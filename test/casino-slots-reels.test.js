const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('stopped slot reels retain the symbols used for payout', () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/games/GameWorlds.js'), 'utf8');
    const start = source.indexOf('const SLOTS_SYMBOLS =');
    const end = source.indexOf('const WHEEL_PRIZES =', start);
    const elements = new Map();
    const timeouts = [];
    let cycle;
    let paid = 0;
    const context = vm.createContext({
        document: { getElementById(id) {
            if (!elements.has(id)) elements.set(id, { textContent: '' });
            return elements.get(id);
        } },
        Math: Object.assign(Object.create(Math), { random: () => 0 }),
        bobuxBalance: 1000,
        spendBobux: () => true,
        addBobux: amount => { paid += amount; },
        updateCasinoBobuxDisplay() {},
        sfx: new Proxy({}, { get: () => () => {} }),
        spawnObbyConfetti() {},
        THREE: { Vector3: class {} },
        setInterval: callback => { cycle = callback; return 1; },
        clearInterval: () => { cycle = null; },
        setTimeout: (callback, delay) => { timeouts.push({ callback, delay }); }
    });
    vm.runInContext(source.slice(start, end), context);
    vm.runInContext('pickRandomSlotSymbol = () => 2; spinSlots();', context);
    cycle();
    timeouts.find(timer => timer.delay === 600).callback();
    cycle();
    assert.equal(elements.get('slot-reel-1').textContent, '🍇', 'first stopped reel must not be overwritten');
    timeouts.find(timer => timer.delay === 1100).callback();
    cycle();
    assert.equal(elements.get('slot-reel-2').textContent, '🍇', 'second stopped reel must not be overwritten');
    timeouts.find(timer => timer.delay === 1600).callback();
    assert.deepEqual([1, 2, 3].map(i => elements.get(`slot-reel-${i}`).textContent), ['🍇', '🍇', '🍇']);
    assert.match(elements.get('slots-status-msg').textContent, /3x 🍇.*200 B\$/);
    assert.equal(paid, 200);
    assert.equal(cycle, null);
});
