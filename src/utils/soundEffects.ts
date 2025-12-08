/**
 * Emotional Sound Effects Utility
 * Uses Web Audio API to create rich, musical sounds that evoke emotions
 */

type SoundType = 'stageTransition' | 'triumph' | 'click' | 'whoosh' | 'reveal' | 'crackle' | 'zap';

class EmotionalSoundEngine {
    private ctx: AudioContext | null = null;
    private isEnabled: boolean = true;
    private isReady: boolean = false;
    private initAttempts: number = 0;

    constructor() {
        // Try to initialize immediately if possible
        this.tryInit();

        // Set up multiple interaction listeners as fallback
        if (typeof window !== 'undefined') {
            const events = ['click', 'touchstart', 'touchend', 'mousedown', 'keydown', 'scroll', 'pointerdown'];
            const initOnInteraction = () => {
                this.tryInit();
                if (this.isReady && this.initAttempts > 2) {
                    events.forEach(e => document.removeEventListener(e, initOnInteraction));
                }
            };
            events.forEach(e => document.addEventListener(e, initOnInteraction, { passive: true }));
        }
    }

    private tryInit() {
        this.initAttempts++;

        try {
            const AudioContextClass = window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

            if (!this.ctx) {
                this.ctx = new AudioContextClass();
            }

            // Resume if suspended (critical for mobile)
            if (this.ctx.state === 'suspended') {
                this.ctx.resume().then(() => {
                    this.isReady = true;
                    console.log('🔊 Audio context resumed successfully');
                }).catch(() => { });
            } else if (this.ctx.state === 'running') {
                this.isReady = true;
            }
        } catch {
            console.warn('Web Audio API not supported');
        }
    }

    // Force resume before playing any sound
    private async ensureReady() {
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
                this.isReady = true;
            } catch { }
        }
    }

    public enable() { this.isEnabled = true; }
    public disable() { this.isEnabled = false; }

    private createTone(
        frequency: number,
        duration: number,
        type: OscillatorType = 'sine',
        volume: number = 0.1,
        delay: number = 0
    ) {
        this.tryInit();
        this.ensureReady(); // Force resume AudioContext
        if (!this.ctx || !this.isEnabled) return null;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + delay);

            gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + delay);
            osc.stop(this.ctx.currentTime + delay + duration);

            return osc;
        } catch {
            return null;
        }
    }

    private playChord(frequencies: number[], duration: number, volume: number = 0.08) {
        frequencies.forEach((freq, i) => {
            this.createTone(freq, duration, 'sine', volume / frequencies.length, i * 0.02);
        });
    }

    private playSequence(frequencies: number[], noteDuration: number, volume: number = 0.1) {
        frequencies.forEach((freq, i) => {
            this.createTone(freq, noteDuration, 'sine', volume, i * noteDuration * 0.7);
        });
    }

    public stageTransition(stageIndex: number) {
        const baseFreq = 220 + (stageIndex * 55);
        this.createTone(baseFreq, 0.15, 'sine', 0.06);
        this.createTone(baseFreq * 1.5, 0.12, 'sine', 0.04, 0.05);
    }

    public triumph() {
        const notes = [261.63, 329.63, 392.00, 523.25];
        this.playSequence(notes, 0.15, 0.08);
        setTimeout(() => {
            this.playChord([523.25, 659.25, 783.99], 0.3, 0.05);
        }, 400);
    }

    public click() {
        this.createTone(800, 0.05, 'sine', 0.03);
        this.createTone(1200, 0.03, 'sine', 0.02, 0.01);
    }

    public whoosh() {
        this.tryInit();
        if (!this.ctx || !this.isEnabled) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.1);
            filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

            osc.frequency.setValueAtTime(100, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
            osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch { }
    }

    public reveal() {
        const notes = [440, 554.37, 659.25];
        notes.forEach((freq, i) => {
            this.createTone(freq, 0.1, 'sine', 0.04, i * 0.03);
        });
    }

    public neonCrackle() {
        const numBursts = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numBursts; i++) {
            const delay = i * 0.08 + Math.random() * 0.04;
            const freq = 80 + Math.random() * 40;
            const duration = 0.02 + Math.random() * 0.03;

            this.createTone(freq, duration, 'square', 0.015, delay);
            this.createTone(freq * 20 + Math.random() * 1000, duration * 0.5, 'sawtooth', 0.008, delay);
        }
    }

    public electricZap() {
        this.tryInit();
        if (!this.ctx || !this.isEnabled) return;

        try {
            const now = this.ctx.currentTime;

            // === Layer 1: Initial bright CRACK (high frequency transient) ===
            const crackOsc = this.ctx.createOscillator();
            const crackGain = this.ctx.createGain();
            const crackFilter = this.ctx.createBiquadFilter();

            crackOsc.type = 'sawtooth';
            crackFilter.type = 'highpass';
            crackFilter.frequency.setValueAtTime(2000, now);
            crackFilter.frequency.exponentialRampToValueAtTime(500, now + 0.08);

            crackOsc.frequency.setValueAtTime(3000, now);
            crackOsc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

            crackGain.gain.setValueAtTime(0.12, now);
            crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            crackOsc.connect(crackFilter);
            crackFilter.connect(crackGain);
            crackGain.connect(this.ctx.destination);

            crackOsc.start(now);
            crackOsc.stop(now + 0.1);

            // === Layer 2: White noise burst (the sizzle) ===
            const noiseLength = 0.15;
            const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * noiseLength, this.ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.3));
            }

            const noiseSource = this.ctx.createBufferSource();
            const noiseGain = this.ctx.createGain();
            const noiseFilter = this.ctx.createBiquadFilter();

            noiseSource.buffer = noiseBuffer;
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(4000, now);
            noiseFilter.Q.setValueAtTime(0.5, now);

            noiseGain.gain.setValueAtTime(0.08, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseLength);

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noiseSource.start(now);

            // === Layer 3: Low rumble (the thunder roll) ===
            const rumbleOsc = this.ctx.createOscillator();
            const rumbleGain = this.ctx.createGain();
            const rumbleFilter = this.ctx.createBiquadFilter();

            rumbleOsc.type = 'triangle';
            rumbleFilter.type = 'lowpass';
            rumbleFilter.frequency.setValueAtTime(150, now);

            rumbleOsc.frequency.setValueAtTime(80, now);
            rumbleOsc.frequency.setValueAtTime(60, now + 0.1);
            rumbleOsc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

            rumbleGain.gain.setValueAtTime(0, now);
            rumbleGain.gain.linearRampToValueAtTime(0.06, now + 0.02);
            rumbleGain.gain.setValueAtTime(0.06, now + 0.05);
            rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            rumbleOsc.connect(rumbleFilter);
            rumbleFilter.connect(rumbleGain);
            rumbleGain.connect(this.ctx.destination);

            rumbleOsc.start(now);
            rumbleOsc.stop(now + 0.4);

            // === Layer 4: Quick "snap" for impact ===
            const snapOsc = this.ctx.createOscillator();
            const snapGain = this.ctx.createGain();

            snapOsc.type = 'square';
            snapOsc.frequency.setValueAtTime(150, now);
            snapOsc.frequency.exponentialRampToValueAtTime(50, now + 0.02);

            snapGain.gain.setValueAtTime(0.1, now);
            snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

            snapOsc.connect(snapGain);
            snapGain.connect(this.ctx.destination);

            snapOsc.start(now);
            snapOsc.stop(now + 0.05);

        } catch { }
    }

    public play(sound: SoundType, options?: { stageIndex?: number }) {
        switch (sound) {
            case 'stageTransition':
                this.stageTransition(options?.stageIndex || 0);
                break;
            case 'triumph':
                this.triumph();
                break;
            case 'click':
                this.click();
                break;
            case 'whoosh':
                this.whoosh();
                break;
            case 'reveal':
                this.reveal();
                break;
            case 'crackle':
                this.neonCrackle();
                break;
            case 'zap':
                this.electricZap();
                break;
        }
    }
}

export const soundEngine = new EmotionalSoundEngine();

export const useSoundEffects = () => {
    return {
        playTransition: (stageIndex: number) => soundEngine.play('stageTransition', { stageIndex }),
        playTriumph: () => soundEngine.play('triumph'),
        playClick: () => soundEngine.play('click'),
        playWhoosh: () => soundEngine.play('whoosh'),
        playReveal: () => soundEngine.play('reveal'),
        playCrackle: () => soundEngine.play('crackle'),
        playZap: () => soundEngine.play('zap'),
        enable: () => soundEngine.enable(),
        disable: () => soundEngine.disable(),
    };
};
