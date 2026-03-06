/**
 * AETHER-ROME: SYNTHETIC AUDIO ENGINE v3.0 (AAA STANDARD)
 * Architecture: Procedural Synthesis, ADSR Envelopes, Master Bus Compression
 * Tier: FAANG / Sound Design God Level
 */
export class AudioEngine {
    // 🔒 PRIVATE FIELDS
    #ctx;
    #masterGain;
    #compressor;
    #noiseBuffer;
    #isUnlocked = false;

    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.#ctx = new AudioContext();

        this.#setupMasterBus();
        this.#generateNoiseBuffer();
    }

    // ==========================================
    // 1. ENGINE INFRASTRUCTURE & UX
    // ==========================================

    #setupMasterBus() {
        // MASTER GAIN: Controls overall volume
        this.#masterGain = this.#ctx.createGain();
        this.#masterGain.gain.value = 0.7; // 70% volume to leave headroom

        // DYNAMICS COMPRESSOR: Prevents clipping/distortion when multiple sounds overlap
        this.#compressor = this.#ctx.createDynamicsCompressor();
        this.#compressor.threshold.value = -10;
        this.#compressor.knee.value = 40;
        this.#compressor.ratio.value = 12;
        this.#compressor.attack.value = 0;
        this.#compressor.release.value = 0.25;

        // Routing: Synth -> Compressor -> Master Gain -> Speakers
        this.#compressor.connect(this.#masterGain);
        this.#masterGain.connect(this.#ctx.destination);
    }

    /**
     * BROWSER POLICY COMPLIANCE: Must be called on first user click.
     * Browsers suspend audio contexts until the user interacts with the page.
     */
    unlock() {
        if (!this.#isUnlocked) {
            if (this.#ctx.state === 'suspended') this.#ctx.resume();
            
            // Play an inaudible tone to firmly unlock the audio thread
            const osc = this.#ctx.createOscillator();
            osc.connect(this.#ctx.destination);
            osc.start(0);
            osc.stop(this.#ctx.currentTime + 0.001);
            
            this.#isUnlocked = true;
            console.log("🔊 [AUDIO SYSTEM]: Master Bus Unlocked & Ready.");
        }
    }

    // ==========================================
    // 2. PROCEDURAL SYNTHESIS (God Tier Sound Design)
    // ==========================================

    /**
     * Triumphant Arpeggio (Major Chord)
     * Uses layered sine/triangle waves with a fast decay for a "chime" effect.
     */
    playSuccess() {
        const now = this.#ctx.currentTime;
        // C Major Arpeggio (C5, E5, G5, C6)
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
            this.#playOscillator("sine", freq, now + (index * 0.08), {
                attack: 0.01, decay: 0.1, sustain: 0, release: 0.1, peak: 0.5
            });
            // Add a subtle "sparkle" layer
            this.#playOscillator("triangle", freq * 2, now + (index * 0.08), {
                attack: 0.01, decay: 0.05, sustain: 0, release: 0.05, peak: 0.1
            });
        });
    }

    /**
     * Heavy Cinematic Error (Low Pass Filtered Sawtooth)
     * Sounds like a heavy, ancient brass horn failing.
     */
    playError() {
        const now = this.#ctx.currentTime;
        const osc = this.#ctx.createOscillator();
        const filter = this.#ctx.createBiquadFilter();
        const gain = this.#ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, now); // A2 (Low pitch)
        osc.detune.setValueAtTime(-50, now); // Slightly detuned for a "dissonant" feel

        // Filter sweeping down creates a "doom" drop effect
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        // ADSR Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.6, now + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5); // Decay

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.#compressor);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    /**
     * Kinetic Arrow Shot (Filtered White Noise Burst)
     * Uses procedural static passed through a sweeping bandpass filter.
     */
    playArrow() {
        const now = this.#ctx.currentTime;
        
        const noiseSource = this.#ctx.createBufferSource();
        noiseSource.buffer = this.#noiseBuffer;

        const filter = this.#ctx.createBiquadFilter();
        const gain = this.#ctx.createGain();

        // Bandpass sweeps up to simulate wind rushing past
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.15);
        filter.Q.value = 1.5; // Resonance

        // Arrow "Whoosh" envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.02); // Sharp attack
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); // Fast tail

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.#compressor);

        noiseSource.start(now);
        noiseSource.stop(now + 0.2);
    }

    // ==========================================
    // 3. INTERNAL UTILITIES
    // ==========================================

    /**
     * Helper to play a sculpted waveform using an ADSR envelope.
     */
    #playOscillator(type, freq, time, adsr) {
        const osc = this.#ctx.createOscillator();
        const gain = this.#ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        // Apply ADSR (Attack, Decay, Sustain, Release)
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(adsr.peak, time + adsr.attack);
        gain.gain.linearRampToValueAtTime(adsr.sustain, time + adsr.attack + adsr.decay);
        gain.gain.linearRampToValueAtTime(0, time + adsr.attack + adsr.decay + adsr.release);

        osc.connect(gain);
        gain.connect(this.#compressor);

        osc.start(time);
        osc.stop(time + adsr.attack + adsr.decay + adsr.release + 0.1);
    }

    /**
     * Pre-computes 1 second of pure white noise directly into RAM.
     * Prevents runtime generation costs.
     */
    #generateNoiseBuffer() {
        const bufferSize = this.#ctx.sampleRate * 1.0; // 1 second of audio
        const buffer = this.#ctx.createBuffer(1, bufferSize, this.#ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Float between -1.0 and 1.0
        }
        this.#noiseBuffer = buffer;
    }
}

// Global Singleton Export
export const AudioSystem = new AudioEngine();
