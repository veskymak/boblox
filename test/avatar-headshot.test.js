const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Browser environment shims for Node
global.window = global;
global.window.addEventListener = () => {};
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });
global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: (tag) => {
        if (tag === 'canvas') {
            return {
                width: 128,
                height: 128,
                toDataURL: () => 'data:image/png;base64,mockHeadshotPngData',
                getContext: () => ({
                    clearRect: () => {},
                    fillRect: () => {},
                    drawImage: () => {},
                    beginPath: () => {},
                    closePath: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    arc: () => {},
                    arcTo: () => {},
                    ellipse: () => {},
                    fill: () => {},
                    stroke: () => {},
                    save: () => {},
                    restore: () => {},
                    translate: () => {},
                    scale: () => {},
                    roundRect: () => {},
                    quadraticCurveTo: () => {}
                })
            };
        }
        return {};
    }
};

// Setup mock THREE for headless testing of getAvatarHeadshotDataUrl
let renderCallCount = 0;
let lastRenderedScene = null;
let lastRenderedCamera = null;

class MockGroup {
    constructor() {
        this.children = [];
        this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    }
    add(obj) { this.children.push(obj); }
    remove(obj) {
        const idx = this.children.indexOf(obj);
        if (idx !== -1) this.children.splice(idx, 1);
    }
    traverse(fn) {
        fn(this);
        this.children.forEach(c => { if (c.traverse) c.traverse(fn); else fn(c); });
    }
}

class MockMesh extends MockGroup {
    constructor(geo, mat) {
        super();
        this.isMesh = true;
        this.geometry = geo;
        this.material = mat;
    }
}

class MockColor {
    constructor(hex) {
        this.hex = hex || 0;
    }
    getHex() { return typeof this.hex === 'number' ? this.hex : 0x0D69AC; }
    getHexString() { return '0D69AC'; }
}

global.THREE = {
    Scene: MockGroup,
    Group: MockGroup,
    Mesh: MockMesh,
    Color: MockColor,
    BoxGeometry: class { translate() {} dispose() {} },
    CylinderGeometry: class { dispose() {} },
    TorusGeometry: class { dispose() {} },
    SphereGeometry: class { dispose() {} },
    ConeGeometry: class { dispose() {} },
    MeshStandardMaterial: class { dispose() {} },
    CanvasTexture: class { dispose() {} },
    RepeatWrapping: 1000,
    AmbientLight: class {},
    DirectionalLight: class {
        constructor() {
            this.position = { set: () => {} };
        }
    },
    PerspectiveCamera: class {
        constructor(fov, aspect, near, far) {
            this.fov = fov;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        }
        lookAt(x, y, z) {
            this.target = { x, y, z };
        }
    },
    WebGLRenderer: class {
        constructor(options = {}) {
            this.domElement = options.canvas || global.document.createElement('canvas');
        }
        setSize(w, h) {
            this.domElement.width = w;
            this.domElement.height = h;
        }
        render(scene, camera) {
            renderCallCount++;
            lastRenderedScene = scene;
            lastRenderedCamera = camera;
        }
        dispose() {}
        forceContextLoss() {}
    }
};

const AvatarAndShop = require('../src/core/AvatarAndShop.js');
const { getAvatarHeadshotDataUrl, invalidateAvatarHeadshotCache } = AvatarAndShop;

describe('Seam 1: getAvatarHeadshotDataUrl & invalidateAvatarHeadshotCache', () => {
    beforeEach(() => {
        renderCallCount = 0;
        lastRenderedScene = null;
        lastRenderedCamera = null;
        if (typeof invalidateAvatarHeadshotCache === 'function') {
            invalidateAvatarHeadshotCache();
        }
    });

    it('exports getAvatarHeadshotDataUrl and invalidateAvatarHeadshotCache as functions', () => {
        assert.strictEqual(typeof getAvatarHeadshotDataUrl, 'function', 'getAvatarHeadshotDataUrl must be exported');
        assert.strictEqual(typeof invalidateAvatarHeadshotCache, 'function', 'invalidateAvatarHeadshotCache must be exported');
    });

    it('generates 3D headshot dataURL using Three.js and caches subsequent identical calls', () => {
        const outfit = { hat: 'hat_crown', face: 'face_cool', shirt: null, pants: null };
        const torsoHex = '#DC2626';

        const dataUrl1 = getAvatarHeadshotDataUrl(outfit, torsoHex);
        assert.ok(typeof dataUrl1 === 'string' && dataUrl1.startsWith('data:image/'), 'Must return valid dataURL string');
        assert.strictEqual(renderCallCount, 1, 'First call must render through WebGLRenderer');

        // Second call with same outfit & torsoHex must return cached result without re-rendering
        const dataUrl2 = getAvatarHeadshotDataUrl(outfit, torsoHex);
        assert.strictEqual(dataUrl2, dataUrl1, 'Must return identical cached dataURL');
        assert.strictEqual(renderCallCount, 1, 'Second call must NOT re-render (cache hit)');
    });

    it('differentiates cache by torsoHex and outfit components', () => {
        const outfitA = { hat: 'hat_crown', face: 'face_cool' };
        const outfitB = { hat: 'hat_cowboy', face: 'face_cool' };

        getAvatarHeadshotDataUrl(outfitA, '#DC2626');
        assert.strictEqual(renderCallCount, 1);

        getAvatarHeadshotDataUrl(outfitA, '#00B06F');
        assert.strictEqual(renderCallCount, 2, 'Different torso color must invalidate cache key and trigger new render');

        getAvatarHeadshotDataUrl(outfitB, '#00B06F');
        assert.strictEqual(renderCallCount, 3, 'Different hat must invalidate cache key and trigger new render');
    });

    it('invalidates cache when invalidateAvatarHeadshotCache() is called', () => {
        const outfit = { hat: 'hat_crown' };
        getAvatarHeadshotDataUrl(outfit, '#DC2626');
        assert.strictEqual(renderCallCount, 1);

        invalidateAvatarHeadshotCache();

        getAvatarHeadshotDataUrl(outfit, '#DC2626');
        assert.strictEqual(renderCallCount, 2, 'Calling invalidateAvatarHeadshotCache() must force re-rendering');
    });

    it('returns null gracefully if WebGLRenderer throws context creation error', () => {
        const originalRenderer = global.THREE.WebGLRenderer;
        global.THREE.WebGLRenderer = class {
            constructor() {
                throw new Error('WebGL not supported');
            }
        };

        try {
            invalidateAvatarHeadshotCache();
            const result = getAvatarHeadshotDataUrl({ hat: 'hat_crown' }, '#0D69AC');
            assert.strictEqual(result, null, 'Must return null gracefully when WebGL is unavailable');
        } finally {
            global.THREE.WebGLRenderer = originalRenderer;
        }
    });
});

describe('Seam 2: Cache Invalidation on Outfit Mutations & Login', () => {
    let invalidated = false;

    beforeEach(() => {
        invalidated = false;
        global.onAvatarHeadshotCacheInvalidated = () => {
            invalidated = true;
        };
        global.invalidateAvatarHeadshotCache = () => {
            invalidated = true;
        };
        global.rebuildShopPreviewAvatar = () => {};
        global.renderShop = () => {};
        global.refreshPortalAvatarVisuals = () => {};
        global.saveShopState = () => {};
        global.sfx = { playCoin: () => {}, playWinFanfare: () => {} };
        global.syncAccountToServer = async () => {};
        global.updateTorsoColorUI = () => {};
        global.renderGameCatalog = () => {};
        global.updateAuthUI = () => {};
        global.updateBobuxUI = () => {};
        global.updateDailyBonusUI = () => {};
        global.updateNickname = () => {};
    });

    it('equipShopItem() invalidates the avatar headshot cache', () => {
        const { equipShopItem } = require('../src/core/AvatarAndShop.js');
        assert.strictEqual(typeof equipShopItem, 'function', 'equipShopItem must be exported');

        global.ownedShopItems = new Set(['hat_crown']);
        global.avatarOutfit = { hat: null, face: 'face_default', shirt: null, pants: null };

        equipShopItem('hat_brown_hair');
        assert.strictEqual(invalidated, true, 'equipShopItem must invoke invalidateAvatarHeadshotCache()');
    });

    it('unequipShopSlot() invalidates the avatar headshot cache', () => {
        const { unequipShopSlot } = require('../src/core/AvatarAndShop.js');
        assert.strictEqual(typeof unequipShopSlot, 'function', 'unequipShopSlot must be exported');

        global.avatarOutfit = { hat: 'hat_crown', face: 'face_default', shirt: null, pants: null };

        unequipShopSlot('hat');
        assert.strictEqual(invalidated, true, 'unequipShopSlot must invoke invalidateAvatarHeadshotCache()');
    });

    it('setAvatarTorsoColor() invalidates the avatar headshot cache', () => {
        const { setAvatarTorsoColor } = require('../src/ui/PortalUI.js');
        assert.strictEqual(typeof setAvatarTorsoColor, 'function', 'setAvatarTorsoColor must be exported');

        setAvatarTorsoColor('#00B06F');
        assert.strictEqual(invalidated, true, 'setAvatarTorsoColor must invoke invalidateAvatarHeadshotCache()');
    });

    it('applyAuthenticatedUser() invalidates the avatar headshot cache upon user login', () => {
        const PortalStore = require('../src/state/PortalStore.js');
        const { applyAuthenticatedUser } = PortalStore;
        assert.strictEqual(typeof applyAuthenticatedUser, 'function', 'applyAuthenticatedUser must be exported');

        global.authState = { user: null };
        applyAuthenticatedUser({
            username: 'TestPlayer',
            inventory: {
                outfit: { hat: 'hat_crown' },
                torsoHex: '#00B06F'
            }
        });

        assert.strictEqual(invalidated, true, 'applyAuthenticatedUser must invoke invalidateAvatarHeadshotCache()');
    });
});

describe('Seam 3: drawPlayerHeadshotCanvas (3D Snapshot & 2D Procedural Fallback)', () => {
    function createMockHeadshotCanvas(width = 96, height = 96) {
        const operations = [];
        const ctx = {
            clearRect: (x, y, w, h) => operations.push({ op: 'clearRect', x, y, w, h }),
            fillRect: (x, y, w, h) => operations.push({ op: 'fillRect', x, y, w, h, fillStyle: ctx.fillStyle }),
            createRadialGradient: () => ({ addColorStop: () => {} }),
            save: () => operations.push({ op: 'save' }),
            restore: () => operations.push({ op: 'restore' }),
            translate: (x, y) => operations.push({ op: 'translate', x, y }),
            scale: (x, y) => operations.push({ op: 'scale', x, y }),
            drawImage: (img, x, y, w, h) => operations.push({ op: 'drawImage', img, x, y, w, h }),
            beginPath: () => operations.push({ op: 'beginPath' }),
            closePath: () => operations.push({ op: 'closePath' }),
            moveTo: (x, y) => operations.push({ op: 'moveTo', x, y }),
            lineTo: (x, y) => operations.push({ op: 'lineTo', x, y }),
            arc: (x, y, r, sa, ea) => operations.push({ op: 'arc', x, y, r, sa, ea }),
            ellipse: (...args) => operations.push({ op: 'ellipse', args }),
            roundRect: (x, y, w, h, r) => operations.push({ op: 'roundRect', x, y, w, h, r }),
            fill: () => operations.push({ op: 'fill', fillStyle: ctx.fillStyle }),
            stroke: () => operations.push({ op: 'stroke', strokeStyle: ctx.strokeStyle }),
            fillStyle: '#000000',
            strokeStyle: '#000000'
        };
        return {
            width,
            height,
            getContext: (t) => (t === '2d' ? ctx : null),
            operations
        };
    }

    beforeEach(() => {
        class MockImage {
            constructor() {
                this.complete = false;
                this.naturalWidth = 128;
                this._src = '';
            }
            set src(val) {
                this._src = val;
                this.complete = true;
                if (typeof this.onload === 'function') {
                    this.onload();
                }
            }
            get src() {
                return this._src;
            }
        }
        global.Image = MockImage;
    });

    it('exports drawPlayerHeadshotCanvas and refreshPortalAvatarVisuals as functions', () => {
        const PortalUI = require('../src/ui/PortalUI.js');
        assert.strictEqual(typeof PortalUI.drawPlayerHeadshotCanvas, 'function', 'drawPlayerHeadshotCanvas must be exported');
        assert.strictEqual(typeof PortalUI.refreshPortalAvatarVisuals, 'function', 'refreshPortalAvatarVisuals must be exported');
    });

    it('draws 3D snapshot via ctx.drawImage when 3D snapshot dataURL is available', () => {
        const { drawPlayerHeadshotCanvas } = require('../src/ui/PortalUI.js');
        const canvas = createMockHeadshotCanvas(96, 96);
        const player = { isLocal: true, username: 'BobloxHero', torsoHex: '#DC2626', outfit: { hat: 'hat_crown' } };

        const testDataUrl = 'data:image/png;base64,mock3dHeadshotSnapshotBase64';
        global.getAvatarHeadshotDataUrl = (outfit, torsoHex) => testDataUrl;

        drawPlayerHeadshotCanvas(canvas, player);

        const drawImageOps = canvas.operations.filter(op => op.op === 'drawImage');
        assert.ok(drawImageOps.length > 0, 'drawPlayerHeadshotCanvas must call ctx.drawImage with the 3D snapshot image');
        assert.strictEqual(drawImageOps[0].img.src, testDataUrl, 'drawImage must render the generated 3D snapshot');
    });

    it('falls back gracefully to 2D procedural avatar when WebGL is unavailable (getAvatarHeadshotDataUrl returns null)', () => {
        const { drawPlayerHeadshotCanvas } = require('../src/ui/PortalUI.js');
        const canvas = createMockHeadshotCanvas(96, 96);
        const player = { isLocal: true, username: 'BobloxHero', torsoHex: '#DC2626', outfit: { hat: 'hat_crown' } };

        // Simulate WebGL unavailable
        global.getAvatarHeadshotDataUrl = () => null;

        drawPlayerHeadshotCanvas(canvas, player);

        // Should NOT call drawImage
        const drawImageOps = canvas.operations.filter(op => op.op === 'drawImage');
        assert.strictEqual(drawImageOps.length, 0, 'Must not call drawImage when snapshot is null');

        // Should call 2D procedural drawing operations (fillRect, roundRect, fill)
        const fillOps = canvas.operations.filter(op => op.op === 'fill' || op.op === 'fillRect');
        assert.ok(fillOps.length > 1, 'Must render 2D procedural avatar parts as fallback');
    });

    it('refreshes all 3 primary navigation canvases when refreshPortalAvatarVisuals() is called', () => {
        const { refreshPortalAvatarVisuals } = require('../src/ui/PortalUI.js');
        const topNavCanvas = createMockHeadshotCanvas(40, 40);
        const sidebarCanvas = createMockHeadshotCanvas(48, 48);
        const homeUserCanvas = createMockHeadshotCanvas(96, 96);

        const domElements = {
            'top-nav-avatar-canvas': topNavCanvas,
            'sidebar-avatar-canvas': sidebarCanvas,
            'home-user-avatar-canvas': homeUserCanvas
        };

        const origGetElementById = global.document.getElementById;
        global.document.getElementById = (id) => domElements[id] || null;

        try {
            global.getLocalRobloxPlayerProfile = () => ({
                id: 'local',
                username: 'BobloxHero',
                isLocal: true,
                torsoHex: '#DC2626'
            });
            global.updateGreetingByTimeOfDay = () => {};
            global.renderHomeFriendsStrip = () => {};

            const testDataUrl = 'data:image/png;base64,mockNav3dSnapshot';
            global.getAvatarHeadshotDataUrl = () => testDataUrl;

            refreshPortalAvatarVisuals();

            // Check that all 3 canvases were rendered with 3D snapshots
            assert.ok(topNavCanvas.operations.some(op => op.op === 'drawImage'), 'Top nav canvas must have 3D headshot');
            assert.ok(sidebarCanvas.operations.some(op => op.op === 'drawImage'), 'Sidebar canvas must have 3D headshot');
            assert.ok(homeUserCanvas.operations.some(op => op.op === 'drawImage'), 'Home user avatar canvas must have 3D headshot');
        } finally {
            global.document.getElementById = origGetElementById;
        }
    });
});


