const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

describe('Casino Lucky Wheel Freeze Diagnosis & Regression', () => {
    let sandbox;

    beforeEach(() => {
        class MockVec3 {
            constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
            set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
            copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
            add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
            addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
            subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
            clone() { return new MockVec3(this.x, this.y, this.z); }
            length() { return Math.hypot(this.x, this.y, this.z); }
        }

        class MockGroup {
            constructor() {
                this.position = new MockVec3();
                this.rotation = new MockVec3();
                this.scale = new MockVec3(1, 1, 1);
                this.children = [];
                this.userData = {};
            }
            add(c) { this.children.push(c); }
            remove() {}
            traverse(fn) { fn(this); this.children.forEach(c => c && c.traverse && c.traverse(fn)); }
        }

        sandbox = {
            console,
            Math,
            Date,
            performance: { now: () => Date.now() },
            requestAnimationFrame: () => {},
            THREE: {
                Vector3: MockVec3,
                Box3: class {
                    constructor() {
                        this.min = new MockVec3();
                        this.max = new MockVec3();
                    }
                    setFromObject() { return this; }
                    intersectsBox() { return false; }
                },
                Color: class { constructor(h) { this.hex = h; } },
                Group: MockGroup,
                Mesh: class extends MockGroup {
                    constructor(g, m) { super(); this.geometry = g; this.material = m; }
                },
                PlaneGeometry: class { dispose() {} },
                BoxGeometry: class { dispose() {} },
                SphereGeometry: class { dispose() {} },
                CylinderGeometry: class { dispose() {} },
                MeshStandardMaterial: class { dispose() {} },
                MeshBasicMaterial: class { dispose() {} },
                DoubleSide: 2,
                Scene: class extends MockGroup {}
            },
            scene: new MockGroup(),
            camera: { position: new MockVec3(), lookAt: () => {} },
            renderer: { render: () => {} },
            playerState: {
                pos: new MockVec3(0, 1, 0),
                vel: new MockVec3(0, 0, 0),
                speedMultiplier: 1,
                hp: 100,
                maxHp: 100
            },
            gameSpecificData: {
                confettiParticles: []
            },
            activeGameMode: 'casino',
            sfx: {
                playCoin: () => {},
                playJackpot: () => {},
                playWinFanfare: () => {},
                playWheelTick: () => {}
            },
            localStorage: {
                _map: new Map(),
                getItem(k) { return this._map.get(k) || null; },
                setItem(k, v) { this._map.set(k, String(v)); },
                removeItem(k) { this._map.delete(k); }
            },
            document: {
                pointerLockElement: null,
                exitPointerLock: () => {},
                getElementById: (id) => {
                    return {
                        id,
                        classList: {
                            add: () => {},
                            remove: () => {},
                            contains: () => false
                        },
                        focus: () => {}
                    };
                },
                querySelectorAll: () => []
            }
        };

        const repoRoot = path.resolve(__dirname, '..');
        const physicsCode = fs.readFileSync(path.join(repoRoot, 'src', 'core', 'PhysicsAndLoop.js'), 'utf8');
        const worldsCode = fs.readFileSync(path.join(repoRoot, 'src', 'games', 'GameWorlds.js'), 'utf8');

        vm.createContext(sandbox);
        vm.runInContext(physicsCode, sandbox);
        vm.runInContext(worldsCode, sandbox);
    });

    it('reproduces freeze: updateGame12Casino throws when spawnLuckyWheelConfettiBurst pushes meshes to confettiParticles', () => {
        // Trigger the confetti burst as done by winning any prize on the lucky wheel
        assert.doesNotThrow(() => {
            sandbox.spawnLuckyWheelConfettiBurst();
        });

        assert.equal(sandbox.gameSpecificData.confettiParticles.length > 0, true);

        // Before fix: updateGame12Casino -> updateGame1Obby throws:
        // TypeError: Cannot read properties of undefined (reading 'y')
        // which completely halts the game loop and freezes the entire game.
        assert.doesNotThrow(() => {
            sandbox.updateGame12Casino(0.016, 1.0);
        });
    });

    it('advances confetti lifetime and removes expired particles without crashing gameLoop', () => {
        sandbox.spawnLuckyWheelConfettiBurst();
        const initialCount = sandbox.gameSpecificData.confettiParticles.length;
        assert.ok(initialCount > 0);

        // Simulate 6 seconds of gameLoop ticks (confetti life is ~5.5s)
        for (let i = 0; i < 400; i++) {
            sandbox.updateGame12Casino(0.016, i * 0.016);
        }

        // All confetti should have safely decayed without throwing
        assert.equal(sandbox.gameSpecificData.confettiParticles.length, 0);
    });

    it('closeLuckyWheelModal cleans up state and refocuses canvas safely', () => {
        let focused = false;
        sandbox.document.getElementById = (id) => {
            if (id === 'three-canvas') {
                return { focus: () => { focused = true; } };
            }
            return {
                id,
                classList: {
                    add: () => {},
                    remove: () => {},
                    contains: () => false
                }
            };
        };

        assert.doesNotThrow(() => {
            sandbox.closeLuckyWheelModal();
        });
        assert.equal(focused, true);
    });
});
