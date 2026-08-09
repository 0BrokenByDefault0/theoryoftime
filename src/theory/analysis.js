"use strict";
/**
 * Analysis — going backwards from sound to theory.
 *
 * The user plays notes; these functions work out what they just played. This
 * is what turns a keyboard into a discovery tool rather than a quiz.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERVAL_CLASS_LABELS = void 0;
exports.toPitchClassSet = toPitchClassSet;
exports.identifyChords = identifyChords;
exports.identifyScales = identifyScales;
exports.estimateKey = estimateKey;
exports.outsideNotes = outsideNotes;
exports.describeStack = describeStack;
exports.intervalVector = intervalVector;
exports.dissonanceScore = dissonanceScore;
const pitch_1 = require("./pitch");
const chord_1 = require("./chord");
const scale_1 = require("./scale");
const key_1 = require("./key");
const interval_1 = require("./interval");
/** Reduce MIDI notes to the set of distinct pitch classes present. */
function toPitchClassSet(midiNotes) {
    return [...new Set(midiNotes.map((n) => (0, pitch_1.mod)(n, 12)))].sort((a, b) => a - b);
}
/**
 * Identify every chord that could describe a set of pitch classes, best first.
 *
 * Real chord identification is ambiguous — C E G A is both C6 and Am7 — so
 * this returns a ranked list rather than pretending there is one answer. The
 * lowest sounding note is used to break ties, which is how a human would hear it.
 */
function identifyChords(midiNotes, limit = 6) {
    const pcs = toPitchClassSet(midiNotes);
    if (pcs.length < 2)
        return [];
    const bassPc = midiNotes.length ? (0, pitch_1.mod)(Math.min(...midiNotes), 12) : pcs[0];
    const matches = [];
    for (let rootPc = 0; rootPc < 12; rootPc++) {
        for (const quality of chord_1.CHORD_QUALITIES) {
            const template = (0, chord_1.qualityIntervals)(quality).map((iv) => (0, pitch_1.mod)(rootPc + iv.semitones, 12));
            const templateSet = new Set(template);
            const missing = template.filter((pc) => !pcs.includes(pc)).length;
            const extra = pcs.filter((pc) => !templateSet.has(pc)).length;
            if (missing > 1 || extra > 1)
                continue;
            const exact = missing === 0 && extra === 0;
            // Prefer exact matches, then chords whose root is in the bass, then
            // simpler qualities — a plain triad beats an exotic altered chord.
            let score = 1 - missing * 0.35 - extra * 0.3;
            if (rootPc === bassPc)
                score += 0.15;
            score -= quality.tension * 0.005;
            score -= template.length * 0.001;
            const root = (0, pitch_1.fromMidi)(60 + rootPc, [1, 3, 6, 8, 10].includes(rootPc) && rootPc !== 1);
            const chord = { root, quality, inversion: 0 };
            matches.push({
                chord,
                symbol: (0, chord_1.chordSymbol)(chord),
                quality,
                rootPc,
                score,
                exact,
                missing,
                extra,
            });
        }
    }
    return matches
        .sort((a, b) => b.score - a.score)
        .filter((m, i, arr) => arr.findIndex((x) => x.symbol === m.symbol) === i)
        .slice(0, limit);
}
/** Which scales contain everything the user played? Ranked by tightness of fit. */
function identifyScales(midiNotes, limit = 8) {
    const pcs = toPitchClassSet(midiNotes);
    if (pcs.length < 3)
        return [];
    const matches = [];
    for (let tonicPc = 0; tonicPc < 12; tonicPc++) {
        for (const scale of scale_1.SCALES) {
            if (scale.id === 'chromatic')
                continue;
            const set = new Set((0, scale_1.scaleIntervals)(scale).map((iv) => (0, pitch_1.mod)(tonicPc + iv.semitones, 12)));
            const contained = pcs.filter((pc) => set.has(pc)).length;
            const coverage = contained / pcs.length;
            if (coverage < 1)
                continue;
            const fill = contained / set.size;
            // A scale that just barely contains the notes is a better answer than a
            // huge scale that contains everything.
            const score = coverage * 0.7 + fill * 0.3 - set.size * 0.01;
            matches.push({
                scale,
                tonicPc,
                tonicName: (0, pitch_1.noteName)((0, pitch_1.fromMidi)(60 + tonicPc)),
                coverage,
                fill,
                score,
            });
        }
    }
    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
/**
 * Estimate the key of a note collection using a simplified Krumhansl-style
 * weighting: tonic and dominant count for more than passing tones.
 */
function estimateKey(midiNotes, limit = 5) {
    if (!midiNotes.length)
        return [];
    const histogram = new Array(12).fill(0);
    midiNotes.forEach((n) => (histogram[(0, pitch_1.mod)(n, 12)] += 1));
    const total = histogram.reduce((a, b) => a + b, 0);
    const MAJOR_WEIGHTS = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
    const MINOR_WEIGHTS = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
    const results = key_1.ALL_KEYS.map((key) => {
        const tonic = (0, pitch_1.pitchClass)(key.tonic);
        const weights = key.mode === 'major' ? MAJOR_WEIGHTS : MINOR_WEIGHTS;
        let score = 0;
        for (let i = 0; i < 12; i++) {
            score += (histogram[(0, pitch_1.mod)(i + tonic, 12)] / total) * weights[i];
        }
        return { key, name: (0, key_1.keyName)(key), score };
    });
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
/** Notes played that fall outside a key — the "wrong notes", usefully labelled. */
function outsideNotes(midiNotes, key) {
    const inKey = new Set((0, key_1.keyNotes)(key).map((n) => (0, pitch_1.pitchClass)(n)));
    return [...new Set(midiNotes.map((n) => (0, pitch_1.mod)(n, 12)))].filter((pc) => !inKey.has(pc));
}
/** Describe the intervals stacked in a chord, bottom to top. */
function describeStack(midiNotes) {
    const sorted = [...midiNotes].sort((a, b) => a - b);
    const out = [];
    for (let i = 1; i < sorted.length; i++) {
        out.push((0, interval_1.intervalName)((0, interval_1.intervalFromSemitones)(sorted[i] - sorted[i - 1])));
    }
    return out;
}
/**
 * Interval-vector-style summary: how many of each interval class the set
 * contains. It is the fingerprint that explains why a chord sounds the way it
 * does independent of its name.
 */
function intervalVector(midiNotes) {
    const pcs = toPitchClassSet(midiNotes);
    const vector = new Array(6).fill(0);
    for (let i = 0; i < pcs.length; i++) {
        for (let j = i + 1; j < pcs.length; j++) {
            const d = (0, pitch_1.mod)(pcs[j] - pcs[i], 12);
            const ic = Math.min(d, 12 - d);
            if (ic >= 1 && ic <= 6)
                vector[ic - 1] += 1;
        }
    }
    return vector;
}
exports.INTERVAL_CLASS_LABELS = [
    'semitones (ic1)',
    'whole tones (ic2)',
    'minor 3rds (ic3)',
    'major 3rds (ic4)',
    'perfect 4ths (ic5)',
    'tritones (ic6)',
];
/** A rough dissonance score, 0–100, for colouring feedback in the UI. */
function dissonanceScore(midiNotes) {
    const v = intervalVector(midiNotes);
    const weights = [1.0, 0.5, 0.15, 0.15, 0.1, 0.85];
    const raw = v.reduce((sum, count, i) => sum + count * weights[i], 0);
    const pairs = Math.max(1, (toPitchClassSet(midiNotes).length * (toPitchClassSet(midiNotes).length - 1)) / 2);
    return Math.round(Math.min(100, (raw / pairs) * 110));
}
