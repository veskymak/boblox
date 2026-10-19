/* ============================================================================
 * 1. WEB AUDIO API RETRO SYNTHESIZER & CASINO BACKGROUND MUSIC
 * ============================================================================
 * ⚙️ AUDIO CONFIGURATION: DEFAULT VOLUMES & SETTINGS
 * Zde můžeš nastavit výchozí hlasitost hudby v casinu (hodnota mezi 0.0 a 1.0):
 * Například 0.35 = 35% hlasitost.
 * ============================================================================ */
const DEFAULT_CASINO_MUSIC_VOLUME = 0.35; // <- VÝCHOZÍ HLASITOST HUDBY V CASINU (0.35 = 35%)
const CASINO_MUSIC_TRACK_URL = 'assets/audio/casino_bgm.mp3';

class BobloxSoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicAudio = null;
        this.currentMusicTrack = null;
        this.musicVolume = DEFAULT_CASINO_MUSIC_VOLUME;
        this.isMusicMuted = false;
        this.isPlayingMusic = false;
        this.initMusicVolume();
    }

    initMusicVolume() {
        try {
            if (typeof localStorage !== 'undefined') {
                const storageKey = (typeof window !== 'undefined' && window.STORAGE_KEYS && window.STORAGE_KEYS.MUSIC_VOLUME)
                    ? window.STORAGE_KEYS.MUSIC_VOLUME
                    : 'boblox_music_volume_v1';
                const saved = localStorage.getItem(storageKey);
                if (saved !== null) {
                    const parsed = parseFloat(saved);
                    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
                        this.musicVolume = parsed;
                    }
                }
            }
        } catch (e) {}
    }

    getEffectiveMusicVolume() {
        if (this.muted || this.isMusicMuted) return 0;
        return this.musicVolume;
    }

    setMusicVolume(vol) {
        const parsed = parseFloat(vol);
        if (isNaN(parsed)) return;
        this.musicVolume = Math.max(0, Math.min(1, parsed));
        if (this.musicAudio) {
            this.musicAudio.volume = this.getEffectiveMusicVolume();
        }
        try {
            if (typeof localStorage !== 'undefined') {
                const storageKey = (typeof window !== 'undefined' && window.STORAGE_KEYS && window.STORAGE_KEYS.MUSIC_VOLUME)
                    ? window.STORAGE_KEYS.MUSIC_VOLUME
                    : 'boblox_music_volume_v1';
                localStorage.setItem(storageKey, String(this.musicVolume));
            }
        } catch (e) {}
        this.syncMusicUI();
    }

    toggleMusicMute() {
        this.isMusicMuted = !this.isMusicMuted;
        if (this.musicAudio) {
            this.musicAudio.volume = this.getEffectiveMusicVolume();
        }
        this.syncMusicUI();
        return this.isMusicMuted;
    }

    syncMusicUI() {
        if (typeof document === 'undefined') return;
        const pct = Math.round(this.musicVolume * 100);

        // 1. In Roblox ESC Menu Settings modal
        const rblxSlider = document.getElementById('rblx-setting-music-slider');
        const rblxVal = document.getElementById('rblx-setting-music-val');
        if (rblxSlider) rblxSlider.value = String(pct);
        if (rblxVal) rblxVal.textContent = (this.muted || this.isMusicMuted) ? 'Muted (0%)' : `${pct}%`;

        // 2. In Casino modal header
        const casinoSlider = document.getElementById('casino-music-modal-slider');
        const casinoVal = document.getElementById('casino-music-modal-val');
        const casinoMuteIcon = document.getElementById('casino-music-mute-icon');
        if (casinoSlider) casinoSlider.value = String(pct);
        if (casinoVal) casinoVal.textContent = (this.muted || this.isMusicMuted) ? '0%' : `${pct}%`;
        if (casinoMuteIcon) {
            casinoMuteIcon.textContent = (this.muted || this.isMusicMuted || pct === 0) ? '🔇' : (pct < 40 ? '🔉' : '🔊');
        }
    }

    playMusic(trackUrl = CASINO_MUSIC_TRACK_URL, loop = true) {
        if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
        try {
            if (!this.musicAudio) {
                this.musicAudio = new Audio();
                this.musicAudio.preload = 'auto';
            }
            if (this.currentMusicTrack !== trackUrl || !this.musicAudio.src) {
                this.musicAudio.src = trackUrl;
                this.currentMusicTrack = trackUrl;
            }
            this.musicAudio.loop = loop;
            this.musicAudio.volume = this.getEffectiveMusicVolume();
            this.isPlayingMusic = true;

            const playPromise = this.musicAudio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    // Browser autoplay policy might delay audio until user interaction
                });
            }
        } catch (e) {
            console.warn('[BobloxSoundEngine] playMusic error:', e);
        }
    }

    playCasinoMusic() {
        this.playMusic(CASINO_MUSIC_TRACK_URL, true);
    }

    stopMusic() {
        if (this.musicAudio) {
            try {
                this.musicAudio.pause();
                this.musicAudio.currentTime = 0;
            } catch (e) {}
        }
        this.isPlayingMusic = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = (typeof window !== 'undefined') ? (window.AudioContext || window.webkitAudioContext) : null;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.16);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    playCoin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [987.77, 1318.51]; // B5 -> E6 classic coin/cash chime
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.2, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.25);
        });
    }

    playOof() {
        // Iconic classic Roblox "OOF!" synthesized with formant-like pitch drop
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(310, now);
        osc1.frequency.linearRampToValueAtTime(195, now + 0.12);
        osc1.frequency.linearRampToValueAtTime(140, now + 0.28);

        osc2.frequency.setValueAtTime(620, now);
        osc2.frequency.linearRampToValueAtTime(390, now + 0.12);
        osc2.frequency.linearRampToValueAtTime(280, now + 0.28);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(520, now);
        filter.Q.setValueAtTime(3.2, now);

        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.008, now + 0.30);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.31);
        osc2.stop(now + 0.31);
    }

    playSwordSlash() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Metallic lunge swoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    playSwordHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.14);

        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playWinFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
        chord.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);
            gain.gain.setValueAtTime(0.22, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.46);
        });
    }

    playExplosion() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }

    playGunshot(pitch = 420) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.11);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playReload() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [320, 480].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.09);
            gain.gain.setValueAtTime(0.15, now + i * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.09 + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.09);
            osc.stop(now + i * 0.09 + 0.09);
        });
    }

    playCardFlip() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
    }

    playSlotSpin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    playWheelTick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.035);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
    }

    playDerbyHorn() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Classic equestrian bugle fanfare: G4(392), C5(523), E5(659), G5(784), E5(659), G5(784)
        const notes = [
            { f: 392.00, dur: 0.12, delay: 0.00 },
            { f: 523.25, dur: 0.12, delay: 0.12 },
            { f: 659.25, dur: 0.12, delay: 0.24 },
            { f: 783.99, dur: 0.24, delay: 0.36 },
            { f: 659.25, dur: 0.12, delay: 0.62 },
            { f: 783.99, dur: 0.45, delay: 0.74 }
        ];
        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(n.f, now + n.delay);
            gain.gain.setValueAtTime(0.18, now + n.delay);
            gain.gain.exponentialRampToValueAtTime(0.005, now + n.delay + n.dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + n.delay);
            osc.stop(now + n.delay + n.dur);
        });
    }

    playJackpot() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        arpeggio.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.16, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.36);
        });
    }
}

const sfx = new BobloxSoundEngine();

function toggleAudioMute() {
    sfx.muted = !sfx.muted;
    if (sfx.musicAudio) {
        sfx.musicAudio.volume = sfx.getEffectiveMusicVolume();
    }
    sfx.syncMusicUI();
    const iconOn = typeof document !== 'undefined' ? document.getElementById('icon-sound-on') : null;
    const iconOff = typeof document !== 'undefined' ? document.getElementById('icon-sound-off') : null;
    if (iconOn) iconOn.classList.toggle('hidden', sfx.muted);
    if (iconOff) iconOff.classList.toggle('hidden', !sfx.muted);
    if (typeof updateRobloxSettingsUI === 'function') {
        updateRobloxSettingsUI();
    }
}

function setMusicVolumeFromUI(val) {
    if (typeof sfx !== 'undefined') {
        sfx.setMusicVolume(val);
    }
}

function toggleMusicMute() {
    if (typeof sfx !== 'undefined') {
        return sfx.toggleMusicMute();
    }
    return false;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BobloxSoundEngine,
        sfx,
        DEFAULT_CASINO_MUSIC_VOLUME,
        CASINO_MUSIC_TRACK_URL,
        toggleAudioMute,
        setMusicVolumeFromUI,
        toggleMusicMute
    };
}

