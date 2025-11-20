
import { RarityId } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private activeNodes: AudioNode[] = [];

  constructor() {
    // Initialize on first user interaction
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.4; // Slightly louder for epicness
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private stopAll() {
    this.activeNodes.forEach(node => {
        try {
            node.disconnect();
            // @ts-ignore
            if(node.stop) node.stop();
        } catch (e) {}
    });
    this.activeNodes = [];
  }

  // --- FX UTILITIES ---

  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private createDelay(input: AudioNode, time: number, feedbackVal: number, mixVal: number) {
      if (!this.ctx || !this.masterGain) return;
      const delay = this.ctx.createDelay();
      delay.delayTime.value = time;

      const feedback = this.ctx.createGain();
      feedback.gain.value = feedbackVal;

      const mix = this.ctx.createGain();
      mix.gain.value = mixVal;
      
      // Filter the delay repeats for a "tape dub" effect
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;

      input.connect(delay);
      delay.connect(filter);
      filter.connect(feedback);
      feedback.connect(delay);
      
      delay.connect(mix);
      mix.connect(this.masterGain);
      
      this.activeNodes.push(delay, feedback, mix, filter);
  }

  // --- PUBLIC METHODS ---

  public toggleMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.4, this.ctx!.currentTime);
    }
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // High tech blip
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playRollSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.08; // Short burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseGain.gain.setValueAtTime(0.15, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.start(t);
  }

  public playRaritySound(rarity: RarityId) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Just a simple confirmation sound, since cutscenes handle the big audio
    if (rarity >= RarityId.DIVINE) {
       // Heavy Impact
       const osc = this.ctx.createOscillator();
       const gain = this.ctx.createGain();
       osc.frequency.setValueAtTime(150, t);
       osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
       gain.gain.setValueAtTime(0.5, t);
       gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
       
       osc.connect(gain);
       gain.connect(this.masterGain);
       osc.start(t);
       osc.stop(t + 0.5);
    } else {
       // Standard Ping
       const osc = this.ctx.createOscillator();
       const gain = this.ctx.createGain();
       osc.type = 'sine';
       osc.frequency.setValueAtTime(440 + (rarity * 100), t);
       gain.gain.setValueAtTime(0.1, t);
       gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
       osc.connect(gain);
       gain.connect(this.masterGain);
       osc.start(t);
       osc.stop(t + 0.3);
    }
  }

  public playCutsceneAmbience(rarity: RarityId) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    
    this.stopAll();
    const t = this.ctx.currentTime;

    switch(rarity) {
        case RarityId.PRIMORDIAL: this.playPrimordialTrack(t); break;
        case RarityId.INFINITE: this.playInfiniteTrack(t); break;
        case RarityId.CHAOS: this.playChaosTrack(t); break;
        case RarityId.THE_ONE: this.playTheOneTrack(t); break;
        default: this.playPrimordialTrack(t); break; // Fallback
    }
  }

  // --- CINEMATIC PROCEDURAL TRACKS ---

  private playPrimordialTrack(t: number) {
      // 1. Magma Drone (Deep, detuned, lowpassed saws)
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const droneGain = this.ctx!.createGain();
      const droneFilter = this.ctx!.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.value = 45;
      osc2.frequency.value = 45.5; // Detune for beating effect
      
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 150;
      // Open filter slowly
      droneFilter.frequency.linearRampToValueAtTime(400, t + 6);

      osc1.connect(droneFilter);
      osc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.masterGain!);

      droneGain.gain.setValueAtTime(0, t);
      droneGain.gain.linearRampToValueAtTime(0.6, t + 2);
      droneGain.gain.linearRampToValueAtTime(0, t + 8);

      osc1.start(t); osc2.start(t);
      osc1.stop(t + 8); osc2.stop(t + 8);
      this.activeNodes.push(osc1, osc2, droneGain, droneFilter);

      // 2. Rhythmic Impacts (War Drums / Heartbeat)
      for (let i = 0; i < 6; i++) {
          const hitT = t + (i * 1.2);
          const kick = this.ctx!.createOscillator();
          const kickGain = this.ctx!.createGain();
          
          kick.frequency.setValueAtTime(120, hitT);
          kick.frequency.exponentialRampToValueAtTime(20, hitT + 0.3);
          
          kickGain.gain.setValueAtTime(0.8, hitT);
          kickGain.gain.exponentialRampToValueAtTime(0.01, hitT + 0.4);
          
          // Add distortion to kick
          const shaper = this.ctx!.createWaveShaper();
          shaper.curve = this.makeDistortionCurve(400);
          
          kick.connect(shaper);
          shaper.connect(kickGain);
          kickGain.connect(this.masterGain!);
          
          kick.start(hitT);
          kick.stop(hitT + 0.4);
          this.activeNodes.push(kick, kickGain, shaper);
      }

      // 3. Sizzling Atmosphere (Highpass Noise)
      const bufferSize = this.ctx!.sampleRate * 2;
      const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx!.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseFilter = this.ctx!.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;
      const noiseGain = this.ctx!.createGain();
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain!);
      
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(0.05, t + 3);
      noiseGain.gain.linearRampToValueAtTime(0, t + 8);
      
      noise.start(t);
      noise.stop(t + 8);
      this.activeNodes.push(noise, noiseGain, noiseFilter);
  }

  private playInfiniteTrack(t: number) {
      // 1. The Riser (Shepard-tone-like illusion)
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(100, t);
      osc1.frequency.exponentialRampToValueAtTime(2000, t + 8);
      osc2.frequency.setValueAtTime(102, t);
      osc2.frequency.exponentialRampToValueAtTime(2020, t + 8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 4);
      gain.gain.linearRampToValueAtTime(0, t + 8);
      
      osc1.start(t); osc2.start(t);
      osc1.stop(t + 8); osc2.stop(t + 8);
      this.activeNodes.push(osc1, osc2, gain);

      // 2. Crystalline Arps (Hyperspace blips)
      // Rapid random notes
      const arpGain = this.ctx!.createGain();
      arpGain.connect(this.masterGain!);
      this.createDelay(arpGain, 0.2, 0.5, 0.5); // Add delay to arp

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C Major spread
      for(let i = 0; i < 40; i++) {
          const noteT = t + (i * 0.15);
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
          
          osc.connect(g);
          g.connect(arpGain);
          
          g.gain.setValueAtTime(0.1, noteT);
          g.gain.exponentialRampToValueAtTime(0.001, noteT + 0.2);
          
          osc.start(noteT);
          osc.stop(noteT + 0.2);
          this.activeNodes.push(osc, g);
      }
      this.activeNodes.push(arpGain);
  }

  private playChaosTrack(t: number) {
      // 1. The Glitch Bass (FM Synthesis style)
      const carrier = this.ctx!.createOscillator();
      const modulator = this.ctx!.createOscillator();
      const modGain = this.ctx!.createGain();
      const mainGain = this.ctx!.createGain();

      carrier.frequency.value = 60;
      modulator.frequency.value = 400; // High ratio for harsh sound
      modGain.gain.value = 500;

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(mainGain);
      mainGain.connect(this.masterGain!);

      // Randomly change modulation depth
      for(let i = 0; i < 20; i++) {
          const modT = t + (i * 0.4);
          modGain.gain.linearRampToValueAtTime(Math.random() * 1000, modT);
          carrier.frequency.setValueAtTime(50 + Math.random() * 50, modT);
      }

      mainGain.gain.setValueAtTime(0.4, t);
      mainGain.gain.linearRampToValueAtTime(0, t + 8);

      carrier.start(t); modulator.start(t);
      carrier.stop(t + 8); modulator.stop(t + 8);
      this.activeNodes.push(carrier, modulator, modGain, mainGain);

      // 2. Data Screams (Square waves random pitch)
      for(let i = 0; i < 15; i++) {
          const screamT = t + Math.random() * 6;
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(200 + Math.random() * 2000, screamT);
          // Pitch drop
          osc.frequency.exponentialRampToValueAtTime(100, screamT + 0.3);
          
          osc.connect(g);
          g.connect(this.masterGain!);
          g.gain.setValueAtTime(0.1, screamT);
          g.gain.exponentialRampToValueAtTime(0.001, screamT + 0.3);
          
          osc.start(screamT);
          osc.stop(screamT + 0.3);
          this.activeNodes.push(osc, g);
      }
  }

  private playTheOneTrack(t: number) {
      // THX Deep Note Style Crescendo
      // Stack of oscillators drifting from random freq to a massive chord
      const oscCount = 7;
      const targetFreqs = [32.70, 65.41, 130.81, 196.00, 261.63, 392.00, 523.25]; // C1, C2, C3, G3, C4, G4, C5
      const gainNode = this.ctx!.createGain();
      
      gainNode.connect(this.masterGain!);
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.5, t + 4); // Crescendo
      gainNode.gain.linearRampToValueAtTime(0.5, t + 8); // Hold
      gainNode.gain.linearRampToValueAtTime(0, t + 10); // Release

      for (let i = 0; i < oscCount; i++) {
          const osc = this.ctx!.createOscillator();
          osc.type = 'sawtooth';
          // Start at random chaotic frequency between 200 and 800
          const startFreq = 200 + Math.random() * 600;
          osc.frequency.setValueAtTime(startFreq, t);
          
          // Slide to target frequency
          // We use setTargetAtTime for a smooth asymptotic approach
          osc.frequency.exponentialRampToValueAtTime(targetFreqs[i], t + 4);

          osc.connect(gainNode);
          osc.start(t);
          osc.stop(t + 10);
          this.activeNodes.push(osc);
      }
      this.activeNodes.push(gainNode);
  }
}

export const audioService = new AudioService();
