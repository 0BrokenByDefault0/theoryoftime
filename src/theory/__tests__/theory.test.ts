/**
 * Correctness checks for the theory engine.
 *
 * These are the facts the whole app rests on. If any of them break, lessons
 * start teaching wrong information, which is worse than shipping nothing.
 *
 * Run with `npm run test:theory`.
 */

import {
  buildScale,
  centsOffset,
  chord,
  chordSymbol,
  chordVoicing,
  circleDistance,
  diatonicChords,
  DRUM_PATTERNS,
  delayMs,
  estimateKey,
  euclideanRhythm,
  frequency,
  getScale,
  identifyChords,
  interval,
  intervalAbbr,
  intervalBetween,
  invert,
  key,
  keySignature,
  keySignatureLabel,
  noteName,
  parseChordSymbol,
  parseNote,
  PROGRESSIONS,
  progressionToChords,
  relativeKey,
  requireNote,
  romanToChord,
  SCALES,
  scaleNoteNames,
  toMidi,
  transpose,
  voiceChord,
} from '../index';

let failures = 0;
let checks = 0;

function check(label: string, actual: unknown, expected: unknown) {
  checks++;
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.error(`  ✗ ${label}\n      expected ${e}\n      actual   ${a}`);
  }
}

function assert(label: string, condition: boolean) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`  ✗ ${label}`);
  }
}

function group(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

// ── Pitch ─────────────────────────────────────────────────────────────────
group('Pitch', () => {
  check('middle C is MIDI 60', toMidi(requireNote('C4')), 60);
  check('A4 is MIDI 69', toMidi(requireNote('A4')), 69);
  check('A4 is 440 Hz', frequency(69), 440);
  check('A5 is 880 Hz', frequency(81), 880);
  check('C-1 is MIDI 0', toMidi(requireNote('C-1')), 0);
  check('B#3 is enharmonic with C4', toMidi(requireNote('B#3')), 60);
  check('Cb4 is one below C4', toMidi(requireNote('Cb4')), 59);
  check('Gx (double sharp) parses', toMidi(requireNote('Gx4')), 69);
  check('note naming round-trips', noteName(requireNote('F#'), { unicode: false }), 'F#');
  check('bad note name returns null', parseNote('H#'), null);
  check('cents offset of exact pitch is 0', centsOffset(440), 0);
  assert('cents offset detects sharpness', centsOffset(445) > 15);
});

// ── Intervals ─────────────────────────────────────────────────────────────
group('Intervals', () => {
  check('C to E is a major third', intervalAbbr(intervalBetween(requireNote('C4'), requireNote('E4'))), 'M3');
  check('C to Eb is a minor third', intervalAbbr(intervalBetween(requireNote('C4'), requireNote('Eb4'))), 'm3');
  check('C to F# is an augmented fourth', intervalAbbr(intervalBetween(requireNote('C4'), requireNote('F#4'))), 'A4');
  check('C to Gb is a diminished fifth', intervalAbbr(intervalBetween(requireNote('C4'), requireNote('Gb4'))), 'd5');
  check('B to F is a diminished fifth', intervalAbbr(intervalBetween(requireNote('B3'), requireNote('F4'))), 'd5');
  check('C to C is a perfect unison', intervalAbbr(intervalBetween(requireNote('C4'), requireNote('C4'))), 'P1');
  check('C4 to C5 is a perfect octave', intervalAbbr(intervalBetween(requireNote('C4'), requireNote('C5'))), 'P8');
  check('C4 to D5 is a major ninth', intervalAbbr(intervalBetween(requireNote('C4'), requireNote('D5'))), 'M9');
  check('major third inverts to minor sixth', intervalAbbr(invert(interval(3, 'major'))), 'm6');
  check('perfect fifth inverts to perfect fourth', intervalAbbr(invert(interval(5, 'perfect'))), 'P4');
  check('transposing C up a M3 gives E', noteName(transpose(requireNote('C4'), interval(3, 'major'))), 'E');
  check('transposing Eb up a m3 gives Gb', noteName(transpose(requireNote('Eb4'), interval(3, 'minor')), { unicode: false }), 'Gb');
  check('transposing A up a P5 gives E', noteName(transpose(requireNote('A4'), interval(5, 'perfect'))), 'E');
  check('transposing B up a P5 gives F#', noteName(transpose(requireNote('B4'), interval(5, 'perfect')), { unicode: false }), 'F#');
});

// ── Scales ────────────────────────────────────────────────────────────────
group('Scales', () => {
  check('C major', scaleNoteNames(requireNote('C4'), getScale('ionian')), 'C D E F G A B');
  check('G major has F#', scaleNoteNames(requireNote('G4'), getScale('ionian')).includes('F♯'), true);
  check('F major has Bb', scaleNoteNames(requireNote('F4'), getScale('ionian')).includes('B♭'), true);
  check('A natural minor', scaleNoteNames(requireNote('A4'), getScale('aeolian')), 'A B C D E F G');
  check('D dorian', scaleNoteNames(requireNote('D4'), getScale('dorian')), 'D E F G A B C');
  check('E phrygian', scaleNoteNames(requireNote('E4'), getScale('phrygian')), 'E F G A B C D');
  check('A harmonic minor has G#', scaleNoteNames(requireNote('A4'), getScale('harmonic-minor')), 'A B C D E F G♯');
  check('C blues scale', scaleNoteNames(requireNote('C4'), getScale('blues')), 'C E♭ F G♭ G B♭');
  check('C major pentatonic', scaleNoteNames(requireNote('C4'), getScale('major-pentatonic')), 'C D E G A');
  check('C# major spells correctly', scaleNoteNames(requireNote('C#4'), getScale('ionian')), 'C♯ D♯ E♯ F♯ G♯ A♯ B♯');
  check('Cb major spells correctly', scaleNoteNames(requireNote('Cb4'), getScale('ionian')), 'C♭ D♭ E♭ F♭ G♭ A♭ B♭');

  // Every scale must build on every one of the twelve tonics without throwing.
  const tonics = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  let built = 0;
  for (const s of SCALES) {
    for (const t of tonics) {
      const notes = buildScale(requireNote(t + '4'), s);
      if (notes.length === s.intervals.length) built++;
    }
  }
  check('every scale builds on every tonic', built, SCALES.length * tonics.length);
  check('scale degree labels match interval counts', SCALES.every((s) => s.degrees.length === s.intervals.length), true);
});

// ── Chords ────────────────────────────────────────────────────────────────
group('Chords', () => {
  check('C major triad', chordVoicing(chord(requireNote('C4'), 'major')).map((n) => noteName(n)), ['C', 'E', 'G']);
  check('A minor triad', chordVoicing(chord(requireNote('A4'), 'minor')).map((n) => noteName(n)), ['A', 'C', 'E']);
  check('B diminished triad', chordVoicing(chord(requireNote('B4'), 'diminished')).map((n) => noteName(n)), ['B', 'D', 'F']);
  check('G7', chordVoicing(chord(requireNote('G4'), '7')).map((n) => noteName(n)), ['G', 'B', 'D', 'F']);
  check('Cmaj7', chordVoicing(chord(requireNote('C4'), 'maj7')).map((n) => noteName(n)), ['C', 'E', 'G', 'B']);
  check('Bm7b5', chordVoicing(chord(requireNote('B4'), 'm7b5')).map((n) => noteName(n)), ['B', 'D', 'F', 'A']);
  check('C major first inversion is C/E', chordSymbol(chord(requireNote('C4'), 'major', 1)), 'C/E');
  check('C major second inversion is C/G', chordSymbol(chord(requireNote('C4'), 'major', 2)), 'C/G');
  check('inversion raises the rotated tones an octave',
    chordVoicing(chord(requireNote('C4'), 'major', 1)).map(toMidi), [64, 67, 72]);

  check('parse Cmaj7', chordSymbol(parseChordSymbol('Cmaj7')!), 'Cmaj7');
  check('parse F#m7b5', chordSymbol(parseChordSymbol('F#m7b5')!), 'F♯m7b5');
  check('parse Bb13', chordSymbol(parseChordSymbol('Bb13')!), 'B♭13');
  check('parse plain triad', chordSymbol(parseChordSymbol('D')!), 'D');
  check('parse slash chord', chordSymbol(parseChordSymbol('C/E')!), 'C/E');
  check('reject nonsense', parseChordSymbol('Zq7'), null);

  const drop2 = voiceChord(chord(requireNote('C4'), 'maj7'), 'drop2');
  assert('drop 2 spans more than an octave', Math.max(...drop2) - Math.min(...drop2) > 12);
  const shell = voiceChord(chord(requireNote('C4'), 'maj7'), 'shell');
  check('shell voicing is root, third, seventh', shell, [60, 64, 71]);
});

// ── Keys and Roman numerals ───────────────────────────────────────────────
group('Keys', () => {
  check('C major has no accidentals', keySignature(key('C')), 0);
  check('G major has one sharp', keySignature(key('G')), 1);
  check('F major has one flat', keySignature(key('F')), -1);
  check('Eb major has three flats', keySignature(key('Eb')), -3);
  check('F# major has six sharps', keySignature(key('F#')), 6);
  check('A minor has no accidentals', keySignature(key('A', 'minor')), 0);
  check('E minor has one sharp', keySignature(key('E', 'minor')), 1);
  check('C minor has three flats', keySignature(key('C', 'minor')), -3);
  check('signature label reads naturally', keySignatureLabel(key('D')), '2 sharps');
  check('relative minor of C is A minor', noteName(relativeKey(key('C')).tonic), 'A');
  check('relative major of A minor is C', noteName(relativeKey(key('A', 'minor')).tonic), 'C');

  check('diatonic triads of C major',
    diatonicChords(key('C')).map((c) => chordSymbol(c)),
    ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
  check('diatonic sevenths of C major',
    diatonicChords(key('C'), true).map((c) => chordSymbol(c)),
    ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5']);
  check('diatonic triads of A minor',
    diatonicChords(key('A', 'minor')).map((c) => chordSymbol(c)),
    ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G']);

  check('V in C major is G', chordSymbol(romanToChord('V', key('C'))!), 'G');
  check('V7 in C major is G7', chordSymbol(romanToChord('V7', key('C'))!), 'G7');
  check('ii7 in C major is Dm7', chordSymbol(romanToChord('ii7', key('C'))!), 'Dm7');
  check('vii° in C major is Bdim', chordSymbol(romanToChord('vii°', key('C'))!), 'Bdim');
  check('bVII in C major is Bb', chordSymbol(romanToChord('bVII', key('C'))!), 'B♭');
  check('bVI in A minor is F', chordSymbol(romanToChord('bVI', key('A', 'minor'))!), 'F');
  check('iiø7 in A minor is Bm7b5', chordSymbol(romanToChord('iiø7', key('A', 'minor'))!), 'Bm7b5');

  check('I V vi IV in C', progressionToChords(['I', 'V', 'vi', 'IV'], key('C')).map((c) => chordSymbol(c)),
    ['C', 'G', 'Am', 'F']);
  check('I V vi IV in G', progressionToChords(['I', 'V', 'vi', 'IV'], key('G')).map((c) => chordSymbol(c)),
    ['G', 'D', 'Em', 'C']);

  check('C and G are one step apart on the circle', circleDistance(key('C'), key('G')), 1);
  check('C and F# are six steps apart', circleDistance(key('C'), key('F#')), 6);

  // Every progression in the library must resolve to real chords in a real key.
  let resolved = 0;
  for (const p of PROGRESSIONS) {
    const chords = progressionToChords(p.romans, key('C', p.mode));
    if (chords.length === p.romans.length) resolved++;
    else console.error(`      ! ${p.id} resolved ${chords.length}/${p.romans.length}`);
  }
  check('every progression resolves fully', resolved, PROGRESSIONS.length);
});

// ── Analysis ──────────────────────────────────────────────────────────────
group('Analysis', () => {
  const cMajor = [60, 64, 67];
  check('identifies a C major triad', identifyChords(cMajor)[0].symbol, 'C');
  const g7 = [55, 59, 62, 65];
  check('identifies a G7', identifyChords(g7)[0].symbol, 'G7');
  const am7 = [57, 60, 64, 67];
  assert('identifies Am7 among the candidates', identifyChords(am7).some((m) => m.symbol === 'Am7'));

  const cMajorScale = [60, 62, 64, 65, 67, 69, 71];
  check('estimates C major from its own scale', estimateKey(cMajorScale)[0].name, 'C major');
  const aMinorish = [57, 59, 60, 62, 64, 65, 67, 57, 57, 64];
  assert('estimates a minor-leaning key', estimateKey(aMinorish)[0].name.includes('minor'));
});

// ── Rhythm ────────────────────────────────────────────────────────────────
group('Rhythm', () => {
  check('quarter note delay at 120bpm is 500ms', delayMs(120, 1), 500);
  check('dotted eighth at 120bpm is 375ms', delayMs(120, 0.75), 375);
  check('tresillo is the 3-in-8 euclidean rhythm',
    euclideanRhythm(3, 8).map((b) => (b ? 'x' : '.')).join(''), 'x..x..x.');
  check('euclidean 5 in 8 has five hits', euclideanRhythm(5, 8).filter(Boolean).length, 5);
  check('drum patterns all use a 16-step grid', DRUM_PATTERNS.every((p) => p.steps === 16), true);
  check('drum hits stay in range',
    DRUM_PATTERNS.every((p) => p.tracks.every((t) => t.hits.every((h) => h >= 0 && h < 16))), true);
});

// ── Result ────────────────────────────────────────────────────────────────
console.log(`\n${failures === 0 ? '✓ PASS' : '✗ FAIL'} — ${checks - failures}/${checks} checks passed`);
if (failures > 0) process.exit(1);
