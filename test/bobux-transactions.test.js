const { describe, it } = require('node:test');
const assert = require('node:assert');

// Setup minimal browser shims for Node test environment
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

const { formatBobuxTransaction, openBobuxTransactionsModal } = require('../src/ui/PortalUI.js');

describe('formatBobuxTransaction', () => {
    it('correctly formats negative transaction as expense', () => {
        const tx = { amount: -50, game: 'Blackjack sázka (50 B$)' };
        const result = formatBobuxTransaction(tx);

        assert.strictEqual(result.isExpense, true);
        assert.strictEqual(result.formattedAmount, '-50 B$');
        assert.strictEqual(result.amountClass, 'text-[#FF4D4D]');
        assert.strictEqual(result.labelText, 'Výdaj / Sázka');
        assert.strictEqual(result.iconColorClass, 'text-[#FF4D4D]');
    });

    it('correctly formats positive transaction as reward', () => {
        const tx = { amount: 120, game: 'Bedwars' };
        const result = formatBobuxTransaction(tx);

        assert.strictEqual(result.isExpense, false);
        assert.strictEqual(result.formattedAmount, '+120 B$');
        assert.strictEqual(result.amountClass, 'text-[#00B06F]');
        assert.strictEqual(result.labelText, 'Získáno');
        assert.strictEqual(result.iconColorClass, 'text-[#FFE066]');
    });

    it('formats large amounts with Czech locale formatting', () => {
        const expResult = formatBobuxTransaction({ amount: -1500 });
        const rewResult = formatBobuxTransaction({ amount: 2500 });

        assert.strictEqual(expResult.formattedAmount, `-${Math.abs(-1500).toLocaleString('cs-CZ')} B$`);
        assert.strictEqual(rewResult.formattedAmount, `+${(2500).toLocaleString('cs-CZ')} B$`);
    });

    it('handles zero or missing amount gracefully', () => {
        const zeroResult = formatBobuxTransaction({ amount: 0 });
        const emptyResult = formatBobuxTransaction({});

        assert.strictEqual(zeroResult.isExpense, false);
        assert.strictEqual(zeroResult.formattedAmount, '+0 B$');
        assert.strictEqual(emptyResult.isExpense, false);
        assert.strictEqual(emptyResult.formattedAmount, '+0 B$');
    });
});

describe('openBobuxTransactionsModal', () => {
    it('renders both positive and negative transaction rows into modal list', () => {

        const modalEl = {
            classList: {
                remove: (c) => modalEl.classes.delete(c),
                add: (c) => modalEl.classes.add(c)
            },
            classes: new Set(['hidden'])
        };

        const appendedRows = [];
        const listEl = {
            innerHTML: '',
            appendChild: (child) => appendedRows.push(child)
        };

        const balEl = { textContent: '' };

        global.escapeHtml = (str) => str;
        global.bobuxBalance = 500;
        global.bobuxTransactions = [
            { id: 'tx_1', amount: -50, game: 'Blackjack sázka', timestamp: 1700000000000 },
            { id: 'tx_2', amount: 150, game: 'Bedwars výhra', timestamp: 1700000000000 }
        ];

        global.document = {
            getElementById: (id) => {
                if (id === 'bobux-transactions-modal') return modalEl;
                if (id === 'bobux-transactions-list') return listEl;
                if (id === 'bobux-transactions-balance') return balEl;
                return null;
            },
            createElement: (tag) => {
                return {
                    tag,
                    className: '',
                    innerHTML: ''
                };
            }
        };

        openBobuxTransactionsModal();

        assert.strictEqual(appendedRows.length, 2);

        // First row: negative expense
        assert.ok(appendedRows[0].innerHTML.includes('text-[#FF4D4D]'));
        assert.ok(appendedRows[0].innerHTML.includes('-50 B$'));
        assert.ok(appendedRows[0].innerHTML.includes('Výdaj / Sázka'));

        // Second row: positive reward
        assert.ok(appendedRows[1].innerHTML.includes('text-[#00B06F]'));
        assert.ok(appendedRows[1].innerHTML.includes('+150 B$'));
        assert.ok(appendedRows[1].innerHTML.includes('Získáno'));
    });
});
