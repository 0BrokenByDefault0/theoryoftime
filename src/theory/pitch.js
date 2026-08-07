"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = exports.A4 = exports.MIDDLE_C = exports.FLAT_NAMES = exports.SHARP_NAMES = exports.LETTER_NAMES = exports.LETTER_SEMITONES = void 0;
exports.note = note;
exports.pitchClass = pitchClass;
exports.toMidi = toMidi;
exports.fromMidi = fromMidi;
exports.noteName = noteName;
exports.parseNote = parseNote;
exports.requireNote = requireNote;
exports.shiftNote = shiftNote;
exports.frequency = frequency;
exports.midiFromFrequency = midiFromFrequency;
exports.centsOffset = centsOffset;
exports.isEnharmonic = isEnharmonic;
exports.sameNote = sameNote;
exports.enharmonics = enharmonics;
exports.isBlackKey = isBlackKey;
exports.registerName = registerName;
/** Semitone offset above C for each letter name, C=0 … B=6. */
exports.LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
exports.LETTER_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
exports.SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
exports.FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
/** MIDI note number of middle C. */
exports.MIDDLE_C = 60;
/** MIDI note number of A440. */
exports.A4 = 69;
const mod = (n, m) => ((n % m) + m) % m;
exports.mod = mod;
function note(letter, alter = 0, octave = 4) {
    return { letter: mod(letter, 7), alter, octave };
}
/** Chromatic pitch class 0–11, where C = 0. */
function pitchClass(n) {
    return mod(exports.LETTER_SEMITONES[mod(n.letter, 7)] + n.alter, 12);
}
/** MIDI note number. C4 (middle C) = 60. */
function toMidi(n) {
    return (n.octave + 1) * 12 + exports.LETTER_SEMITONES[mod(n.letter, 7)] + n.alter;
}
/**
 * Spell a MIDI number using sharps or flats. This is the lossy direction —
 * prefer carrying real `Note` values around when spelling matters.
 */
function fromMidi(midi, preferFlats = false) {
    const pc = mod(midi, 12);
    const octave = Math.floor(midi / 12) - 1;
    const name = (preferFlats ? exports.FLAT_NAMES : exports.SHARP_NAMES)[pc];
    const letter = exports.LETTER_NAMES.indexOf(name[0]);
    const alter = name.length > 1 ? (name[1] === '#' ? 1 : -1) : 0;
    return { letter, alter, octave };
}
const ACCIDENTAL_GLYPHS = {
    [-2]: '𝄫',
    [-1]: '♭',
    [0]: '',
    [1]: '♯',
    [2]: '𝄪',
};
const ACCIDENTAL_ASCII = {
    [-2]: 'bb',
    [-1]: 'b',
    [0]: '',
    [1]: '#',
    [2]: '##',
};
function noteName(n, opts = {}) {
    const { unicode = true, octave = false } = opts;
    const table = unicode ? ACCIDENTAL_GLYPHS : ACCIDENTAL_ASCII;
    const acc = table[Math.max(-2, Math.min(2, n.alter))] ?? '';
    const base = exports.LETTER_NAMES[mod(n.letter, 7)] + acc;
    return octave && 'octave' in n ? `${base}${n.octave}` : base;
}
const NOTE_PATTERN = /^([A-Ga-g])(##|#|bb|b|x|♯|♭|𝄪|𝄫)?(-?\d{1,2})?$/;
/** Parse "C", "F#3", "Bb", "Gx2". Returns null if unparseable. */
function parseNote(input, defaultOctave = 4) {
    const match = NOTE_PATTERN.exec(input.trim());
    if (!match)
        return null;
    const letter = exports.LETTER_NAMES.indexOf(match[1].toUpperCase());
    const accidental = match[2] ?? '';
    const alter = accidental === '#' || accidental === '♯'
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
function requireNote(input, defaultOctave = 4) {
    const parsed = parseNote(input, defaultOctave);
    if (!parsed)
        throw new Error(`Invalid note name: "${input}"`);
    return parsed;
}
/**
 * Move a note by a diatonic step count and a semitone count at once. This is
 * the primitive that keeps spelling honest: transposing C up "a third and 4
 * semitones" gives E, while "a second and 4 semitones" would give D𝄪.
 */
function shiftNote(n, letterSteps, semitones) {
    const absoluteLetter = n.letter + letterSteps;
    const letter = mod(absoluteLetter, 7);
    const octave = n.octave + Math.floor(absoluteLetter / 7);
    const naturalMidi = (octave + 1) * 12 + exports.LETTER_SEMITONES[letter];
    const alter = toMidi(n) + semitones - naturalMidi;
    return { letter, alter, octave };
}
/** Frequency in Hz. `tuning` is the reference frequency for A4. */
function frequency(midi, tuning = 440) {
    return tuning * Math.pow(2, (midi - exports.A4) / 12);
}
/** Inverse of `frequency` — useful for tuner-style visualisations. */
function midiFromFrequency(hz, tuning = 440) {
    return 12 * Math.log2(hz / tuning) + exports.A4;
}
/** Cents deviation of `hz` from the nearest equal-tempered pitch. */
function centsOffset(hz, tuning = 440) {
    const exact = midiFromFrequency(hz, tuning);
    return Math.round((exact - Math.round(exact)) * 100);
}
/** True when two notes are the same key on a keyboard but spelled differently. */
function isEnharmonic(a, b) {
    return pitchClass(a) === pitchClass(b) && a.letter !== b.letter;
}
function sameNote(a, b) {
    return a.letter === b.letter && a.alter === b.alter && a.octave === b.octave;
}
/** Enharmonic respellings of a pitch class, cheapest accidental first. */
function enharmonics(pc) {
    const results = [];
    for (let letter = 0; letter < 7; letter++) {
        const alter = mod(pc - exports.LETTER_SEMITONES[letter] + 6, 12) - 6;
        if (Math.abs(alter) <= 2)
            results.push({ letter, alter, octave: 4 });
    }
    return results.sort((a, b) => Math.abs(a.alter) - Math.abs(b.alter));
}
/** Piano key colour. Useful for keyboard rendering and for lesson copy. */
function isBlackKey(midi) {
    return [1, 3, 6, 8, 10].includes(mod(midi, 12));
}
/** Human-facing octave register names, the way producers actually talk. */
function registerName(midi) {
    if (midi < 36)
        return 'sub-bass';
    if (midi < 48)
        return 'bass';
    if (midi < 60)
        return 'low mids';
    if (midi < 72)
        return 'mids';
    if (midi < 84)
        return 'upper mids';
    return 'highs';
}
