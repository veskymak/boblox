const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const vm = require('node:vm');

test('Adopt Me persists a collection through authenticated API to a fresh device', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boblox-adopt-'));
    const filename = path.resolve(__dirname, '../server.js');
    const source = fs.readFileSync(filename, 'utf8').replace("path.join(__dirname, 'boblox.db')", JSON.stringify(path.join(dir, 'test.db')));
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = module.paths;
    mod._compile(source, filename);
    const { server, db, wss } = mod.exports;
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        const register = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'AdoptTester', password: 'TestPassword123!' }) });
        assert.equal(register.status, 201);
        const { token } = await register.json();
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        const progress = { adoptme_bucks: 543, adoptme_pets: [{ id: 'dragon', tasksDone: 7, ageIdx: 5 }, { id: 'dog', tasksDone: 10, ageIdx: 5 }] };
        const saved = await fetch(base + '/api/user/sync', { method: 'POST', headers, body: JSON.stringify(progress) });
        assert.equal(saved.status, 200);
        // A fresh authenticated GET has no client storage or cookies from the first device.
        const fresh = await fetch(base + '/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const { user } = await fresh.json();
        assert.equal(user.adoptme_bucks, 543);
        assert.deepEqual(user.adoptme_pets, [{ id: 'dragon', tasksDone: 7, ageIdx: 3 }, { id: 'dog', tasksDone: 10, ageIdx: 5 }]);
        const invalid = await fetch(base + '/api/user/sync', { method: 'POST', headers, body: JSON.stringify({ ...progress, adoptme_bucks: -1 }) });
        assert.equal(invalid.status, 400);
        const anonymous = await fetch(base + '/api/user/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(progress) });
        assert.equal(anonymous.status, 401);
        const unchanged = await fetch(base + '/api/user/sync', { method: 'POST', headers, body: '{}' });
        assert.equal((await unchanged.json()).user.adoptme_bucks, 543);
    } finally {
        await new Promise(resolve => wss.close(resolve));
        await new Promise(resolve => server.close(resolve));
        db.close();
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

test('selecting a pet dismounts safely and resets timed activity', () => {
    const context = vm.createContext({ gameSpecificData: { pets: [{ id: 'dog' }, { id: 'cat' }], isRidingPet: true, activityTime: 4 }, playerState: { speedMultiplier: 2, jumpMultiplier: 2 }, spawnAdoptMeActivePetMesh() {} });
    vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../src/ui/AdoptMeUI.js'), 'utf8'), context);
    vm.runInContext('selectAdoptMePet(1)', context);
    assert.equal(context.gameSpecificData.activePetIdx, 1);
    assert.equal(context.gameSpecificData.isRidingPet, false);
    assert.equal(context.gameSpecificData.activityTime, 0);
    assert.equal(context.playerState.speedMultiplier, 1);
    vm.runInContext('selectAdoptMePet(50)', context);
    assert.equal(context.gameSpecificData.activePetIdx, 1);
});

test('school and camping require five uninterrupted seconds in their own zones', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../src/core/PhysicsAndLoop.js'), 'utf8');
    // Run the activity portion of the real game tick without constructing the Three.js world.
    const start = source.indexOf('function updateGame11AdoptMe(');
    const end = source.indexOf('// 1. Update confetti particles', start);
    const completed = [];
    const context = vm.createContext({
        gameSpecificData: { currentNeed: { id: 'school' } },
        playerState: { pos: { x: -16, y: 3, z: -28 } },
        completeAdoptMeNeed(id) { completed.push(id); context.gameSpecificData.currentNeed = null; }
    });
    vm.runInContext(source.slice(start, end) + '}', context);
    vm.runInContext('updateGame11AdoptMe(4, 0)', context);
    assert.equal(completed.length, 0);
    context.playerState.pos.x = 0;
    vm.runInContext('updateGame11AdoptMe(1, 0)', context);
    assert.equal(context.gameSpecificData.activityTime, 0);
    context.playerState.pos.x = -16;
    vm.runInContext('updateGame11AdoptMe(5, 0)', context);
    assert.deepEqual(completed, ['school']);
    context.gameSpecificData.currentNeed = { id: 'camping' };
    vm.runInContext('updateGame11AdoptMe(5, 0)', context);
    assert.equal(completed.length, 1);
    context.playerState.pos.x = 16;
    vm.runInContext('updateGame11AdoptMe(5, 0)', context);
    assert.deepEqual(completed, ['school', 'camping']);
});
