const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function getWheelPrizeTable() {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'games', 'GameWorlds.js'), 'utf8');
    const start = source.indexOf('const WHEEL_PRIZES = [');
    const end = source.indexOf('\n];', start);
    assert.notEqual(start, -1, 'Wheel prize table must exist in GameWorlds.js');
    assert.notEqual(end, -1, 'Wheel prize table must have a closing bracket');

    const context = {};
    vm.runInNewContext(`${source.slice(start, end + 3)}; globalThis.prizes = WHEEL_PRIZES;`, context);
    const priceMatch = source.match(/const WHEEL_PAID_SPIN_PRICE = (\d+);/);
    assert.ok(priceMatch, 'Paid wheel spin price must be defined');
    const paidSpinPrice = Number(priceMatch[1]);
    assert.match(source, /Math\.floor\(Math\.random\(\) \* WHEEL_PRIZES\.length\)/);
    assert.match(source, /localStorage\.removeItem\(STORAGE_KEY_CASINO_WHEEL\)/);
    assert.match(source, /spendBobux\(WHEEL_PAID_SPIN_PRICE,/);
    const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.ok(indexHtml.includes(`Extra zatočení stojí ${paidSpinPrice} B$.`));
    assert.ok(indexHtml.includes(`Další točení stojí ${paidSpinPrice} B$.`));
    return {
        prizes: Array.from(context.prizes, ({ type, amount }) => ({ type, amount })),
        paidSpinPrice
    };
}

describe('Casino wheel profitability', () => {
    it('keeps expected Bobux payout for a paid spin at or below its price', () => {
        const { prizes, paidSpinPrice } = getWheelPrizeTable();
        const prizeTotal = prizes.reduce(
            (total, prize) => total + (prize.type === 'bobux' ? prize.amount : 0),
            0);
        const extraSpinProbability = prizes.filter((prize) => prize.type === 'extra').length / prizes.length;
        const expectedPayout = prizeTotal / prizes.length / (1 - extraSpinProbability);

        assert.ok(
            expectedPayout <= paidSpinPrice,
            `Paid spin costs ${paidSpinPrice} B$ but returns ${expectedPayout.toFixed(2)} B$ on average, including free spins`
        );
    });
});
