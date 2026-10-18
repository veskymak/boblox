const { describe, it } = require('node:test');
const assert = require('node:assert');

// Browser shims for Node test environment
global.window = global;
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};
global.document = {
    getElementById: () => null,
    addEventListener: () => {}
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

const PortalUI = require('../src/ui/PortalUI.js');
const { drawWearingItemCardCanvas } = PortalUI;

function createMockCanvas(width = 120, height = 120) {
    const operations = [];
    const ctx = {
        save: () => operations.push({ op: 'save' }),
        restore: () => operations.push({ op: 'restore' }),
        translate: (x, y) => operations.push({ op: 'translate', x, y }),
        rotate: (angle) => operations.push({ op: 'rotate', angle }),
        clearRect: (x, y, w, h) => operations.push({ op: 'clearRect', x, y, w, h }),
        fillRect: (x, y, w, h) => operations.push({ op: 'fillRect', x, y, w, h, fillStyle: ctx.fillStyle }),
        strokeRect: (x, y, w, h) => operations.push({ op: 'strokeRect', x, y, w, h, strokeStyle: ctx.strokeStyle }),
        beginPath: () => operations.push({ op: 'beginPath' }),
        closePath: () => operations.push({ op: 'closePath' }),
        moveTo: (x, y) => operations.push({ op: 'moveTo', x, y }),
        lineTo: (x, y) => operations.push({ op: 'lineTo', x, y }),
        arc: (x, y, r, sa, ea) => operations.push({ op: 'arc', x, y, r, sa, ea }),
        ellipse: (...args) => operations.push({ op: 'ellipse', args }),
        quadraticCurveTo: (...args) => operations.push({ op: 'quadraticCurveTo', args }),
        roundRect: (x, y, w, h, r) => operations.push({ op: 'roundRect', x, y, w, h, r, fillStyle: ctx.fillStyle }),
        fill: () => operations.push({ op: 'fill', fillStyle: ctx.fillStyle }),
        stroke: () => operations.push({ op: 'stroke', strokeStyle: ctx.strokeStyle }),
        fillText: (text, x, y) => operations.push({ op: 'fillText', text, x, y }),
        drawImage: (img, x, y, w, h) => operations.push({ op: 'drawImage', img, x, y, w, h }),
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1
    };
    return {
        width,
        height,
        getContext: (type) => (type === '2d' ? ctx : null),
        operations
    };
}

describe('drawWearingItemCardCanvas', () => {
    it('renders golden crown visual for hat_crown instead of generic mannequin', () => {
        assert.strictEqual(typeof drawWearingItemCardCanvas, 'function', 'drawWearingItemCardCanvas must be exported');
        const canvas = createMockCanvas(120, 120);
        const item = {
            name: 'Královská Koruna',
            price: '500 B$',
            type: 'hat_crown',
            shopId: 'hat_crown'
        };

        drawWearingItemCardCanvas(canvas, item);

        // Should use gold colors for crown
        const goldOps = canvas.operations.filter(op =>
            typeof op.fillStyle === 'string' && (op.fillStyle.toLowerCase().includes('fac') || op.fillStyle.toLowerCase().includes('gold') || op.fillStyle.toLowerCase().includes('eab') || op.fillStyle.toLowerCase().includes('f5c'))
        );
        assert.ok(goldOps.length > 0, 'Expected gold fill color operations for hat_crown');

        // Should NOT draw the generic mannequin body parts (mannequin head at -12, -26, 24, 24)
        const mannequinHead = canvas.operations.find(op =>
            op.op === 'fillRect' && op.x === -12 && op.y === -26 && op.w === 24 && op.h === 24
        );
        assert.strictEqual(mannequinHead, undefined, 'Must not draw generic mannequin for hat_crown');
    });

    it('renders sunglasses and smile for face_cool', () => {
        const canvas = createMockCanvas(120, 120);
        const item = {
            name: 'Cool Brýle',
            price: '75 B$',
            type: 'face_cool',
            shopId: 'face_cool'
        };

        drawWearingItemCardCanvas(canvas, item);

        // Sunglasses dark lenses
        const darkOps = canvas.operations.filter(op =>
            typeof op.fillStyle === 'string' && (op.fillStyle === '#090a0f' || op.fillStyle === '#111111' || op.fillStyle === '#111827')
        );
        assert.ok(darkOps.length > 0, 'Expected dark glasses fill operations for face_cool');

        // Should NOT draw generic mannequin
        const mannequinHead = canvas.operations.find(op =>
            op.op === 'fillRect' && op.x === -12 && op.y === -26 && op.w === 24 && op.h === 24
        );
        assert.strictEqual(mannequinHead, undefined, 'Must not draw generic mannequin for face_cool');
    });

    it('renders real hat visuals for hat_cone and hat_viking', () => {
        const coneCanvas = createMockCanvas(120, 120);
        drawWearingItemCardCanvas(coneCanvas, { type: 'hat_cone', shopId: 'hat_cone', name: 'Dopravní Kužel' });
        const orangeOps = coneCanvas.operations.filter(op =>
            typeof op.fillStyle === 'string' && (op.fillStyle.toLowerCase().includes('f97') || op.fillStyle.toLowerCase().includes('orange'))
        );
        assert.ok(orangeOps.length > 0, 'Expected orange color for hat_cone');

        const vikingCanvas = createMockCanvas(120, 120);
        drawWearingItemCardCanvas(vikingCanvas, { type: 'hat_viking', shopId: 'hat_viking', name: 'Vikingská Helma' });
        const steelOps = vikingCanvas.operations.filter(op =>
            typeof op.fillStyle === 'string' && (op.fillStyle.toLowerCase().includes('9ca') || op.fillStyle.toLowerCase().includes('steel') || op.fillStyle.toLowerCase().includes('d1d'))
        );
        assert.ok(steelOps.length > 0, 'Expected steel helmet color for hat_viking');
    });

    it('renders real clothing visuals for shirts and pants instead of generic mannequin', () => {
        const shirtCanvas = createMockCanvas(120, 120);
        drawWearingItemCardCanvas(shirtCanvas, { type: 'shirt_logo', shopId: 'shirt_logo', name: 'Tričko BOBLOX' });
        const logoText = shirtCanvas.operations.find(op => op.op === 'fillText' && op.text === 'BOBLOX');
        assert.ok(logoText, 'Expected BOBLOX logo text on shirt_logo');

        const pantsCanvas = createMockCanvas(120, 120);
        drawWearingItemCardCanvas(pantsCanvas, { type: 'pants_jeans', shopId: 'pants_jeans', name: 'Modré Džíny' });
        const blueOps = pantsCanvas.operations.filter(op =>
            typeof op.fillStyle === 'string' && (op.fillStyle.toLowerCase().includes('1e4') || op.fillStyle.toLowerCase().includes('blue'))
        );
        assert.ok(blueOps.length > 0, 'Expected denim blue color for pants_jeans');
    });

    it('draws thumbnail image directly to canvas when shopState.thumbs has the item', () => {
        const canvas = createMockCanvas(120, 120);
        const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        // Mock Image class in global
        class MockImage {
            constructor() {
                this.naturalWidth = 120;
                this.naturalHeight = 120;
                this.complete = true;
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
            set src(val) {
                this._src = val;
            }
            get src() {
                return this._src;
            }
        }
        global.Image = MockImage;
        global.shopState = {
            thumbs: {
                'hat_crown': testDataUrl
            }
        };

        drawWearingItemCardCanvas(canvas, { type: 'hat_crown', shopId: 'hat_crown', name: 'Královská Koruna' });

        const drawImageOp = canvas.operations.find(op => op.op === 'drawImage');
        assert.ok(drawImageOp, 'Expected drawImage to be called with the thumbnail image');
    });
});

describe('renderPortalProfileView & getProfileWearingItems', () => {
    it('calls generateShopThumbnails when rendering profile and populates wearGrid with thumbnail img tags', () => {
        let generateThumbnailsCalled = false;
        global.generateShopThumbnails = () => {
            generateThumbnailsCalled = true;
        };

        const testThumb = 'data:image/png;base64,testthumbcrown';
        global.shopState = {
            thumbs: {
                'hat_crown': testThumb
            }
        };

        global.SHOP_ITEM_MAP = {
            hat_crown: { id: 'hat_crown', slot: 'hat', name: 'Královská Koruna', price: 500 }
        };

        global.avatarOutfit = {
            hat: 'hat_crown',
            face: null,
            shirt: null,
            pants: null
        };

        global.getLocalRobloxPlayerProfile = () => ({
            id: 'local',
            username: 'BobloxKing',
            displayName: 'BobloxKing',
            bio: 'Test bio'
        });
        global.getMyUniqueSocialId = () => 'local';
        global.getPlayerPresence = () => ({ isOnline: true });
        global.escapeHtml = (s) => String(s);

        const appendedChildren = [];
        const wearGridEl = {
            innerHTML: '',
            appendChild: (child) => appendedChildren.push(child)
        };

        global.document = {
            getElementById: (id) => {
                if (id === 'profile-wearing-grid') return wearGridEl;
                return {
                    textContent: '',
                    innerHTML: '',
                    style: {},
                    classList: { add: () => {}, remove: () => {} },
                    getContext: () => ({
                        clearRect: () => {},
                        fillRect: () => {},
                        beginPath: () => {},
                        arc: () => {},
                        fill: () => {},
                        stroke: () => {},
                        save: () => {},
                        restore: () => {},
                        translate: () => {},
                        rotate: () => {},
                        scale: () => {},
                        rect: () => {},
                        clip: () => {},
                        roundRect: () => {},
                        ellipse: () => {},
                        createRadialGradient: () => ({ addColorStop: () => {} }),
                        createLinearGradient: () => ({ addColorStop: () => {} })
                    })
                };
            },
            createElement: (tag) => ({
                tag,
                className: '',
                innerHTML: '',
                children: []
            })
        };

        const { renderPortalProfileView, getProfileWearingItems } = PortalUI;
        renderPortalProfileView();

        assert.strictEqual(generateThumbnailsCalled, true, 'generateShopThumbnails must be called upon profile view render');
        assert.strictEqual(appendedChildren.length, 1, 'Should render 1 wearing card');
        assert.ok(appendedChildren[0].innerHTML.includes('<img src="data:image/png;base64,testthumbcrown"'), 'Should render img tag with shop thumbnail');
    });
});

