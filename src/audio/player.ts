/**
 * The bridge between theory objects and sound.
 *
 * Screens should reach for these helpers rather than the raw engine, so that
 * "play this chord" stays one line and voicing decisions live in one place.
 */

import { audioEngine } from './engine';
import {
  Chord,
  Key,
  Note,
  ScaleDefinition,
  buildScaleWithOctave,
  chordMidi,
  nearestInversion,
  progressionToChords,
  toMidi,
} from '../theory';

export type PlaybackDirection = 'up' | 'down' | 'both';

export interface ScalePlaybackOptions {
  instrument?: string;
  bpm?: number;
  direction?: PlaybackDirection;
  onStep?: (index: number) => void;
}

/** Play a scale as a run. Returns its total duration in seconds. */
export function playScale(
  tonic: Note,
  scale: ScaleDefinition,
  options: ScalePlaybackOptions = {},
): { midi: number[]; duration: number } {
  const { bpm = 132, direction = 'up' } = options;
  const ascending = buildScaleWithOctave(tonic, scale).map(toMidi);
  const midi =
    direction === 'up'
      ? ascending
      : direction === 'down'
        ? [...ascending].reverse()
        : [...ascending, ...[...ascending].reverse().slice(1)];

  const noteLength = 60 / bpm;
  const duration = audioEngine.playSequence(midi, {
    instrument: options.instrument,
    noteLength,
    velocity: 0.75,
    onStep: options.onStep,
  });
  return { midi, duration };
}

/** Play a chord as a block. */
export function playChord(
  chord: Chord,
  options: { instrument?: string; duration?: number; spread?: number; velocity?: number } = {},
): number[] {
  const midi = chordMidi(chord);
  audioEngine.playChord(midi, {
    instrument: options.instrument,
    duration: options.duration ?? 1.6,
    spread: options.spread ?? 0.014,
    velocity: options.velocity ?? 0.8,
  });
  return midi;
}

/** Play a chord one note at a time, so the stack is audible. */
export function arpeggiateChord(
  chord: Chord,
  options: { instrument?: string; bpm?: number; onStep?: (i: number) => void } = {},
): number[] {
  const midi = chordMidi(chord);
  const noteLength = 60 / (options.bpm ?? 150);
  audioEngine.playSequence(midi, {
    instrument: options.instrument,
    noteLength,
    velocity: 0.78,
    onStep: options.onStep,
  });
  return midi;
}

export interface ProgressionPlaybackOptions {
  instrument?: string;
  bpm?: number;
  beatsPerChord?: number;
  /** Pick inversions that minimise movement between chords. */
  smoothVoiceLeading?: boolean;
  /** Add a bass note an octave below each root. */
  withBass?: boolean;
  onStep?: (index: number) => void;
}

/**
 * Audition a Roman-numeral progression in a key.
 *
 * With `smoothVoiceLeading` the chords are re-inverted to sit close to each
 * other, which is the difference between "a list of chords" and "music".
 */
export function playProgression(
  romans: string[],
  key: Key,
  options: ProgressionPlaybackOptions = {},
): { chords: Chord[]; voicings: number[][]; duration: number } {
  const {
    bpm = 92,
    beatsPerChord = 2,
    smoothVoiceLeading = true,
    withBass = true,
  } = options;

  const raw = progressionToChords(romans, key, 4);
  const chords: Chord[] = [];
  const voicings: number[][] = [];
  let previous: number[] = [];

  for (const chord of raw) {
    const voiced = smoothVoiceLeading && previous.length ? nearestInversion(previous, chord) : chord;
    const midi = chordMidi(voiced);
    chords.push(voiced);
    voicings.push(midi);
    previous = midi;
  }

  const chordLength = (60 / bpm) * beatsPerChord;
  const start = audioEngine.now + 0.08;

  voicings.forEach((midi, i) => {
    const time = start + i * chordLength;
    audioEngine.playChord(midi, {
      instrument: options.instrument,
      time,
      duration: chordLength * 0.94,
      spread: 0.014,
      velocity: 0.72,
    });
    if (withBass) {
      audioEngine.playDrum('kick', { time, velocity: 0.35 });
      audioEngine.playNote(Math.min(...midi) - 12, {
        instrument: 'bass',
        time,
        duration: chordLength * 0.9,
        velocity: 0.7,
      });
    }
    if (options.onStep) {
      const delay = Math.max(0, (time - audioEngine.now) * 1000);
      setTimeout(() => options.onStep?.(i), delay);
    }
  });

  return { chords, voicings, duration: voicings.length * chordLength };
}

/** Play two notes as an interval — melodically then harmonically, or either. */
export function playInterval(
  low: number,
  high: number,
  options: { instrument?: string; style?: 'harmonic' | 'melodic' | 'both'; gap?: number } = {},
): void {
  const { style = 'melodic', gap = 0.55, instrument } = options;
  const now = audioEngine.now + 0.05;
  if (style === 'harmonic') {
    audioEngine.playChord([low, high], { instrument, time: now, duration: 1.8, velocity: 0.8 });
    return;
  }
  audioEngine.playNote(low, { instrument, time: now, duration: gap * 0.9, velocity: 0.8 });
  audioEngine.playNote(high, { instrument, time: now + gap, duration: gap * 0.9, velocity: 0.8 });
  if (style === 'both') {
    audioEngine.playChord([low, high], {
      instrument,
      time: now + gap * 2.2,
      duration: 1.8,
      velocity: 0.75,
    });
  }
}

/** A short cadence in a key — orients the ear before an ear-training question. */
export function playKeyContext(key: Key, options: { instrument?: string; bpm?: number } = {}): number {
  const { bpm = 120 } = options;
  const result = playProgression(['I', 'IV', 'V', 'I'], key, {
    ...options,
    bpm,
    beatsPerChord: 1,
    withBass: false,
    smoothVoiceLeading: true,
  });
  return result.duration;
}

export function stopAll() {
  audioEngine.stopAll();
}
