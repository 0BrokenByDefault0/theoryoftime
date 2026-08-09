/**
 * Instrument definitions.
 *
 * Every sound in the app is synthesised at runtime rather than sampled. That
 * keeps the bundle tiny, lets any note in any octave be played instantly, and
 * — more importantly for a teaching app — means the synthesis parameters are
 * themselves teachable material. The production lessons reach into these
 * same structures.
 */

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface Envelope {
  /** Seconds to reach full level. */
  attack: number;
  /** Seconds to fall from peak to the sustain level. */
  decay: number;
  /** Level held while the note is down, 0–1. */
  sustain: number;
  /** Seconds to fade to silence after release. */
  release: number;
}

export interface OscillatorLayer {
  waveform: Waveform;
  /** Relative level of this layer, 0–1. */
  gain: number;
  /** Pitch offset in semitones (12 = one octave up). */
  semitones: number;
  /** Fine offset in cents — small amounts create chorus-like thickness. */
  detune: number;
}

export interface InstrumentDefinition {
  id: string;
  name: string;
  description: string;
  /** Emoji used as the picker glyph. */
  glyph: string;
  layers: OscillatorLayer[];
  envelope: Envelope;
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass';
    /** Cutoff at note-on, in Hz. */
    frequency: number;
    Q: number;
    /** How far the filter sweeps down over the note, as a multiplier. */
    envelopeAmount: number;
    /** Seconds for the filter sweep. */
    envelopeTime: number;
  };
  /** Master level trim so instruments feel equally loud. */
  level: number;
  /** Send level into the shared reverb, 0–1. */
  reverbSend: number;
  /**
   * Higher notes decay faster on real instruments. This scales release time
   * down as pitch rises, which is most of what makes a synth "piano" read as
   * a piano rather than an organ.
   */
  keyTracking: number;
}

const env = (attack: number, decay: number, sustain: number, release: number): Envelope => ({
  attack,
  decay,
  sustain,
  release,
});

export const INSTRUMENTS: InstrumentDefinition[] = [
  {
    id: 'grand',
    name: 'Grand Piano',
    description: 'Bright hammered attack with a long, tapering tail.',
    glyph: '🎹',
    layers: [
      { waveform: 'triangle', gain: 0.6, semitones: 0, detune: 0 },
      { waveform: 'sine', gain: 0.34, semitones: 12, detune: 2 },
      { waveform: 'sine', gain: 0.12, semitones: 19, detune: -3 },
      { waveform: 'sawtooth', gain: 0.06, semitones: 0, detune: 6 },
    ],
    envelope: env(0.004, 1.1, 0.16, 0.5),
    filter: { type: 'lowpass', frequency: 5200, Q: 0.6, envelopeAmount: 0.35, envelopeTime: 0.9 },
    level: 0.85,
    reverbSend: 0.22,
    keyTracking: 0.55,
  },
  {
    id: 'epiano',
    name: 'Electric Piano',
    description: 'Bell-like tine with a soft, woody body. Rhodes territory.',
    glyph: '🎼',
    layers: [
      { waveform: 'sine', gain: 0.7, semitones: 0, detune: 0 },
      { waveform: 'sine', gain: 0.22, semitones: 24, detune: 4 },
      { waveform: 'triangle', gain: 0.18, semitones: 12, detune: -4 },
    ],
    envelope: env(0.006, 1.4, 0.22, 0.7),
    filter: { type: 'lowpass', frequency: 3400, Q: 0.8, envelopeAmount: 0.4, envelopeTime: 1.2 },
    level: 0.9,
    reverbSend: 0.3,
    keyTracking: 0.4,
  },
  {
    id: 'pad',
    name: 'Warm Pad',
    description: 'Slow swelling strings. Made for hearing chords bloom.',
    glyph: '🌊',
    layers: [
      { waveform: 'sawtooth', gain: 0.32, semitones: 0, detune: -8 },
      { waveform: 'sawtooth', gain: 0.32, semitones: 0, detune: 8 },
      { waveform: 'triangle', gain: 0.3, semitones: 12, detune: 0 },
      { waveform: 'sine', gain: 0.2, semitones: -12, detune: 0 },
    ],
    envelope: env(0.55, 0.9, 0.75, 1.6),
    filter: { type: 'lowpass', frequency: 2200, Q: 1.1, envelopeAmount: 1.5, envelopeTime: 1.4 },
    level: 0.6,
    reverbSend: 0.55,
    keyTracking: 0.15,
  },
  {
    id: 'pluck',
    name: 'Synth Pluck',
    description: 'Short, filtered and percussive. Excellent for hearing intervals.',
    glyph: '✨',
    layers: [
      { waveform: 'sawtooth', gain: 0.5, semitones: 0, detune: 0 },
      { waveform: 'square', gain: 0.25, semitones: 0, detune: 7 },
      { waveform: 'sine', gain: 0.25, semitones: 12, detune: 0 },
    ],
    envelope: env(0.002, 0.28, 0.0, 0.24),
    filter: { type: 'lowpass', frequency: 4800, Q: 3.5, envelopeAmount: 0.12, envelopeTime: 0.3 },
    level: 0.8,
    reverbSend: 0.3,
    keyTracking: 0.5,
  },
  {
    id: 'organ',
    name: 'Drawbar Organ',
    description: 'Stacked harmonics, no decay. Every note holds forever.',
    glyph: '⛪',
    layers: [
      { waveform: 'sine', gain: 0.42, semitones: 0, detune: 0 },
      { waveform: 'sine', gain: 0.26, semitones: 12, detune: 0 },
      { waveform: 'sine', gain: 0.18, semitones: 19, detune: 0 },
      { waveform: 'sine', gain: 0.12, semitones: 24, detune: 2 },
      { waveform: 'sine', gain: 0.08, semitones: 28, detune: -2 },
    ],
    envelope: env(0.02, 0.05, 0.9, 0.12),
    filter: { type: 'lowpass', frequency: 6000, Q: 0.4, envelopeAmount: 1, envelopeTime: 0.1 },
    level: 0.62,
    reverbSend: 0.35,
    keyTracking: 0.1,
  },
  {
    id: 'bass',
    name: 'Sub Bass',
    description: 'Round low end. Use it to hear how roots and inversions sit.',
    glyph: '🔊',
    layers: [
      { waveform: 'sine', gain: 0.7, semitones: 0, detune: 0 },
      { waveform: 'triangle', gain: 0.28, semitones: 12, detune: 0 },
      { waveform: 'sawtooth', gain: 0.08, semitones: 0, detune: 4 },
    ],
    envelope: env(0.012, 0.5, 0.55, 0.28),
    filter: { type: 'lowpass', frequency: 900, Q: 1.4, envelopeAmount: 0.5, envelopeTime: 0.4 },
    level: 1.0,
    reverbSend: 0.05,
    keyTracking: 0.3,
  },
  {
    id: 'sine',
    name: 'Pure Tone',
    description: 'One sine wave, nothing else. The cleanest way to train an ear.',
    glyph: '◎',
    layers: [{ waveform: 'sine', gain: 1, semitones: 0, detune: 0 }],
    envelope: env(0.02, 0.1, 0.85, 0.22),
    filter: { type: 'lowpass', frequency: 12000, Q: 0.3, envelopeAmount: 1, envelopeTime: 0.1 },
    level: 0.55,
    reverbSend: 0.12,
    keyTracking: 0.2,
  },
  {
    id: 'strings',
    name: 'Strings',
    description: 'Bowed ensemble with a slow bloom. Voice leading becomes obvious.',
    glyph: '🎻',
    layers: [
      { waveform: 'sawtooth', gain: 0.34, semitones: 0, detune: -6 },
      { waveform: 'sawtooth', gain: 0.34, semitones: 0, detune: 6 },
      { waveform: 'sawtooth', gain: 0.18, semitones: 12, detune: 12 },
      { waveform: 'triangle', gain: 0.14, semitones: -12, detune: 0 },
    ],
    envelope: env(0.18, 0.6, 0.8, 0.9),
    filter: { type: 'lowpass', frequency: 3000, Q: 0.9, envelopeAmount: 1.2, envelopeTime: 0.8 },
    level: 0.62,
    reverbSend: 0.45,
    keyTracking: 0.2,
  },
];

export const INSTRUMENTS_BY_ID: Record<string, InstrumentDefinition> = Object.fromEntries(
  INSTRUMENTS.map((i) => [i.id, i]),
);

export const DEFAULT_INSTRUMENT = 'grand';

export function getInstrument(id: string): InstrumentDefinition {
  return INSTRUMENTS_BY_ID[id] ?? INSTRUMENTS_BY_ID[DEFAULT_INSTRUMENT];
}

/** Percussion is synthesised from noise and pitched blips rather than samples. */
export interface DrumVoiceDefinition {
  id: string;
  /** 'noise' voices use filtered white noise; 'tone' voices use an oscillator. */
  kind: 'noise' | 'tone';
  frequency: number;
  /** Frequency the tone sweeps to, for kicks and toms. */
  sweepTo?: number;
  sweepTime?: number;
  decay: number;
  filterType: 'lowpass' | 'highpass' | 'bandpass';
  filterFrequency: number;
  Q: number;
  level: number;
  waveform?: Waveform;
}

export const DRUM_VOICES: Record<string, DrumVoiceDefinition> = {
  kick: {
    id: 'kick',
    kind: 'tone',
    waveform: 'sine',
    frequency: 130,
    sweepTo: 42,
    sweepTime: 0.08,
    decay: 0.42,
    filterType: 'lowpass',
    filterFrequency: 2400,
    Q: 0.5,
    level: 1.0,
  },
  snare: {
    id: 'snare',
    kind: 'noise',
    frequency: 1800,
    decay: 0.19,
    filterType: 'bandpass',
    filterFrequency: 1900,
    Q: 0.9,
    level: 0.6,
  },
  clap: {
    id: 'clap',
    kind: 'noise',
    frequency: 1400,
    decay: 0.24,
    filterType: 'bandpass',
    filterFrequency: 1400,
    Q: 1.6,
    level: 0.55,
  },
  hat: {
    id: 'hat',
    kind: 'noise',
    frequency: 9000,
    decay: 0.045,
    filterType: 'highpass',
    filterFrequency: 8000,
    Q: 1.2,
    level: 0.3,
  },
  openhat: {
    id: 'openhat',
    kind: 'noise',
    frequency: 8000,
    decay: 0.34,
    filterType: 'highpass',
    filterFrequency: 7000,
    Q: 1.0,
    level: 0.24,
  },
  rim: {
    id: 'rim',
    kind: 'tone',
    waveform: 'square',
    frequency: 420,
    decay: 0.06,
    filterType: 'bandpass',
    filterFrequency: 2200,
    Q: 4,
    level: 0.45,
  },
  perc: {
    id: 'perc',
    kind: 'tone',
    waveform: 'triangle',
    frequency: 660,
    sweepTo: 520,
    sweepTime: 0.05,
    decay: 0.16,
    filterType: 'bandpass',
    filterFrequency: 1500,
    Q: 2.4,
    level: 0.4,
  },
  click: {
    id: 'click',
    kind: 'tone',
    waveform: 'square',
    frequency: 1000,
    decay: 0.035,
    filterType: 'bandpass',
    filterFrequency: 2000,
    Q: 2,
    level: 0.35,
  },
  clickAccent: {
    id: 'clickAccent',
    kind: 'tone',
    waveform: 'square',
    frequency: 1600,
    decay: 0.045,
    filterType: 'bandpass',
    filterFrequency: 2600,
    Q: 2,
    level: 0.5,
  },
};
