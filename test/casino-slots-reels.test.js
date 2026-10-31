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

for (const reducedMotion of [false, true]) {
    for (const [draw, payout, title] of [
        [[2, 2, 2], 200, 'VELKÁ VÝHRA!'],
        [[6, 6, 6], 1250, 'JACKPOT!'],
        [[0, 0, 1], 38, 'VÝHRA!'],
        [[0, 1, 2], 0, null]
    ]) {
        test(`animated slots ${draw}: payout and celebration agree (reduced motion: ${reducedMotion})`, () => {
            const source = fs.readFileSync(path.join(__dirname, '../src/games/GameWorlds.js'), 'utf8');
            const elements = new Map();
            const timers = [];
            const animations = [];
            const node = () => ({
                textContent: '7️⃣', dataset: {}, children: [], clientHeight: 128,
                style: { setProperty() {} },
                appendChild(child) { this.children.push(child); },
                replaceChildren(...children) { this.children = children; },
                animate(frames, options) {
                    const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } };
                    animations.push(animation);
                    return animation;
                },
                remove() {}
            });
            let paid = 0;
            let interval;
            const context = vm.createContext({
                document: {
                    createElement: node,
                    getElementById(id) {
                        if (!elements.has(id)) elements.set(id, node());
                        return elements.get(id);
                    }
                },
                window: { matchMedia: () => ({ matches: reducedMotion }) },
                bobuxBalance: 2000,
                spendBobux: () => true,
                addBobux: amount => { paid += amount; },
                updateCasinoBobuxDisplay() {},
                sfx: new Proxy({}, { get: () => () => {} }),
                spawnObbyConfetti() {}, THREE: { Vector3: class {} },
                setInterval: callback => { interval = callback; return 1; },
                clearInterval: () => { interval = null; },
                setTimeout: (callback, delay) => timers.push({ callback, delay })
            });
            vm.runInContext(source.slice(source.indexOf('const SLOTS_SYMBOLS ='), source.indexOf('const WHEEL_PRIZES =')), context);
            context.draw = [...draw];
            vm.runInContext('pickRandomSlotSymbol = () => draw.shift(); spinSlots();', context);
            assert.equal(animations.length, reducedMotion ? 0 : 3);
            const icons = ['🍒', '🍋', '🍇', '🔔', '💎', '🪙', '7️⃣'];
            if (!reducedMotion) {
                draw.forEach((symbol, i) => {
                    const cells = elements.get(`slot-reel-${i + 1}`).children[0].children;
                    assert.equal(cells.at(-1).textContent, icons[symbol]);
                    assert.match(animations[i].frames[1].transform, /translateY\(-\d+px\)/);
                });
            }
            for (const delay of [600, 1100, 1600]) {
                if (interval) interval();
                timers.find(timer => timer.delay === delay).callback();
            }
            assert.equal(paid, payout);
            assert.deepEqual([1, 2, 3].map(i => elements.get(`slot-reel-${i}`).textContent), draw.map(i => icons[i]));
            assert.ok(animations.every(animation => animation.cancelled));
            assert.equal(elements.get('slots-celebration').hidden, !payout);
            if (payout) {
                assert.equal(elements.get('slots-win-title').textContent, title);
                assert.equal(elements.get('slots-win-amount').textContent, `+${payout.toLocaleString('cs-CZ')} B$`);
            }
            assert.equal(elements.get('slots-particles').children.length > 0, !!payout && !reducedMotion);
        });
    }
}
