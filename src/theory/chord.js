"use strict";
/**
 * Chords — construction, naming, inversion, and voicing.
 *
 * A chord quality is a stack of intervals from the root. Everything else
 * (symbols, inversions, drop voicings, guitar shapes) is derived from that.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHORD_FAMILY_LABELS = exports.VOICING_NOTES = exports.VOICING_LABELS = exports.CHORD_QUALITIES_BY_ID = exports.CHORD_QUALITIES = void 0;
exports.getQuality = getQuality;
exports.qualityIntervals = qualityIntervals;
exports.chord = chord;
exports.chordNotes = chordNotes;
exports.chordVoicing = chordVoicing;
exports.chordMidi = chordMidi;
exports.chordSymbol = chordSymbol;
exports.chordFullName = chordFullName;
exports.chordPitchClasses = chordPitchClasses;
exports.parseChordSymbol = parseChordSymbol;
exports.voiceChord = voiceChord;
exports.nearestInversion = nearestInversion;
exports.voiceLeadingCost = voiceLeadingCost;
const pitch_1 = require("./pitch");
const interval_1 = require("./interval");
const C = (id, symbol, name, family, intervals, degrees, mood, usedIn, tension, aliases = []) => ({
    id,
    symbol,
    name,
    family,
    aliases,
    intervals: intervals.split(' '),
    degrees: degrees.split(' '),
    mood,
    usedIn,
    tension,
});
exports.CHORD_QUALITIES = [
    // ── Triads ──────────────────────────────────────────────────────────────
    C('major', '', 'Major', 'triad', 'P1 M3 P5', '1 3 5', 'Stable, bright, resolved. The chord everything else is measured against.', 'Essentially all Western music.', 0, ['maj', 'M']),
    C('minor', 'm', 'Minor', 'triad', 'P1 m3 P5', '1 b3 5', 'Serious and shaded. One semitone lower than major, an entire world away.', 'Ballads, minor-key pop, metal, film scoring.', 1, ['min', '-']),
    C('diminished', 'dim', 'Diminished', 'triad', 'P1 m3 d5', '1 b3 b5', 'Cramped and anxious. Two stacked minor thirds with nowhere to sit.', 'Passing chords, horror cues, the vii° of any major key.', 6, ['°', 'o']),
    C('augmented', 'aug', 'Augmented', 'triad', 'P1 M3 A5', '1 3 #5', 'Stretched and weightless. Perfectly symmetrical, so it has no home.', 'Transitions, Beatles turnarounds, dream sequences.', 6, ['+', '#5']),
    C('power', '5', 'Power Chord', 'power', 'P1 P5', '1 5', 'Neither major nor minor. Just weight and volume.', 'Rock, punk, metal — anything with distortion.', 0, ['no3']),
    // ── Suspensions ─────────────────────────────────────────────────────────
    C('sus2', 'sus2', 'Suspended 2nd', 'suspended', 'P1 M2 P5', '1 2 5', 'Open and unresolved, hanging in the air. Neither happy nor sad.', 'Ambient pads, post-rock, folk guitar, worship music.', 2),
    C('sus4', 'sus4', 'Suspended 4th', 'suspended', 'P1 P4 P5', '1 4 5', 'Leaning forward, waiting to fall into the third.', 'Rock intros, gospel, the opening of A Hard Day’s Night.', 3),
    C('7sus4', '7sus4', 'Dominant 7 sus4', 'suspended', 'P1 P4 P5 m7', '1 4 5 b7', 'Dominant tension without the bite. Smooth and suspended.', 'Soul, gospel, house music, jazz vamps.', 4),
    // ── Sevenths ────────────────────────────────────────────────────────────
    C('maj7', 'maj7', 'Major 7th', 'seventh', 'P1 M3 P5 M7', '1 3 5 7', 'Dreamy, warm, sophisticated. Major with a soft halo on top.', 'Bossa nova, jazz, neo-soul, lo-fi hip hop.', 2, ['M7', 'Δ7', 'Δ']),
    C('m7', 'm7', 'Minor 7th', 'seventh', 'P1 m3 P5 m7', '1 b3 5 b7', 'Cool and relaxed. Minor without the drama.', 'Jazz, funk, R&B, house — the default minor chord in groove music.', 2, ['min7', '-7']),
    C('7', '7', 'Dominant 7th', 'seventh', 'P1 M3 P5 m7', '1 3 5 b7', 'Restless. The tritone inside it wants to resolve, which is why cadences work.', 'Blues, jazz, rock, funk — and every V chord ever.', 5, ['dom7']),
    C('m7b5', 'm7b5', 'Half-Diminished 7th', 'seventh', 'P1 m3 d5 m7', '1 b3 b5 b7', 'Melancholy and unstable, but soft-edged. Diminished with a cushion.', 'The ii chord in minor keys; jazz standards everywhere.', 6, ['ø7', 'ø']),
    C('dim7', 'dim7', 'Diminished 7th', 'seventh', 'P1 m3 d5 d7', '1 b3 b5 bb7', 'Four notes a minor third apart. Maximum instability, total symmetry.', 'Classical modulation, silent-film villainy, jazz passing chords.', 8, ['°7']),
    C('mmaj7', 'm(maj7)', 'Minor Major 7th', 'seventh', 'P1 m3 P5 M7', '1 b3 5 7', 'Minor with a knife-edge. Beautiful and deeply uneasy.', 'James Bond, noir jazz, Radiohead, Hitchcock scores.', 7, ['mM7', '-Δ7']),
    C('6', '6', 'Major 6th', 'added', 'P1 M3 P5 M6', '1 3 5 6', 'Vintage sweetness. Resolved but with a wink.', 'Swing era endings, surf rock, city pop.', 1),
    C('m6', 'm6', 'Minor 6th', 'added', 'P1 m3 P5 M6', '1 b3 5 6', 'Minor with an unexpected brightness. Slightly mysterious.', 'Jazz standards, bossa nova, French chanson.', 3),
    // ── Extensions ──────────────────────────────────────────────────────────
    C('maj9', 'maj9', 'Major 9th', 'extended', 'P1 M3 P5 M7 M9', '1 3 5 7 9', 'Lush and glassy. The sound of expensive-sounding chords.', 'Neo-soul, R&B, jazz, city pop.', 3),
    C('m9', 'm9', 'Minor 9th', 'extended', 'P1 m3 P5 m7 M9', '1 b3 5 b7 9', 'Velvet. Minor 7 with extra depth and air.', 'Deep house, R&B, jazz ballads, hip-hop samples.', 3),
    C('9', '9', 'Dominant 9th', 'extended', 'P1 M3 P5 m7 M9', '1 3 5 b7 9', 'Funky and forward. Dominant tension with a strut.', 'James Brown, funk guitar, soul horn sections.', 5),
    C('11', '11', 'Dominant 11th', 'extended', 'P1 P5 m7 M9 P11', '1 5 b7 9 11', 'Wide and hazy. The third usually steps aside for the eleventh.', 'Fusion, gospel, 70s soul.', 6),
    C('m11', 'm11', 'Minor 11th', 'extended', 'P1 m3 P5 m7 M9 P11', '1 b3 5 b7 9 11', 'A whole world in one chord. Spacious and modern.', 'Neo-soul, jazz fusion, ambient R&B.', 4),
    C('13', '13', 'Dominant 13th', 'extended', 'P1 M3 P5 m7 M9 M13', '1 3 5 b7 9 13', 'The full dominant sound — rich, brassy, and still pulling home.', 'Big band, jazz, funk, Steely Dan.', 6),
    C('maj13', 'maj13', 'Major 13th', 'extended', 'P1 M3 P5 M7 M9 M13', '1 3 5 7 9 13', 'Maximum warmth without tension. Every colour tone that agrees.', 'Jazz ballads, city pop, lush arrangements.', 4),
    C('add9', 'add9', 'Add 9', 'added', 'P1 M3 P5 M9', '1 3 5 9', 'Major with a sparkle. Colour without jazz commitment.', 'Indie rock, pop production, acoustic guitar.', 2),
    C('madd9', 'm(add9)', 'Minor Add 9', 'added', 'P1 m3 P5 M9', '1 b3 5 9', 'Wistful and cinematic. Sad but shimmering.', 'Film scores, indie, ambient piano.', 3),
    C('6-9', '6/9', 'Six Nine', 'added', 'P1 M3 P5 M6 M9', '1 3 5 6 9', 'Resolved but colourful. A very stylish way to end a song.', 'Jazz guitar endings, bossa nova, city pop.', 3),
    // ── Altered dominants ───────────────────────────────────────────────────
    C('7b9', '7b9', 'Dominant 7 flat 9', 'altered', 'P1 M3 P5 m7 m9', '1 3 5 b7 b9', 'Dark and urgent. The flat nine sharpens the pull to the tonic.', 'Jazz turnarounds resolving to minor, flamenco, tango.', 8),
    C('7sharp9', '7#9', 'Dominant 7 sharp 9', 'altered', 'P1 M3 P5 m7 A9', '1 3 5 b7 #9', 'Major and minor third at once. The "Hendrix chord" — snarling and electric.', 'Purple Haze, funk, hard bop, acid jazz.', 9),
    C('7b5', '7b5', 'Dominant 7 flat 5', 'altered', 'P1 M3 d5 m7', '1 3 b5 b7', 'Sideways and slippery. Symmetrical, so it resolves in two directions.', 'Jazz reharmonisation, whole-tone passages.', 8),
    C('7sharp5', '7#5', 'Dominant 7 sharp 5', 'altered', 'P1 M3 A5 m7', '1 3 #5 b7', 'Bright tension pushing outward. Augmented with a seventh on top.', 'Big band shout choruses, soul modulations.', 8, ['7+']),
    C('7alt', '7alt', 'Altered Dominant', 'altered', 'P1 M3 m7 m9 A9 A11 m13', '1 3 b7 b9 #9 #11 b13', 'Every tension at once. The most charged chord in common practice.', 'Bebop and modern jazz, right before the resolution.', 10),
    C('13b9', '13b9', 'Dominant 13 flat 9', 'altered', 'P1 M3 P5 m7 m9 M13', '1 3 5 b7 b9 13', 'Sumptuous and dangerous at once — sweetness over a dark ninth.', 'Jazz standards, Brazilian harmony.', 8),
];
exports.CHORD_QUALITIES_BY_ID = Object.fromEntries(exports.CHORD_QUALITIES.map((q) => [q.id, q]));
function getQuality(id) {
    const q = exports.CHORD_QUALITIES_BY_ID[id];
    if (!q)
        throw new Error(`Unknown chord quality: ${id}`);
    return q;
}
const qualityIntervalCache = new Map();
function qualityIntervals(q) {
    const cached = qualityIntervalCache.get(q.id);
    if (cached)
        return cached;
    const parsed = q.intervals.map((abbr) => {
        const iv = (0, interval_1.parseInterval)(abbr);
        if (!iv)
            throw new Error(`Bad interval "${abbr}" in chord ${q.id}`);
        return iv;
    });
    qualityIntervalCache.set(q.id, parsed);
    return parsed;
}
function chord(root, qualityId, inversion = 0) {
    return { root, quality: getQuality(qualityId), inversion };
}
/** The chord's notes in root position, correctly spelled. */
function chordNotes(c) {
    return qualityIntervals(c.quality).map((iv) => (0, interval_1.transpose)(c.root, iv));
}
/**
 * Voiced notes with inversion applied — each inverted tone is lifted an octave
 * so the result is playable top-to-bottom.
 */
function chordVoicing(c) {
    const notes = chordNotes(c);
    const inv = (0, pitch_1.mod)(c.inversion, notes.length);
    const rotated = [
        ...notes.slice(inv).map((n) => ({ ...n })),
        ...notes.slice(0, inv).map((n) => ({ ...n, octave: n.octave + 1 })),
    ];
    if (c.bass) {
        const bassMidi = (0, pitch_1.toMidi)(c.bass);
        const lowest = Math.min(...rotated.map(pitch_1.toMidi));
        const bass = { ...c.bass, octave: c.bass.octave - (bassMidi >= lowest ? 1 : 0) };
        return [bass, ...rotated];
    }
    return rotated;
}
function chordMidi(c) {
    return chordVoicing(c).map(pitch_1.toMidi);
}
/** Chord symbol, e.g. "Cmaj7", "F#m7b5", "Bb13", "C/E". */
function chordSymbol(c, opts = {}) {
    const unicode = opts.unicode ?? true;
    const base = (0, pitch_1.noteName)(c.root, { unicode }) + c.quality.symbol;
    const voiced = chordVoicing(c);
    if (c.inversion === 0 && !c.bass)
        return base;
    const bassNote = voiced[0];
    if ((0, pitch_1.pitchClass)(bassNote) === (0, pitch_1.pitchClass)(c.root))
        return base;
    return `${base}/${(0, pitch_1.noteName)(bassNote, { unicode })}`;
}
/** Full descriptive name, e.g. "C major seventh, first inversion". */
function chordFullName(c) {
    const inversions = ['root position', 'first inversion', 'second inversion', 'third inversion'];
    const inv = inversions[c.inversion] ?? `${c.inversion + 1}th inversion`;
    return `${(0, pitch_1.noteName)(c.root)} ${c.quality.name}${c.inversion ? `, ${inv}` : ''}`;
}
/** Pitch classes in the chord — order independent, for matching and quizzes. */
function chordPitchClasses(c) {
    return chordNotes(c).map((n) => (0, pitch_1.pitchClass)(n));
}
// ── Symbol parsing ────────────────────────────────────────────────────────
/**
 * Longest suffix first, so that "maj7" wins over "maj" and "m7b5" wins over
 * "m7". This ordering is the whole trick to parsing chord symbols.
 */
const SUFFIX_TABLE = exports.CHORD_QUALITIES.flatMap((q) => [q.symbol, ...q.aliases].map((s) => [s, q.id])).sort((a, b) => b[0].length - a[0].length);
/** Parse "Cmaj7", "F#m7b5", "Bb13", "Dsus4", "G/B". Returns null if unparseable. */
function parseChordSymbol(input, octave = 4) {
    const trimmed = input.trim().replace(/[Δ]/g, 'maj').replace(/[–—]/g, '-');
    const slash = trimmed.split('/');
    const body = slash[0];
    const rootMatch = /^([A-Ga-g])(##|#|bb|b|♯|♭)?/.exec(body);
    if (!rootMatch)
        return null;
    const rootName = rootMatch[0];
    const root = (0, pitch_1.parseNote)(rootName, octave);
    if (!root)
        return null;
    const suffix = body.slice(rootName.length);
    const match = SUFFIX_TABLE.find(([sym]) => sym === suffix);
    const qualityId = match ? match[1] : suffix === '' ? 'major' : null;
    if (!qualityId)
        return null;
    const result = { root, quality: getQuality(qualityId), inversion: 0 };
    if (slash[1]) {
        const bass = (0, pitch_1.parseNote)(slash[1], octave - 1);
        if (bass) {
            result.bass = bass;
            const idx = chordNotes(result).findIndex((n) => (0, pitch_1.pitchClass)(n) === (0, pitch_1.pitchClass)(bass));
            if (idx > 0) {
                result.inversion = idx;
                delete result.bass;
            }
        }
    }
    return result;
}
exports.VOICING_LABELS = {
    close: 'Close',
    open: 'Open',
    drop2: 'Drop 2',
    drop3: 'Drop 3',
    shell: 'Shell',
    rootless: 'Rootless',
    spread: 'Spread',
};
exports.VOICING_NOTES = {
    close: 'All notes packed within one octave. Dense and blocky — great for pads, muddy in the bass.',
    open: 'The middle voice lifted an octave, opening a gap. Instantly less cluttered.',
    drop2: 'Take the second-highest note down an octave. The default guitar and big-band voicing.',
    drop3: 'Take the third-highest note down an octave. Wider still, with a strong bass anchor.',
    shell: 'Root, third and seventh only. The bare minimum that still names the chord.',
    rootless: 'Drop the root and let the bass player have it. The core of jazz piano comping.',
    spread: 'Root far below, colour tones far above. Maximum clarity, cinematic width.',
};
/** Apply a voicing style to a chord, returning MIDI note numbers. */
function voiceChord(c, style) {
    const notes = chordVoicing(c).map(pitch_1.toMidi).sort((a, b) => a - b);
    if (notes.length < 3)
        return notes;
    switch (style) {
        case 'close':
            return notes;
        case 'open': {
            const out = [...notes];
            if (out.length >= 3)
                out[1] += 12;
            return out.sort((a, b) => a - b);
        }
        case 'drop2': {
            const out = [...notes];
            const idx = out.length - 2;
            out[idx] -= 12;
            return out.sort((a, b) => a - b);
        }
        case 'drop3': {
            const out = [...notes];
            const idx = Math.max(0, out.length - 3);
            out[idx] -= 12;
            return out.sort((a, b) => a - b);
        }
        case 'shell': {
            const ivs = qualityIntervals(c.quality);
            const root = (0, pitch_1.toMidi)(c.root);
            const third = ivs.find((iv) => iv.number === 3);
            const seventh = ivs.find((iv) => iv.number === 7);
            return [root, third && root + third.semitones, seventh && root + seventh.semitones].filter((n) => typeof n === 'number');
        }
        case 'rootless': {
            const rootPc = (0, pitch_1.pitchClass)(c.root);
            return notes.filter((n) => (0, pitch_1.mod)(n, 12) !== rootPc);
        }
        case 'spread': {
            const out = [notes[0] - 12];
            notes.slice(1).forEach((n, i) => out.push(n + (i % 2 === 1 ? 12 : 0)));
            return out.sort((a, b) => a - b);
        }
    }
}
/**
 * Choose the inversion of `target` whose voice-leading distance from
 * `previous` is smallest. This is how good comping avoids leaping around.
 */
function nearestInversion(previous, target) {
    const size = chordNotes(target).length;
    let best = target;
    let bestCost = Infinity;
    for (let inv = 0; inv < size; inv++) {
        const candidate = { ...target, inversion: inv };
        const cost = voiceLeadingCost(previous, chordMidi(candidate));
        if (cost < bestCost) {
            bestCost = cost;
            best = candidate;
        }
    }
    return best;
}
/** Total semitone movement required to get from one voicing to another. */
function voiceLeadingCost(from, to) {
    if (!from.length)
        return 0;
    return to.reduce((sum, n) => {
        const nearest = from.reduce((acc, f) => Math.min(acc, Math.abs(f - n)), Infinity);
        return sum + nearest;
    }, 0);
}
exports.CHORD_FAMILY_LABELS = {
    triad: 'Triads',
    seventh: 'Sevenths',
    extended: 'Extensions',
    suspended: 'Suspensions',
    added: 'Added Tones',
    altered: 'Altered',
    power: 'Power',
};
