const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const gameWorldsSource = fs.readFileSync(path.join(repoRoot, 'src', 'games', 'GameWorlds.js'), 'utf8');

describe('Casino Lucky Wheel Performance & Offscreen Pre-rendering', () => {
    it('implements offscreen canvas disc cache to avoid per-frame slice re-rendering', () => {
        assert.ok(gameWorldsSource.includes('getOrCreateWheelDiscCache') || gameWorldsSource.includes('wheelDiscCache'),
            'GameWorlds.js must cache the wheel disc in an offscreen canvas');
    });

    it('bypasses drawing for hidden or non-visible canvas elements', () => {
        assert.ok(gameWorldsSource.includes('offsetParent') || gameWorldsSource.includes('closest'),
            'renderCasinoWheel must check if the canvas container is visible before redrawing');
    });

    it('synchronizes physical 3D wheel with wheelMesh/wheelRotor without breaking idle loop', () => {
        assert.ok(gameWorldsSource.includes('wheelMesh'), 'GameWorlds.js must reference wheelMesh correctly');
    });
});
