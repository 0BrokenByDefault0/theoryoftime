/**
 * Keys, key signatures, diatonic harmony and Roman numeral analysis.
 *
 * This is the module that turns "a pile of notes" into "a place you are in",
 * which is the single biggest conceptual jump for a learner.
 */

import { Note, PitchClassNote, mod, noteName, pitchClass, requireNote } from './pitch';
import { Chord, ChordQuality, chordNotes, getQuality } from './chord';
import { buildScale, getScale } from './scale';
import { transpose, parseInterval, Interval } from './interval';

export type KeyMode = 'major' | 'minor';

export interface Key {
  tonic: Note;
  mode: KeyMode;
}

export function key(tonic: string | Note, mode: KeyMode = 'major'): Key {
  return { tonic: typeof tonic === 'string' ? requireNote(tonic) : tonic, mode };
}

export function keyName(k: Key): string {
  return `${noteName(k.tonic)} ${k.mode}`;
}

/** Order sharps and flats appear in a key signature. */
export const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
export const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

/** Major keys around the circle of fifths, from 7 flats to 7 sharps. */
const MAJOR_CIRCLE: Array<{ name: string; accidentals: number }> = [
  { name: 'Cb', accidentals: -7 },
  { name: 'Gb', accidentals: -6 },
  { name: 'Db', accidentals: -5 },
  { name: 'Ab', accidentals: -4 },
  { name: 'Eb', accidentals: -3 },
  { name: 'Bb', accidentals: -2 },
  { name: 'F', accidentals: -1 },
  { name: 'C', accidentals: 0 },
  { name: 'G', accidentals: 1 },
  { name: 'D', accidentals: 2 },
  { name: 'A', accidentals: 3 },
  { name: 'E', accidentals: 4 },
  { name: 'B', accidentals: 5 },
  { name: 'F#', accidentals: 6 },
  { name: 'C#', accidentals: 7 },
];

/**
 * Signed accidental count for a key: positive = sharps, negative = flats.
 * Minor keys borrow the signature of their relative major.
 */
export function keySignature(k: Key): number {
  const relativeMajor = k.mode === 'major' ? k.tonic : transpose(k.tonic, parseInterval('m3')!);
  const name = noteName(relativeMajor, { unicode: false });
  const entry = MAJOR_CIRCLE.find((e) => e.name === name);
  return entry ? entry.accidentals : 0;
}

/** Letter names that carry an accidental in this key, in signature order. */
export function keySignatureNotes(k: Key): string[] {
  const count = keySignature(k);
  return count >= 0 ? SHARP_ORDER.slice(0, count) : FLAT_ORDER.slice(0, -count);
}

export function keySignatureLabel(k: Key): string {
  const count = keySignature(k);
  if (count === 0) return 'no sharps or flats';
  const n = Math.abs(count);
  return `${n} ${count > 0 ? 'sharp' : 'flat'}${n > 1 ? 's' : ''}`;
}

/** The relative minor of a major key (or relative major of a minor key). */
export function relativeKey(k: Key): Key {
  return k.mode === 'major'
    ? { tonic: transpose(k.tonic, parseInterval('M6')!), mode: 'minor' }
    : { tonic: transpose(k.tonic, parseInterval('m3')!), mode: 'major' };
}

/** Same tonic, opposite mode — a much more dramatic shift than the relative. */
export function parallelKey(k: Key): Key {
  return { tonic: k.tonic, mode: k.mode === 'major' ? 'minor' : 'major' };
}

export function keyNotes(k: Key): Note[] {
  return buildScale(k.tonic, getScale(k.mode === 'major' ? 'ionian' : 'aeolian'));
}

/** Triad qualities on each degree, by mode. */
const DIATONIC_TRIADS: Record<KeyMode, string[]> = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
};

const DIATONIC_SEVENTHS: Record<KeyMode, string[]> = {
  major: ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
  minor: ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'],
};

export const ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
export const ROMAN_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

/** How each scale degree behaves — the part that actually explains harmony. */
export const DEGREE_FUNCTIONS: Array<{
  degree: number;
  fn: 'tonic' | 'predominant' | 'dominant';
  label: string;
  blurb: string;
}> = [
  { degree: 1, fn: 'tonic', label: 'Tonic', blurb: 'Home. Stable, at rest, the gravitational centre.' },
  { degree: 2, fn: 'predominant', label: 'Predominant', blurb: 'Sets up the dominant. Movement without commitment.' },
  { degree: 3, fn: 'tonic', label: 'Tonic substitute', blurb: 'Shares two notes with I — home, but softened.' },
  { degree: 4, fn: 'predominant', label: 'Predominant', blurb: 'Leans away from home, the classic pre-cadence chord.' },
  { degree: 5, fn: 'dominant', label: 'Dominant', blurb: 'Maximum pull. Contains the leading tone; wants to resolve to I.' },
  { degree: 6, fn: 'tonic', label: 'Tonic substitute', blurb: 'The relative minor. Home wearing a different coat.' },
  { degree: 7, fn: 'dominant', label: 'Dominant', blurb: 'Dominant without a root. Unstable and cadence-hungry.' },
];

/** The seven diatonic triads (or sevenths) of a key. */
export function diatonicChords(k: Key, sevenths = false): Chord[] {
  const notes = keyNotes(k);
  const qualities = (sevenths ? DIATONIC_SEVENTHS : DIATONIC_TRIADS)[k.mode];
  return notes.map((root, i) => ({
    root,
    quality: getQuality(qualities[i]),
    inversion: 0,
  }));
}

export function romanNumerals(k: Key, sevenths = false): string[] {
  const base = k.mode === 'major' ? ROMAN_MAJOR : ROMAN_MINOR;
  if (!sevenths) return base;
  const sevenSuffix: Record<KeyMode, string[]> = {
    major: ['maj7', '7', '7', 'maj7', '7', '7', 'ø7'],
    minor: ['7', 'ø7', 'maj7', '7', '7', 'maj7', '7'],
  };
  return base.map((r, i) => r.replace('°', '') + sevenSuffix[k.mode][i]);
}

// ── Roman numeral parsing ─────────────────────────────────────────────────

const ROMAN_VALUES: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
};

const ROMAN_PATTERN =
  /^(b|#|♭|♯)?((?:VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i))(°|o|\+|ø|dim|aug)?(maj7|maj9|7|9|11|13|6|sus4|sus2)?(?:\/(\d))?$/;

export interface RomanNumeralAnalysis {
  /** Scale degree 1–7. */
  degree: number;
  /** Chromatic alteration of the root: -1 for bVII, +1 for #iv. */
  alteration: number;
  minor: boolean;
  qualityId: string;
  inversion: number;
  original: string;
}

/** Parse "V7", "bVII", "ii", "vii°", "IVmaj7", "V/3". */
export function parseRoman(input: string): RomanNumeralAnalysis | null {
  const match = ROMAN_PATTERN.exec(input.trim());
  if (!match) return null;
  const [, accidental, numeral, symbol, extension, inversionFigure] = match;
  const degree = ROMAN_VALUES[numeral.toLowerCase()];
  const minor = numeral === numeral.toLowerCase();
  const alteration = accidental === 'b' || accidental === '♭' ? -1 : accidental ? 1 : 0;

  let qualityId: string;
  if (symbol === '°' || symbol === 'o' || symbol === 'dim') {
    qualityId = extension === '7' ? 'dim7' : 'diminished';
  } else if (symbol === 'ø') {
    qualityId = 'm7b5';
  } else if (symbol === '+' || symbol === 'aug') {
    qualityId = 'augmented';
  } else if (extension === 'sus4' || extension === 'sus2') {
    qualityId = extension;
  } else if (extension === 'maj7' || extension === 'maj9') {
    qualityId = extension;
  } else if (extension === '7') {
    qualityId = minor ? 'm7' : '7';
  } else if (extension === '9') {
    qualityId = minor ? 'm9' : '9';
  } else if (extension === '11') {
    qualityId = minor ? 'm11' : '11';
  } else if (extension === '13') {
    qualityId = '13';
  } else if (extension === '6') {
    qualityId = minor ? 'm6' : '6';
  } else {
    qualityId = minor ? 'minor' : 'major';
  }

  return {
    degree,
    alteration,
    minor,
    qualityId,
    inversion: inversionFigure ? parseInt(inversionFigure, 10) : 0,
    original: input.trim(),
  };
}

const MAJOR_DEGREE_INTERVALS = ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'];

/** Turn a Roman numeral into a real chord in a real key. */
export function romanToChord(roman: string, k: Key, octave = 4): Chord | null {
  const analysis = parseRoman(roman);
  if (!analysis) return null;
  const scale = keyNotes({ ...k, tonic: { ...k.tonic, octave } });
  let root = scale[analysis.degree - 1];
  if (analysis.alteration !== 0) {
    // Chromatic alterations (bVII, bVI, #iv) are measured against the *major*
    // scale degree, which is why bVII in C minor is still Bb.
    const base = transpose(
      { ...k.tonic, octave },
      parseInterval(MAJOR_DEGREE_INTERVALS[analysis.degree - 1])!,
    );
    root = { ...base, alter: base.alter + analysis.alteration };
  }
  return {
    root,
    quality: getQuality(analysis.qualityId),
    inversion: analysis.inversion,
  };
}

/** Convert a whole progression string ("I V vi IV") into chords. */
export function progressionToChords(romans: string[], k: Key, octave = 4): Chord[] {
  return romans
    .map((r) => romanToChord(r, k, octave))
    .filter((c): c is Chord => c !== null);
}

// ── Circle of fifths ──────────────────────────────────────────────────────

export interface CirclePosition {
  /** Clock position 0–11, where 0 is C at the top. */
  index: number;
  major: string;
  minor: string;
  accidentals: number;
  signature: string;
}

export const CIRCLE_OF_FIFTHS: CirclePosition[] = (() => {
  const majors = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  const minors = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'Bb', 'F', 'C', 'G', 'D'];
  const accidentals = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];
  return majors.map((m, i) => ({
    index: i,
    major: m,
    minor: minors[i],
    accidentals: accidentals[i],
    signature: keySignatureLabel({ tonic: requireNote(m), mode: 'major' }),
  }));
})();

/** Distance around the circle — a rough proxy for how far apart two keys feel. */
export function circleDistance(a: Key, b: Key): number {
  const idx = (k: Key) => {
    const name = noteName(k.tonic, { unicode: false });
    const found = CIRCLE_OF_FIFTHS.findIndex((p) =>
      k.mode === 'major' ? p.major === name : p.minor === name,
    );
    return found === -1 ? 0 : found;
  };
  const raw = Math.abs(idx(a) - idx(b));
  return Math.min(raw, 12 - raw);
}

/** Keys that share six of seven notes with this one — the safe modulations. */
export function closelyRelatedKeys(k: Key): Key[] {
  const up = transpose(k.tonic, parseInterval('P5')!);
  const down = transpose(k.tonic, parseInterval('P4')!);
  const related: Key[] = [
    relativeKey(k),
    { tonic: up, mode: k.mode },
    relativeKey({ tonic: up, mode: k.mode }),
    { tonic: down, mode: k.mode },
    relativeKey({ tonic: down, mode: k.mode }),
  ];
  return related;
}

/** All twelve major and minor keys, for pickers. */
export const ALL_KEYS: Key[] = CIRCLE_OF_FIFTHS.flatMap((p) => [
  { tonic: requireNote(p.major), mode: 'major' as KeyMode },
  { tonic: requireNote(p.minor), mode: 'minor' as KeyMode },
]);

/** Which of the seven diatonic chords contain a given pitch class. */
export function chordsContaining(k: Key, pc: number, sevenths = false): Chord[] {
  return diatonicChords(k, sevenths).filter((c) =>
    chordNotes(c).some((n) => pitchClass(n) === mod(pc, 12)),
  );
}

/** A degree's function label for a given Roman numeral index. */
export function functionOf(degree: number) {
  return DEGREE_FUNCTIONS[mod(degree - 1, 7)];
}
