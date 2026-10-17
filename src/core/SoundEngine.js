/* ============================================================================
 * 1. WEB AUDIO API RETRO SYNTHESIZER (NO EXTERNAL AUDIO FILES)
 * ============================================================================ */
class BobloxSoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
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
}

const sfx = new BobloxSoundEngine();

function toggleAudioMute() {
    sfx.muted = !sfx.muted;
    document.getElementById('icon-sound-on').classList.toggle('hidden', sfx.muted);
    document.getElementById('icon-sound-off').classList.toggle('hidden', !sfx.muted);
}

