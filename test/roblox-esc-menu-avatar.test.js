const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// DOM and environment shims for Node
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
    readyState: 'loading',
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
};

function createMockCardCanvas(width = 110, height = 108) {
    const operations = [];
    const ctx = {
        clearRect: (x, y, w, h) => operations.push({ op: 'clearRect', x, y, w, h }),
        fillRect: (x, y, w, h) => operations.push({ op: 'fillRect', x, y, w, h, fillStyle: ctx.fillStyle }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        save: () => operations.push({ op: 'save' }),
        restore: () => operations.push({ op: 'restore' }),
        translate: (x, y) => operations.push({ op: 'translate', x, y }),
        scale: (x, y) => operations.push({ op: 'scale', x, y }),
        rotate: (r) => operations.push({ op: 'rotate', r }),
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
        clip: () => operations.push({ op: 'clip' }),
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

describe('ESC Experience Menu Avatar Portrait Integrity', () => {
    let PortalUI;

    beforeEach(() => {
        global.authState = { user: { username: 'Vendeez' } };
        global.avatarOutfit = { hat: 'hat_crown', face: 'face_classic', shirt: null, pants: null };
        global.avatarTorsoHex = '#0D69AC';
        global.robloxUiState = {
            isMenuOpen: true,
            activeTab: 'people',
            peopleViewMode: 'grid'
        };

        class MockImage {
            constructor() {
                this.complete = true;
                this.naturalWidth = 128;
                this._src = '';
            }
            set src(v) { this._src = v; if (this.onload) this.onload(); }
            get src() { return this._src; }
        }
        global.Image = MockImage;

        // Load PortalUI
        delete require.cache[require.resolve('../src/ui/PortalUI.js')];
        PortalUI = require('../src/ui/PortalUI.js');
    });

    it('drawRobloxAvatarCardPortrait renders dynamic player avatar matching actual player outfit instead of hardcoded brown-haired boy', () => {
        const canvas = createMockCardCanvas(110, 108);

        // Player Vendeez: wearing golden crown (hat_crown), classic face, blue torso
        const playerVendeez = {
            id: 'local',
            displayName: 'Vendeez',
            handle: '@Vendeez',
            isLocal: true,
            torsoHex: '#0D69AC',
            outfit: { hat: 'hat_crown', face: 'face_classic', shirt: null, pants: null }
        };

        // Mock 3D headshot snapshot available for Vendeez
        const vendeezSnapshotUrl = 'data:image/png;base64,vendeezCrownSnapshotBase64';
        global.getAvatarHeadshotDataUrl = (outfit, torso) => {
            if (outfit && outfit.hat === 'hat_crown') return vendeezSnapshotUrl;
            return 'data:image/png;base64,otherSnapshot';
        };

        // Render portrait
        const drawPortrait = PortalUI.drawRobloxAvatarCardPortrait || global.drawRobloxAvatarCardPortrait;
        assert.strictEqual(typeof drawPortrait, 'function', 'drawRobloxAvatarCardPortrait must be a function');

        drawPortrait(canvas, playerVendeez);

        // Must NOT render hardcoded spiky brown hair (#5c3317) when Vendeez has hat_crown
        const brownHairOps = canvas.operations.filter(op => op.fillStyle === '#5c3317');
        assert.strictEqual(
            brownHairOps.length,
            0,
            'Must not render hardcoded spiky brown hair (#5c3317) for player wearing hat_crown'
        );

        // Must NOT render hardcoded sunglasses (#090a0c) when Vendeez has classic face
        const sunglassesOps = canvas.operations.filter(op => op.fillStyle === '#090a0c');
        assert.strictEqual(
            sunglassesOps.length,
            0,
            'Must not render hardcoded sunglasses (#090a0c) for player with classic face'
        );

        // Must use the dynamic 3D snapshot (or dynamic visual style)
        const drawImageOps = canvas.operations.filter(op => op.op === 'drawImage');
        assert.ok(
            drawImageOps.length > 0,
            'Must render player 3D headshot snapshot via ctx.drawImage'
        );
        assert.strictEqual(
            drawImageOps[0].img.src,
            vendeezSnapshotUrl,
            'Must render the snapshot matching Vendeez outfit and crown'
        );
    });

    it('drawRobloxAvatarCardPortrait renders Max with his distinct outfit and snapshot', () => {
        const canvas = createMockCardCanvas(110, 108);

        // Remote player Max: wearing hat_cone, face_cool, red torso
        const playerMax = {
            id: 'remote_max',
            displayName: 'Max',
            handle: '@Max',
            isLocal: false,
            torsoHex: '#DC2626',
            outfit: { hat: 'hat_cone', face: 'face_cool', shirt: null, pants: null }
        };

        const maxSnapshotUrl = 'data:image/png;base64,maxConeSnapshotBase64';
        global.getAvatarHeadshotDataUrl = (outfit, torso) => {
            if (outfit && outfit.hat === 'hat_cone') return maxSnapshotUrl;
            return null;
        };

        const drawPortrait = PortalUI.drawRobloxAvatarCardPortrait || global.drawRobloxAvatarCardPortrait;
        drawPortrait(canvas, playerMax);

        // Must NOT render hardcoded brown hair (#5c3317) for Max
        const brownHairOps = canvas.operations.filter(op => op.fillStyle === '#5c3317');
        assert.strictEqual(
            brownHairOps.length,
            0,
            'Must not render hardcoded spiky brown hair (#5c3317) for Max'
        );

        // Must render Max snapshot
        const drawImageOps = canvas.operations.filter(op => op.op === 'drawImage');
        assert.ok(drawImageOps.length > 0, 'Must render 3D snapshot for Max');
        assert.strictEqual(drawImageOps[0].img.src, maxSnapshotUrl);
    });
});
