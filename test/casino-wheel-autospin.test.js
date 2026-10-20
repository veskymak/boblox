const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const gameWorlds = fs.readFileSync(path.join(repoRoot, 'src', 'games', 'GameWorlds.js'), 'utf8');

describe('Casino wheel auto spin', () => {
    it('connects the auto-spin checkbox to its toggle handler', () => {
        assert.match(indexHtml, /id="wheel-auto-spin" onchange="toggleWheelAutoSpin\(\)"/);
    });

    it('continues spinning while enabled and disables itself when funds run out', () => {
        assert.match(gameWorlds, /if \(wheelAutoSpin\) \{\s*setTimeout\(\(\) => \{\s*if \(wheelAutoSpin && !isWheelSpinning\) spinDailyWheel\(\);\s*\}, 1200\);\s*\}/);
        assert.match(gameWorlds, /if \(bobuxBalance < WHEEL_PAID_SPIN_PRICE\) \{\s*wheelAutoSpin = false;\s*const cb = document\.getElementById\('wheel-auto-spin'\);\s*if \(cb\) cb\.checked = false;/);
    });
});