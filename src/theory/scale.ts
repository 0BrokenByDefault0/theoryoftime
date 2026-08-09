/**
 * Scales and modes.
 *
 * Every scale is defined by its interval spelling from the tonic (e.g. the
 * Dorian mode is 1 2 b3 4 5 6 b7). Spelling the degrees rather than listing
 * semitones is what lets a D Dorian scale come out as D E F G A B C instead of
 * D E F G A B B#.
 */

import { Note, PitchClassNote, mod, noteName, pitchClass } from './pitch';
import { Interval, parseInterval, transpose } from './interval';

export type ScaleFamily =
  | 'major'
  | 'minor'
  | 'pentatonic'
  | 'blues'
  | 'symmetric'
  | 'jazz'
  | 'exotic'
  | 'modal';

export interface ScaleDefinition {
  id: string;
  name: string;
  /** Alternate names players actually use. */
  aliases: string[];
  family: ScaleFamily;
  /** Interval abbreviations from the tonic, e.g. ['P1','M2','m3',…]. */
  intervals: string[];
  /** Degree labels for display: 1, 2, b3, #4 … */
  degrees: string[];
  /** One-line character description — how it feels, not what it is. */
  mood: string;
  /** Where you actually hear it. */
  usedIn: string;
  /** The degree that gives the scale its identity, as a display label. */
  characteristic?: string;
  /** Brightness ranking, -7 (darkest) to +7 (brightest), for modal ordering. */
  brightness?: number;
}

const D = (
  id: string,
  name: string,
  family: ScaleFamily,
  intervals: string,
  degrees: string,
  mood: string,
  usedIn: string,
  extra: Partial<ScaleDefinition> = {},
): ScaleDefinition => ({
  id,
  name,
  aliases: [],
  family,
  intervals: intervals.split(' '),
  degrees: degrees.split(' '),
  mood,
  usedIn,
  ...extra,
});

export const SCALES: ScaleDefinition[] = [
  // ── The seven modes of the major scale, ordered bright to dark ──────────
  D(
    'lydian',
    'Lydian',
    'modal',
    'P1 M2 M3 A4 P5 M6 M7',
    '1 2 3 #4 5 6 7',
    'Weightless and luminous. Major, but floating an inch off the ground.',
    'Film scores (Williams, Elfman), dream pop, The Simpsons theme.',
    { characteristic: '#4', brightness: 1, aliases: ['Major #4'] },
  ),
  D(
    'ionian',
    'Ionian (Major)',
    'major',
    'P1 M2 M3 P4 P5 M6 M7',
    '1 2 3 4 5 6 7',
    'Home. Resolved, bright, complete — the sound most Western music is measured against.',
    'Everything from nursery rhymes to stadium pop choruses.',
    { characteristic: '7', brightness: 0, aliases: ['Major scale'] },
  ),
  D(
    'mixolydian',
    'Mixolydian',
    'modal',
    'P1 M2 M3 P4 P5 M6 m7',
    '1 2 3 4 5 6 b7',
    'Major with the shine sanded off. Swaggering, bluesy, endlessly loopable.',
    'Rock and funk riffs, Celtic tunes, Sweet Home Alabama, Royals.',
    { characteristic: 'b7', brightness: -1 },
  ),
  D(
    'dorian',
    'Dorian',
    'modal',
    'P1 M2 m3 P4 P5 M6 m7',
    '1 2 b3 4 5 6 b7',
    'Minor with hope in it. Cool, groove-forward, never quite tragic.',
    'Jazz vamps, house and UK garage, Scarborough Fair, Billie Jean.',
    { characteristic: '6', brightness: -2 },
  ),
  D(
    'aeolian',
    'Aeolian (Natural Minor)',
    'minor',
    'P1 M2 m3 P4 P5 m6 m7',
    '1 2 b3 4 5 b6 b7',
    'Plain sadness. Serious and grounded, with no leading tone pulling home.',
    'Ballads, metal, most minor-key pop. The default minor.',
    { characteristic: 'b6', brightness: -3, aliases: ['Natural minor'] },
  ),
  D(
    'phrygian',
    'Phrygian',
    'modal',
    'P1 m2 m3 P4 P5 m6 m7',
    '1 b2 b3 4 5 b6 b7',
    'Dark and coiled. That flat second right above the tonic is pure menace.',
    'Flamenco, thrash and djent riffs, trap melodies, Spanish guitar.',
    { characteristic: 'b2', brightness: -4 },
  ),
  D(
    'locrian',
    'Locrian',
    'modal',
    'P1 m2 m3 P4 d5 m6 m7',
    '1 b2 b3 4 b5 b6 b7',
    'Unstable by design — even the tonic chord is diminished. It cannot rest.',
    'Passing harmony, metal, and deliberate unease. Rare as a home key.',
    { characteristic: 'b5', brightness: -5 },
  ),

  // ── Minor variants ──────────────────────────────────────────────────────
  D(
    'harmonic-minor',
    'Harmonic Minor',
    'minor',
    'P1 M2 m3 P4 P5 m6 M7',
    '1 2 b3 4 5 b6 7',
    'Minor that fights to resolve. The augmented second between b6 and 7 gives it an eastern, gothic edge.',
    'Classical minor keys, neoclassical metal, klezmer, tango.',
    { characteristic: '7' },
  ),
  D(
    'melodic-minor',
    'Melodic Minor',
    'minor',
    'P1 M2 m3 P4 P5 M6 M7',
    '1 2 b3 4 5 6 7',
    'Minor on the way up, smooth as major. A jazz workhorse in disguise.',
    'Jazz improvisation, film underscore, Bond-style tension.',
    { characteristic: '6 and 7 raised', aliases: ['Jazz minor'] },
  ),
  D(
    'dorian-b2',
    'Dorian b2',
    'jazz',
    'P1 m2 m3 P4 P5 M6 m7',
    '1 b2 b3 4 5 6 b7',
    'Phrygian with a bright sixth. Exotic but still groovy.',
    'Modal jazz — the second mode of melodic minor.',
    { aliases: ['Phrygian #6'] },
  ),
  D(
    'lydian-augmented',
    'Lydian Augmented',
    'jazz',
    'P1 M2 M3 A4 A5 M6 M7',
    '1 2 3 #4 #5 6 7',
    'Lydian pushed further into the sky. Shimmering and unresolved.',
    'Impressionist harmony, jazz over maj7#5 chords.',
  ),
  D(
    'lydian-dominant',
    'Lydian Dominant',
    'jazz',
    'P1 M2 M3 A4 P5 M6 m7',
    '1 2 3 #4 5 6 b7',
    'A dominant chord with a raised fourth. Bright, blurry, slightly alien.',
    'Jazz fusion, Steely Dan, blues turnarounds.',
    { aliases: ['Overtone scale', 'Acoustic scale', 'Mixolydian #4'] },
  ),
  D(
    'mixolydian-b6',
    'Mixolydian b6',
    'jazz',
    'P1 M2 M3 P4 P5 m6 m7',
    '1 2 3 4 5 b6 b7',
    'Dominant with a heavy heart. Bittersweet resolution.',
    'Fifth mode of melodic minor; used over V chords going to minor.',
    { aliases: ['Hindu scale'] },
  ),
  D(
    'locrian-natural-2',
    'Locrian ♮2',
    'jazz',
    'P1 M2 m3 P4 d5 m6 m7',
    '1 2 b3 4 b5 b6 b7',
    'Locrian made playable. The natural second softens the collapse.',
    'The standard choice over half-diminished chords in jazz.',
    { aliases: ['Half-diminished scale'] },
  ),
  D(
    'altered',
    'Altered Scale',
    'jazz',
    'P1 m2 m3 d4 d5 m6 m7',
    '1 b9 #9 3 b5 #5 b7',
    'Every possible tension stacked at once. Maximum instability, maximum pull.',
    'The sound of a jazz V chord about to resolve. Bebop and beyond.',
    { aliases: ['Super Locrian', 'Diminished whole tone'] },
  ),

  // ── Pentatonics and blues ───────────────────────────────────────────────
  D(
    'major-pentatonic',
    'Major Pentatonic',
    'pentatonic',
    'P1 M2 M3 P5 M6',
    '1 2 3 5 6',
    'Five notes that never clash. Open, folk-bright, impossible to play wrong.',
    'Country, folk, gospel, pop hooks, the black keys of a piano.',
  ),
  D(
    'minor-pentatonic',
    'Minor Pentatonic',
    'pentatonic',
    'P1 m3 P4 P5 m7',
    '1 b3 4 5 b7',
    'The first scale most guitarists learn and the last one they stop using.',
    'Blues, rock and metal solos, hip-hop melodies.',
  ),
  D(
    'blues',
    'Blues Scale',
    'blues',
    'P1 m3 P4 d5 P5 m7',
    '1 b3 4 b5 5 b7',
    'Minor pentatonic with a cracked note wedged in. Grit and slide.',
    'Blues, rock, funk, soul — the b5 is the "blue note".',
    { characteristic: 'b5' },
  ),
  D(
    'major-blues',
    'Major Blues Scale',
    'blues',
    'P1 M2 m3 M3 P5 M6',
    '1 2 b3 3 5 6',
    'Sunny blues. The rub between b3 and 3 is the whole point.',
    'Country lead playing, gospel piano, early rock and roll.',
  ),

  // ── Symmetric ───────────────────────────────────────────────────────────
  D(
    'whole-tone',
    'Whole Tone',
    'symmetric',
    'P1 M2 M3 A4 A5 m7',
    '1 2 3 #4 #5 b7',
    'No semitones, no gravity. Everything is equally weighted, so nothing resolves.',
    'Debussy, dream sequences, cartoon transitions, Stevie Wonder.',
  ),
  D(
    'diminished-wh',
    'Diminished (Whole–Half)',
    'symmetric',
    'P1 M2 m3 P4 d5 m6 M6 M7',
    '1 2 b3 4 b5 b6 6 7',
    'Eight notes that repeat every minor third. Slippery and mechanical.',
    'Jazz over diminished chords, horror scoring, Coltrane lines.',
    { aliases: ['Octatonic'] },
  ),
  D(
    'diminished-hw',
    'Diminished (Half–Whole)',
    'symmetric',
    'P1 m2 m3 M3 A4 P5 M6 m7',
    '1 b9 #9 3 #11 5 13 b7',
    'The dominant diminished sound — a 7th chord with every colourful tension.',
    'Jazz and fusion over dominant 7th chords.',
  ),
  D(
    'chromatic',
    'Chromatic',
    'symmetric',
    'P1 m2 M2 m3 M3 P4 d5 P5 m6 M6 m7 M7',
    '1 b2 2 b3 3 4 b5 5 b6 6 b7 7',
    'Every note there is. Not a key so much as raw material for motion.',
    'Passing tones, bebop lines, tension build-ups, riser design.',
  ),

  // ── World and exotic ────────────────────────────────────────────────────
  D(
    'phrygian-dominant',
    'Phrygian Dominant',
    'exotic',
    'P1 m2 M3 P4 P5 m6 m7',
    '1 b2 3 4 5 b6 b7',
    'The unmistakable "Spanish" sound. Major third over a flat second.',
    'Flamenco, Middle Eastern music, metal, Dick Dale surf guitar.',
    { aliases: ['Spanish Gypsy', 'Freygish', 'Hijaz'] },
  ),
  D(
    'hungarian-minor',
    'Hungarian Minor',
    'exotic',
    'P1 M2 m3 A4 P5 m6 M7',
    '1 2 b3 #4 5 b6 7',
    'Two augmented seconds. Dramatic to the point of theatrical.',
    'Eastern European folk, symphonic metal, video game villains.',
    { aliases: ['Gypsy minor', 'Double harmonic minor'] },
  ),
  D(
    'double-harmonic',
    'Double Harmonic Major',
    'exotic',
    'P1 m2 M3 P4 P5 m6 M7',
    '1 b2 3 4 5 b6 7',
    'Ancient and ornate. Sounds like a doorway to somewhere much older.',
    'Arabic and Indian classical traditions, Misirlou, exotica.',
    { aliases: ['Byzantine', 'Arabic scale'] },
  ),
  D(
    'hirajoshi',
    'Hirajoshi',
    'exotic',
    'P1 M2 m3 P5 m6',
    '1 2 b3 5 b6',
    'Sparse and contemplative. Five notes with a lot of air between them.',
    'Japanese koto and shakuhachi music, ambient and game scores.',
  ),
  D(
    'in-sen',
    'In Sen',
    'exotic',
    'P1 m2 P4 P5 m7',
    '1 b2 4 5 b7',
    'Stark and floating, with a bite at the second degree.',
    'Japanese traditional music, minimalism, lo-fi beats.',
  ),
  D(
    'egyptian',
    'Egyptian (Suspended Pentatonic)',
    'pentatonic',
    'P1 M2 P4 P5 m7',
    '1 2 4 5 b7',
    'All suspensions, no thirds. Ambiguous between major and minor.',
    'Ambient, world fusion, modal jazz vamps.',
  ),
  D(
    'prometheus',
    'Prometheus',
    'exotic',
    'P1 M2 M3 A4 M6 m7',
    '1 2 3 #4 6 b7',
    'Scriabin’s "mystic" colour. Hovering, unresolved, synthetic.',
    'Impressionist and 20th-century classical, sound design.',
  ),
  D(
    'bebop-dominant',
    'Bebop Dominant',
    'jazz',
    'P1 M2 M3 P4 P5 M6 m7 M7',
    '1 2 3 4 5 6 b7 7',
    'Mixolydian plus a passing note so that chord tones land on the beat.',
    'Bebop lines over dominant chords — Parker, Gillespie.',
  ),
  D(
    'bebop-major',
    'Bebop Major',
    'jazz',
    'P1 M2 M3 P4 P5 m6 M6 M7',
    '1 2 3 4 5 b6 6 7',
    'Major with a chromatic filler between 5 and 6. Built for eighth-note runs.',
    'Swing and bebop improvisation over major chords.',
  ),
  D(
    'neapolitan-minor',
    'Neapolitan Minor',
    'exotic',
    'P1 m2 m3 P4 P5 m6 M7',
    '1 b2 b3 4 5 b6 7',
    'Sombre and formal, with a leading tone that cuts through the darkness.',
    'Late Romantic classical, dramatic underscore.',
  ),
  D(
    'ukrainian-dorian',
    'Ukrainian Dorian',
    'exotic',
    'P1 M2 m3 A4 P5 M6 m7',
    '1 2 b3 #4 5 6 b7',
    'Dorian with a raised fourth. Restless and folk-modal at once.',
    'Eastern European folk, klezmer, film scoring.',
    { aliases: ['Romanian minor'] },
  ),
];

export const SCALES_BY_ID: Record<string, ScaleDefinition> = Object.fromEntries(
  SCALES.map((s) => [s.id, s]),
);

export function getScale(id: string): ScaleDefinition {
  const found = SCALES_BY_ID[id];
  if (!found) throw new Error(`Unknown scale: ${id}`);
  return found;
}

/** The parsed interval objects for a scale, cached on first use. */
const intervalCache = new Map<string, Interval[]>();

export function scaleIntervals(def: ScaleDefinition): Interval[] {
  const cached = intervalCache.get(def.id);
  if (cached) return cached;
  const parsed = def.intervals.map((abbr) => {
    const iv = parseInterval(abbr);
    if (!iv) throw new Error(`Bad interval "${abbr}" in scale ${def.id}`);
    return iv;
  });
  intervalCache.set(def.id, parsed);
  return parsed;
}

/** Build the notes of a scale from a tonic, correctly spelled. */
export function buildScale(tonic: Note, def: ScaleDefinition): Note[] {
  return scaleIntervals(def).map((iv) => transpose(tonic, iv));
}

/** Scale notes plus the octave repetition of the tonic — for playback. */
export function buildScaleWithOctave(tonic: Note, def: ScaleDefinition): Note[] {
  const notes = buildScale(tonic, def);
  return [...notes, { ...tonic, octave: tonic.octave + 1 }];
}

/** Pitch classes (0–11) covered by a scale rooted on a tonic. */
export function scalePitchClasses(tonic: PitchClassNote, def: ScaleDefinition): number[] {
  return scaleIntervals(def).map((iv) => mod(pitchClass(tonic) + iv.semitones, 12));
}

/** Does a pitch class belong to the scale? Powers keyboard highlighting. */
export function inScale(pc: number, tonic: PitchClassNote, def: ScaleDefinition): boolean {
  return scalePitchClasses(tonic, def).includes(mod(pc, 12));
}

/** Scale degree (1-based) of a pitch class, or null if it is outside the scale. */
export function degreeOf(pc: number, tonic: PitchClassNote, def: ScaleDefinition): number | null {
  const index = scalePitchClasses(tonic, def).indexOf(mod(pc, 12));
  return index === -1 ? null : index + 1;
}

/** Rotate a scale to start on a different degree — how modes are derived. */
export function modeOf(def: ScaleDefinition, degree: number): Interval[] {
  const ivs = scaleIntervals(def);
  const n = ivs.length;
  const start = ivs[mod(degree - 1, n)].semitones;
  return Array.from({ length: n }, (_, i) => {
    const iv = ivs[mod(degree - 1 + i, n)];
    const semitones = mod(iv.semitones - start, 12);
    return { ...iv, semitones };
  });
}

/** The seven modes of the major scale in brightness order, bright → dark. */
export const MODE_BRIGHTNESS_ORDER = [
  'lydian',
  'ionian',
  'mixolydian',
  'dorian',
  'aeolian',
  'phrygian',
  'locrian',
];

export const SCALE_FAMILY_LABELS: Record<ScaleFamily, string> = {
  major: 'Major',
  minor: 'Minor',
  modal: 'Modes',
  pentatonic: 'Pentatonic',
  blues: 'Blues',
  jazz: 'Jazz',
  symmetric: 'Symmetric',
  exotic: 'World & Exotic',
};

/** Compact display, e.g. "D E F G A B C". */
export function scaleNoteNames(tonic: Note, def: ScaleDefinition): string {
  return buildScale(tonic, def)
    .map((n) => noteName(n))
    .join(' ');
}
