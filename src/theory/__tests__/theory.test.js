"use strict";
/**
 * Correctness checks for the theory engine.
 *
 * These are the facts the whole app rests on. If any of them break, lessons
 * start teaching wrong information, which is worse than shipping nothing.
 *
 * Run with `npm run test:theory`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
let failures = 0;
let checks = 0;
function check(label, actual, expected) {
    checks++;
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
        failures++;
        console.error(`  ✗ ${label}\n      expected ${e}\n      actual   ${a}`);
    }
}
function assert(label, condition) {
    checks++;
    if (!condition) {
        failures++;
        console.error(`  ✗ ${label}`);
    }
}
function group(name, fn) {
    console.log(`\n${name}`);
    fn();
}
// ── Pitch ─────────────────────────────────────────────────────────────────
group('Pitch', () => {
    check('middle C is MIDI 60', (0, index_1.toMidi)((0, index_1.requireNote)('C4')), 60);
    check('A4 is MIDI 69', (0, index_1.toMidi)((0, index_1.requireNote)('A4')), 69);
    check('A4 is 440 Hz', (0, index_1.frequency)(69), 440);
    check('A5 is 880 Hz', (0, index_1.frequency)(81), 880);
    check('C-1 is MIDI 0', (0, index_1.toMidi)((0, index_1.requireNote)('C-1')), 0);
    check('B#3 is enharmonic with C4', (0, index_1.toMidi)((0, index_1.requireNote)('B#3')), 60);
    check('Cb4 is one below C4', (0, index_1.toMidi)((0, index_1.requireNote)('Cb4')), 59);
    check('Gx (double sharp) parses', (0, index_1.toMidi)((0, index_1.requireNote)('Gx4')), 69);
    check('note naming round-trips', (0, index_1.noteName)((0, index_1.requireNote)('F#'), { unicode: false }), 'F#');
    check('bad note name returns null', (0, index_1.parseNote)('H#'), null);
    check('cents offset of exact pitch is 0', (0, index_1.centsOffset)(440), 0);
    assert('cents offset detects sharpness', (0, index_1.centsOffset)(445) > 15);
});
// ── Intervals ─────────────────────────────────────────────────────────────
group('Intervals', () => {
    check('C to E is a major third', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('C4'), (0, index_1.requireNote)('E4'))), 'M3');
    check('C to Eb is a minor third', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('C4'), (0, index_1.requireNote)('Eb4'))), 'm3');
    check('C to F# is an augmented fourth', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('C4'), (0, index_1.requireNote)('F#4'))), 'A4');
    check('C to Gb is a diminished fifth', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('C4'), (0, index_1.requireNote)('Gb4'))), 'd5');
    check('B to F is a diminished fifth', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('B3'), (0, index_1.requireNote)('F4'))), 'd5');
    check('C to C is a perfect unison', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('C4'), (0, index_1.requireNote)('C4'))), 'P1');
    check('C4 to C5 is a perfect octave', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('C4'), (0, index_1.requireNote)('C5'))), 'P8');
    check('C4 to D5 is a major ninth', (0, index_1.intervalAbbr)((0, index_1.intervalBetween)((0, index_1.requireNote)('C4'), (0, index_1.requireNote)('D5'))), 'M9');
    check('major third inverts to minor sixth', (0, index_1.intervalAbbr)((0, index_1.invert)((0, index_1.interval)(3, 'major'))), 'm6');
    check('perfect fifth inverts to perfect fourth', (0, index_1.intervalAbbr)((0, index_1.invert)((0, index_1.interval)(5, 'perfect'))), 'P4');
    check('transposing C up a M3 gives E', (0, index_1.noteName)((0, index_1.transpose)((0, index_1.requireNote)('C4'), (0, index_1.interval)(3, 'major'))), 'E');
    check('transposing Eb up a m3 gives Gb', (0, index_1.noteName)((0, index_1.transpose)((0, index_1.requireNote)('Eb4'), (0, index_1.interval)(3, 'minor')), { unicode: false }), 'Gb');
    check('transposing A up a P5 gives E', (0, index_1.noteName)((0, index_1.transpose)((0, index_1.requireNote)('A4'), (0, index_1.interval)(5, 'perfect'))), 'E');
    check('transposing B up a P5 gives F#', (0, index_1.noteName)((0, index_1.transpose)((0, index_1.requireNote)('B4'), (0, index_1.interval)(5, 'perfect')), { unicode: false }), 'F#');
});
// ── Scales ────────────────────────────────────────────────────────────────
group('Scales', () => {
    check('C major', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('C4'), (0, index_1.getScale)('ionian')), 'C D E F G A B');
    check('G major has F#', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('G4'), (0, index_1.getScale)('ionian')).includes('F♯'), true);
    check('F major has Bb', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('F4'), (0, index_1.getScale)('ionian')).includes('B♭'), true);
    check('A natural minor', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('A4'), (0, index_1.getScale)('aeolian')), 'A B C D E F G');
    check('D dorian', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('D4'), (0, index_1.getScale)('dorian')), 'D E F G A B C');
    check('E phrygian', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('E4'), (0, index_1.getScale)('phrygian')), 'E F G A B C D');
    check('A harmonic minor has G#', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('A4'), (0, index_1.getScale)('harmonic-minor')), 'A B C D E F G♯');
    check('C blues scale', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('C4'), (0, index_1.getScale)('blues')), 'C E♭ F G♭ G B♭');
    check('C major pentatonic', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('C4'), (0, index_1.getScale)('major-pentatonic')), 'C D E G A');
    check('C# major spells correctly', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('C#4'), (0, index_1.getScale)('ionian')), 'C♯ D♯ E♯ F♯ G♯ A♯ B♯');
    check('Cb major spells correctly', (0, index_1.scaleNoteNames)((0, index_1.requireNote)('Cb4'), (0, index_1.getScale)('ionian')), 'C♭ D♭ E♭ F♭ G♭ A♭ B♭');
    // Every scale must build on every one of the twelve tonics without throwing.
    const tonics = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    let built = 0;
    for (const s of index_1.SCALES) {
        for (const t of tonics) {
            const notes = (0, index_1.buildScale)((0, index_1.requireNote)(t + '4'), s);
            if (notes.length === s.intervals.length)
                built++;
        }
    }
    check('every scale builds on every tonic', built, index_1.SCALES.length * tonics.length);
    check('scale degree labels match interval counts', index_1.SCALES.every((s) => s.degrees.length === s.intervals.length), true);
});
// ── Chords ────────────────────────────────────────────────────────────────
group('Chords', () => {
    check('C major triad', (0, index_1.chordVoicing)((0, index_1.chord)((0, index_1.requireNote)('C4'), 'major')).map((n) => (0, index_1.noteName)(n)), ['C', 'E', 'G']);
    check('A minor triad', (0, index_1.chordVoicing)((0, index_1.chord)((0, index_1.requireNote)('A4'), 'minor')).map((n) => (0, index_1.noteName)(n)), ['A', 'C', 'E']);
    check('B diminished triad', (0, index_1.chordVoicing)((0, index_1.chord)((0, index_1.requireNote)('B4'), 'diminished')).map((n) => (0, index_1.noteName)(n)), ['B', 'D', 'F']);
    check('G7', (0, index_1.chordVoicing)((0, index_1.chord)((0, index_1.requireNote)('G4'), '7')).map((n) => (0, index_1.noteName)(n)), ['G', 'B', 'D', 'F']);
    check('Cmaj7', (0, index_1.chordVoicing)((0, index_1.chord)((0, index_1.requireNote)('C4'), 'maj7')).map((n) => (0, index_1.noteName)(n)), ['C', 'E', 'G', 'B']);
    check('Bm7b5', (0, index_1.chordVoicing)((0, index_1.chord)((0, index_1.requireNote)('B4'), 'm7b5')).map((n) => (0, index_1.noteName)(n)), ['B', 'D', 'F', 'A']);
    check('C major first inversion is C/E', (0, index_1.chordSymbol)((0, index_1.chord)((0, index_1.requireNote)('C4'), 'major', 1)), 'C/E');
    check('C major second inversion is C/G', (0, index_1.chordSymbol)((0, index_1.chord)((0, index_1.requireNote)('C4'), 'major', 2)), 'C/G');
    check('inversion raises the rotated tones an octave', (0, index_1.chordVoicing)((0, index_1.chord)((0, index_1.requireNote)('C4'), 'major', 1)).map(index_1.toMidi), [64, 67, 72]);
    check('parse Cmaj7', (0, index_1.chordSymbol)((0, index_1.parseChordSymbol)('Cmaj7')), 'Cmaj7');
    check('parse F#m7b5', (0, index_1.chordSymbol)((0, index_1.parseChordSymbol)('F#m7b5')), 'F♯m7b5');
    check('parse Bb13', (0, index_1.chordSymbol)((0, index_1.parseChordSymbol)('Bb13')), 'B♭13');
    check('parse plain triad', (0, index_1.chordSymbol)((0, index_1.parseChordSymbol)('D')), 'D');
    check('parse slash chord', (0, index_1.chordSymbol)((0, index_1.parseChordSymbol)('C/E')), 'C/E');
    check('reject nonsense', (0, index_1.parseChordSymbol)('Zq7'), null);
    const drop2 = (0, index_1.voiceChord)((0, index_1.chord)((0, index_1.requireNote)('C4'), 'maj7'), 'drop2');
    assert('drop 2 spans more than an octave', Math.max(...drop2) - Math.min(...drop2) > 12);
    const shell = (0, index_1.voiceChord)((0, index_1.chord)((0, index_1.requireNote)('C4'), 'maj7'), 'shell');
    check('shell voicing is root, third, seventh', shell, [60, 64, 71]);
});
// ── Keys and Roman numerals ───────────────────────────────────────────────
group('Keys', () => {
    check('C major has no accidentals', (0, index_1.keySignature)((0, index_1.key)('C')), 0);
    check('G major has one sharp', (0, index_1.keySignature)((0, index_1.key)('G')), 1);
    check('F major has one flat', (0, index_1.keySignature)((0, index_1.key)('F')), -1);
    check('Eb major has three flats', (0, index_1.keySignature)((0, index_1.key)('Eb')), -3);
    check('F# major has six sharps', (0, index_1.keySignature)((0, index_1.key)('F#')), 6);
    check('A minor has no accidentals', (0, index_1.keySignature)((0, index_1.key)('A', 'minor')), 0);
    check('E minor has one sharp', (0, index_1.keySignature)((0, index_1.key)('E', 'minor')), 1);
    check('C minor has three flats', (0, index_1.keySignature)((0, index_1.key)('C', 'minor')), -3);
    check('signature label reads naturally', (0, index_1.keySignatureLabel)((0, index_1.key)('D')), '2 sharps');
    check('relative minor of C is A minor', (0, index_1.noteName)((0, index_1.relativeKey)((0, index_1.key)('C')).tonic), 'A');
    check('relative major of A minor is C', (0, index_1.noteName)((0, index_1.relativeKey)((0, index_1.key)('A', 'minor')).tonic), 'C');
    check('diatonic triads of C major', (0, index_1.diatonicChords)((0, index_1.key)('C')).map((c) => (0, index_1.chordSymbol)(c)), ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
    check('diatonic sevenths of C major', (0, index_1.diatonicChords)((0, index_1.key)('C'), true).map((c) => (0, index_1.chordSymbol)(c)), ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5']);
    check('diatonic triads of A minor', (0, index_1.diatonicChords)((0, index_1.key)('A', 'minor')).map((c) => (0, index_1.chordSymbol)(c)), ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G']);
    check('V in C major is G', (0, index_1.chordSymbol)((0, index_1.romanToChord)('V', (0, index_1.key)('C'))), 'G');
    check('V7 in C major is G7', (0, index_1.chordSymbol)((0, index_1.romanToChord)('V7', (0, index_1.key)('C'))), 'G7');
    check('ii7 in C major is Dm7', (0, index_1.chordSymbol)((0, index_1.romanToChord)('ii7', (0, index_1.key)('C'))), 'Dm7');
    check('vii° in C major is Bdim', (0, index_1.chordSymbol)((0, index_1.romanToChord)('vii°', (0, index_1.key)('C'))), 'Bdim');
    check('bVII in C major is Bb', (0, index_1.chordSymbol)((0, index_1.romanToChord)('bVII', (0, index_1.key)('C'))), 'B♭');
    check('bVI in A minor is F', (0, index_1.chordSymbol)((0, index_1.romanToChord)('bVI', (0, index_1.key)('A', 'minor'))), 'F');
    check('iiø7 in A minor is Bm7b5', (0, index_1.chordSymbol)((0, index_1.romanToChord)('iiø7', (0, index_1.key)('A', 'minor'))), 'Bm7b5');
    check('I V vi IV in C', (0, index_1.progressionToChords)(['I', 'V', 'vi', 'IV'], (0, index_1.key)('C')).map((c) => (0, index_1.chordSymbol)(c)), ['C', 'G', 'Am', 'F']);
    check('I V vi IV in G', (0, index_1.progressionToChords)(['I', 'V', 'vi', 'IV'], (0, index_1.key)('G')).map((c) => (0, index_1.chordSymbol)(c)), ['G', 'D', 'Em', 'C']);
    check('C and G are one step apart on the circle', (0, index_1.circleDistance)((0, index_1.key)('C'), (0, index_1.key)('G')), 1);
    check('C and F# are six steps apart', (0, index_1.circleDistance)((0, index_1.key)('C'), (0, index_1.key)('F#')), 6);
    // Every progression in the library must resolve to real chords in a real key.
    let resolved = 0;
    for (const p of index_1.PROGRESSIONS) {
        const chords = (0, index_1.progressionToChords)(p.romans, (0, index_1.key)('C', p.mode));
        if (chords.length === p.romans.length)
            resolved++;
        else
            console.error(`      ! ${p.id} resolved ${chords.length}/${p.romans.length}`);
    }
    check('every progression resolves fully', resolved, index_1.PROGRESSIONS.length);
});
// ── Analysis ──────────────────────────────────────────────────────────────
group('Analysis', () => {
    const cMajor = [60, 64, 67];
    check('identifies a C major triad', (0, index_1.identifyChords)(cMajor)[0].symbol, 'C');
    const g7 = [55, 59, 62, 65];
    check('identifies a G7', (0, index_1.identifyChords)(g7)[0].symbol, 'G7');
    const am7 = [57, 60, 64, 67];
    assert('identifies Am7 among the candidates', (0, index_1.identifyChords)(am7).some((m) => m.symbol === 'Am7'));
    const cMajorScale = [60, 62, 64, 65, 67, 69, 71];
    check('estimates C major from its own scale', (0, index_1.estimateKey)(cMajorScale)[0].name, 'C major');
    const aMinorish = [57, 59, 60, 62, 64, 65, 67, 57, 57, 64];
    assert('estimates a minor-leaning key', (0, index_1.estimateKey)(aMinorish)[0].name.includes('minor'));
});
// ── Rhythm ────────────────────────────────────────────────────────────────
group('Rhythm', () => {
    check('quarter note delay at 120bpm is 500ms', (0, index_1.delayMs)(120, 1), 500);
    check('dotted eighth at 120bpm is 375ms', (0, index_1.delayMs)(120, 0.75), 375);
    check('tresillo is the 3-in-8 euclidean rhythm', (0, index_1.euclideanRhythm)(3, 8).map((b) => (b ? 'x' : '.')).join(''), 'x..x..x.');
    check('euclidean 5 in 8 has five hits', (0, index_1.euclideanRhythm)(5, 8).filter(Boolean).length, 5);
    check('drum patterns all use a 16-step grid', index_1.DRUM_PATTERNS.every((p) => p.steps === 16), true);
    check('drum hits stay in range', index_1.DRUM_PATTERNS.every((p) => p.tracks.every((t) => t.hits.every((h) => h >= 0 && h < 16))), true);
});
// ── Result ────────────────────────────────────────────────────────────────
console.log(`\n${failures === 0 ? '✓ PASS' : '✗ FAIL'} — ${checks - failures}/${checks} checks passed`);
if (failures > 0)
    process.exit(1);
