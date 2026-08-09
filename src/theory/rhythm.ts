/**
 * Rhythm, meter, and groove.
 *
 * Rhythm is where most theory curricula go thin and where most producers
 * actually live, so this module carries real weight: note values, meters,
 * subdivision grids, swing, polyrhythm, and a library of named drum patterns.
 */

export interface NoteValue {
  id: string;
  name: string;
  /** Length in beats, where a quarter note = 1. */
  beats: number;
  /** Unicode notation glyph. */
  glyph: string;
  american: string;
  british: string;
}

export const NOTE_VALUES: NoteValue[] = [
  { id: 'whole', name: 'Whole note', beats: 4, glyph: '𝅝', american: 'whole', british: 'semibreve' },
  { id: 'half', name: 'Half note', beats: 2, glyph: '𝅗𝅥', american: 'half', british: 'minim' },
  { id: 'quarter', name: 'Quarter note', beats: 1, glyph: '♩', american: 'quarter', british: 'crotchet' },
  { id: 'eighth', name: 'Eighth note', beats: 0.5, glyph: '♪', american: 'eighth', british: 'quaver' },
  { id: 'sixteenth', name: 'Sixteenth note', beats: 0.25, glyph: '𝅘𝅥𝅯', american: 'sixteenth', british: 'semiquaver' },
  { id: 'thirtysecond', name: 'Thirty-second note', beats: 0.125, glyph: '𝅘𝅥𝅰', american: 'thirty-second', british: 'demisemiquaver' },
];

export const NOTE_VALUES_BY_ID: Record<string, NoteValue> = Object.fromEntries(
  NOTE_VALUES.map((v) => [v.id, v]),
);

/** A dot adds half the note's value again; two dots add a further quarter. */
export function dotted(beats: number, dots = 1): number {
  let total = beats;
  let add = beats;
  for (let i = 0; i < dots; i++) {
    add /= 2;
    total += add;
  }
  return total;
}

/** N notes played in the space of M — triplets, quintuplets, and friends. */
export function tuplet(beats: number, inTheSpaceOf: number, playing: number): number {
  return (beats * inTheSpaceOf) / playing;
}

export interface TimeSignature {
  beats: number;
  /** Note value that gets the beat: 4 = quarter, 8 = eighth. */
  unit: number;
}

export interface MeterInfo {
  id: string;
  signature: TimeSignature;
  label: string;
  type: 'simple' | 'compound' | 'irregular';
  /** How the beats group, e.g. [3,3,2] for a 7/8 or a clave feel. */
  grouping: number[];
  feel: string;
  heardIn: string;
}

export const METERS: MeterInfo[] = [
  {
    id: '4-4',
    signature: { beats: 4, unit: 4 },
    label: '4/4',
    type: 'simple',
    grouping: [1, 1, 1, 1],
    feel: 'Common time. Four even beats, strong on 1 and 3, backbeat on 2 and 4.',
    heardIn: 'Almost all popular music.',
  },
  {
    id: '3-4',
    signature: { beats: 3, unit: 4 },
    label: '3/4',
    type: 'simple',
    grouping: [1, 1, 1],
    feel: 'Waltz. Strong–weak–weak, with a circular, lilting motion.',
    heardIn: 'Waltzes, Norwegian Wood, My Favourite Things.',
  },
  {
    id: '6-8',
    signature: { beats: 6, unit: 8 },
    label: '6/8',
    type: 'compound',
    grouping: [3, 3],
    feel: 'Two big beats, each divided into three. Rolling and galloping.',
    heardIn: 'Irish jigs, We Are the Champions, doo-wop ballads.',
  },
  {
    id: '12-8',
    signature: { beats: 12, unit: 8 },
    label: '12/8',
    type: 'compound',
    grouping: [3, 3, 3, 3],
    feel: 'Four beats in triplets. The classic slow blues shuffle.',
    heardIn: 'Slow blues, gospel ballads, Beast of Burden.',
  },
  {
    id: '5-4',
    signature: { beats: 5, unit: 4 },
    label: '5/4',
    type: 'irregular',
    grouping: [3, 2],
    feel: 'One beat longer than expected. Perpetually slightly off balance.',
    heardIn: 'Take Five, Mission Impossible, Living in the Past.',
  },
  {
    id: '7-8',
    signature: { beats: 7, unit: 8 },
    label: '7/8',
    type: 'irregular',
    grouping: [2, 2, 3],
    feel: 'A bar that trips forward. Common in Balkan music and prog.',
    heardIn: 'Money (7/4), Balkan folk, Tool, Radiohead.',
  },
  {
    id: '9-8',
    signature: { beats: 9, unit: 8 },
    label: '9/8',
    type: 'compound',
    grouping: [3, 3, 3],
    feel: 'Three compound beats — a jig with an extra limb.',
    heardIn: 'Slip jigs, Blue Rondo à la Turk (in 2+2+2+3).',
  },
];

export const METERS_BY_ID: Record<string, MeterInfo> = Object.fromEntries(
  METERS.map((m) => [m.id, m]),
);

/** Length of one bar in beats (quarter-note beats). */
export function barLengthInBeats(sig: TimeSignature): number {
  return sig.beats * (4 / sig.unit);
}

/** Seconds per beat at a tempo. */
export function secondsPerBeat(bpm: number): number {
  return 60 / bpm;
}

/** Seconds per bar at a tempo and meter. */
export function secondsPerBar(bpm: number, sig: TimeSignature): number {
  return secondsPerBeat(bpm) * barLengthInBeats(sig);
}

/**
 * Delay time in milliseconds for a note value at a tempo. This is the single
 * most-used number in a mixing session — every tempo-synced delay and every
 * reverb pre-delay comes from here.
 */
export function delayMs(bpm: number, beats: number): number {
  return (60000 / bpm) * beats;
}

export const DELAY_PRESETS: Array<{ label: string; beats: number; note: string }> = [
  { label: '1/1', beats: 4, note: 'Whole bar — huge, ambient washes.' },
  { label: '1/2', beats: 2, note: 'Half note — slow, dramatic echoes.' },
  { label: '1/4', beats: 1, note: 'Quarter note — the default delay. Locks to the pulse.' },
  { label: '1/4D', beats: 1.5, note: 'Dotted quarter — the "U2" delay. Fills space without clutter.' },
  { label: '1/8', beats: 0.5, note: 'Eighth note — tight rhythmic doubling.' },
  { label: '1/8D', beats: 0.75, note: 'Dotted eighth — the classic guitar/synth pattern delay.' },
  { label: '1/8T', beats: 1 / 3, note: 'Eighth triplet — rolling, hypnotic.' },
  { label: '1/16', beats: 0.25, note: 'Sixteenth — slapback thickening.' },
  { label: '1/16D', beats: 0.375, note: 'Dotted sixteenth — subtle syncopated smear.' },
  { label: '1/32', beats: 0.125, note: 'Thirty-second — comb filtering, doubling, width.' },
];

/**
 * Swing: delay every second subdivision. 0 = straight, 1 = full triplet swing.
 * Returns the offset in subdivisions to add to odd-numbered steps.
 */
export function swingOffset(amount: number): number {
  // Straight 8ths sit at 0.5; full triplet swing sits at 2/3.
  return amount * (2 / 3 - 0.5);
}

export interface DrumPattern {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  /** 16 steps per bar. Each track is a boolean grid. */
  steps: number;
  tracks: Array<{ id: DrumVoice; label: string; hits: number[] }>;
  note: string;
  swing?: number;
}

export type DrumVoice = 'kick' | 'snare' | 'hat' | 'openhat' | 'clap' | 'rim' | 'perc';

export const DRUM_VOICE_LABELS: Record<DrumVoice, string> = {
  kick: 'Kick',
  snare: 'Snare',
  hat: 'Closed Hat',
  openhat: 'Open Hat',
  clap: 'Clap',
  rim: 'Rimshot',
  perc: 'Perc',
};

const P = (
  id: string,
  name: string,
  genre: string,
  bpm: number,
  note: string,
  tracks: Array<[DrumVoice, number[]]>,
  swing?: number,
): DrumPattern => ({
  id,
  name,
  genre,
  bpm,
  steps: 16,
  note,
  swing,
  tracks: tracks.map(([voice, hits]) => ({ id: voice, label: DRUM_VOICE_LABELS[voice], hits })),
});

export const DRUM_PATTERNS: DrumPattern[] = [
  P('four-on-floor', 'Four on the Floor', 'House / Disco', 124,
    'A kick on every beat gives the body something unmissable to lock to. Open hats on the off-beats create the forward lean.',
    [['kick', [0, 4, 8, 12]], ['clap', [4, 12]], ['hat', [2, 6, 10, 14]], ['openhat', [2, 6, 10, 14]]]),
  P('backbeat', 'Rock Backbeat', 'Rock / Pop', 120,
    'Kick on 1 and 3, snare on 2 and 4. The snare on the weak beats is what makes it feel like popular music rather than a march.',
    [['kick', [0, 8]], ['snare', [4, 12]], ['hat', [0, 2, 4, 6, 8, 10, 12, 14]]]),
  P('boom-bap', 'Boom Bap', 'Hip Hop', 90,
    'Slightly behind-the-beat snare and a swung hat grid. The looseness is the point — perfectly quantised boom bap sounds dead.',
    [['kick', [0, 6, 10]], ['snare', [4, 12]], ['hat', [0, 2, 4, 6, 8, 10, 12, 14]]], 0.55),
  P('trap', 'Trap', 'Trap', 140,
    'Half-time feel: the snare lands only on beat 3, so the tempo reads as half. Hat rolls fill the space that leaves.',
    [['kick', [0, 3, 10]], ['snare', [8]], ['hat', [0, 2, 4, 6, 7, 8, 10, 12, 13, 14, 15]]]),
  P('amen', 'Amen-Style Break', 'Drum & Bass', 174,
    'Syncopated ghost kicks and snares displaced off the grid. Density plus displacement is what creates the sense of speed.',
    [['kick', [0, 10]], ['snare', [4, 7, 12, 14]], ['hat', [2, 6, 10, 14]]]),
  P('bossa', 'Bossa Nova', 'Latin / Jazz', 130,
    'The rim pattern is a two-bar clave-derived figure. Nothing lands squarely, which is why it floats.',
    [['kick', [0, 6, 8, 14]], ['rim', [0, 3, 6, 10, 12]], ['hat', [0, 2, 4, 6, 8, 10, 12, 14]]]),
  P('son-clave', 'Son Clave (3-2)', 'Afro-Cuban', 100,
    'Five strokes across two bars that organise everything else in the arrangement. The reference the whole band feels against.',
    [['perc', [0, 3, 6, 10, 12]], ['kick', [0, 6, 8, 14]]]),
  P('dembow', 'Dembow', 'Reggaeton', 96,
    'The "boom-ch-boom-chick" figure. Kick on the downbeat, snare on the "and" of 1 and on 2 — endlessly repeating.',
    [['kick', [0, 6, 8, 14]], ['snare', [3, 4, 11, 12]], ['hat', [0, 4, 8, 12]]]),
  P('shuffle', 'Blues Shuffle', 'Blues', 100,
    'Every eighth becomes a triplet. Long–short, long–short. Straighten it and the blues disappears.',
    [['kick', [0, 8]], ['snare', [4, 12]], ['hat', [0, 2, 4, 6, 8, 10, 12, 14]]], 1),
  P('breakbeat', 'Breakbeat', 'Breaks / Big Beat', 132,
    'Kick displaced off the downbeat and syncopated snares. It swings without swing, purely through placement.',
    [['kick', [0, 3, 8, 11]], ['snare', [4, 12]], ['hat', [2, 6, 10, 14]]]),
  P('garage', 'UK Garage 2-Step', 'UK Garage', 132,
    'The kick skips beat 3 entirely and the snare shuffles. Removing an expected hit is as powerful as adding one.',
    [['kick', [0, 10]], ['snare', [4, 12]], ['hat', [2, 5, 6, 9, 13, 14]]], 0.6),
  P('afrobeats', 'Afrobeats', 'Afrobeats', 104,
    'A three-against-four log-drum pulse over a steady kick. The tension between the two grids is the groove.',
    [['kick', [0, 6, 11]], ['perc', [0, 3, 6, 9, 12, 15]], ['hat', [2, 4, 6, 10, 12, 14]]]),
];

export const DRUM_PATTERNS_BY_ID: Record<string, DrumPattern> = Object.fromEntries(
  DRUM_PATTERNS.map((p) => [p.id, p]),
);

/**
 * Euclidean rhythm: distribute `pulses` as evenly as possible across `steps`.
 * This one algorithm generates a startling number of the world's folk rhythms.
 */
export function euclideanRhythm(pulses: number, steps: number, rotation = 0): boolean[] {
  if (pulses <= 0) return new Array(steps).fill(false);
  if (pulses >= steps) return new Array(steps).fill(true);
  // A hit lands on step i whenever the running remainder wraps past `steps`.
  // Anchoring the test at i itself (rather than accumulating) puts the first
  // hit on step 0, which is what every named rhythm below expects.
  const pattern = Array.from({ length: steps }, (_, i) => ((i * pulses) % steps) < pulses);
  const r = ((rotation % steps) + steps) % steps;
  return [...pattern.slice(steps - r), ...pattern.slice(0, steps - r)];
}

export const EUCLIDEAN_EXAMPLES: Array<{ pulses: number; steps: number; name: string }> = [
  { pulses: 3, steps: 8, name: 'Tresillo — Cuban, and the root of reggaeton' },
  { pulses: 5, steps: 8, name: 'Cinquillo — Cuban and West African' },
  { pulses: 2, steps: 5, name: 'Khafif-e-ramal — Persian' },
  { pulses: 5, steps: 16, name: 'Bossa nova clave' },
  { pulses: 7, steps: 16, name: 'Brazilian samba figure' },
  { pulses: 4, steps: 9, name: 'Turkish aksak' },
  { pulses: 9, steps: 16, name: 'West African bell pattern' },
];

/**
 * Where two different subdivisions coincide — the maths behind polyrhythms.
 * A 3:2 polyrhythm lines up every 6 subdivisions.
 */
export function polyrhythmGrid(a: number, b: number): { lcm: number; aHits: number[]; bHits: number[] } {
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  const lcm = (a * b) / gcd(a, b);
  return {
    lcm,
    aHits: Array.from({ length: a }, (_, i) => (i * lcm) / a),
    bHits: Array.from({ length: b }, (_, i) => (i * lcm) / b),
  };
}

/** Reference tempos with the genres that live there. */
export const TEMPO_MAP: Array<{ range: [number, number]; label: string; genres: string }> = [
  { range: [60, 80], label: 'Largo / Ballad', genres: 'Slow ballads, ambient, downtempo, trap at half-time.' },
  { range: [80, 100], label: 'Andante / Groove', genres: 'Hip hop, boom bap, reggae, soul.' },
  { range: [100, 115], label: 'Moderato', genres: 'Afrobeats, pop, R&B, disco.' },
  { range: [115, 130], label: 'Allegro / Dance', genres: 'House, disco, pop, funk.' },
  { range: [130, 150], label: 'Driving', genres: 'Techno, trance, trap (double-time), breaks.' },
  { range: [150, 180], label: 'Fast', genres: 'Drum & bass, hardcore, punk, footwork.' },
];

export function tempoLabel(bpm: number): string {
  const found = TEMPO_MAP.find((t) => bpm >= t.range[0] && bpm < t.range[1]);
  return found ? found.label : bpm < 60 ? 'Very slow' : 'Very fast';
}
