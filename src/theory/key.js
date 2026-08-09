"use strict";
/**
 * Keys, key signatures, diatonic harmony and Roman numeral analysis.
 *
 * This is the module that turns "a pile of notes" into "a place you are in",
 * which is the single biggest conceptual jump for a learner.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_KEYS = exports.CIRCLE_OF_FIFTHS = exports.DEGREE_FUNCTIONS = exports.ROMAN_MINOR = exports.ROMAN_MAJOR = exports.FLAT_ORDER = exports.SHARP_ORDER = void 0;
exports.key = key;
exports.keyName = keyName;
exports.keySignature = keySignature;
exports.keySignatureNotes = keySignatureNotes;
exports.keySignatureLabel = keySignatureLabel;
exports.relativeKey = relativeKey;
exports.parallelKey = parallelKey;
exports.keyNotes = keyNotes;
exports.diatonicChords = diatonicChords;
exports.romanNumerals = romanNumerals;
exports.parseRoman = parseRoman;
exports.romanToChord = romanToChord;
exports.progressionToChords = progressionToChords;
exports.circleDistance = circleDistance;
exports.closelyRelatedKeys = closelyRelatedKeys;
exports.chordsContaining = chordsContaining;
exports.functionOf = functionOf;
const pitch_1 = require("./pitch");
const chord_1 = require("./chord");
const scale_1 = require("./scale");
const interval_1 = require("./interval");
function key(tonic, mode = 'major') {
    return { tonic: typeof tonic === 'string' ? (0, pitch_1.requireNote)(tonic) : tonic, mode };
}
function keyName(k) {
    return `${(0, pitch_1.noteName)(k.tonic)} ${k.mode}`;
}
/** Order sharps and flats appear in a key signature. */
exports.SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
exports.FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
/** Major keys around the circle of fifths, from 7 flats to 7 sharps. */
const MAJOR_CIRCLE = [
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
function keySignature(k) {
    const relativeMajor = k.mode === 'major' ? k.tonic : (0, interval_1.transpose)(k.tonic, (0, interval_1.parseInterval)('m3'));
    const name = (0, pitch_1.noteName)(relativeMajor, { unicode: false });
    const entry = MAJOR_CIRCLE.find((e) => e.name === name);
    return entry ? entry.accidentals : 0;
}
/** Letter names that carry an accidental in this key, in signature order. */
function keySignatureNotes(k) {
    const count = keySignature(k);
    return count >= 0 ? exports.SHARP_ORDER.slice(0, count) : exports.FLAT_ORDER.slice(0, -count);
}
function keySignatureLabel(k) {
    const count = keySignature(k);
    if (count === 0)
        return 'no sharps or flats';
    const n = Math.abs(count);
    return `${n} ${count > 0 ? 'sharp' : 'flat'}${n > 1 ? 's' : ''}`;
}
/** The relative minor of a major key (or relative major of a minor key). */
function relativeKey(k) {
    return k.mode === 'major'
        ? { tonic: (0, interval_1.transpose)(k.tonic, (0, interval_1.parseInterval)('M6')), mode: 'minor' }
        : { tonic: (0, interval_1.transpose)(k.tonic, (0, interval_1.parseInterval)('m3')), mode: 'major' };
}
/** Same tonic, opposite mode — a much more dramatic shift than the relative. */
function parallelKey(k) {
    return { tonic: k.tonic, mode: k.mode === 'major' ? 'minor' : 'major' };
}
function keyNotes(k) {
    return (0, scale_1.buildScale)(k.tonic, (0, scale_1.getScale)(k.mode === 'major' ? 'ionian' : 'aeolian'));
}
/** Triad qualities on each degree, by mode. */
const DIATONIC_TRIADS = {
    major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
    minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
};
const DIATONIC_SEVENTHS = {
    major: ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
    minor: ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'],
};
exports.ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
exports.ROMAN_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
/** How each scale degree behaves — the part that actually explains harmony. */
exports.DEGREE_FUNCTIONS = [
    { degree: 1, fn: 'tonic', label: 'Tonic', blurb: 'Home. Stable, at rest, the gravitational centre.' },
    { degree: 2, fn: 'predominant', label: 'Predominant', blurb: 'Sets up the dominant. Movement without commitment.' },
    { degree: 3, fn: 'tonic', label: 'Tonic substitute', blurb: 'Shares two notes with I — home, but softened.' },
    { degree: 4, fn: 'predominant', label: 'Predominant', blurb: 'Leans away from home, the classic pre-cadence chord.' },
    { degree: 5, fn: 'dominant', label: 'Dominant', blurb: 'Maximum pull. Contains the leading tone; wants to resolve to I.' },
    { degree: 6, fn: 'tonic', label: 'Tonic substitute', blurb: 'The relative minor. Home wearing a different coat.' },
    { degree: 7, fn: 'dominant', label: 'Dominant', blurb: 'Dominant without a root. Unstable and cadence-hungry.' },
];
/** The seven diatonic triads (or sevenths) of a key. */
function diatonicChords(k, sevenths = false) {
    const notes = keyNotes(k);
    const qualities = (sevenths ? DIATONIC_SEVENTHS : DIATONIC_TRIADS)[k.mode];
    return notes.map((root, i) => ({
        root,
        quality: (0, chord_1.getQuality)(qualities[i]),
        inversion: 0,
    }));
}
function romanNumerals(k, sevenths = false) {
    const base = k.mode === 'major' ? exports.ROMAN_MAJOR : exports.ROMAN_MINOR;
    if (!sevenths)
        return base;
    const sevenSuffix = {
        major: ['maj7', '7', '7', 'maj7', '7', '7', 'ø7'],
        minor: ['7', 'ø7', 'maj7', '7', '7', 'maj7', '7'],
    };
    return base.map((r, i) => r.replace('°', '') + sevenSuffix[k.mode][i]);
}
// ── Roman numeral parsing ─────────────────────────────────────────────────
const ROMAN_VALUES = {
    i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
};
const ROMAN_PATTERN = /^(b|#|♭|♯)?((?:VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i))(°|o|\+|ø|dim|aug)?(maj7|maj9|7|9|11|13|6|sus4|sus2)?(?:\/(\d))?$/;
/** Parse "V7", "bVII", "ii", "vii°", "IVmaj7", "V/3". */
function parseRoman(input) {
    const match = ROMAN_PATTERN.exec(input.trim());
    if (!match)
        return null;
    const [, accidental, numeral, symbol, extension, inversionFigure] = match;
    const degree = ROMAN_VALUES[numeral.toLowerCase()];
    const minor = numeral === numeral.toLowerCase();
    const alteration = accidental === 'b' || accidental === '♭' ? -1 : accidental ? 1 : 0;
    let qualityId;
    if (symbol === '°' || symbol === 'o' || symbol === 'dim') {
        qualityId = extension === '7' ? 'dim7' : 'diminished';
    }
    else if (symbol === 'ø') {
        qualityId = 'm7b5';
    }
    else if (symbol === '+' || symbol === 'aug') {
        qualityId = 'augmented';
    }
    else if (extension === 'sus4' || extension === 'sus2') {
        qualityId = extension;
    }
    else if (extension === 'maj7' || extension === 'maj9') {
        qualityId = extension;
    }
    else if (extension === '7') {
        qualityId = minor ? 'm7' : '7';
    }
    else if (extension === '9') {
        qualityId = minor ? 'm9' : '9';
    }
    else if (extension === '11') {
        qualityId = minor ? 'm11' : '11';
    }
    else if (extension === '13') {
        qualityId = '13';
    }
    else if (extension === '6') {
        qualityId = minor ? 'm6' : '6';
    }
    else {
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
function romanToChord(roman, k, octave = 4) {
    const analysis = parseRoman(roman);
    if (!analysis)
        return null;
    const scale = keyNotes({ ...k, tonic: { ...k.tonic, octave } });
    let root = scale[analysis.degree - 1];
    if (analysis.alteration !== 0) {
        // Chromatic alterations (bVII, bVI, #iv) are measured against the *major*
        // scale degree, which is why bVII in C minor is still Bb.
        const base = (0, interval_1.transpose)({ ...k.tonic, octave }, (0, interval_1.parseInterval)(MAJOR_DEGREE_INTERVALS[analysis.degree - 1]));
        root = { ...base, alter: base.alter + analysis.alteration };
    }
    return {
        root,
        quality: (0, chord_1.getQuality)(analysis.qualityId),
        inversion: analysis.inversion,
    };
}
/** Convert a whole progression string ("I V vi IV") into chords. */
function progressionToChords(romans, k, octave = 4) {
    return romans
        .map((r) => romanToChord(r, k, octave))
        .filter((c) => c !== null);
}
exports.CIRCLE_OF_FIFTHS = (() => {
    const majors = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    const minors = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'Bb', 'F', 'C', 'G', 'D'];
    const accidentals = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];
    return majors.map((m, i) => ({
        index: i,
        major: m,
        minor: minors[i],
        accidentals: accidentals[i],
        signature: keySignatureLabel({ tonic: (0, pitch_1.requireNote)(m), mode: 'major' }),
    }));
})();
/** Distance around the circle — a rough proxy for how far apart two keys feel. */
function circleDistance(a, b) {
    const idx = (k) => {
        const name = (0, pitch_1.noteName)(k.tonic, { unicode: false });
        const found = exports.CIRCLE_OF_FIFTHS.findIndex((p) => k.mode === 'major' ? p.major === name : p.minor === name);
        return found === -1 ? 0 : found;
    };
    const raw = Math.abs(idx(a) - idx(b));
    return Math.min(raw, 12 - raw);
}
/** Keys that share six of seven notes with this one — the safe modulations. */
function closelyRelatedKeys(k) {
    const up = (0, interval_1.transpose)(k.tonic, (0, interval_1.parseInterval)('P5'));
    const down = (0, interval_1.transpose)(k.tonic, (0, interval_1.parseInterval)('P4'));
    const related = [
        relativeKey(k),
        { tonic: up, mode: k.mode },
        relativeKey({ tonic: up, mode: k.mode }),
        { tonic: down, mode: k.mode },
        relativeKey({ tonic: down, mode: k.mode }),
    ];
    return related;
}
/** All twelve major and minor keys, for pickers. */
exports.ALL_KEYS = exports.CIRCLE_OF_FIFTHS.flatMap((p) => [
    { tonic: (0, pitch_1.requireNote)(p.major), mode: 'major' },
    { tonic: (0, pitch_1.requireNote)(p.minor), mode: 'minor' },
]);
/** Which of the seven diatonic chords contain a given pitch class. */
function chordsContaining(k, pc, sevenths = false) {
    return diatonicChords(k, sevenths).filter((c) => (0, chord_1.chordNotes)(c).some((n) => (0, pitch_1.pitchClass)(n) === (0, pitch_1.mod)(pc, 12)));
}
/** A degree's function label for a given Roman numeral index. */
function functionOf(degree) {
    return exports.DEGREE_FUNCTIONS[(0, pitch_1.mod)(degree - 1, 7)];
}
