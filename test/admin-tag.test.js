const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../src/state/PortalStore.js'), 'utf8');
const helper = source.slice(source.indexOf('function getPlayerTag('), source.indexOf('function isCurrentUserVip('));
const { getPlayerTag } = vm.runInNewContext(`${helper}; ({ getPlayerTag });`);

test('ADMIN is exclusive to Vendeez and takes precedence over VIP', () => {
    for (const vip of [false, true]) {
        assert.equal(getPlayerTag('Vendeez', vip), 'ADMIN');
        assert.equal(getPlayerTag('VENDEEZ', vip), 'ADMIN');
        for (const name of ['Other', 'Vendeez2', ' Vendeez', '', null, undefined]) {
            assert.equal(getPlayerTag(name, vip), vip ? 'VIP' : '');
        }
    }
});

test('overhead canvas displays ADMIN instead of VIP for Vendeez', () => {
    const network = fs.readFileSync(path.join(__dirname, '../src/network/NetworkManager.js'), 'utf8');
    const start = network.indexOf('function createNameplateSprite(');
    const end = network.indexOf('\nfunction ', start + 10);
    const labels = [];
    const ctx = new Proxy({}, { get: (_, key) => key === 'fillText' ? text => labels.push(text) : () => {} });
    class Sprite { constructor() { this.scale = { set() {} }; this.position = { set() {} }; } }
    const sandbox = {
        getPlayerTag,
        document: { createElement: () => ({ getContext: () => ctx }) },
        THREE: { CanvasTexture: class {}, SpriteMaterial: class {}, Sprite }
    };
    vm.runInNewContext(`${network.slice(start, end)}; createNameplateSprite('Vendeez', true);`, sandbox);
    assert.ok(labels.includes('ADMIN'));
    assert.ok(!labels.includes('VIP'));
});
