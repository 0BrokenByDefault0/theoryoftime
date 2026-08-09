/**
 * Procedural question generation.
 *
 * Drills generate questions from the theory engine rather than from a fixed
 * bank, so they never repeat themselves and difficulty can scale continuously.
 * Every generator returns the same shape, which is what lets one runner screen
 * handle every drill type.
 */

import {
  ALL_KEYS,
  CHORD_QUALITIES_BY_ID,
  Key,
  Note,
  PROGRESSIONS_BY_ID,
  SCALES_BY_ID,
  chordMidi,
  chordSymbol,
  fromMidi,
  getQuality,
  getScale,
  intervalAbbr,
  intervalFromSemitones,
  intervalName,
  keySignature,
  keySignatureLabel,
  noteName,
  parseChordSymbol,
  pitchClass,
  requireNote,
  romanToChord,
  toMidi,
} from '../theory';
import { Drill } from '../content/types';

export type QuestionPrompt =
  | { kind: 'audio-interval'; low: number; high: number; style: 'melodic' | 'harmonic' }
  | { kind: 'audio-chord'; midi: number[] }
  | { kind: 'audio-scale'; tonic: Note; scaleId: string }
  | { kind: 'audio-progression'; romans: string[]; key: Key }
  | { kind: 'staff'; notes: string[]; clef: 'treble' | 'bass'; keyTonic?: string }
  | { kind: 'text'; text: string }
  | { kind: 'build-chord'; targetPitchClasses: number[]; label: string }
  | { kind: 'tap'; bpm: number; subdivision: number };

export interface Question {
  id: string;
  prompt: QuestionPrompt;
  question: string;
  options: string[];
  answer: number;
  explain: string;
  /** Spaced-repetition key, when the question maps to a durable fact. */
  reviewId?: string;
  reviewCategory?: string;
}

const rand = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** Shuffle, then place the correct answer wherever it lands. */
function buildOptions(correct: string, distractors: string[], count = 4): { options: string[]; answer: number } {
  const pool = [...new Set(distractors.filter((d) => d !== correct))];
  const chosen: string[] = [];
  while (chosen.length < count - 1 && pool.length) {
    chosen.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  const options = [...chosen, correct].sort(() => Math.random() - 0.5);
  return { options, answer: options.indexOf(correct) };
}

interface LevelConfig {
  label: string;
  [key: string]: unknown;
}

function levelConfig(drill: Drill, levelIndex: number): Record<string, unknown> {
  const levels = (drill.config.levels as LevelConfig[] | undefined) ?? [];
  const level = levels[Math.min(levelIndex, levels.length - 1)];
  return { ...drill.config, ...(level ?? {}) };
}

export function levelLabels(drill: Drill): string[] {
  const levels = (drill.config.levels as LevelConfig[] | undefined) ?? [];
  return levels.length ? levels.map((l) => l.label) : ['Standard'];
}

// ── Generators ────────────────────────────────────────────────────────────

function intervalEarQuestion(config: Record<string, unknown>, i: number): Question {
  const semitones = rand(config.semitones as number[]);
  const style = (config.style as 'melodic' | 'harmonic') ?? 'melodic';
  // Randomise the starting note so learners cannot anchor on absolute pitch.
  const low = randInt(52, 66);
  const interval = intervalFromSemitones(semitones);
  const correct = intervalName(interval);

  const all = (config.semitones as number[]).map((s) => intervalName(intervalFromSemitones(s)));
  const { options, answer } = buildOptions(correct, all);

  return {
    id: `interval-ear-${semitones}-${i}`,
    prompt: { kind: 'audio-interval', low, high: low + semitones, style },
    question: 'Which interval is this?',
    options,
    answer,
    explain: `${correct} — ${semitones} semitone${semitones === 1 ? '' : 's'}, written ${intervalAbbr(interval)}.`,
    reviewId: `ear-interval-${semitones}`,
    reviewCategory: 'ear-intervals',
  };
}

function chordEarQuestion(config: Record<string, unknown>, i: number): Question {
  const qualities = config.qualities as string[];
  const qualityId = rand(qualities);
  const quality = getQuality(qualityId);
  const rootMidi = randInt(52, 64);
  const root = fromMidi(rootMidi);
  const chord = { root, quality, inversion: 0 };

  const { options, answer } = buildOptions(
    quality.name,
    qualities.map((q) => getQuality(q).name),
  );

  return {
    id: `chord-ear-${qualityId}-${i}`,
    prompt: { kind: 'audio-chord', midi: chordMidi(chord) },
    question: 'Which chord quality is this?',
    options,
    answer,
    explain: `${quality.name} — ${quality.degrees.join(' ')}. ${quality.mood}`,
    reviewId: `ear-chord-${qualityId}`,
    reviewCategory: 'ear-chords',
  };
}

function scaleEarQuestion(config: Record<string, unknown>, i: number): Question {
  const scaleIds = config.scales as string[];
  const scaleId = rand(scaleIds);
  const scale = getScale(scaleId);
  const tonic = requireNote(rand(['C', 'D', 'E', 'F', 'G', 'A']) + '4');

  const { options, answer } = buildOptions(
    scale.name,
    scaleIds.map((id) => getScale(id).name),
  );

  return {
    id: `scale-ear-${scaleId}-${i}`,
    prompt: { kind: 'audio-scale', tonic, scaleId },
    question: 'Which scale is this?',
    options,
    answer,
    explain: `${scale.name} — ${scale.degrees.join(' ')}. ${scale.mood}`,
    reviewId: `ear-scale-${scaleId}`,
    reviewCategory: 'ear-scales',
  };
}

function progressionEarQuestion(config: Record<string, unknown>, i: number): Question {
  const ids = config.progressionIds as string[];
  const id = rand(ids);
  const progression = PROGRESSIONS_BY_ID[id];
  const tonicName = rand(['C', 'D', 'F', 'G', 'A']);
  const key: Key = { tonic: requireNote(tonicName + '4'), mode: progression.mode };

  const label = (p: string) => PROGRESSIONS_BY_ID[p].romans.join(' – ');
  const { options, answer } = buildOptions(label(id), ids.map(label));

  return {
    id: `prog-ear-${id}-${i}`,
    prompt: { kind: 'audio-progression', romans: progression.romans, key },
    question: 'Which progression is this?',
    options,
    answer,
    explain: `${progression.name}. ${progression.why}`,
    reviewId: `ear-prog-${id}`,
    reviewCategory: 'ear-progressions',
  };
}

function keySignatureQuestion(config: Record<string, unknown>, i: number): Question {
  const max = (config.maxAccidentals as number) ?? 4;
  const includeMinor = (config.includeMinor as boolean) ?? false;

  const candidates = ALL_KEYS.filter(
    (k) => Math.abs(keySignature(k)) <= max && (includeMinor || k.mode === 'major'),
  );
  const key = rand(candidates);
  const correct = `${noteName(key.tonic)} ${key.mode}`;

  const { options, answer } = buildOptions(
    correct,
    candidates.map((k) => `${noteName(k.tonic)} ${k.mode}`),
  );

  const count = keySignature(key);

  return {
    id: `keysig-${correct}-${i}`,
    prompt: {
      kind: 'staff',
      notes: [],
      clef: 'treble',
      keyTonic: noteName(key.tonic, { unicode: false }),
    },
    question: `Which key has ${keySignatureLabel(key)}?`,
    options,
    answer,
    explain:
      count === 0
        ? 'No accidentals — C major or A minor.'
        : count > 0
          ? `${keySignatureLabel(key)}. The last sharp is the leading tone, so the tonic is a semitone above it.`
          : `${keySignatureLabel(key)}. The second-to-last flat names the major key.`,
    reviewId: `keysig-${noteName(key.tonic, { unicode: false })}-${key.mode}`,
    reviewCategory: 'keys',
  };
}

function noteReadingQuestion(config: Record<string, unknown>, i: number): Question {
  const clefSetting = (config.clef as string) ?? 'treble';
  const clef: 'treble' | 'bass' =
    clefSetting === 'both' ? (Math.random() < 0.5 ? 'treble' : 'bass') : (clefSetting as 'treble' | 'bass');
  const ledger = (config.ledger as boolean) ?? false;

  // Staff ranges: E4–F5 on the treble staff, G2–A3 on the bass staff.
  const range = clef === 'treble' ? (ledger ? [60, 84] : [64, 77]) : ledger ? [36, 60] : [43, 57];
  let midi = randInt(range[0], range[1]);
  // Accidentals would make this a spelling question rather than a reading one.
  while ([1, 3, 6, 8, 10].includes(midi % 12)) midi = randInt(range[0], range[1]);

  const note = fromMidi(midi);
  const correct = noteName(note);
  const { options, answer } = buildOptions(correct, ['C', 'D', 'E', 'F', 'G', 'A', 'B']);

  return {
    id: `read-${midi}-${i}`,
    prompt: {
      kind: 'staff',
      notes: [noteName(note, { unicode: false, octave: true })],
      clef,
    },
    question: 'Name this note.',
    options,
    answer,
    explain: `${correct}${note.octave} — ${clef === 'treble' ? 'treble' : 'bass'} clef.`,
  };
}

function chordSpellingQuestion(config: Record<string, unknown>, i: number): Question {
  const qualities = config.qualities as string[];
  const qualityId = rand(qualities);
  const quality = getQuality(qualityId);
  const rootName = rand(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'F#']);
  const symbol = rootName + quality.symbol;
  const chord = parseChordSymbol(symbol, 4);
  const midi = chord ? chordMidi(chord) : [];

  return {
    id: `spell-${symbol}-${i}`,
    prompt: {
      kind: 'build-chord',
      targetPitchClasses: midi.map((m) => m % 12),
      label: symbol,
    },
    question: `Play ${symbol}`,
    options: [],
    answer: 0,
    explain: chord
      ? `${symbol} = ${chordMidi(chord)
          .map((m) => noteName(fromMidi(m)))
          .join(' – ')}. Degrees ${quality.degrees.join(' ')}.`
      : symbol,
    reviewId: `spell-${qualityId}`,
    reviewCategory: 'chords',
  };
}

function romanNumeralQuestion(config: Record<string, unknown>, i: number): Question {
  const romans = config.romans as string[];
  const mode = ((config.mode as string) ?? 'major') as 'major' | 'minor';
  const roman = rand(romans);
  const tonicName = rand(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']);
  const key: Key = { tonic: requireNote(tonicName + '4'), mode };

  const chord = romanToChord(roman, key);
  if (!chord) {
    return {
      id: `roman-fallback-${i}`,
      prompt: { kind: 'text', text: roman },
      question: 'Which chord is this?',
      options: ['—'],
      answer: 0,
      explain: '',
    };
  }

  const correct = chordSymbol(chord);
  const distractors = romans
    .map((r) => romanToChord(r, key))
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map((c) => chordSymbol(c));

  const { options, answer } = buildOptions(correct, distractors);

  return {
    id: `roman-${roman}-${tonicName}-${i}`,
    prompt: { kind: 'text', text: `${roman}  in  ${noteName(key.tonic)} ${mode}` },
    question: 'Which chord is this?',
    options,
    answer,
    explain: `${roman} in ${noteName(key.tonic)} ${mode} is ${correct}.`,
    reviewId: `roman-${roman}`,
    reviewCategory: 'harmony',
  };
}

function rhythmTapQuestion(config: Record<string, unknown>, i: number): Question {
  return {
    id: `tap-${i}`,
    prompt: {
      kind: 'tap',
      bpm: (config.bpm as number) ?? 90,
      subdivision: (config.subdivision as number) ?? 1,
    },
    question: 'Tap on the beat',
    options: [],
    answer: 0,
    explain: '',
  };
}

// ── Public API ────────────────────────────────────────────────────────────

/** Build a full round of questions for a drill at a given level. */
export function generateRound(drill: Drill, levelIndex: number): Question[] {
  const config = levelConfig(drill, levelIndex);
  const count = drill.questions;

  const generator = {
    'interval-ear': intervalEarQuestion,
    'chord-ear': chordEarQuestion,
    'scale-ear': scaleEarQuestion,
    'progression-ear': progressionEarQuestion,
    'key-signature': keySignatureQuestion,
    'note-reading': noteReadingQuestion,
    'chord-spelling': chordSpellingQuestion,
    'roman-numeral': romanNumeralQuestion,
    'rhythm-tap': rhythmTapQuestion,
    'interval-sight': intervalEarQuestion,
    'perfect-pitch': intervalEarQuestion,
    review: intervalEarQuestion,
  }[drill.kind];

  const questions: Question[] = [];
  const seen = new Set<string>();

  // Avoid asking the same thing twice in one round, but never loop forever if
  // the level's pool is smaller than the round length.
  for (let attempt = 0; questions.length < count && attempt < count * 8; attempt++) {
    const q = generator(config, questions.length);
    const dedupeKey = q.id.replace(/-\d+$/, '');
    if (seen.has(dedupeKey) && seen.size < count) continue;
    seen.add(dedupeKey);
    questions.push(q);
  }

  return questions;
}

/** Questions rebuilt from spaced-repetition items that are due. */
export function generateReviewRound(
  dueIds: Array<{ id: string; category: string }>,
  limit = 15,
): Question[] {
  const questions: Question[] = [];

  for (const item of dueIds.slice(0, limit)) {
    const question = questionFromReviewId(item.id, item.category, questions.length);
    if (question) questions.push(question);
  }

  return questions;
}

/**
 * Reconstruct a question from a review id. Review ids encode enough to rebuild
 * the prompt, which avoids having to persist whole questions in storage.
 */
function questionFromReviewId(id: string, category: string, index: number): Question | null {
  if (id.startsWith('ear-interval-')) {
    const semitones = parseInt(id.replace('ear-interval-', ''), 10);
    if (Number.isNaN(semitones)) return null;
    return intervalEarQuestion(
      { semitones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], style: 'melodic' },
      index,
    );
  }
  if (id.startsWith('ear-chord-')) {
    const qualityId = id.replace('ear-chord-', '');
    if (!CHORD_QUALITIES_BY_ID[qualityId]) return null;
    return chordEarQuestion({ qualities: [qualityId, 'major', 'minor', 'maj7', 'm7', '7'] }, index);
  }
  if (id.startsWith('ear-scale-')) {
    const scaleId = id.replace('ear-scale-', '');
    if (!SCALES_BY_ID[scaleId]) return null;
    return scaleEarQuestion(
      { scales: [scaleId, 'ionian', 'aeolian', 'dorian', 'mixolydian'] },
      index,
    );
  }
  if (id.startsWith('ear-prog-')) {
    const progId = id.replace('ear-prog-', '');
    if (!PROGRESSIONS_BY_ID[progId]) return null;
    return progressionEarQuestion(
      { progressionIds: [progId, 'i-iv-v-i', 'i-v-vi-iv', 'ii-v-i'] },
      index,
    );
  }
  if (category === 'keys') {
    return keySignatureQuestion({ maxAccidentals: 7, includeMinor: true }, index);
  }
  if (category === 'harmony') {
    return romanNumeralQuestion({ romans: ['I', 'ii', 'iii', 'IV', 'V', 'vi'], mode: 'major' }, index);
  }
  if (category === 'chords') {
    return chordSpellingQuestion({ qualities: ['major', 'minor', 'maj7', 'm7', '7'] }, index);
  }
  return null;
}

export { pitchClass, toMidi };
