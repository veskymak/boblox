const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Game Load & Global Script Scope Integrity', () => {
    it('verifies that all scripts referenced in index.html evaluate in shared global browser scope without duplicate declarations or syntax errors', () => {
        const repoRoot = path.resolve(__dirname, '..');
        const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

        // Extract all src/*.js scripts in exact order from index.html
        const scriptMatches = [...indexHtml.matchAll(/<script\s+src=["'](src\/[^"']+\.js)(?:\?v=[^"']*)?["']/g)];
        const scriptPaths = scriptMatches.map(m => m[1]);

        assert.ok(scriptPaths.length >= 8, `Must find all modular scripts in index.html (found ${scriptPaths.length})`);

        // Prepare a browser-like sandbox context
        const sandbox = {
            console,
            setTimeout,
            clearTimeout,
            setInterval: () => ({ unref: () => {} }),
            clearInterval: () => {},
            Date,
            Math,
            parseInt,
            parseFloat,
            isNaN,
            isFinite,
            JSON,
            Array,
            Object,
            String,
            Number,
            Boolean,
            RegExp,
            Map,
            Set,
            WeakMap,
            WeakSet,
            Promise,
            Error,
            TypeError,
            SyntaxError,
            ReferenceError
        };

        sandbox.window = sandbox;
        sandbox.globalThis = sandbox;
        sandbox.performance = { now: () => Date.now() };
        sandbox.requestAnimationFrame = (cb) => setTimeout(cb, 16);
        sandbox.cancelAnimationFrame = (id) => clearTimeout(id);
        sandbox.addEventListener = () => {};
        sandbox.removeEventListener = () => {};
        sandbox.location = { protocol: 'http:', hostname: 'localhost', href: 'http://localhost/' };
        sandbox.navigator = { userAgent: 'test-browser' };
        sandbox.localStorage = {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        };
        sandbox.sessionStorage = sandbox.localStorage;

        // Mock THREE
        class MockVec3 {
            constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
            set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
            copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
            clone() { return new MockVec3(this.x, this.y, this.z); }
            add() { return this; }
            sub() { return this; }
            multiplyScalar() { return this; }
            normalize() { return this; }
            length() { return 0; }
            dot() { return 0; }
            distanceToSquared() { return 0; }
            lerp() { return this; }
        }
        class MockGroup {
            constructor() {
                this.children = [];
                this.position = new MockVec3();
                this.rotation = new MockVec3();
                this.scale = new MockVec3(1, 1, 1);
            }
            add(c) { this.children.push(c); }
            remove() {}
            traverse(fn) { fn(this); this.children.forEach(c => c && c.traverse && c.traverse(fn)); }
        }
        sandbox.THREE = {
            Vector3: MockVec3,
            Box3: class {
                setFromObject() { return this; }
                intersectsBox() { return false; }
            },
            Color: class {
                constructor(h) { this.hex = h; }
                getHex() { return 0xffffff; }
                getHexString() { return 'ffffff'; }
            },
            Group: MockGroup,
            Mesh: class extends MockGroup {
                constructor(g, m) { super(); this.geometry = g; this.material = m; }
            },
            BoxGeometry: class { constructor() { this.userData = {}; } dispose() {} },
            SphereGeometry: class { constructor() { this.userData = {}; } dispose() {} },
            CylinderGeometry: class { constructor() { this.userData = {}; } dispose() {} },
            MeshStandardMaterial: class { constructor() { this.userData = {}; } dispose() {} },
            MeshLambertMaterial: class { constructor() { this.userData = {}; } dispose() {} },
            MeshBasicMaterial: class { constructor() { this.userData = {}; } dispose() {} },
            PCFSoftShadowMap: 2,
            FogExp2: class {},
            Scene: class extends MockGroup { constructor() { super(); this.background = null; this.fog = null; } },
            PerspectiveCamera: class extends MockGroup { constructor() { super(); } lookAt() {} },
            AmbientLight: MockGroup,
            DirectionalLight: class extends MockGroup { constructor() { super(); this.shadow = { mapSize: {}, camera: {} }; } },
            WebGLRenderer: class {
                constructor(opts = {}) {
                    this.domElement = opts.canvas || {};
                    this.shadowMap = {};
                }
                setPixelRatio() {}
                setSize() {}
                render() {}
            }
        };
        sandbox.document = {
            readyState: 'loading',
            getElementById: () => ({
                style: {},
                classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
                focus: () => {},
                addEventListener: () => {},
                appendChild: () => {},
                getContext: () => ({
                    fillRect: () => {},
                    clearRect: () => {},
                    drawImage: () => {},
                    beginPath: () => {},
                    closePath: () => {},
                    fill: () => {},
                    stroke: () => {},
                    save: () => {},
                    restore: () => {},
                    translate: () => {},
                    scale: () => {},
                    arc: () => {},
                    roundRect: () => {},
                    createRadialGradient: () => ({ addColorStop: () => {} })
                }),
                innerHTML: '',
                textContent: ''
            }),
            querySelectorAll: () => [],
            createElement: () => sandbox.document.getElementById('mock'),
            addEventListener: () => {}
        };

        const context = vm.createContext(sandbox);

        // 1. Detect duplicate top-level const or let declarations across all scripts
        // In browser classic scripts, duplicate declarations in the global declarative scope throw Uncaught SyntaxError
        const declaredTopLevel = new Map();
        const duplicates = [];

        for (const scriptRelPath of scriptPaths) {
            const fileContent = fs.readFileSync(path.join(repoRoot, scriptRelPath), 'utf8');
            const lines = fileContent.split('\n');
            lines.forEach((line, idx) => {
                const m = line.match(/^(?:const|let)\s+([a-zA-Z0-9_$]+)\s*=/);
                if (m) {
                    const varName = m[1];
                    if (declaredTopLevel.has(varName)) {
                        duplicates.push({
                            identifier: varName,
                            firstLocation: declaredTopLevel.get(varName),
                            secondLocation: `${scriptRelPath}:${idx + 1}`
                        });
                    } else {
                        declaredTopLevel.set(varName, `${scriptRelPath}:${idx + 1}`);
                    }
                }
            });
        }

        assert.deepStrictEqual(duplicates, [], `Found duplicate top-level declarations across scripts in index.html: ${JSON.stringify(duplicates)}`);

        // 2. Execute each script in order in browser-like global context
        for (const scriptRelPath of scriptPaths) {
            const fileContent = fs.readFileSync(path.join(repoRoot, scriptRelPath), 'utf8');
            assert.doesNotThrow(() => {
                vm.runInContext(fileContent, context, { filename: scriptRelPath });
            }, `Script ${scriptRelPath} failed to execute in global context`);
        }

        // Verify that GameWorlds functions are properly initialized and not undefined
        assert.strictEqual(typeof sandbox.setupGame1Obby, 'function', 'setupGame1Obby must be defined');
        assert.strictEqual(typeof sandbox.setupGame11AdoptMe, 'function', 'setupGame11AdoptMe must be defined');
        assert.strictEqual(typeof sandbox.startGame, 'function', 'startGame must be defined');
    });
});
