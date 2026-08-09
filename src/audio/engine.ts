/**
 * The audio engine.
 *
 * Everything is synthesised live through the Web Audio graph that
 * react-native-audio-api exposes natively. There are no samples in the bundle.
 *
 * Signal flow:
 *
 *   oscillator layers → layer gain → filter → amp envelope ─┬─→ dry → master
 *                                                           └─→ send → reverb → master
 *
 *   master → soft-clip limiter → destination
 */

import {
  AudioContext,
  AudioBuffer,
  BiquadFilterNode,
  GainNode,
  OscillatorNode,
} from 'react-native-audio-api';

import {
  DRUM_VOICES,
  DrumVoiceDefinition,
  Envelope,
  InstrumentDefinition,
  getInstrument,
} from './instruments';

export interface PlayOptions {
  instrument?: string;
  /** 0–1. Affects loudness and, on most instruments, brightness. */
  velocity?: number;
  /** Seconds the note is held before release. Omit for a held note. */
  duration?: number;
  /** Absolute context time to start at. Defaults to now. */
  time?: number;
  /** Pitch offset in cents, for detuning and microtonal demos. */
  detune?: number;
  /** Multiplies the instrument's reverb send. */
  reverb?: number;
}

interface Voice {
  id: number;
  midi: number;
  oscillators: OscillatorNode[];
  amp: GainNode;
  filter: BiquadFilterNode;
  instrument: InstrumentDefinition;
  /** Peak gain reached by the envelope, needed to release correctly. */
  peak: number;
  releaseTime: number;
  stopAt: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverbInput: GainNode | null = null;
  private voices = new Map<number, Voice>();
  private heldVoices = new Map<string, number[]>();
  private nextVoiceId = 1;
  private noiseBuffer: AudioBuffer | null = null;
  private ready = false;
  private initPromise: Promise<void> | null = null;

  /** Global output level, 0–1. Mirrors the user's setting. */
  private volume = 0.8;
  private muted = false;
  /** A4 reference frequency. Exposed so the tuning lesson can move it. */
  tuning = 440;

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Build the audio graph. Safe to call repeatedly — concurrent callers share
   * one initialisation, which matters because several screens mount at once.
   */
  async init(): Promise<void> {
    if (this.ready) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.buildGraph();
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  private async buildGraph(): Promise<void> {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : this.volume;

    // A gentle soft-clipper rather than a true limiter. Chords of eight
    // oscillators can easily sum past 0 dBFS, and hard digital clipping on a
    // teaching app sounds like a bug.
    const limiter = ctx.createWaveShaper();
    limiter.curve = softClipCurve();
    limiter.oversample = '2x';

    // Reverb from a synthesised impulse response — no asset to ship.
    const convolver = ctx.createConvolver();
    convolver.buffer = impulseResponse(ctx, 2.4, 2.6);
    const reverbInput = ctx.createGain();
    reverbInput.gain.value = 1;
    const reverbLevel = ctx.createGain();
    reverbLevel.gain.value = 0.85;

    reverbInput.connect(convolver);
    convolver.connect(reverbLevel);
    reverbLevel.connect(master);
    master.connect(limiter);
    limiter.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.reverbInput = reverbInput;
    this.noiseBuffer = noiseBuffer(ctx, 2);
    this.ready = true;
  }

  get isReady(): boolean {
    return this.ready;
  }

  /** Current audio-clock time. Returns 0 before init. */
  get now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  setVolume(v: number) {
    this.volume = clamp(v, 0, 1);
    if (this.master && !this.muted) this.master.gain.value = this.volume;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : this.volume;
  }

  async suspend() {
    await this.ctx?.suspend().catch(() => undefined);
  }

  async resume() {
    await this.ctx?.resume().catch(() => undefined);
  }

  // ── Note playback ───────────────────────────────────────────────────────

  /** Play a note. With `duration`, it releases itself; without, hold it. */
  playNote(midi: number, options: PlayOptions = {}): number | null {
    if (!this.ctx || !this.master || !this.reverbInput) return null;
    const ctx = this.ctx;
    const instrument = getInstrument(options.instrument ?? 'grand');
    const velocity = clamp(options.velocity ?? 0.8, 0.05, 1);
    const start = Math.max(options.time ?? ctx.currentTime, ctx.currentTime);
    const freq = this.tuning * Math.pow(2, (midi - 69) / 12);

    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = instrument.filter.type;
    filter.Q.value = instrument.filter.Q;

    // Harder playing opens the filter — the single cheapest trick for making
    // synthesised instruments feel responsive rather than static.
    const cutoff = clamp(
      instrument.filter.frequency * (0.55 + velocity * 0.7) * pitchScale(midi),
      60,
      18000,
    );
    filter.frequency.setValueAtTime(cutoff, start);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(60, cutoff * instrument.filter.envelopeAmount),
      start + instrument.filter.envelopeTime,
    );

    const oscillators: OscillatorNode[] = [];
    for (const layer of instrument.layers) {
      const osc = ctx.createOscillator();
      osc.type = layer.waveform;
      osc.frequency.value = freq * Math.pow(2, layer.semitones / 12);
      osc.detune.value = layer.detune + (options.detune ?? 0);
      const layerGain = ctx.createGain();
      layerGain.gain.value = layer.gain;
      osc.connect(layerGain);
      layerGain.connect(filter);
      oscillators.push(osc);
    }

    filter.connect(amp);

    const dry = ctx.createGain();
    dry.gain.value = 1;
    amp.connect(dry);
    dry.connect(this.master);

    const sendAmount = clamp(instrument.reverbSend * (options.reverb ?? 1), 0, 1);
    if (sendAmount > 0.001) {
      const send = ctx.createGain();
      send.gain.value = sendAmount;
      amp.connect(send);
      send.connect(this.reverbInput);
    }

    // Higher notes are quieter and shorter on real instruments.
    const trackedRelease = instrument.envelope.release * releaseScale(midi, instrument.keyTracking);
    const peak = velocity * instrument.level * 0.32;

    applyAttack(amp, instrument.envelope, start, peak);

    const voiceId = this.nextVoiceId++;
    const voice: Voice = {
      id: voiceId,
      midi,
      oscillators,
      amp,
      filter,
      instrument,
      peak,
      releaseTime: trackedRelease,
      stopAt: Infinity,
    };
    this.voices.set(voiceId, voice);

    oscillators.forEach((osc) => osc.start(start));

    if (options.duration !== undefined) {
      const releaseAt = start + Math.max(0.02, options.duration);
      this.scheduleRelease(voice, releaseAt);
    }

    return voiceId;
  }

  /** Start a held note, keyed so `noteOff` can find it later. */
  noteOn(midi: number, options: PlayOptions = {}): void {
    const key = voiceKey(midi, options.instrument);
    const id = this.playNote(midi, { ...options, duration: undefined });
    if (id === null) return;
    const existing = this.heldVoices.get(key) ?? [];
    this.heldVoices.set(key, [...existing, id]);
  }

  /** Release a held note. */
  noteOff(midi: number, instrument?: string): void {
    const key = voiceKey(midi, instrument);
    const ids = this.heldVoices.get(key);
    if (!ids) return;
    this.heldVoices.delete(key);
    const releaseAt = this.now;
    ids.forEach((id) => {
      const voice = this.voices.get(id);
      if (voice) this.scheduleRelease(voice, releaseAt);
    });
  }

  private scheduleRelease(voice: Voice, at: number) {
    const release = voice.releaseTime;
    const end = at + release;
    if (end >= voice.stopAt) return;
    voice.stopAt = end;

    const gain = voice.amp.gain;
    gain.cancelScheduledValues(at);
    // cancelScheduledValues can leave the param at a stale value mid-ramp;
    // pinning it explicitly avoids an audible click on fast re-triggers.
    gain.setValueAtTime(Math.max(0.0001, currentEnvelopeValue(voice, at)), at);
    gain.exponentialRampToValueAtTime(0.0001, end);
    gain.linearRampToValueAtTime(0, end + 0.01);

    voice.oscillators.forEach((osc) => {
      try {
        osc.stop(end + 0.02);
      } catch {
        // Already stopped — harmless.
      }
    });

    const ttl = Math.max(0, (end + 0.1 - this.now) * 1000);
    setTimeout(() => this.disposeVoice(voice.id), ttl);
  }

  private disposeVoice(id: number) {
    const voice = this.voices.get(id);
    if (!voice) return;
    try {
      voice.amp.disconnect();
      voice.filter.disconnect();
      voice.oscillators.forEach((osc) => osc.disconnect());
    } catch {
      // Node already torn down.
    }
    this.voices.delete(id);
  }

  // ── Chords and sequences ────────────────────────────────────────────────

  /** Play notes together. `spread` staggers them into a strum or roll. */
  playChord(
    midiNotes: number[],
    options: PlayOptions & { spread?: number } = {},
  ): void {
    const base = options.time ?? this.now;
    const spread = options.spread ?? 0;
    midiNotes.forEach((midi, i) => {
      this.playNote(midi, {
        ...options,
        time: base + i * spread,
        duration: options.duration !== undefined ? options.duration - i * spread : undefined,
      });
    });
  }

  /**
   * Play a melodic line. Returns the total duration so callers can time UI.
   * `onStep` fires on the JS thread roughly in sync with each note.
   */
  playSequence(
    midiNotes: number[],
    options: PlayOptions & { noteLength?: number; gap?: number; onStep?: (index: number) => void } = {},
  ): number {
    const noteLength = options.noteLength ?? 0.42;
    const gap = options.gap ?? 0;
    const step = noteLength + gap;
    const base = (options.time ?? this.now) + 0.06;
    midiNotes.forEach((midi, i) => {
      this.playNote(midi, { ...options, time: base + i * step, duration: noteLength * 0.92 });
      if (options.onStep) {
        const delay = Math.max(0, (base + i * step - this.now) * 1000);
        setTimeout(() => options.onStep?.(i), delay);
      }
    });
    return midiNotes.length * step;
  }

  /** Play a series of chords — a progression audition. */
  playChordSequence(
    chords: number[][],
    options: PlayOptions & {
      chordLength?: number;
      spread?: number;
      onStep?: (index: number) => void;
    } = {},
  ): number {
    const chordLength = options.chordLength ?? 1.1;
    const base = (options.time ?? this.now) + 0.06;
    chords.forEach((notes, i) => {
      this.playChord(notes, {
        ...options,
        time: base + i * chordLength,
        duration: chordLength * 0.95,
        spread: options.spread ?? 0.012,
      });
      if (options.onStep) {
        const delay = Math.max(0, (base + i * chordLength - this.now) * 1000);
        setTimeout(() => options.onStep?.(i), delay);
      }
    });
    return chords.length * chordLength;
  }

  // ── Percussion ──────────────────────────────────────────────────────────

  /** Fire a synthesised drum voice. Used by the metronome and rhythm trainer. */
  playDrum(voiceId: string, options: { time?: number; velocity?: number } = {}): void {
    if (!this.ctx || !this.master) return;
    const def: DrumVoiceDefinition | undefined = DRUM_VOICES[voiceId];
    if (!def) return;
    const ctx = this.ctx;
    const start = Math.max(options.time ?? ctx.currentTime, ctx.currentTime);
    const velocity = clamp(options.velocity ?? 1, 0.05, 1);

    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = def.filterType;
    filter.frequency.value = def.filterFrequency;
    filter.Q.value = def.Q;
    filter.connect(amp);
    amp.connect(this.master);

    const level = def.level * velocity * 0.5;
    amp.gain.setValueAtTime(level, start);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + def.decay);
    amp.gain.linearRampToValueAtTime(0, start + def.decay + 0.01);

    if (def.kind === 'tone') {
      const osc = ctx.createOscillator();
      osc.type = def.waveform ?? 'sine';
      osc.frequency.setValueAtTime(def.frequency, start);
      if (def.sweepTo) {
        osc.frequency.exponentialRampToValueAtTime(
          def.sweepTo,
          start + (def.sweepTime ?? 0.08),
        );
      }
      osc.connect(filter);
      osc.start(start);
      osc.stop(start + def.decay + 0.05);
      setTimeout(
        () => {
          try {
            osc.disconnect();
            filter.disconnect();
            amp.disconnect();
          } catch {
            /* already gone */
          }
        },
        (start + def.decay + 0.2 - this.now) * 1000,
      );
    } else if (this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.connect(filter);
      src.start(start);
      src.stop(start + def.decay + 0.05);
      setTimeout(
        () => {
          try {
            src.disconnect();
            filter.disconnect();
            amp.disconnect();
          } catch {
            /* already gone */
          }
        },
        (start + def.decay + 0.2 - this.now) * 1000,
      );
    }
  }

  // ── Global control ──────────────────────────────────────────────────────

  /** Cut every sounding note. Called when leaving a screen. */
  stopAll(): void {
    const at = this.now;
    this.heldVoices.clear();
    this.voices.forEach((voice) => this.scheduleRelease(voice, at));
  }

  /** Number of voices currently sounding — surfaced in the synth lesson. */
  get activeVoiceCount(): number {
    return this.voices.size;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function voiceKey(midi: number, instrument?: string): string {
  return `${instrument ?? 'grand'}:${midi}`;
}

function applyAttack(amp: GainNode, envelope: Envelope, start: number, peak: number) {
  const { attack, decay, sustain } = envelope;
  const gain = amp.gain;
  gain.setValueAtTime(0.0001, start);
  gain.linearRampToValueAtTime(peak, start + Math.max(0.001, attack));
  gain.exponentialRampToValueAtTime(
    Math.max(0.0001, peak * Math.max(sustain, 0.0005)),
    start + attack + Math.max(0.005, decay),
  );
}

/**
 * Approximate where the envelope is at time `t`. Only needs to be close — it
 * exists to avoid a discontinuity when a note is released mid-attack.
 */
function currentEnvelopeValue(voice: Voice, t: number): number {
  return Math.max(0.0001, voice.peak * Math.max(voice.instrument.envelope.sustain, 0.05));
}

/** Brightness rises with pitch, but far less than linearly. */
function pitchScale(midi: number): number {
  return Math.pow(2, (midi - 60) / 36);
}

/** Higher notes ring for less time. `amount` is the instrument's key tracking. */
function releaseScale(midi: number, amount: number): number {
  const octavesAboveMiddle = (midi - 60) / 12;
  return clamp(1 - octavesAboveMiddle * amount * 0.22, 0.25, 2.2);
}

/** Symmetric soft saturation, gentle below unity and firm above it. */
function softClipCurve(samples = 2048): Float32Array {
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 1.15);
  }
  return curve;
}

/**
 * A synthesised reverb impulse: exponentially decaying noise, slightly
 * different per channel so the tail is stereo. `decay` shapes the curve —
 * higher values die away faster at the start.
 */
function impulseResponse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const buffer = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Slightly delayed onset reads as room size rather than a burst of noise.
      const early = t < 0.008 ? t / 0.008 : 1;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * early * 0.6;
    }
    buffer.copyToChannel(data, channel);
  }
  return buffer;
}

/** White noise used as the source for snares, hats and claps. */
function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const buffer = ctx.createBuffer(1, length, rate);
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  buffer.copyToChannel(data, 0);
  return buffer;
}

export const audioEngine = new AudioEngine();
export type { AudioEngine };
