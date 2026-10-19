const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Setup minimal browser mocks for Node test environment
global.window = global;
const storageStore = {};
global.localStorage = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, val) => { storageStore[key] = String(val); },
    removeItem: (key) => { delete storageStore[key]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

let mockElements = {};
global.document = {
    readyState: 'complete',
    getElementById: (id) => mockElements[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
};

// Mock Audio element for Node.js
class MockAudio {
    constructor(src = '') {
        this.src = src;
        this.loop = false;
        this.volume = 1.0;
        this.paused = true;
        this.currentTime = 0;
    }
    play() {
        this.paused = false;
        return Promise.resolve();
    }
    pause() {
        this.paused = true;
    }
}
global.Audio = MockAudio;

const SoundEngineModule = require('../src/core/SoundEngine.js');
const { BobloxSoundEngine, DEFAULT_CASINO_MUSIC_VOLUME, CASINO_MUSIC_TRACK_URL } = SoundEngineModule;

describe('Casino Background Music & Volume Control', () => {
    beforeEach(() => {
        global.localStorage.clear();
        mockElements = {
            'rblx-setting-music-slider': { value: '35' },
            'rblx-setting-music-val': { textContent: '35%' },
            'casino-music-modal-slider': { value: '35' },
            'casino-music-modal-val': { textContent: '35%' },
            'casino-music-mute-icon': { textContent: '🔊' },
            'icon-sound-on': { classList: { toggle: () => {} } },
            'icon-sound-off': { classList: { toggle: () => {} } }
        };
    });

    it('exports DEFAULT_CASINO_MUSIC_VOLUME as a valid number between 0.0 and 1.0', () => {
        assert.strictEqual(typeof DEFAULT_CASINO_MUSIC_VOLUME, 'number');
        assert.ok(DEFAULT_CASINO_MUSIC_VOLUME >= 0 && DEFAULT_CASINO_MUSIC_VOLUME <= 1);
        assert.strictEqual(typeof CASINO_MUSIC_TRACK_URL, 'string');
        assert.ok(CASINO_MUSIC_TRACK_URL.includes('casino_bgm.mp3'));
    });

    it('verifies that the audio file exists on disk in assets/audio/casino_bgm.mp3', () => {
        const audioPath = path.resolve(__dirname, '..', 'assets', 'audio', 'casino_bgm.mp3');
        assert.ok(fs.existsSync(audioPath), 'assets/audio/casino_bgm.mp3 must exist');
        const stats = fs.statSync(audioPath);
        assert.ok(stats.size > 100000, `Audio file must not be empty (found size: ${stats.size} bytes)`);
    });

    it('initializes BobloxSoundEngine with default volume when localStorage is empty', () => {
        const engine = new BobloxSoundEngine();
        assert.strictEqual(engine.musicVolume, DEFAULT_CASINO_MUSIC_VOLUME);
        assert.strictEqual(engine.isMusicMuted, false);
        assert.strictEqual(engine.isPlayingMusic, false);
    });

    it('loads saved volume preference from localStorage on initialization', () => {
        global.localStorage.setItem('boblox_music_volume_v1', '0.15');
        const engine = new BobloxSoundEngine();
        assert.strictEqual(engine.musicVolume, 0.15);
    });

    it('allows players to set music volume, clamping between 0 and 1 and persisting to localStorage', () => {
        const engine = new BobloxSoundEngine();
        engine.setMusicVolume(0.20);
        assert.strictEqual(engine.musicVolume, 0.20);
        assert.strictEqual(global.localStorage.getItem('boblox_music_volume_v1'), '0.2');

        // Test clamping bounds
        engine.setMusicVolume(1.8);
        assert.strictEqual(engine.musicVolume, 1.0);
        engine.setMusicVolume(-0.5);
        assert.strictEqual(engine.musicVolume, 0.0);
    });

    it('supports toggling music mute while preserving the user chosen volume level', () => {
        const engine = new BobloxSoundEngine();
        engine.setMusicVolume(0.25);
        assert.strictEqual(engine.getEffectiveMusicVolume(), 0.25);

        // Mute music
        engine.toggleMusicMute();
        assert.strictEqual(engine.isMusicMuted, true);
        assert.strictEqual(engine.getEffectiveMusicVolume(), 0);
        assert.strictEqual(engine.musicVolume, 0.25); // preserved!

        // Unmute music
        engine.toggleMusicMute();
        assert.strictEqual(engine.isMusicMuted, false);
        assert.strictEqual(engine.getEffectiveMusicVolume(), 0.25);
    });

    it('plays and stops casino music correctly updating audio instance state', () => {
        const engine = new BobloxSoundEngine();
        engine.setMusicVolume(0.30);
        engine.playCasinoMusic();

        assert.ok(engine.musicAudio);
        assert.strictEqual(engine.isPlayingMusic, true);
        assert.strictEqual(engine.musicAudio.paused, false);
        assert.strictEqual(engine.musicAudio.loop, true);
        assert.strictEqual(engine.musicAudio.volume, 0.30);

        engine.stopMusic();
        assert.strictEqual(engine.isPlayingMusic, false);
        assert.strictEqual(engine.musicAudio.paused, true);
    });

    it('verifies index.html has casino music controls in both casino modal and roblox settings', () => {
        const repoRoot = path.resolve(__dirname, '..');
        const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

        assert.ok(indexHtml.includes('casino-music-modal-slider'), 'index.html must include casino-music-modal-slider');
        assert.ok(indexHtml.includes('rblx-setting-music-slider'), 'index.html must include rblx-setting-music-slider');
        assert.ok(indexHtml.includes('setMusicVolumeFromUI'), 'index.html must connect slider oninput to setMusicVolumeFromUI');
    });

    it('verifies GameWorlds.js and Engine.js connect casino setup and cleanup with sound engine', () => {
        const gameWorlds = fs.readFileSync(path.join(__dirname, '..', 'src', 'games', 'GameWorlds.js'), 'utf8');
        const engineJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'core', 'Engine.js'), 'utf8');

        assert.ok(gameWorlds.includes('playCasinoMusic') || engineJs.includes('playCasinoMusic'), 'GameWorlds or Engine must trigger playCasinoMusic');
        assert.ok(engineJs.includes('stopMusic'), 'Engine.js cleanupCurrentGame must trigger stopMusic');
    });
});
