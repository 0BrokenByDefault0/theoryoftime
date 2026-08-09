/**
 * Pitch primitives.
 *
 * Notes are stored as (letter, alter, octave) rather than as raw semitone
 * numbers. Spelling matters in music theory: G# and Ab are the same key on a
 * piano but they are different notes — one is the leading tone of A minor, the
 * other is the flat sixth of C minor. Keeping the letter separate from the
 * accidental is what lets the rest of the engine name intervals, spell scales,
 * and build key signatures correctly.
 */

/** Semitone offset above C for each letter name, C=0 … B=6. */
export const LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11] as const;
export const LETTER_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/** MIDI note number of middle C. */
export const MIDDLE_C = 60;
/** MIDI note number of A440. */
export const A4 = 69;

export interface Note {
  /** 0–6, indexing LETTER_NAMES (C…B). */
  letter: number;
  /** Accidental in semitones: -2 double flat … +2 double sharp. */
  alter: number;
  /** Scientific pitch notation octave. Middle C is octave 4. */
  octave: number;
}

/** A note without a fixed octave — a pitch class with a spelling. */
export type PitchClassNote = Omit<Note, 'octave'>;

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function note(letter: number, alter = 0, octave = 4): Note {
  return { letter: mod(letter, 7), alter, octave };
}

/** Chromatic pitch class 0–11, where C = 0. */
export function pitchClass(n: PitchClassNote): number {
  return mod(LETTER_SEMITONES[mod(n.letter, 7)] + n.alter, 12);
}

/** MIDI note number. C4 (middle C) = 60. */
export function toMidi(n: Note): number {
  return (n.octave + 1) * 12 + LETTER_SEMITONES[mod(n.letter, 7)] + n.alter;
}

/**
 * Spell a MIDI number using sharps or flats. This is the lossy direction —
 * prefer carrying real `Note` values around when spelling matters.
 */
export function fromMidi(midi: number, preferFlats = false): Note {
  const pc = mod(midi, 12);
  const octave = Math.floor(midi / 12) - 1;
  const name = (preferFlats ? FLAT_NAMES : SHARP_NAMES)[pc];
  const letter = LETTER_NAMES.indexOf(name[0] as (typeof LETTER_NAMES)[number]);
  const alter = name.length > 1 ? (name[1] === '#' ? 1 : -1) : 0;
  return { letter, alter, octave };
}

const ACCIDENTAL_GLYPHS: Record<number, string> = {
  [-2]: '𝄫',
  [-1]: '♭',
  [0]: '',
  [1]: '♯',
  [2]: '𝄪',
};

const ACCIDENTAL_ASCII: Record<number, string> = {
  [-2]: 'bb',
  [-1]: 'b',
  [0]: '',
  [1]: '#',
  [2]: '##',
};

export interface NameOptions {
  /** Use ♯/♭ glyphs instead of #/b. Default true. */
  unicode?: boolean;
  /** Append the octave number. Default false. */
  octave?: boolean;
}

export function noteName(n: PitchClassNote | Note, opts: NameOptions = {}): string {
  const { unicode = true, octave = false } = opts;
  const table = unicode ? ACCIDENTAL_GLYPHS : ACCIDENTAL_ASCII;
  const acc = table[Math.max(-2, Math.min(2, n.alter))] ?? '';
  const base = LETTER_NAMES[mod(n.letter, 7)] + acc;
  return octave && 'octave' in n ? `${base}${(n as Note).octave}` : base;
}

const NOTE_PATTERN = /^([A-Ga-g])(##|#|bb|b|x|♯|♭|𝄪|𝄫)?(-?\d{1,2})?$/;

/** Parse "C", "F#3", "Bb", "Gx2". Returns null if unparseable. */
export function parseNote(input: string, defaultOctave = 4): Note | null {
  const match = NOTE_PATTERN.exec(input.trim());
  if (!match) return null;
  const letter = LETTER_NAMES.indexOf(match[1].toUpperCase() as (typeof LETTER_NAMES)[number]);
  const accidental = match[2] ?? '';
  const alter =
    accidental === '#' || accidental === '♯'
      ? 1
      : accidental === '##' || accidental === 'x' || accidental === '𝄪'
        ? 2
        : accidental === 'b' || accidental === '♭'
          ? -1
          : accidental === 'bb' || accidental === '𝄫'
            ? -2
            : 0;
  const octave = match[3] !== undefined ? parseInt(match[3], 10) : defaultOctave;
  return { letter, alter, octave };
}

/** Parse or throw — for literals baked into content where a typo is a bug. */
export function requireNote(input: string, defaultOctave = 4): Note {
  const parsed = parseNote(input, defaultOctave);
  if (!parsed) throw new Error(`Invalid note name: "${input}"`);
  return parsed;
}

/**
 * Move a note by a diatonic step count and a semitone count at once. This is
 * the primitive that keeps spelling honest: transposing C up "a third and 4
 * semitones" gives E, while "a second and 4 semitones" would give D𝄪.
 */
export function shiftNote(n: Note, letterSteps: number, semitones: number): Note {
  const absoluteLetter = n.letter + letterSteps;
  const letter = mod(absoluteLetter, 7);
  const octave = n.octave + Math.floor(absoluteLetter / 7);
  const naturalMidi = (octave + 1) * 12 + LETTER_SEMITONES[letter];
  const alter = toMidi(n) + semitones - naturalMidi;
  return { letter, alter, octave };
}

/** Frequency in Hz. `tuning` is the reference frequency for A4. */
export function frequency(midi: number, tuning = 440): number {
  return tuning * Math.pow(2, (midi - A4) / 12);
}

/** Inverse of `frequency` — useful for tuner-style visualisations. */
export function midiFromFrequency(hz: number, tuning = 440): number {
  return 12 * Math.log2(hz / tuning) + A4;
}

/** Cents deviation of `hz` from the nearest equal-tempered pitch. */
export function centsOffset(hz: number, tuning = 440): number {
  const exact = midiFromFrequency(hz, tuning);
  return Math.round((exact - Math.round(exact)) * 100);
}

/** True when two notes are the same key on a keyboard but spelled differently. */
export function isEnharmonic(a: PitchClassNote, b: PitchClassNote): boolean {
  return pitchClass(a) === pitchClass(b) && a.letter !== b.letter;
}

export function sameNote(a: Note, b: Note): boolean {
  return a.letter === b.letter && a.alter === b.alter && a.octave === b.octave;
}

/** Enharmonic respellings of a pitch class, cheapest accidental first. */
export function enharmonics(pc: number): Note[] {
  const results: Note[] = [];
  for (let letter = 0; letter < 7; letter++) {
    const alter = mod(pc - LETTER_SEMITONES[letter] + 6, 12) - 6;
    if (Math.abs(alter) <= 2) results.push({ letter, alter, octave: 4 });
  }
  return results.sort((a, b) => Math.abs(a.alter) - Math.abs(b.alter));
}

/** Piano key colour. Useful for keyboard rendering and for lesson copy. */
export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(mod(midi, 12));
}

/** Human-facing octave register names, the way producers actually talk. */
export function registerName(midi: number): string {
  if (midi < 36) return 'sub-bass';
  if (midi < 48) return 'bass';
  if (midi < 60) return 'low mids';
  if (midi < 72) return 'mids';
  if (midi < 84) return 'upper mids';
  return 'highs';
}

export { mod };
