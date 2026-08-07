/**
 * Analysis — going backwards from sound to theory.
 *
 * The user plays notes; these functions work out what they just played. This
 * is what turns a keyboard into a discovery tool rather than a quiz.
 */

import { mod, fromMidi, noteName, pitchClass } from './pitch';
import { CHORD_QUALITIES, Chord, ChordQuality, chordSymbol, qualityIntervals } from './chord';
import { SCALES, ScaleDefinition, scaleIntervals } from './scale';
import { ALL_KEYS, Key, keyName, keyNotes } from './key';
import { intervalFromSemitones, intervalName } from './interval';

/** Reduce MIDI notes to the set of distinct pitch classes present. */
export function toPitchClassSet(midiNotes: number[]): number[] {
  return [...new Set(midiNotes.map((n) => mod(n, 12)))].sort((a, b) => a - b);
}

export interface ChordMatch {
  chord: Chord;
  symbol: string;
  quality: ChordQuality;
  rootPc: number;
  /** 1 = exact match, lower = extra or missing notes. */
  score: number;
  exact: boolean;
  missing: number;
  extra: number;
}

/**
 * Identify every chord that could describe a set of pitch classes, best first.
 *
 * Real chord identification is ambiguous — C E G A is both C6 and Am7 — so
 * this returns a ranked list rather than pretending there is one answer. The
 * lowest sounding note is used to break ties, which is how a human would hear it.
 */
export function identifyChords(midiNotes: number[], limit = 6): ChordMatch[] {
  const pcs = toPitchClassSet(midiNotes);
  if (pcs.length < 2) return [];
  const bassPc = midiNotes.length ? mod(Math.min(...midiNotes), 12) : pcs[0];
  const matches: ChordMatch[] = [];

  for (let rootPc = 0; rootPc < 12; rootPc++) {
    for (const quality of CHORD_QUALITIES) {
      const template = qualityIntervals(quality).map((iv) => mod(rootPc + iv.semitones, 12));
      const templateSet = new Set(template);
      const missing = template.filter((pc) => !pcs.includes(pc)).length;
      const extra = pcs.filter((pc) => !templateSet.has(pc)).length;
      if (missing > 1 || extra > 1) continue;

      const exact = missing === 0 && extra === 0;
      // Prefer exact matches, then chords whose root is in the bass, then
      // simpler qualities — a plain triad beats an exotic altered chord.
      let score = 1 - missing * 0.35 - extra * 0.3;
      if (rootPc === bassPc) score += 0.15;
      score -= quality.tension * 0.005;
      score -= template.length * 0.001;

      const root = fromMidi(60 + rootPc, [1, 3, 6, 8, 10].includes(rootPc) && rootPc !== 1);
      const chord: Chord = { root, quality, inversion: 0 };
      matches.push({
        chord,
        symbol: chordSymbol(chord),
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

export interface ScaleMatch {
  scale: ScaleDefinition;
  tonicPc: number;
  tonicName: string;
  /** Fraction of the played notes that the scale contains. */
  coverage: number;
  /** How much of the scale the played notes account for. */
  fill: number;
  score: number;
}

/** Which scales contain everything the user played? Ranked by tightness of fit. */
export function identifyScales(midiNotes: number[], limit = 8): ScaleMatch[] {
  const pcs = toPitchClassSet(midiNotes);
  if (pcs.length < 3) return [];
  const matches: ScaleMatch[] = [];

  for (let tonicPc = 0; tonicPc < 12; tonicPc++) {
    for (const scale of SCALES) {
      if (scale.id === 'chromatic') continue;
      const set = new Set(scaleIntervals(scale).map((iv) => mod(tonicPc + iv.semitones, 12)));
      const contained = pcs.filter((pc) => set.has(pc)).length;
      const coverage = contained / pcs.length;
      if (coverage < 1) continue;
      const fill = contained / set.size;
      // A scale that just barely contains the notes is a better answer than a
      // huge scale that contains everything.
      const score = coverage * 0.7 + fill * 0.3 - set.size * 0.01;
      matches.push({
        scale,
        tonicPc,
        tonicName: noteName(fromMidi(60 + tonicPc)),
        coverage,
        fill,
        score,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

export interface KeyMatch {
  key: Key;
  name: string;
  score: number;
}

/**
 * Estimate the key of a note collection using a simplified Krumhansl-style
 * weighting: tonic and dominant count for more than passing tones.
 */
export function estimateKey(midiNotes: number[], limit = 5): KeyMatch[] {
  if (!midiNotes.length) return [];

  const histogram = new Array(12).fill(0);
  midiNotes.forEach((n) => (histogram[mod(n, 12)] += 1));

  // Position matters. A C major scale and an A natural minor scale contain
  // exactly the same seven pitch classes, so a bare histogram genuinely cannot
  // tell them apart. What disambiguates them for a listener is emphasis: the
  // note you start on, the note you end on, and the note underneath everything.
  const first = mod(midiNotes[0], 12);
  const last = mod(midiNotes[midiNotes.length - 1], 12);
  const lowest = mod(Math.min(...midiNotes), 12);
  histogram[first] += 1.5;
  histogram[last] += 1.0;
  histogram[lowest] += 1.0;

  const results = ALL_KEYS.map((key) => {
    const tonic = pitchClass(key.tonic);
    const profile = key.mode === 'major' ? MAJOR_PROFILE : MINOR_PROFILE;
    const rotated = Array.from({ length: 12 }, (_, i) => histogram[mod(i + tonic, 12)]);
    return { key, name: keyName(key), score: correlation(rotated, profile) };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Krumhansl–Kessler probe-tone profiles: how strongly listeners rate each
 * scale degree as "fitting" in a major and a minor context.
 */
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

/**
 * Pearson correlation, not a plain dot product. The minor profile sums higher
 * than the major one, so a dot product quietly biases every guess toward minor.
 * Correlating against the mean removes that thumb on the scale.
 */
function correlation(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((x, y) => x + y, 0) / n;
  const meanB = b.reduce((x, y) => x + y, 0) / n;
  let num = 0;
  let devA = 0;
  let devB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    devA += da * da;
    devB += db * db;
  }
  const denom = Math.sqrt(devA * devB);
  return denom === 0 ? 0 : num / denom;
}

/** Notes played that fall outside a key — the "wrong notes", usefully labelled. */
export function outsideNotes(midiNotes: number[], key: Key): number[] {
  const inKey = new Set(keyNotes(key).map((n) => pitchClass(n)));
  return [...new Set(midiNotes.map((n) => mod(n, 12)))].filter((pc) => !inKey.has(pc));
}

/** Describe the intervals stacked in a chord, bottom to top. */
export function describeStack(midiNotes: number[]): string[] {
  const sorted = [...midiNotes].sort((a, b) => a - b);
  const out: string[] = [];
  for (let i = 1; i < sorted.length; i++) {
    out.push(intervalName(intervalFromSemitones(sorted[i] - sorted[i - 1])));
  }
  return out;
}

/**
 * Interval-vector-style summary: how many of each interval class the set
 * contains. It is the fingerprint that explains why a chord sounds the way it
 * does independent of its name.
 */
export function intervalVector(midiNotes: number[]): number[] {
  const pcs = toPitchClassSet(midiNotes);
  const vector = new Array(6).fill(0);
  for (let i = 0; i < pcs.length; i++) {
    for (let j = i + 1; j < pcs.length; j++) {
      const d = mod(pcs[j] - pcs[i], 12);
      const ic = Math.min(d, 12 - d);
      if (ic >= 1 && ic <= 6) vector[ic - 1] += 1;
    }
  }
  return vector;
}

export const INTERVAL_CLASS_LABELS = [
  'semitones (ic1)',
  'whole tones (ic2)',
  'minor 3rds (ic3)',
  'major 3rds (ic4)',
  'perfect 4ths (ic5)',
  'tritones (ic6)',
];

/** A rough dissonance score, 0–100, for colouring feedback in the UI. */
export function dissonanceScore(midiNotes: number[]): number {
  const v = intervalVector(midiNotes);
  const weights = [1.0, 0.5, 0.15, 0.15, 0.1, 0.85];
  const raw = v.reduce((sum, count, i) => sum + count * weights[i], 0);
  const pairs = Math.max(1, (toPitchClassSet(midiNotes).length * (toPitchClassSet(midiNotes).length - 1)) / 2);
  return Math.round(Math.min(100, (raw / pairs) * 110));
}
