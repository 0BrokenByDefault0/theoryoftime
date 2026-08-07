import { palette } from '../../theme';
import { Stage } from '../types';

/**
 * Stage 3–4: scales, keys, and the modes.
 *
 * The conceptual jump here is from "notes" to "a place you are in". Once a
 * learner feels a tonic, everything downstream — chords, function, tension —
 * has somewhere to point.
 */

export const scalesStage: Stage = {
  id: 'scales-keys',
  title: 'Scales & Keys',
  tagline: 'Choosing seven notes',
  description:
    'A scale is a filter: seven notes out of twelve, chosen so that one of them feels like home. Everything that follows depends on this.',
  tier: 'developing',
  glyph: '🗝️',
  color: palette.cyan,
  gradient: ['#22D3EE', '#3B82F6'],
  lessons: [
    {
      id: 'major-scale',
      title: 'The Major Scale',
      summary: 'One pattern of steps that generates every major key.',
      minutes: 8,
      xp: 40,
      cards: [
        {
          kind: 'concept',
          title: 'W W H W W W H',
          lede: 'Whole, whole, half, whole, whole, whole, half. Seven steps, and you are home.',
          body: [
            'The major scale is a fixed pattern of whole steps (W) and half steps (H) applied from any starting note. Start on C and use only white keys and you get exactly that pattern — which is precisely why the keyboard is laid out the way it is.',
            'Start anywhere else and you have to borrow black keys to keep the pattern intact. Start on G and you need F♯. Start on F and you need B♭. The pattern is the scale; the starting note just decides which keys you press.',
            'The starting note is called the **tonic**, and it is the note the whole scale feels magnetically pulled toward.',
          ],
          widget: {
            type: 'scale',
            tonic: 'C',
            scaleId: 'ionian',
            caption: 'C major — all white keys. Listen for how badly the seventh note wants to reach the eighth.',
          },
        },
        {
          kind: 'interactive',
          title: 'The same shape, a different key',
          instruction: 'Play G major. It is the same pattern of steps, but now it needs an F♯.',
          widget: {
            type: 'scale',
            tonic: 'G',
            scaleId: 'ionian',
          },
          body: [
            'If you played F natural instead, the last two steps would come out as W H instead of H — and the scale would stop sounding major. That one black key is what preserves the pattern.',
          ],
          callouts: [
            {
              variant: 'insight',
              text: 'This is the entire idea behind key signatures. Rather than write ♯ next to every single F, the composer declares once at the start: "in this piece, F means F♯."',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Scale degrees have names and jobs',
          body: [
            'Each note of the scale has a number (1–7) and a traditional name that describes its behaviour. The 1st is the **tonic** — home. The 5th is the **dominant** — the strongest pull back to home. The 4th is the **subdominant** — a step away from home in the other direction.',
            'The 7th is the **leading tone**, and it is the most restless note in the scale. It sits one semitone below the tonic and audibly leans into it. Play a major scale and stop on the 7th; the unfinished feeling you get is the entire engine of Western harmony.',
            'The 3rd is the **mediant**, and it is the note that decides major or minor. Everything else can stay the same.',
          ],
          widget: {
            type: 'piano',
            startMidi: 60,
            octaves: 1,
            scale: { tonic: 'C', scaleId: 'ionian' },
            showDegrees: true,
            caption: 'C major with degrees marked. Degree 7 (B) is a semitone from degree 1 (C).',
          },
        },
        {
          kind: 'quiz',
          question: 'What is the step pattern of a major scale?',
          options: [
            'W W H W W W H',
            'W H W W H W W',
            'H W W W H W W',
            'W W W H W W H',
          ],
          answer: 0,
          explain:
            'Whole, whole, half, whole, whole, whole, half. The two half steps land between degrees 3–4 and 7–8, which is what gives the scale its shape and its pull home.',
          reviewId: 'scale-major-pattern',
          reviewCategory: 'scales',
        },
        {
          kind: 'quiz',
          question: 'Which note does the F major scale need to alter?',
          options: ['F♯', 'B♭', 'C♯', 'E♭'],
          answer: 1,
          explain:
            'B♭. F G A B C D E F would put a whole step between the 3rd and 4th degrees instead of a half step. Flattening the B fixes it: F G A B♭ C D E F.',
          reviewId: 'scale-f-major',
          reviewCategory: 'scales',
        },
        {
          kind: 'build',
          title: 'Build it yourself',
          instruction: 'Play the notes of the G major scale (any octave, all seven notes).',
          targetPitchClasses: [7, 9, 11, 0, 2, 4, 6],
          expectedCount: 7,
          hint: 'Start on G and follow W W H W W W H. Remember the F♯.',
          explain:
            'G A B C D E F♯ — the major pattern starting on G. One sharp, which is why G major is the very next key clockwise from C on the circle of fifths.',
          startMidi: 55,
          octaves: 2,
        },
      ],
    },
    {
      id: 'key-signatures',
      title: 'Key Signatures',
      summary: 'Why sharps and flats always appear in the same order.',
      minutes: 8,
      xp: 40,
      requires: ['major-scale'],
      cards: [
        {
          kind: 'concept',
          title: 'A declaration at the start of the music',
          body: [
            'A key signature is a set of sharps or flats written once at the beginning of a staff, applying to every occurrence of those letters for the rest of the piece.',
            'They are not arbitrary. Sharps always appear in the order **F C G D A E B**, and flats always in the exact reverse: **B E A D G C F**. Every key signature is a prefix of one of those two lists.',
            'One sharp is always F♯. Two sharps is always F♯ and C♯. There is no key signature with only a C♯ and no F♯ — it would not correspond to any major scale.',
          ],
          widget: {
            type: 'staff',
            notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'],
            keyTonic: 'G',
            keyMode: 'major',
            caption: 'G major: one sharp in the signature, so every F on the staff is played as F♯.',
          },
        },
        {
          kind: 'concept',
          title: 'Two tricks that save you memorising fifteen keys',
          body: [
            '**For sharp keys:** the last sharp in the signature is the leading tone. Go up one semitone and you have the tonic. Signature ends in F♯? The key is G major. Ends in C♯? D major.',
            '**For flat keys:** the second-to-last flat *is* the tonic. Signature is B♭ E♭ A♭? The second-to-last is E♭ — so it is E♭ major. The single exception is F major, which has one flat and just has to be memorised.',
            'These two tricks cover all fifteen major key signatures in about a minute.',
          ],
          callouts: [
            {
              variant: 'pro',
              text: 'A key signature does not tell you whether a piece is major or minor. C major and A minor share a signature of no accidentals. To tell them apart, look at where the music rests — usually the first and last bass notes.',
            },
          ],
        },
        {
          kind: 'interactive',
          title: 'The circle of fifths',
          instruction: 'Tap around the wheel. Each step clockwise adds one sharp; each step anticlockwise adds one flat.',
          widget: { type: 'circle' },
          body: [
            'Moving clockwise means moving up a perfect fifth: C → G → D → A. Every one of those steps changes exactly one note of the scale, which is why neighbouring keys sound so closely related.',
            'The inner ring shows relative minors — the minor key that shares a signature with the major key outside it.',
          ],
          callouts: [
            {
              variant: 'insight',
              title: 'Why fifths?',
              text: 'A perfect fifth is the simplest interval after the octave (a 3:2 frequency ratio). Stack twelve of them and you land back where you started, having passed through all twelve notes. The circle is that stack drawn as a clock face.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'A piece has three sharps in its key signature. What major key is it in?',
          options: ['E major', 'A major', 'D major', 'B major'],
          answer: 1,
          explain:
            'A major. Three sharps are F♯ C♯ G♯; the last one is G♯, and a semitone above G♯ is A. Alternatively, count three steps clockwise from C on the circle: G, D, A.',
          reviewId: 'key-3-sharps',
          reviewCategory: 'keys',
        },
        {
          kind: 'quiz',
          question: 'A piece has four flats. What major key is it?',
          options: ['A♭ major', 'E♭ major', 'D♭ major', 'B♭ major'],
          answer: 0,
          explain:
            'A♭ major. Four flats are B♭ E♭ A♭ D♭; the second-to-last is A♭, which names the key.',
          reviewId: 'key-4-flats',
          reviewCategory: 'keys',
        },
      ],
    },
    {
      id: 'minor-scales',
      title: 'The Three Minors',
      summary: 'Natural, harmonic, melodic — and why minor needed fixing.',
      minutes: 9,
      xp: 45,
      requires: ['key-signatures'],
      cards: [
        {
          kind: 'concept',
          title: 'Natural minor: the relative of major',
          body: [
            'Play a major scale starting from its sixth degree instead of its first and you get the natural minor scale. C major played from A gives A B C D E F G — A natural minor.',
            'Same seven notes, same key signature, completely different feeling. What changed is which note feels like home. The tonic is a choice, not a property of the note collection.',
            'Its step pattern is W H W W H W W, and its degrees are 1 2 ♭3 4 5 ♭6 ♭7 compared to major.',
          ],
          widget: {
            type: 'scale',
            tonic: 'A',
            scaleId: 'aeolian',
            caption: 'A natural minor — the white keys again, but now A is home.',
          },
        },
        {
          kind: 'concept',
          title: 'The problem with natural minor',
          body: [
            'Natural minor has no leading tone. Its seventh degree sits a whole step below the tonic, not a semitone, so it does not pull home the way major does. Cadences in natural minor feel soft and unfinished.',
            'For a few centuries that was considered a defect worth fixing, so composers raised the seventh degree by a semitone whenever they needed a strong resolution. That gives **harmonic minor**: 1 2 ♭3 4 5 ♭6 7.',
            'But raising the 7th while leaving the ♭6 creates a gap of three semitones between them — an augmented second. It is awkward to sing and unmistakably exotic to hear. That single interval is the sound of everything from Middle Eastern music to neoclassical metal.',
          ],
          widget: {
            type: 'scale',
            tonic: 'A',
            scaleId: 'harmonic-minor',
            caption: 'A harmonic minor. Listen to the leap between F and G♯ — that is the augmented second.',
          },
        },
        {
          kind: 'concept',
          title: 'Melodic minor: smoothing the gap',
          body: [
            '**Melodic minor** raises the sixth degree as well, closing the awkward gap: 1 2 ♭3 4 5 6 7. Now only the third degree differs from major, and the scale runs smoothly.',
            'Classically it was used ascending and reverted to natural minor descending, on the logic that the leading tone is only needed when you are heading upward to the tonic. Jazz musicians dropped that rule entirely and use the raised form in both directions — which is why it is often called the jazz minor scale.',
            'The practical takeaway: minor is not one scale. It is a family of three, and composers pick whichever degree they need note by note.',
          ],
          widget: {
            type: 'scale',
            tonic: 'A',
            scaleId: 'melodic-minor',
          },
        },
        {
          kind: 'ear',
          question: 'Which minor scale is this?',
          prompt: { type: 'scale', tonic: 'A', scaleId: 'harmonic-minor' },
          options: ['Natural minor', 'Harmonic minor', 'Melodic minor', 'Dorian'],
          answer: 1,
          explain:
            'Harmonic minor. The tell is the wide, exotic leap near the top — the augmented second between the flat sixth and the raised seventh.',
          reviewId: 'ear-harmonic-minor',
          reviewCategory: 'ear-scales',
        },
        {
          kind: 'quiz',
          question: 'What is the relative minor of E♭ major?',
          options: ['C minor', 'G minor', 'B♭ minor', 'F minor'],
          answer: 0,
          explain:
            'C minor. The relative minor sits a minor third below the major tonic (or on its sixth degree). E♭ major and C minor both have three flats.',
          reviewId: 'key-relative-eb',
          reviewCategory: 'keys',
        },
        {
          kind: 'quiz',
          question: 'Why was the seventh degree of minor raised historically?',
          options: [
            'To make the scale easier to sing',
            'To create a leading tone that pulls strongly into the tonic',
            'To match the key signature of the relative major',
            'To avoid using black keys',
          ],
          answer: 1,
          explain:
            'To get a leading tone. Natural minor\'s seventh is a whole step below the tonic and resolves weakly. Raising it to a semitone below produces a proper dominant chord and a decisive cadence.',
          reviewId: 'scale-why-harmonic-minor',
          reviewCategory: 'scales',
        },
      ],
    },
    {
      id: 'pentatonic-blues',
      title: 'Pentatonic & Blues',
      summary: 'Five notes that cannot go wrong, plus the one that can.',
      minutes: 7,
      xp: 35,
      requires: ['major-scale'],
      cards: [
        {
          kind: 'concept',
          title: 'Remove the two problem notes',
          body: [
            'Take a major scale and delete degrees 4 and 7 — the two notes that create the semitone tensions — and you are left with a five-note **major pentatonic** scale: 1 2 3 5 6.',
            'With no semitones left, no two notes clash. That is why pentatonic is the first scale handed to beginners and why it appears independently in folk traditions across the world. It is very hard to play a wrong note.',
            'The black keys of a piano are a G♭ major pentatonic scale. Play only black keys, in any order, at any speed, and it will sound intentional.',
          ],
          widget: {
            type: 'scale',
            tonic: 'C',
            scaleId: 'major-pentatonic',
          },
        },
        {
          kind: 'concept',
          title: 'Minor pentatonic and the blue note',
          body: [
            '**Minor pentatonic** is the same five-note collection started from a different note: 1 ♭3 4 5 ♭7. In C that is C E♭ F G B♭.',
            'Add one more note — the ♭5 — and you get the **blues scale**. That added note is the "blue note", and it is not really a note at all. It is a smear, a pitch that sits between the major and minor third in traditional blues singing, approximated on fixed-pitch instruments by bending toward the ♭5.',
            'It is deliberately outside the harmony. Its whole function is to be a passing crack in an otherwise clean scale, and it should be used as a moment rather than a destination.',
          ],
          widget: {
            type: 'scale',
            tonic: 'C',
            scaleId: 'blues',
            caption: 'C blues. The G♭ is the blue note — pass through it rather than sitting on it.',
          },
          callouts: [
            {
              variant: 'warning',
              text: 'Landing on the ♭5 and holding it sounds like a mistake. Passing through it on the way from F to G sounds like the blues. Placement is everything.',
            },
          ],
        },
        {
          kind: 'interactive',
          title: 'Play the black keys',
          instruction: 'Improvise using only black keys over the drone. Try to make something bad happen.',
          widget: {
            type: 'piano',
            startMidi: 54,
            octaves: 2,
            scale: { tonic: 'Gb', scaleId: 'major-pentatonic' },
          },
          body: [
            'This is the fastest confidence-building exercise in music. Five notes with no semitones means there is nothing to avoid — you are free to focus entirely on rhythm and phrasing, which is where the music actually lives.',
          ],
        },
        {
          kind: 'quiz',
          question: 'Which degrees are removed from the major scale to make major pentatonic?',
          options: ['2 and 6', '3 and 7', '4 and 7', '4 and 6'],
          answer: 2,
          explain:
            'Degrees 4 and 7 — the two notes involved in the scale\'s semitone steps. Removing them removes every semitone clash, which is why pentatonic is so forgiving.',
          reviewId: 'scale-pentatonic-removed',
          reviewCategory: 'scales',
        },
      ],
    },
  ],
};

export const modesStage: Stage = {
  id: 'modes',
  title: 'The Modes',
  tagline: 'Seven colours from one scale',
  description:
    'The same seven notes, seven different homes, seven completely different moods. Modes are the cheapest way to make familiar material sound new.',
  tier: 'developing',
  glyph: '🎨',
  color: palette.violet,
  gradient: ['#8B5CF6', '#D946EF'],
  lessons: [
    {
      id: 'what-are-modes',
      title: 'What a Mode Actually Is',
      summary: 'Rotate the starting point, change everything.',
      minutes: 8,
      xp: 40,
      cards: [
        {
          kind: 'concept',
          title: 'Same notes, different centre',
          lede: 'A mode is a scale that starts somewhere else and means it.',
          body: [
            'Play the white keys from D to D. Those are the notes of C major, but D now feels like home. That is **D Dorian** — a genuinely different scale with a different pattern of steps relative to its own tonic.',
            'There are seven modes, one for each starting note of the major scale: Ionian (from 1), Dorian (2), Phrygian (3), Lydian (4), Mixolydian (5), Aeolian (6), Locrian (7).',
            'The critical part, and the part most explanations skip: it only counts as a mode if the music actually treats that note as home. Play white keys from D over a C bass and you are still in C major. Play them over a D bass with D-rooted chords and you are in D Dorian.',
          ],
          callouts: [
            {
              variant: 'warning',
              title: 'The most common misunderstanding',
              text: 'Modes are not scale fingerings. Playing "the D Dorian shape" over a C major backing track produces C major, not Dorian. The bass and the harmony decide the mode, not the notes you run.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Brightness is the useful ordering',
          body: [
            'Textbooks list the modes in scale order. That ordering teaches you nothing about how they sound. Order them by **brightness** instead — how many degrees are raised or lowered relative to the others — and they form a smooth ramp from luminous to bleak:',
            '**Lydian → Ionian → Mixolydian → Dorian → Aeolian → Phrygian → Locrian.**',
            'Each step down flattens exactly one more degree. Lydian is major with a ♯4. Mixolydian is major with a ♭7. Dorian is minor with a natural 6. Phrygian is minor with a ♭2. Once you see the ramp, you can pick a mode by the mood you want instead of by memory.',
          ],
          widget: {
            type: 'modeCompare',
            tonic: 'D',
            caption: 'All seven modes on the same tonic. Move down the list and hear the light drain out.',
          },
        },
        {
          kind: 'concept',
          title: 'The characteristic note',
          body: [
            'Each mode has one note that distinguishes it from its nearest neighbour. Emphasise that note and the mode announces itself; avoid it and the mode collapses back into plain major or minor.',
            'Lydian: the ♯4. Mixolydian: the ♭7. Dorian: the natural 6. Phrygian: the ♭2. Locrian: the ♭5.',
            'This is the single most practical fact about modes. If you want a track to sound Dorian rather than just minor, put the natural sixth somewhere prominent — in the melody, or as the major IV chord.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'Making a mode stick',
              text: 'Drone the tonic in the bass, avoid the chord that would pull you elsewhere (usually the V of the parent major), and land on the characteristic note in the melody. Three moves, and the mode is unmistakable.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'D Dorian contains the same notes as which major scale?',
          options: ['D major', 'C major', 'G major', 'F major'],
          answer: 1,
          explain:
            'C major. Dorian is the second mode, so D Dorian draws from the major scale a whole step below: C major. The notes are identical — what differs is that D is the tonal centre.',
          reviewId: 'mode-d-dorian-parent',
          reviewCategory: 'modes',
        },
        {
          kind: 'quiz',
          question: 'What single degree distinguishes Mixolydian from Ionian (major)?',
          options: ['♯4', '♭3', '♭7', '♭6'],
          answer: 2,
          explain:
            'The ♭7. Mixolydian is a major scale with a lowered seventh, which removes the leading tone. Without that semitone pull home, the mode sits still — which is why it loops so well in rock and funk.',
          reviewId: 'mode-mixolydian-degree',
          reviewCategory: 'modes',
        },
      ],
    },
    {
      id: 'bright-modes',
      title: 'Lydian & Mixolydian',
      summary: 'The two bright modes, and where you have heard them.',
      minutes: 8,
      xp: 40,
      requires: ['what-are-modes'],
      cards: [
        {
          kind: 'concept',
          title: 'Lydian: major, but floating',
          body: [
            'Lydian is a major scale with a raised fourth. That one alteration removes the last bit of gravity from the scale — the perfect fourth in a major scale pulls gently toward the third, and Lydian\'s ♯4 does not pull anywhere.',
            'The result sounds weightless, wondrous, slightly unreal. It is why film composers reach for it whenever something is meant to feel magical or vast: the spaceship reveal, the sunrise over the valley, the moment a child sees something impossible.',
            'The ♯4 also makes the II chord major instead of minor, which is the harmonic fingerprint. A I → II move in major key context is the Lydian sound.',
          ],
          widget: {
            type: 'scale',
            tonic: 'F',
            scaleId: 'lydian',
            caption: 'F Lydian — white keys from F. Listen to the B natural.',
          },
        },
        {
          kind: 'concept',
          title: 'Mixolydian: major with the swagger',
          body: [
            'Mixolydian flattens the seventh. Losing the leading tone means losing the urge to resolve, so a Mixolydian vamp can circle indefinitely without ever feeling like it needs to end.',
            'That is why it dominates rock, funk and Celtic music — all styles built on loops rather than on cadences. The ♭7 also turns the tonic chord into a dominant 7th, which is where the bluesy edge comes from.',
            'The signature progression is I – ♭VII – IV. In G that is G – F – C. You have heard it a thousand times.',
          ],
          widget: {
            type: 'progression',
            romans: ['I', 'bVII', 'IV', 'I'],
            tonic: 'G',
            mode: 'major',
            progressionId: 'i-bvii-iv',
          },
        },
        {
          kind: 'ear',
          question: 'Which mode is this?',
          prompt: { type: 'scale', tonic: 'C', scaleId: 'lydian' },
          options: ['Ionian (major)', 'Lydian', 'Mixolydian', 'Dorian'],
          answer: 1,
          explain:
            'Lydian. Everything sounds major until the fourth degree arrives a semitone higher than expected — bright, floating, slightly dreamlike.',
          reviewId: 'ear-lydian',
          reviewCategory: 'ear-modes',
        },
        {
          kind: 'quiz',
          question: 'Why does a Mixolydian vamp loop so comfortably?',
          options: [
            'It has more notes than a major scale',
            'It has no leading tone, so nothing demands resolution',
            'It is always played at a fast tempo',
            'It contains a tritone that resolves immediately',
          ],
          answer: 1,
          explain:
            'No leading tone. The ♭7 sits a whole step below the tonic instead of a semitone, so it does not lean home. Without that pull the progression has no built-in ending and can repeat indefinitely.',
          reviewId: 'mode-mixolydian-loop',
          reviewCategory: 'modes',
        },
      ],
    },
    {
      id: 'dark-modes',
      title: 'Dorian, Phrygian & Locrian',
      summary: 'Minor with hope, minor with menace, and minor with no floor.',
      minutes: 9,
      xp: 45,
      requires: ['what-are-modes'],
      cards: [
        {
          kind: 'concept',
          title: 'Dorian: the cool minor',
          body: [
            'Dorian is natural minor with a raised sixth. That one note lifts the whole scale out of tragedy and into something more ambiguous — serious, but not sad. Groove-friendly rather than mournful.',
            'The raised sixth makes the IV chord major in a minor context, which is the Dorian signature move: i → IV. In D Dorian that is Dm → G. Listen to *Billie Jean*, *Scarborough Fair*, or almost any modal jazz vamp.',
            'It is the default minor mode of dance music, house, and funk for exactly this reason — it carries weight without carrying grief.',
          ],
          widget: {
            type: 'progression',
            romans: ['i7', 'IV', 'i7', 'IV'],
            tonic: 'D',
            mode: 'minor',
            caption: 'D Dorian vamp. The major IV chord is the giveaway.',
          },
        },
        {
          kind: 'concept',
          title: 'Phrygian: the flat second',
          body: [
            'Phrygian is natural minor with a lowered second. The tonic now has a note pressed right up against it from above, and that semitone is claustrophobic in a way nothing else in the modal system is.',
            'Raise the third as well and you get **Phrygian dominant** — the scale of flamenco, of Middle Eastern music, of surf guitar and of every metal band that wanted to sound ancient and dangerous. It is the fifth mode of harmonic minor.',
            'The characteristic harmonic move is ♭II → i: in E Phrygian, F major resolving down to E minor. Two chords, instantly evocative.',
          ],
          widget: {
            type: 'scale',
            tonic: 'E',
            scaleId: 'phrygian-dominant',
            caption: 'E Phrygian dominant — the "Spanish" scale.',
          },
        },
        {
          kind: 'concept',
          title: 'Locrian: the one you cannot live in',
          body: [
            'Locrian flattens both the second and the fifth. Losing the perfect fifth is fatal: the tonic chord becomes diminished, so the note that is supposed to be home is itself unstable.',
            'This is why Locrian is essentially never used as a key. It is not that it sounds bad — it is that it cannot function as a resting place, and a tonal centre that cannot rest is a contradiction.',
            'Where it does appear is as a scale over a single half-diminished chord in jazz, or as a deliberate device in metal for passages that are meant to feel like falling.',
          ],
        },
        {
          kind: 'ear',
          question: 'Which mode is this?',
          prompt: { type: 'scale', tonic: 'D', scaleId: 'dorian' },
          options: ['Natural minor', 'Dorian', 'Phrygian', 'Harmonic minor'],
          answer: 1,
          explain:
            'Dorian. It opens like natural minor, but the sixth degree comes in a semitone higher than you expect — brighter, and noticeably less sad.',
          reviewId: 'ear-dorian',
          reviewCategory: 'ear-modes',
        },
        {
          kind: 'quiz',
          question: 'Why is Locrian almost never used as a key centre?',
          options: [
            'It contains too many accidentals to notate',
            'Its tonic chord is diminished, so home itself is unstable',
            'It sounds identical to Phrygian',
            'It has only six notes',
          ],
          answer: 1,
          explain:
            'The ♭5 makes the tonic triad diminished. A tonal centre works by being the most stable point in the system; if the tonic chord itself demands resolution, there is nowhere for the music to land.',
          reviewId: 'mode-locrian-problem',
          reviewCategory: 'modes',
        },
      ],
    },
  ],
};
