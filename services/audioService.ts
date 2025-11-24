import { RarityId } from '../types';

class AudioService {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private globalVolume: number = 0.4; // Default volume (40%)
    
    // Signal specific nodes
    private signalOsc: OscillatorNode | null = null;
    private signalGain: GainNode | null = null;

    constructor() { }

    private init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.masterGain = this.ctx.createGain();
                this.masterGain.connect(this.ctx.destination);
                this.masterGain.gain.value = this.globalVolume;
            } catch (e) {
                console.error("AudioContext init failed", e);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.warn("Audio resume failed", e));
        }
    }

    public setVolume(volume: number) {
        // Clamp between 0 and 1
        this.globalVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.globalVolume;
        }
        // Re-init context if it was closed/not started to apply volume immediately on interaction
        if (volume > 0) this.init();
    }

    public getVolume(): number {
        return this.globalVolume;
    }

    public playClick() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) { }
    }

    public playRollSound() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            // Tech/Data sound
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch (e) { }
    }

    public playRaritySound(rarity: RarityId) {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            if (rarity >= RarityId.LEGENDARY) {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, t);
                osc.frequency.linearRampToValueAtTime(880, t + 0.5);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.linearRampToValueAtTime(0, t + 1);
                osc.start();
                osc.stop(t + 1);
            } else if (rarity >= RarityId.RARE) {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.3);
                osc.start();
                osc.stop(t + 0.3);
            }
        } catch (e) { }
    }

    public playCutsceneAmbience(rarity: RarityId) {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            const startFreq = rarity >= 10 ? 60 : 110;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, t);
            osc.frequency.exponentialRampToValueAtTime(startFreq / 2, t + 10);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.15, t + 1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 12);

            osc.start(t);
            osc.stop(t + 12);
        } catch (e) {
            console.warn("Audio error", e);
        }
    }

    public playBoom(rarity: RarityId) {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const t = this.ctx.currentTime;
            const intensity = Math.pow(rarity / 15, 2.5);
            const duration = 0.3 + (intensity * 5);

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            const startFreq = 150 - (intensity * 80);
            osc.frequency.setValueAtTime(Math.max(40, startFreq), t);
            osc.frequency.exponentialRampToValueAtTime(10, t + duration);

            gain.gain.setValueAtTime(0.5 + (intensity * 0.5), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

            osc.start(t);
            osc.stop(t + duration);

            if (rarity >= RarityId.UNCOMMON) {
                const bufferSize = this.ctx.sampleRate * duration;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / bufferSize), 3);
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const noiseFilter = this.ctx.createBiquadFilter();
                noiseFilter.type = 'lowpass';
                noiseFilter.frequency.setValueAtTime(500 + (intensity * 8000), t);
                noiseFilter.frequency.exponentialRampToValueAtTime(100, t + (duration * 0.5));

                const noiseGain = this.ctx.createGain();
                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(this.masterGain);

                noiseGain.gain.setValueAtTime(0.2 + (intensity * 0.6), t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + (duration * 0.8));

                noise.start(t);
            }

            if (rarity >= RarityId.LEGENDARY) {
                const laser = this.ctx.createOscillator();
                const laserGain = this.ctx.createGain();

                laser.connect(laserGain);
                laserGain.connect(this.masterGain);

                laser.type = 'sawtooth';
                laser.frequency.setValueAtTime(1000 + (intensity * 4000), t);
                laser.frequency.exponentialRampToValueAtTime(50, t + 0.4);

                laserGain.gain.setValueAtTime(0.1 * intensity, t);
                laserGain.gain.linearRampToValueAtTime(0, t + 0.4);

                laser.start(t);
                laser.stop(t + 0.4);
            }
        } catch (e) {
            console.error("Boom error", e);
        }
    }

    public playMineSound() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch (e) { }
    }

    public playGoldMineSound() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            // Sine wave for a smooth, bell-like tone
            osc.type = 'sine';
            // Start at 600Hz and drop slightly for a "clink" effect
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);

            // Very short envelope
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.01); 
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + 0.1);
        } catch (e) { }
    }

    public playFishSound() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

            noise.start();
        } catch (e) { }
    }

    public playHarvestSound() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            // Snip sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) { }
    }

    public playCoinWin(intensity: number = 1) {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const count = Math.min(intensity, 5);
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!this.ctx || !this.masterGain) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(this.masterGain);

                    osc.frequency.setValueAtTime(1000 + (i * 200), this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.1);

                    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.1);
                } catch (e) { }
            }, i * 100);
        }
    }

    public playCoinLose() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch (e) { }
    }

    public playCoinFlip() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) { }
    }

    public playSlotSpin() {
        this.playClick();
    }

    public playSlotStop() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'square';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) { }
    }

    public playSlotWin() {
        this.playCoinWin(5);
    }

    public setSignalProximity(proximity: number) {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            if (!this.signalOsc) {
                this.signalOsc = this.ctx.createOscillator();
                this.signalGain = this.ctx.createGain();

                this.signalOsc.type = 'sine';
                this.signalOsc.connect(this.signalGain);
                this.signalGain.connect(this.masterGain);

                this.signalOsc.start();
            }

            if (this.signalOsc && this.signalGain) {
                const targetFreq = 200 + (proximity * 800);
                this.signalOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
                this.signalGain.gain.setTargetAtTime(proximity * 0.1, this.ctx.currentTime, 0.1);
            }
        } catch (e) { }
    }

    public stopSignalScan() {
        try {
            if (this.signalOsc) {
                if (this.signalGain && this.ctx) {
                    this.signalGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
                }
                setTimeout(() => {
                    if (this.signalOsc) {
                        try { this.signalOsc.stop(); } catch (e) { }
                        this.signalOsc.disconnect();
                        this.signalOsc = null;
                    }
                    if (this.signalGain) {
                        this.signalGain.disconnect();
                        this.signalGain = null;
                    }
                }, 200);
            }
        } catch (e) { }
    }

    public playSignalLock() {
        if (this.globalVolume <= 0) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'square';
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            osc.frequency.setValueAtTime(1760, this.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);

            this.stopSignalScan();
        } catch (e) { }
    }
}

export const audioService = new AudioService();