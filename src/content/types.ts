/**
 * The content model.
 *
 * Lessons are data, not code. A lesson is a list of cards; a card is either
 * prose, an interactive widget, or a question. The widget vocabulary below is
 * what makes it possible to write a lot of genuinely interactive material
 * without writing a bespoke screen for every idea.
 */

import { Tier } from '../theme';

// ── Widgets ───────────────────────────────────────────────────────────────

export type WidgetSpec =
  /** A keyboard, optionally with a scale or chord lit up. */
  | {
      type: 'piano';
      startMidi?: number;
      octaves?: number;
      /** Light up a scale: tonic note name plus scale id. */
      scale?: { tonic: string; scaleId: string };
      /** Light up a chord by symbol, e.g. "Cmaj7". */
      chord?: string;
      /** Explicit MIDI notes to highlight. */
      notes?: number[];
      labelMode?: 'none' | 'letters' | 'c-only' | 'all';
      /** Label highlighted keys with scale degrees rather than letters. */
      showDegrees?: boolean;
      caption?: string;
    }
  /** Audition a scale, with the notes lighting up as they play. */
  | { type: 'scale'; tonic: string; scaleId: string; caption?: string }
  /** A single chord: keyboard, staff, notes, and a play button. */
  | { type: 'chord'; symbol: string; showStaff?: boolean; caption?: string }
  /** Compare several chords side by side. */
  | { type: 'chordSet'; symbols: string[]; caption?: string }
  /** A Roman-numeral progression in a key, playable and transposable. */
  | {
      type: 'progression';
      romans: string[];
      tonic: string;
      mode: 'major' | 'minor';
      /** Reference the progression library instead, for the annotations. */
      progressionId?: string;
      caption?: string;
    }
  /** The interactive circle of fifths. */
  | { type: 'circle'; caption?: string }
  /** Staff notation of specific notes. */
  | {
      type: 'staff';
      notes: string[];
      clef?: 'treble' | 'bass';
      keyTonic?: string;
      keyMode?: 'major' | 'minor';
      chord?: boolean;
      caption?: string;
    }
  /** A fretboard with a scale or chord shape mapped onto it. */
  | { type: 'fretboard'; scale?: { tonic: string; scaleId: string }; chord?: string; caption?: string }
  /** Interval explorer — pick two notes, hear and name the interval. */
  | { type: 'intervalLab'; caption?: string }
  /** Drum machine with a named preset loaded. */
  | { type: 'drumMachine'; patternId?: string; caption?: string }
  /** Euclidean rhythm generator. */
  | { type: 'euclidean'; pulses?: number; steps?: number; caption?: string }
  /** Metronome with subdivision control. */
  | { type: 'metronome'; bpm?: number; beats?: number; caption?: string }
  /** ADSR envelope playground, wired to a live voice. */
  | { type: 'adsr'; caption?: string }
  /** Filter sweep playground with a live magnitude plot. */
  | { type: 'filter'; caption?: string }
  /** Waveform and harmonic-series comparison. */
  | { type: 'waveform'; caption?: string }
  /** Compressor transfer-function explorer. */
  | { type: 'compressor'; caption?: string }
  /** The frequency-band reference ruler. */
  | { type: 'frequencyBands'; caption?: string }
  /** Tempo-synced delay time calculator. */
  | { type: 'delayCalc'; bpm?: number; caption?: string }
  /** Voicing comparison for one chord. */
  | { type: 'voicings'; symbol: string; caption?: string }
  /** Side-by-side modal comparison over a drone. */
  | { type: 'modeCompare'; tonic?: string; caption?: string }
  /** A free-play keyboard that names whatever you play. */
  | { type: 'chordDetective'; caption?: string };

// ── Cards ─────────────────────────────────────────────────────────────────

export interface CalloutSpec {
  variant: 'insight' | 'warning' | 'pro' | 'listen';
  title?: string;
  text: string;
}

export interface ConceptCard {
  kind: 'concept';
  title: string;
  /** Paragraphs of prose. */
  body: string[];
  callouts?: CalloutSpec[];
  widget?: WidgetSpec;
  /** A short punchy line shown large above the body. */
  lede?: string;
}

export interface InteractiveCard {
  kind: 'interactive';
  title: string;
  instruction: string;
  widget: WidgetSpec;
  body?: string[];
  callouts?: CalloutSpec[];
}

export interface QuizCard {
  kind: 'quiz';
  question: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** Shown after answering, right or wrong. */
  explain: string;
  /** Optional widget shown above the question. */
  widget?: WidgetSpec;
  /** Adds this to the spaced-repetition deck when answered. */
  reviewId?: string;
  reviewCategory?: string;
}

export interface EarCard {
  kind: 'ear';
  question: string;
  /** What to play. */
  prompt:
    | { type: 'interval'; semitones: number; style?: 'melodic' | 'harmonic' }
    | { type: 'chord'; symbol: string }
    | { type: 'scale'; tonic: string; scaleId: string }
    | { type: 'progression'; romans: string[]; tonic: string; mode: 'major' | 'minor' };
  options: string[];
  answer: number;
  explain: string;
  reviewId?: string;
  reviewCategory?: string;
}

/** "Play a C major triad on the keyboard" — checked against real pitch classes. */
export interface BuildCard {
  kind: 'build';
  title: string;
  instruction: string;
  /** Pitch classes (0–11) the learner must play, in any octave or order. */
  targetPitchClasses: number[];
  /** How many distinct notes are expected. */
  expectedCount: number;
  hint: string;
  explain: string;
  startMidi?: number;
  octaves?: number;
}

export type LessonCard = ConceptCard | InteractiveCard | QuizCard | EarCard | BuildCard;

// ── Lessons and stages ────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  /** One line shown in the stage list. */
  summary: string;
  /** Minutes, rounded. */
  minutes: number;
  xp: number;
  cards: LessonCard[];
  /** Lesson ids that should be finished first. */
  requires?: string[];
}

export interface Stage {
  id: string;
  title: string;
  /** Two or three words describing the destination. */
  tagline: string;
  description: string;
  tier: Tier;
  /** Emoji shown on the path node. */
  glyph: string;
  /** Accent colour for everything inside this stage. */
  color: string;
  gradient: readonly [string, string, ...string[]];
  lessons: Lesson[];
}

// ── Reference library ─────────────────────────────────────────────────────

export interface GlossaryEntry {
  term: string;
  category: string;
  definition: string;
  /** Where the idea actually shows up. */
  inPractice?: string;
  seeAlso?: string[];
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  minutes: number;
  glyph: string;
  color: string;
  sections: Array<{
    heading: string;
    body: string[];
    callouts?: CalloutSpec[];
    widget?: WidgetSpec;
    /** A compact reference table. */
    table?: { columns: [string, string]; rows: Array<[string, string]> };
  }>;
}

// ── Drills ────────────────────────────────────────────────────────────────

export type DrillKind =
  | 'interval-ear'
  | 'chord-ear'
  | 'scale-ear'
  | 'progression-ear'
  | 'interval-sight'
  | 'note-reading'
  | 'key-signature'
  | 'chord-spelling'
  | 'roman-numeral'
  | 'rhythm-tap'
  | 'perfect-pitch'
  | 'review';

export interface Drill {
  id: string;
  kind: DrillKind;
  title: string;
  description: string;
  glyph: string;
  color: string;
  tier: Tier;
  /** Questions per round. */
  questions: number;
  xpPerRound: number;
  /** Configuration read by the drill runner. */
  config: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  glyph: string;
  color: string;
}
