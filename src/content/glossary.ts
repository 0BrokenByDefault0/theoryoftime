import { GlossaryEntry } from './types';

/**
 * The glossary.
 *
 * Written to be read cold — every entry stands alone, and each one says what
 * the term means *and* where you would actually meet it, because a definition
 * without a context is very hard to remember.
 */

export const GLOSSARY: GlossaryEntry[] = [
  // ── Fundamentals ────────────────────────────────────────────────────────
  {
    term: 'Pitch',
    category: 'Fundamentals',
    definition: 'How high or low a note sounds, determined by the frequency of its vibration in hertz.',
    inPractice: 'A4 = 440 Hz is the standard tuning reference across most of the world.',
  },
  {
    term: 'Octave',
    category: 'Fundamentals',
    definition: 'The interval between one pitch and another at double or half its frequency. The two sound like the same note at different heights.',
    inPractice: 'Twelve semitones. Note names repeat every octave, which is why there are only seven letters.',
    seeAlso: ['Semitone', 'Interval'],
  },
  {
    term: 'Semitone',
    category: 'Fundamentals',
    definition: 'The smallest interval in standard Western music — one key to the next on a piano, black or white.',
    inPractice: 'Also called a half step. Twelve of them make an octave.',
  },
  {
    term: 'Enharmonic',
    category: 'Fundamentals',
    definition: 'Two different note names that sound the same pitch, such as F♯ and G♭.',
    inPractice: 'Which spelling you use depends on the key and on where the music is going, never on the sound.',
  },
  {
    term: 'Timbre',
    category: 'Fundamentals',
    definition: 'The tonal character of a sound — what makes a trumpet and a violin playing the same note sound different.',
    inPractice: 'Determined mostly by harmonic content and by the attack transient.',
    seeAlso: ['Harmonic series', 'Transient'],
  },
  {
    term: 'Harmonic series',
    category: 'Fundamentals',
    definition: 'The set of frequencies at whole-number multiples of a fundamental, present in almost every real sound.',
    inPractice: 'The reason octaves and fifths sound consonant: their harmonics overlap heavily.',
  },

  // ── Intervals ───────────────────────────────────────────────────────────
  {
    term: 'Interval',
    category: 'Intervals',
    definition: 'The distance between two pitches, named by a number (how many letters it spans) and a quality (its exact size).',
    inPractice: 'C to E spans three letters and four semitones: a major third.',
  },
  {
    term: 'Tritone',
    category: 'Intervals',
    definition: 'An interval of six semitones — exactly half an octave. Spelled as an augmented fourth or diminished fifth.',
    inPractice: 'The unstable core of every dominant 7th chord, and the reason V→I resolves so strongly.',
    seeAlso: ['Dominant', 'Tritone substitution'],
  },
  {
    term: 'Inversion (interval)',
    category: 'Intervals',
    definition: 'Moving the lower note of an interval up an octave. The two interval numbers always add to nine and the quality flips.',
    inPractice: 'A major third inverts to a minor sixth. The tritone inverts to itself.',
  },
  {
    term: 'Consonance',
    category: 'Intervals',
    definition: 'Intervals that sound stable and settled — octaves, fifths, thirds and sixths.',
    inPractice: 'Partly acoustic, partly cultural. The perfect fourth has been classified both ways at different times.',
  },

  // ── Scales ──────────────────────────────────────────────────────────────
  {
    term: 'Scale',
    category: 'Scales',
    definition: 'An ordered set of pitches spanning an octave, defined by its pattern of steps from a tonic.',
  },
  {
    term: 'Tonic',
    category: 'Scales',
    definition: 'The note that functions as home — the point of maximum stability that a piece resolves to.',
    inPractice: 'Established by repetition, by the bass, and by cadences. It is a role, not a property of the note.',
  },
  {
    term: 'Leading tone',
    category: 'Scales',
    definition: 'The seventh degree of a major scale, one semitone below the tonic, which pulls strongly upward into it.',
    inPractice: 'Natural minor has no leading tone, which is why harmonic minor exists.',
  },
  {
    term: 'Mode',
    category: 'Scales',
    definition: 'A scale derived by treating a different degree of a parent scale as the tonic.',
    inPractice: 'D Dorian uses the notes of C major, but D is home. The harmony has to support that or it is just C major.',
  },
  {
    term: 'Pentatonic',
    category: 'Scales',
    definition: 'A five-note scale. The major pentatonic removes degrees 4 and 7 from the major scale, eliminating all semitones.',
    inPractice: 'The black keys of a piano form a G♭ major pentatonic scale.',
  },
  {
    term: 'Blue note',
    category: 'Scales',
    definition: 'A pitch sung or bent between the standard scale degrees, most often around the flattened third, fifth or seventh.',
    inPractice: 'Approximated on fixed-pitch instruments by the ♭5 of the blues scale. Pass through it, do not land on it.',
  },

  // ── Chords ──────────────────────────────────────────────────────────────
  {
    term: 'Triad',
    category: 'Chords',
    definition: 'A three-note chord built from stacked thirds: root, third and fifth.',
    inPractice: 'Four possible qualities — major, minor, diminished, augmented.',
  },
  {
    term: 'Inversion (chord)',
    category: 'Chords',
    definition: 'A chord voiced with something other than the root as its lowest note.',
    inPractice: 'Written as a slash chord: C/E is a C major triad with E in the bass.',
  },
  {
    term: 'Voicing',
    category: 'Chords',
    definition: 'The specific arrangement of a chord — which notes, in which octaves, and which are omitted or doubled.',
    inPractice: 'Drop 2 is the default guitar and big-band voicing. Shell voicings keep only root, third and seventh.',
  },
  {
    term: 'Guide tones',
    category: 'Chords',
    definition: 'The third and seventh of a chord — the notes that carry its harmonic identity.',
    inPractice: 'Jazz players voice-lead guide tones and let the bass handle roots.',
  },
  {
    term: 'Extension',
    category: 'Chords',
    definition: 'A chord tone beyond the seventh — the ninth, eleventh or thirteenth.',
    inPractice: 'Rarely all played at once. Pick the colour you want and drop the rest.',
  },
  {
    term: 'Suspension',
    category: 'Chords',
    definition: 'A chord in which the third is replaced by the second or the fourth, leaving it neither major nor minor.',
  },
  {
    term: 'Avoid note',
    category: 'Chords',
    definition: 'A scale note that clashes badly with a chord tone, usually a semitone above a defining note.',
    inPractice: 'The natural 11 over a major chord. It is not forbidden — just do not sustain it.',
  },

  // ── Harmony ─────────────────────────────────────────────────────────────
  {
    term: 'Diatonic',
    category: 'Harmony',
    definition: 'Belonging to the seven notes of the current key, without chromatic alteration.',
  },
  {
    term: 'Roman numeral analysis',
    category: 'Harmony',
    definition: 'Labelling chords by their scale degree rather than their letter name, so progressions can be discussed independently of key.',
    inPractice: 'I–V–vi–IV describes a shape. C–G–Am–F describes one instance of it.',
  },
  {
    term: 'Cadence',
    category: 'Harmony',
    definition: 'A chord progression that ends a musical phrase.',
    inPractice: 'Authentic (V–I) is a full stop, plagal (IV–I) a gentle settling, half (ending on V) a comma, deceptive (V–vi) a swerve.',
  },
  {
    term: 'Dominant',
    category: 'Harmony',
    definition: 'The fifth degree of a scale, and the chord built on it — the strongest source of tension pulling back to the tonic.',
  },
  {
    term: 'Secondary dominant',
    category: 'Harmony',
    definition: 'A dominant chord borrowed from another key in order to strengthen the arrival of a non-tonic chord.',
    inPractice: 'In C major, A7 is V/ii — it makes the following Dm land much harder.',
  },
  {
    term: 'Modal interchange',
    category: 'Harmony',
    definition: 'Borrowing chords from the parallel major or minor while keeping the same tonic.',
    inPractice: 'The minor iv in a major key is the most emotionally reliable borrowing there is.',
  },
  {
    term: 'Tritone substitution',
    category: 'Harmony',
    definition: 'Replacing a dominant 7th with the dominant 7th a tritone away, since both share the same tritone.',
    inPractice: 'D♭7 substitutes for G7 resolving to C, producing a chromatically descending bass.',
  },
  {
    term: 'Voice leading',
    category: 'Harmony',
    definition: 'How individual lines move from one chord to the next. Good voice leading favours common tones and small steps.',
  },
  {
    term: 'Pedal point',
    category: 'Harmony',
    definition: 'A sustained note, usually in the bass, held while the harmony changes above it.',
    inPractice: 'Generates tension automatically and makes static harmony feel directional.',
  },
  {
    term: 'Modulation',
    category: 'Harmony',
    definition: 'Changing the tonal centre of a piece — genuinely moving home, rather than borrowing a chord.',
  },

  // ── Rhythm ──────────────────────────────────────────────────────────────
  {
    term: 'Meter',
    category: 'Rhythm',
    definition: 'The pattern of strong and weak beats that organises a pulse into bars.',
  },
  {
    term: 'Syncopation',
    category: 'Rhythm',
    definition: 'Accenting a beat or subdivision that the meter treats as weak.',
    inPractice: 'Removing an expected hit is as syncopating as adding an unexpected one.',
  },
  {
    term: 'Swing',
    category: 'Rhythm',
    definition: 'Delaying every second subdivision so that pairs of notes become long–short.',
    inPractice: 'A continuous parameter, not a switch. Boom bap lives around 54–58%.',
  },
  {
    term: 'Polyrhythm',
    category: 'Rhythm',
    definition: 'Two conflicting subdivisions running at once, such as three against two.',
  },
  {
    term: 'Clave',
    category: 'Rhythm',
    definition: 'A five-stroke two-bar pattern that organises everything else in Afro-Cuban music.',
    inPractice: 'A band is either in clave or out of it. Reversing 3-2 to 2-3 changes the whole feel.',
  },
  {
    term: 'Half-time',
    category: 'Rhythm',
    definition: 'Placing the backbeat every other bar so the music feels half as fast without changing tempo.',
    inPractice: 'Trap at 140 BPM feels like 70 because the snare only lands on beat 3.',
  },
  {
    term: 'Harmonic rhythm',
    category: 'Rhythm',
    definition: 'How frequently the chords change.',
    inPractice: 'Accelerating it into a chorus builds energy without adding a single instrument.',
  },

  // ── Production ──────────────────────────────────────────────────────────
  {
    term: 'ADSR',
    category: 'Production',
    definition: 'Attack, Decay, Sustain, Release — the four-stage envelope that shapes how a sound evolves over time.',
    inPractice: 'Sustain is a level, not a duration. The other three are times.',
  },
  {
    term: 'Transient',
    category: 'Production',
    definition: 'The brief, loud, noisy onset of a sound.',
    inPractice: 'Carries most of the information the ear uses to identify an instrument. Compress it away and a sound loses its identity.',
  },
  {
    term: 'Cutoff',
    category: 'Production',
    definition: 'The frequency at which a filter begins to attenuate.',
  },
  {
    term: 'Resonance (Q)',
    category: 'Production',
    definition: 'A boost applied at a filter\'s cutoff frequency, creating a peak that whistles and can self-oscillate.',
  },
  {
    term: 'LFO',
    category: 'Production',
    definition: 'A low-frequency oscillator used to modulate another parameter rather than to be heard directly.',
    inPractice: 'To pitch it is vibrato, to amplitude it is tremolo, to filter cutoff it is a wobble.',
  },
  {
    term: 'Masking',
    category: 'Production',
    definition: 'One sound obscuring another because they occupy the same frequency range at the same time.',
    inPractice: 'The fundamental problem mixing exists to solve. Usually fixed by arrangement, not EQ.',
  },
  {
    term: 'Sidechain compression',
    category: 'Production',
    definition: 'Using one signal to trigger compression on another.',
    inPractice: 'Ducking the bass with the kick lets both share the low end. Pushed further it becomes the pumping effect of dance music.',
  },
  {
    term: 'Parallel compression',
    category: 'Production',
    definition: 'Blending a heavily compressed copy of a signal underneath the uncompressed original.',
    inPractice: 'Gives density and sustain while keeping the original transients intact.',
  },
  {
    term: 'Pre-delay',
    category: 'Production',
    definition: 'The gap between a dry sound and the first reflections of its reverb.',
    inPractice: 'Longer pre-delay keeps a vocal clear and forward while still placing it in a large space.',
  },
  {
    term: 'LUFS',
    category: 'Production',
    definition: 'Loudness Units relative to Full Scale — a measure of perceived loudness rather than peak level.',
    inPractice: 'Streaming services normalise to roughly −14 LUFS, which is why over-limiting no longer buys you loudness.',
  },
  {
    term: 'Headroom',
    category: 'Production',
    definition: 'The gap between the loudest part of a signal and the maximum level the system can handle.',
    inPractice: 'Leave around −6 dBFS on a mix before mastering. A squashed mix cannot be un-squashed.',
  },
  {
    term: 'Dotted eighth delay',
    category: 'Production',
    definition: 'A delay set to three sixteenth notes, producing a syncopated pattern against the beat.',
    inPractice: '375 ms at 120 BPM. The classic guitar and synth delay.',
  },
];

export const GLOSSARY_CATEGORIES = [...new Set(GLOSSARY.map((g) => g.category))];

export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY;
  return GLOSSARY.filter(
    (entry) =>
      entry.term.toLowerCase().includes(q) ||
      entry.definition.toLowerCase().includes(q) ||
      (entry.inPractice ?? '').toLowerCase().includes(q),
  );
}
