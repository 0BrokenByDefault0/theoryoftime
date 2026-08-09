import { palette, gradients } from '../../theme';
import { Stage } from '../types';

/**
 * Stage 1–2: the absolute foundations.
 *
 * The goal of this tier is not to teach notation. It is to make the learner
 * hear that music is made of *distances*, and to give them a physical map (the
 * keyboard) that those distances live on.
 */

export const firstSoundsStage: Stage = {
  id: 'first-sounds',
  title: 'First Sounds',
  tagline: 'Pitch, keys, and steps',
  description:
    'Where notes come from, why the keyboard looks the way it does, and the single measurement that everything else in music is built from.',
  tier: 'foundation',
  glyph: '🌱',
  color: palette.emerald,
  gradient: gradients.mint,
  lessons: [
    {
      id: 'what-is-pitch',
      title: 'What a Note Actually Is',
      summary: 'Frequency, octaves, and why twelve notes repeat forever.',
      minutes: 6,
      xp: 30,
      cards: [
        {
          kind: 'concept',
          title: 'Sound is vibration you can count',
          lede: 'A note is a number of vibrations per second. That is the whole trick.',
          body: [
            'When something vibrates in air — a string, a speaker cone, your vocal folds — it pushes waves of pressure at your eardrum. If those pushes arrive at a steady rate, your brain stops hearing "noise" and starts hearing "a note".',
            'The rate is called frequency, measured in hertz (Hz). The note musicians call A above middle C vibrates 440 times per second. Faster vibration sounds higher; slower sounds lower. That is genuinely all pitch is.',
            'Everything else in this app is about the relationships between those numbers — and it turns out that only a handful of relationships matter.',
          ],
          callouts: [
            {
              variant: 'insight',
              text: 'Human hearing runs from roughly 20 Hz to 20,000 Hz. A piano only covers 27 Hz to 4,186 Hz — the rest of what you hear is harmonics and noise, not fundamental pitch.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'The octave: the one interval everyone hears',
          body: [
            'Double a frequency and something remarkable happens: the new note sounds like *the same note*, just higher. 220 Hz and 440 Hz are both "A". So are 110, 880, and 1760.',
            'This is not a cultural convention. It shows up in every musical tradition on Earth, because doubling the frequency means every single vibration of the low note lines up with every second vibration of the high one. Your ear reads that perfect alignment as sameness.',
            'That is why note names repeat. There are only ever seven letters — A through G — and then you start again.',
          ],
          widget: {
            type: 'piano',
            startMidi: 48,
            octaves: 3,
            labelMode: 'c-only',
            caption: 'Every C is a doubling of the one below it. Play a few and listen for the sameness.',
          },
          callouts: [
            {
              variant: 'listen',
              text: 'Play any note, then the note twelve keys to its right. The two sound like one idea at two heights — that is an octave.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Twelve steps, and why the keyboard is lopsided',
          body: [
            'Western music divides each octave into twelve equal steps. One step is called a semitone or half step — it is the distance between any two adjacent keys on a piano, black or white.',
            'So why are there only seven white keys? Because the seven-note major scale came first, and the keyboard was built to make it easy to play. The black keys were added later, wedged into the gaps.',
            'Look at the black key pattern: two, then three, then two, then three. That grouping is not decoration. It is a navigation system — it is how a pianist knows where they are without looking.',
          ],
          widget: {
            type: 'piano',
            startMidi: 60,
            octaves: 1,
            labelMode: 'all',
            caption: 'C sits immediately left of the group of two black keys. Find it once and you can find it anywhere.',
          },
          callouts: [
            {
              variant: 'pro',
              title: 'Orientation trick',
              text: 'C is always just left of the two-black-key group. F is always just left of the three-black-key group. Learn those two anchors and you never have to count again.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Half steps and whole steps',
          body: [
            'A half step is one key to the next, with nothing in between. E to F is a half step. B to C is a half step. Those two are the ones people miss, because there is no black key between them.',
            'A whole step is two half steps — one key skipped in between. C to D is a whole step, because C♯ sits between them.',
            'That is the entire vocabulary of distance you need for the next several lessons. Every scale in existence is just a specific pattern of half steps and whole steps.',
          ],
          callouts: [
            {
              variant: 'warning',
              title: 'The two exceptions',
              text: 'E→F and B→C are half steps with no black key between them. Nearly every beginner mistake in spelling scales traces back to forgetting this.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'How many semitones are in an octave?',
          options: ['7', '8', '12', '13'],
          answer: 2,
          explain:
            'Twelve. The seven white keys plus the five black keys make twelve distinct notes before the pattern repeats. The number 8 in "octave" counts letter names (C D E F G A B C), not semitones — which is exactly why interval names and semitone counts never quite line up.',
          reviewId: 'fact-octave-semitones',
          reviewCategory: 'fundamentals',
        },
        {
          kind: 'quiz',
          question: 'Which of these pairs is a half step?',
          options: ['C to D', 'F to G', 'E to F', 'G to A'],
          answer: 2,
          explain:
            'E to F. There is no black key between them, so they are adjacent — a half step. The others all have a black key in between, making them whole steps.',
          reviewId: 'fact-e-f-halfstep',
          reviewCategory: 'fundamentals',
        },
        {
          kind: 'build',
          title: 'Find it yourself',
          instruction: 'Play any C on the keyboard.',
          targetPitchClasses: [0],
          expectedCount: 1,
          hint: 'Look for the group of two black keys. C is the white key immediately to its left.',
          explain:
            'That is C. Every C on the instrument is the white key just left of a two-black-key group — the anchor you will use for everything that follows.',
          startMidi: 48,
          octaves: 2,
        },
      ],
    },
    {
      id: 'note-names',
      title: 'Naming Every Note',
      summary: 'Letters, sharps, flats, and why two names can mean one key.',
      minutes: 7,
      xp: 30,
      requires: ['what-is-pitch'],
      cards: [
        {
          kind: 'concept',
          title: 'Seven letters, then repeat',
          body: [
            'The white keys are named A B C D E F G, and then it starts over. That is it — seven names for the whole instrument.',
            'To say *which* A you mean, musicians add an octave number. Middle C is C4. The A above it is A4, the famous 440 Hz one. This is called scientific pitch notation, and it is what the app uses everywhere.',
          ],
          widget: {
            type: 'piano',
            startMidi: 60,
            octaves: 2,
            labelMode: 'letters',
            caption: 'The white keys, labelled. Notice the pattern restarts at every C.',
          },
        },
        {
          kind: 'concept',
          title: 'Sharps raise, flats lower',
          body: [
            'A sharp (♯) means "one half step higher". A flat (♭) means "one half step lower". So C♯ is the black key just right of C, and D♭ is the black key just left of D.',
            'Those are the same key. One physical black key, two names. Which name you use depends entirely on context — on where the music is going, not on what it sounds like.',
            'Two names for one pitch are called enharmonic equivalents. It feels like a design flaw at first. It is actually the feature that makes written music readable, and you will see why once you meet key signatures.',
          ],
          widget: {
            type: 'piano',
            startMidi: 60,
            octaves: 1,
            labelMode: 'all',
            caption: 'Each black key has two valid names. The keyboard does not care; the notation does.',
          },
          callouts: [
            {
              variant: 'insight',
              title: 'Why bother with two names?',
              text: 'A scale should use each letter exactly once. The F♯ major scale is F♯ G♯ A♯ B C♯ D♯ E♯ — that last note is really an F, but calling it E♯ keeps one letter per line and space on the staff. Spelling is about readability.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Naturals, double sharps, and double flats',
          body: [
            'A natural (♮) cancels a previous sharp or flat, returning a note to its plain white-key version.',
            'Occasionally you will meet a double sharp (𝄪, raise two half steps) or a double flat (𝄫). They look absurd — F𝄪 is just G — but they appear when the surrounding harmony demands a particular letter. They are rare, and you never need to write one to make good music.',
          ],
        },
        {
          kind: 'quiz',
          question: 'Which note is the same key as G♯?',
          options: ['G♭', 'A♭', 'A♯', 'F♯'],
          answer: 1,
          explain:
            'A♭. G♯ is one half step above G; A♭ is one half step below A. Same black key, two spellings. You will see G♯ in sharp keys like E major and A♭ in flat keys like E♭ major.',
          reviewId: 'fact-gsharp-aflat',
          reviewCategory: 'fundamentals',
        },
        {
          kind: 'quiz',
          question: 'Why does the F♯ major scale spell its seventh note as E♯ rather than F?',
          options: [
            'Because E♯ sounds slightly different from F',
            'So that each of the seven letters is used exactly once',
            'Because F is already taken by the tonic',
            'It is an arbitrary historical convention with no reason',
          ],
          answer: 1,
          explain:
            'A scale uses each letter name once, in order. F♯ major runs F♯ G♯ A♯ B C♯ D♯ E♯ — one of each letter. Writing it as F would give two Fs and no E, which on the staff would put two notes on the same line and leave a line empty. E♯ and F sound identical.',
          reviewId: 'fact-enharmonic-spelling',
          reviewCategory: 'fundamentals',
        },
        {
          kind: 'build',
          title: 'Spell it on the keys',
          instruction: 'Play E♭ — anywhere on the keyboard.',
          targetPitchClasses: [3],
          expectedCount: 1,
          hint: 'Find E, then move one key to the left. It is the black key in the middle of the group of two.',
          explain:
            'That black key is E♭ — and also D♯. Same sound, two names, chosen by context.',
          startMidi: 60,
          octaves: 2,
        },
      ],
    },
    {
      id: 'keyboard-map',
      title: 'Reading the Keyboard',
      summary: 'Registers, middle C, and how pitch maps to feel.',
      minutes: 5,
      xp: 25,
      requires: ['note-names'],
      cards: [
        {
          kind: 'concept',
          title: 'The keyboard is a map of frequency',
          body: [
            'Left is low, right is high, and the distance is even — every key is exactly one semitone from its neighbour. No other common instrument lays out pitch this plainly, which is why theory is almost always taught at a keyboard even to people who play guitar or sing.',
            'Middle C (C4) sits near the centre of an 88-key piano. It is the reference point everything else is described from.',
          ],
          widget: {
            type: 'piano',
            startMidi: 36,
            octaves: 4,
            labelMode: 'c-only',
            caption: 'Four octaves. Slide across and listen to how the character changes, not just the height.',
          },
        },
        {
          kind: 'concept',
          title: 'Registers have personalities',
          body: [
            'Producers rarely talk about "C2" — they talk about the sub, the low end, the mids, the air. Each region of the keyboard behaves differently in a mix and carries a different emotional weight.',
            'Below about C2 you feel notes more than you hear them, and chords turn to mud. Around middle C the ear is most sensitive to detail — this is where melodies and vocals live. Above C6 notes lose weight and become texture.',
            'This is why a chord voicing that sounds gorgeous in the middle of the keyboard sounds like a mess two octaves down. The notes are identical. The register is not.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'The mud rule',
              text: 'Below roughly E2, play intervals wider than a third — root and fifth, or just the root. Stacked thirds down there smear into noise because the harmonics overlap too closely.',
            },
          ],
        },
        {
          kind: 'interactive',
          title: 'Hear the registers',
          instruction:
            'Play the same three-note shape low, in the middle, and high. Same notes, completely different instrument.',
          widget: {
            type: 'piano',
            startMidi: 36,
            octaves: 4,
            labelMode: 'c-only',
          },
          body: [
            'Try a C major triad (C, E, G) starting at the lowest C, then at middle C, then two octaves up. Notice how the low version blurs while the high version thins out.',
          ],
        },
        {
          kind: 'quiz',
          question: 'A chord that sounds clear at middle C turns muddy two octaves lower. Why?',
          options: [
            'The notes are out of tune down there',
            'The intervals get physically closer together at low frequencies, so harmonics overlap and clash',
            'Low notes are quieter, so the chord is harder to hear',
            'The chord is no longer in the same key',
          ],
          answer: 1,
          explain:
            'Frequency is exponential, not linear. The octave from C1 to C2 spans about 33 Hz; the octave from C5 to C6 spans about 523 Hz. Down low, the notes of a chord are crammed into a tiny frequency range and their harmonics collide — which the ear reads as mud.',
          reviewId: 'fact-low-register-mud',
          reviewCategory: 'production',
        },
      ],
    },
  ],
};

export const intervalsStage: Stage = {
  id: 'intervals',
  title: 'Intervals',
  tagline: 'The distance between two notes',
  description:
    'Intervals are the atoms of music. Every chord, scale, melody and bass line is built out of them — and once you can hear them, you can hear everything else.',
  tier: 'foundation',
  glyph: '📏',
  color: palette.teal,
  gradient: ['#14B8A6', '#22D3EE'],
  lessons: [
    {
      id: 'interval-basics',
      title: 'Measuring Distance',
      summary: 'Number and quality — the two halves of every interval name.',
      minutes: 8,
      xp: 35,
      cards: [
        {
          kind: 'concept',
          title: 'Every interval has two measurements',
          lede: 'Count the letters. Then count the semitones. You need both.',
          body: [
            'An interval name like "major third" has two parts. The **number** (third) says how many letter names you travel through, counting both ends. C to E passes C, D, E — three letters, so it is some kind of third.',
            'The **quality** (major) says the exact size in semitones. C to E is four semitones, which makes it a major third. C to E♭ is also a third by letter count, but only three semitones — a minor third.',
            'Two notes on the same piano key can therefore be different intervals. C to D♯ is an augmented second; C to E♭ is a minor third. Identical sound, different meaning, because the letters differ.',
          ],
          callouts: [
            {
              variant: 'insight',
              text: 'Count the number by letters, inclusively. C to G is C-D-E-F-G = five letters = a fifth. Beginners almost always count the gaps instead of the letters and land one short.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Perfect, major, minor',
          body: [
            'Unisons, fourths, fifths and octaves are called **perfect**. They have one plain version each. Their frequency ratios are the simplest in music (2:1, 3:2, 4:3), which is why they sound stable and hollow rather than coloured.',
            'Seconds, thirds, sixths and sevenths come in **major** and **minor** flavours. Minor is always one semitone smaller than major.',
            'Shrink a perfect or minor interval by a semitone and it becomes **diminished**. Stretch a perfect or major interval by a semitone and it becomes **augmented**.',
          ],
          widget: {
            type: 'intervalLab',
            caption: 'Build any interval and hear it. Try C→E, then flatten the top note.',
          },
        },
        {
          kind: 'concept',
          title: 'The complete set inside one octave',
          body: [
            'There are twelve intervals from a unison up to an octave. Learn them once and you have the vocabulary for the entire rest of music theory.',
            'The tritone — six semitones, spelled as either an augmented fourth or a diminished fifth — is the odd one out. It sits exactly halfway through the octave, splitting it into two equal halves, and it is the most unstable interval in common use. Medieval theorists called it *diabolus in musica*. Modern producers use it constantly.',
          ],
          widget: {
            type: 'piano',
            startMidi: 60,
            octaves: 1,
            labelMode: 'all',
            caption: 'From C, count up: 1 semitone is a minor 2nd, 4 is a major 3rd, 7 is a perfect 5th.',
          },
        },
        {
          kind: 'quiz',
          question: 'How many semitones are in a perfect fifth?',
          options: ['5', '6', '7', '8'],
          answer: 2,
          explain:
            'Seven. C up to G is seven semitones. The name says "fifth" because it spans five letter names (C D E F G), but the actual distance is seven half steps — a mismatch that trips up everyone at first.',
          reviewId: 'iv-p5-semitones',
          reviewCategory: 'intervals',
        },
        {
          kind: 'quiz',
          question: 'C up to E♭ is which interval?',
          options: ['Major third', 'Minor third', 'Augmented second', 'Perfect fourth'],
          answer: 1,
          explain:
            'A minor third — three semitones, spanning three letter names (C D E). If it were spelled C to D♯ it would be an augmented second, which sounds identical but means something different harmonically.',
          reviewId: 'iv-c-eb',
          reviewCategory: 'intervals',
        },
        {
          kind: 'build',
          title: 'Build a perfect fifth',
          instruction: 'Play C and the note a perfect fifth above it, together.',
          targetPitchClasses: [0, 7],
          expectedCount: 2,
          hint: 'Count up seven semitones from C — that is G. Hold both keys at once.',
          explain:
            'C and G — a perfect fifth. This is the interval in every power chord, the bottom of nearly every chord in Western music, and the second note the overtone series produces after the octave.',
          startMidi: 60,
          octaves: 1,
        },
      ],
    },
    {
      id: 'interval-ear',
      title: 'Hearing Intervals',
      summary: 'Song hooks that lock each interval into your memory permanently.',
      minutes: 10,
      xp: 45,
      requires: ['interval-basics'],
      cards: [
        {
          kind: 'concept',
          title: 'Recognition beats calculation',
          lede: 'You will never count semitones fast enough to play music. You have to hear them.',
          body: [
            'Ear training works by anchoring: you attach each interval to a song whose opening leap you already know cold, then you recognise the interval by recognising the song.',
            'It feels like a crutch. It is not — it is how everyone does it, including professionals. After a few hundred repetitions the song fades and the interval itself becomes the thing you recognise directly.',
            'The single most important habit: always sing the interval back before you answer. Your voice knows things your analytical brain does not.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'Two anchors per interval',
              text: 'Learn one ascending song and one descending song for each interval. Ascending and descending are genuinely different recognition tasks, and most learners are much weaker going down.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'The reference table',
          body: [
            'Minor 2nd — *Jaws*. Major 2nd — *Happy Birthday*. Minor 3rd — *Greensleeves*. Major 3rd — *When the Saints Go Marching In*. Perfect 4th — *Here Comes the Bride*. Tritone — *The Simpsons*. Perfect 5th — *Twinkle Twinkle Little Star*. Minor 6th — *Love Story*. Major 6th — *My Bonnie Lies Over the Ocean*. Minor 7th — *Somewhere* from West Side Story. Major 7th — *Take On Me* chorus. Octave — *Somewhere Over the Rainbow*.',
            'Do not try to learn all twelve today. Take four, drill them until they are automatic, then add four more.',
          ],
        },
        {
          kind: 'ear',
          question: 'Which interval is this?',
          prompt: { type: 'interval', semitones: 7, style: 'melodic' },
          options: ['Perfect fourth', 'Perfect fifth', 'Major sixth', 'Octave'],
          answer: 1,
          explain:
            'A perfect fifth — *Twinkle Twinkle Little Star*. Open and hollow, with no major-or-minor colour to it at all. It is the most stable interval after the octave.',
          reviewId: 'ear-p5',
          reviewCategory: 'ear-intervals',
        },
        {
          kind: 'ear',
          question: 'Which interval is this?',
          prompt: { type: 'interval', semitones: 4, style: 'melodic' },
          options: ['Minor third', 'Major third', 'Perfect fourth', 'Major second'],
          answer: 1,
          explain:
            'A major third — *When the Saints Go Marching In*. Bright and confident. This is the interval that makes a chord major.',
          reviewId: 'ear-M3',
          reviewCategory: 'ear-intervals',
        },
        {
          kind: 'ear',
          question: 'Which interval is this?',
          prompt: { type: 'interval', semitones: 3, style: 'melodic' },
          options: ['Major second', 'Minor third', 'Major third', 'Perfect fourth'],
          answer: 1,
          explain:
            'A minor third — *Greensleeves*, or the "so long, farewell" wave. Softer and sadder than a major third by exactly one semitone.',
          reviewId: 'ear-m3',
          reviewCategory: 'ear-intervals',
        },
        {
          kind: 'ear',
          question: 'Which interval is this?',
          prompt: { type: 'interval', semitones: 6, style: 'harmonic' },
          options: ['Perfect fifth', 'Tritone', 'Major sixth', 'Perfect fourth'],
          answer: 1,
          explain:
            'The tritone. Played together it grinds — six semitones splits the octave exactly in half, and nothing in the harmonic series supports it. That instability is the engine behind every dominant chord.',
          reviewId: 'ear-tritone',
          reviewCategory: 'ear-intervals',
        },
      ],
    },
    {
      id: 'interval-inversion',
      title: 'Inversion & Consonance',
      summary: 'Flip an interval and watch it turn into its partner.',
      minutes: 7,
      xp: 35,
      requires: ['interval-basics'],
      cards: [
        {
          kind: 'concept',
          title: 'The rule of nine',
          body: [
            'Move the bottom note of an interval up an octave and you get its **inversion**. A third becomes a sixth, a second becomes a seventh, a fourth becomes a fifth.',
            'The two numbers always add to nine. And the quality flips: major becomes minor, augmented becomes diminished, perfect stays perfect.',
            'So a major third (C→E) inverts to a minor sixth (E→C). This is not trivia — it halves how much you have to learn, and it explains why chord inversions sound related rather than random.',
          ],
          callouts: [
            {
              variant: 'insight',
              text: 'The tritone is its own inversion. Six plus six is twelve, and an augmented fourth inverts to a diminished fifth — the same six semitones. This symmetry is exactly why tritone substitution works in jazz.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Consonance and dissonance',
          body: [
            'Some intervals sound settled; others sound like they need to go somewhere. Octaves and fifths are **perfect consonances** — so stable they can sound empty. Thirds and sixths are **imperfect consonances** — sweet, warm, the intervals harmony is built from.',
            'Seconds, sevenths and tritones are **dissonances**. They create tension, and tension is not a problem to avoid. It is the fuel. Music without dissonance has nothing to resolve, and nothing to resolve means nothing happens.',
            'Note that this is partly physics and partly culture. The perfect fourth was treated as a dissonance for centuries when it appeared above the bass, and a major seventh that would have scandalised a Renaissance composer is a cosy jazz chord today.',
          ],
        },
        {
          kind: 'quiz',
          question: 'A major sixth inverts to which interval?',
          options: ['Minor third', 'Major third', 'Minor sixth', 'Perfect fourth'],
          answer: 0,
          explain:
            'A minor third. Six plus three is nine, and major flips to minor. So C up to A (major sixth) inverts to A up to C (minor third).',
          reviewId: 'iv-inversion-M6',
          reviewCategory: 'intervals',
        },
        {
          kind: 'quiz',
          question: 'Which interval is its own inversion?',
          options: ['Perfect fifth', 'Major third', 'Tritone', 'Octave'],
          answer: 2,
          explain:
            'The tritone. It splits the octave exactly in half, so inverting it produces another tritone. That symmetry is what lets one dominant chord substitute for another a tritone away.',
          reviewId: 'iv-tritone-symmetry',
          reviewCategory: 'intervals',
        },
      ],
    },
  ],
};
