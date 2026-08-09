import { palette } from '../theme';
import { Achievement, Drill } from './types';

/**
 * Practice drills.
 *
 * Lessons build understanding; drills build speed. Every drill generates its
 * questions procedurally from the theory engine, so they never run out and the
 * difficulty can scale with the learner.
 */

export const DRILLS: Drill[] = [
  {
    id: 'interval-ear-basic',
    kind: 'interval-ear',
    title: 'Interval Ear Training',
    description: 'Hear two notes, name the distance. The single highest-value skill in music.',
    glyph: '👂',
    color: palette.teal,
    tier: 'foundation',
    questions: 10,
    xpPerRound: 25,
    config: {
      // Start with the four most distinguishable intervals and widen from there.
      semitones: [3, 4, 7, 12],
      style: 'melodic',
      levels: [
        { label: 'Starter', semitones: [3, 4, 7, 12] },
        { label: 'Common', semitones: [2, 3, 4, 5, 7, 9, 12] },
        { label: 'All simple', semitones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
        { label: 'Harmonic', semitones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], style: 'harmonic' },
      ],
    },
  },
  {
    id: 'chord-ear',
    kind: 'chord-ear',
    title: 'Chord Quality',
    description: 'Triads and sevenths by ear. Learn to hear the shape, not the notes.',
    glyph: '🎧',
    color: palette.indigo,
    tier: 'developing',
    questions: 10,
    xpPerRound: 30,
    config: {
      qualities: ['major', 'minor'],
      levels: [
        { label: 'Major vs minor', qualities: ['major', 'minor'] },
        { label: 'All triads', qualities: ['major', 'minor', 'diminished', 'augmented'] },
        { label: 'Sevenths', qualities: ['maj7', 'm7', '7', 'm7b5', 'dim7'] },
        { label: 'Extensions', qualities: ['maj7', 'm7', '7', 'm7b5', 'dim7', 'maj9', 'm9', '9', '7b9', '7sharp9'] },
      ],
    },
  },
  {
    id: 'scale-ear',
    kind: 'scale-ear',
    title: 'Scale & Mode ID',
    description: 'Identify scales and modes by their characteristic degree.',
    glyph: '🎼',
    color: palette.violet,
    tier: 'proficient',
    questions: 8,
    xpPerRound: 35,
    config: {
      scales: ['ionian', 'aeolian'],
      levels: [
        { label: 'Major vs minor', scales: ['ionian', 'aeolian'] },
        { label: 'Minor family', scales: ['aeolian', 'harmonic-minor', 'melodic-minor', 'dorian'] },
        { label: 'The modes', scales: ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'] },
        {
          label: 'Exotic',
          scales: ['phrygian-dominant', 'hungarian-minor', 'double-harmonic', 'whole-tone', 'blues', 'hirajoshi'],
        },
      ],
    },
  },
  {
    id: 'progression-ear',
    kind: 'progression-ear',
    title: 'Progression Recognition',
    description: 'Name the chord movement behind the song. The producer superpower.',
    glyph: '🔗',
    color: palette.fuchsia,
    tier: 'proficient',
    questions: 8,
    xpPerRound: 40,
    config: {
      progressionIds: ['i-iv-v-i', 'i-v-vi-iv', 'i-vi-iv-v', 'vi-iv-i-v'],
      levels: [
        { label: 'The big four', progressionIds: ['i-iv-v-i', 'i-v-vi-iv', 'i-vi-iv-v', 'vi-iv-i-v'] },
        {
          label: 'Pop & modal',
          progressionIds: ['i-v-vi-iv', 'vi-iv-i-v', 'i-bvii-iv', 'andalusian', 'i-bvi-bvii', 'royal-road'],
        },
        {
          label: 'Jazz',
          progressionIds: ['ii-v-i', 'minor-ii-v-i', 'circle-of-fifths', 'i-vi-ii-v', 'backdoor', 'tritone-sub'],
        },
      ],
    },
  },
  {
    id: 'key-signature',
    kind: 'key-signature',
    title: 'Key Signatures',
    description: 'Read a signature, name the key. Under three seconds is the target.',
    glyph: '🔑',
    color: palette.cyan,
    tier: 'developing',
    questions: 12,
    xpPerRound: 25,
    config: {
      maxAccidentals: 4,
      levels: [
        { label: 'Up to 2', maxAccidentals: 2 },
        { label: 'Up to 4', maxAccidentals: 4 },
        { label: 'All keys', maxAccidentals: 7 },
        { label: 'Minor keys too', maxAccidentals: 7, includeMinor: true },
      ],
    },
  },
  {
    id: 'note-reading',
    kind: 'note-reading',
    title: 'Note Reading',
    description: 'Sight-read notes on the staff. Treble, bass, and ledger lines.',
    glyph: '📖',
    color: palette.emerald,
    tier: 'foundation',
    questions: 15,
    xpPerRound: 25,
    config: {
      clef: 'treble',
      levels: [
        { label: 'Treble, on staff', clef: 'treble', ledger: false },
        { label: 'Bass, on staff', clef: 'bass', ledger: false },
        { label: 'Both clefs', clef: 'both', ledger: false },
        { label: 'With ledger lines', clef: 'both', ledger: true },
      ],
    },
  },
  {
    id: 'chord-spelling',
    kind: 'chord-spelling',
    title: 'Chord Spelling',
    description: 'Build the chord on the keyboard. No multiple choice, no guessing.',
    glyph: '🧩',
    color: palette.rose,
    tier: 'developing',
    questions: 8,
    xpPerRound: 35,
    config: {
      qualities: ['major', 'minor'],
      levels: [
        { label: 'Triads', qualities: ['major', 'minor'] },
        { label: 'All triads', qualities: ['major', 'minor', 'diminished', 'augmented'] },
        { label: 'Sevenths', qualities: ['maj7', 'm7', '7', 'm7b5', 'dim7'] },
        { label: 'Extended', qualities: ['maj9', 'm9', '9', '6', 'm6', 'sus4', 'add9'] },
      ],
    },
  },
  {
    id: 'roman-numeral',
    kind: 'roman-numeral',
    title: 'Roman Numerals',
    description: 'Convert numerals to chords in any key, instantly.',
    glyph: 'Ⅴ',
    color: palette.amber,
    tier: 'proficient',
    questions: 12,
    xpPerRound: 35,
    config: {
      romans: ['I', 'ii', 'iii', 'IV', 'V', 'vi'],
      levels: [
        { label: 'Major triads', romans: ['I', 'ii', 'iii', 'IV', 'V', 'vi'] },
        { label: 'Add sevenths', romans: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7'] },
        { label: 'Minor keys', romans: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], mode: 'minor' },
        { label: 'Chromatic', romans: ['bII', 'bIII', 'bVI', 'bVII', 'V7', 'VI7', 'II7', 'III7'] },
      ],
    },
  },
  {
    id: 'rhythm-tap',
    kind: 'rhythm-tap',
    title: 'Rhythm & Timing',
    description: 'Tap along and see exactly how far off you are, in milliseconds.',
    glyph: '👏',
    color: palette.coral,
    tier: 'foundation',
    questions: 16,
    xpPerRound: 30,
    config: {
      bpm: 90,
      levels: [
        { label: 'Quarter notes', bpm: 90, subdivision: 1 },
        { label: 'Eighth notes', bpm: 100, subdivision: 2 },
        { label: 'Sixteenths', bpm: 100, subdivision: 4 },
        { label: 'Fast', bpm: 132, subdivision: 4 },
      ],
    },
  },
  {
    id: 'review',
    kind: 'review',
    title: 'Daily Review',
    description: 'Everything you have learned, scheduled by an algorithm that knows when you are about to forget it.',
    glyph: '🔄',
    color: palette.gold,
    tier: 'foundation',
    questions: 20,
    xpPerRound: 40,
    config: {},
  },
];

export const DRILLS_BY_ID: Record<string, Drill> = Object.fromEntries(
  DRILLS.map((d) => [d.id, d]),
);

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', title: 'First Steps', description: 'Finish your first lesson.', glyph: '🌱', color: palette.emerald },
  { id: 'streak-3', title: 'Getting Consistent', description: 'Practise three days running.', glyph: '🔥', color: palette.amber },
  { id: 'streak-7', title: 'One Week Strong', description: 'A seven-day streak.', glyph: '⚡', color: palette.gold },
  { id: 'streak-30', title: 'Unbreakable', description: 'Thirty days without missing.', glyph: '💎', color: palette.cyan },
  { id: 'stage-foundations', title: 'Grounded', description: 'Complete the First Sounds stage.', glyph: '🗿', color: palette.emerald },
  { id: 'perfect-drill', title: 'Flawless', description: 'Score 100% on any drill round.', glyph: '🎯', color: palette.rose },
  { id: 'ear-50', title: 'Good Ears', description: 'Answer 50 ear-training questions correctly.', glyph: '👂', color: palette.teal },
  { id: 'ear-250', title: 'Golden Ears', description: 'Answer 250 ear-training questions correctly.', glyph: '🏆', color: palette.gold },
  { id: 'level-5', title: 'Apprentice', description: 'Reach level 5.', glyph: '⭐', color: palette.violet },
  { id: 'level-10', title: 'Musician', description: 'Reach level 10.', glyph: '🌟', color: palette.fuchsia },
  { id: 'level-20', title: 'Theorist', description: 'Reach level 20.', glyph: '✨', color: palette.gold },
  { id: 'all-modes', title: 'Modal Thinker', description: 'Complete every lesson in The Modes.', glyph: '🎨', color: palette.violet },
  { id: 'producer', title: 'In the Studio', description: 'Complete the Sound Design stage.', glyph: '🎛️', color: palette.lime },
  { id: 'mixer', title: 'Mix Engineer', description: 'Complete the Arrangement & Mixing stage.', glyph: '🎚️', color: palette.sky },
  { id: 'composer', title: 'Composer', description: 'Complete every lesson in the app.', glyph: '👑', color: palette.gold },
];

export const ACHIEVEMENTS_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
