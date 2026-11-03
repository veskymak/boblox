const { test } = require('node:test');
const assert = require('node:assert/strict');
const SpatialIndex = require('../src/core/SpatialIndex');
const { disposeObject } = require('../src/core/SceneResources');
const Lifetime = require('../src/core/Lifetime');
test('leaving a world cancels its pending callbacks before disposed resources can be touched', async () => {
    const lifetime = new Lifetime();
    let touched = false;
    lifetime.timeout(() => {
        touched = true;
    }, 5);
    lifetime.interval(() => {
        touched = true;
    }, 5);
    lifetime.reset();
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(touched, false);
    assert.equal(lifetime.handles.size, 0);
});
test('spatial candidates contain every exact collision, including dynamic and huge blocks', () => {
    const blocks = Array.from({ length: 10000 }, (_, i) => ({
        box: { min: { x: i * 3, y: 0, z: 0 }, max: { x: i * 3 + 2, y: 2, z: 2 } }
    }));
    blocks.push({ movingFn: () => {}, box: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } } });
    blocks.push({ box: { min: { x: -10000, y: -1, z: -10000 }, max: { x: 10000, y: 0, z: 10000 } } });
    const query = { min: { x: 100, y: 0, z: 0 }, max: { x: 110, y: 2, z: 2 } };
    const intersects = (a, b) => ['x', 'y', 'z'].every((k) => a.max[k] >= b.min[k] && a.min[k] <= b.max[k]);
    const index = new SpatialIndex();
    const candidates = index.query(blocks, query);
    for (const block of blocks.filter((b) => intersects(b.box, query))) assert.ok(candidates.includes(block));
    assert.ok(candidates.length < 30, 'candidate count should be bounded by the local neighborhood');
    blocks.push({ box: query });
    assert.ok(index.query(blocks, query).includes(blocks.at(-1)));
});
test('resource disposal releases shared references once and preserves cached assets', () => {
    let geometryCalls = 0,
        textureCalls = 0,
        materialCalls = 0,
        cachedCalls = 0;
    const geometry = {
        dispose() {
            geometryCalls++;
        }
    };
    const texture = {
        isTexture: true,
        dispose() {
            textureCalls++;
        }
    };
    const material = {
        map: texture,
        normalMap: texture,
        dispose() {
            materialCalls++;
        }
    };
    const cached = {
        userData: { cachedGeo: true },
        dispose() {
            cachedCalls++;
        }
    };
    const root = {
        traverse(fn) {
            fn({ geometry, material });
            fn({ geometry, material });
            fn({ geometry: cached });
        }
    };
    disposeObject(root);
    assert.equal(geometryCalls, 1);
    assert.equal(textureCalls, 1);
    assert.equal(materialCalls, 1);
    assert.equal(cachedCalls, 0);
});
