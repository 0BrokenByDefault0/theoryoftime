import { palette } from '../../theme';
import { Stage } from '../types';

/**
 * Stage 5–6: chords and functional harmony.
 *
 * This is the tier where a learner stops decoding music and starts being able
 * to write it. The emphasis throughout is on *function* — what a chord does —
 * rather than on chord spelling as trivia.
 */

export const chordsStage: Stage = {
  id: 'chords',
  title: 'Chords',
  tagline: 'Stacking notes into colour',
  description:
    'Three notes make a mood. Four make a flavour. Five or more make a signature. Learn how chords are built, inverted, and voiced.',
  tier: 'developing',
  glyph: '🧱',
  color: palette.indigo,
  gradient: ['#6366F1', '#8B5CF6'],
  lessons: [
    {
      id: 'triads',
      title: 'Triads',
      summary: 'Four three-note chords that cover most of music.',
      minutes: 9,
      xp: 40,
      cards: [
        {
          kind: 'concept',
          title: 'Stack two thirds',
          lede: 'Root, third, fifth. Change the thirds and you change the mood.',
          body: [
            'A triad is three notes built by stacking thirds: a root, the note a third above it, and the note a third above that. Since thirds come in major (4 semitones) and minor (3 semitones) flavours, there are exactly four ways to stack two of them.',
            '**Major** = major third then minor third. Bright, resolved. **Minor** = minor third then major third. Shaded, serious. **Diminished** = two minor thirds. Cramped, anxious. **Augmented** = two major thirds. Stretched, weightless.',
            'That is it. Four triads, and the difference between the two you will use constantly — major and minor — is one note moving by one semitone.',
          ],
          widget: {
            type: 'chordSet',
            symbols: ['C', 'Cm', 'Cdim', 'Caug'],
            caption: 'Same root, four qualities. Play them in order and hear the light drain out.',
          },
        },
        {
          kind: 'interactive',
          title: 'The one-semitone difference',
          instruction: 'Play C major, then move only the E down to E♭.',
          widget: {
            type: 'piano',
            startMidi: 60,
            octaves: 1,
            notes: [60, 64, 67],
          },
          body: [
            'Two notes stay exactly where they are. One note moves by the smallest distance available. And the entire emotional content of the chord inverts.',
            'This is the most important demonstration in beginner theory: mood in music is not about how many notes you use or how complicated they are. It is about tiny, precisely chosen distances.',
          ],
        },
        {
          kind: 'concept',
          title: 'Diminished and augmented are unstable on purpose',
          body: [
            'A diminished triad contains a tritone between its root and fifth. That tritone is what makes it restless — it is a chord that exists to move somewhere else, usually resolving inward.',
            'An augmented triad is perfectly symmetrical: three notes each four semitones apart. Because it divides the octave evenly, no note in it sounds more like a root than any other, so it has no gravity at all. Composers use it to hover between two keys or to make a transition feel like a lift.',
            'You will rarely write a song *in* either of these. You will use them constantly as connective tissue.',
          ],
        },
        {
          kind: 'ear',
          question: 'Which triad is this?',
          prompt: { type: 'chord', symbol: 'Cm' },
          options: ['Major', 'Minor', 'Diminished', 'Augmented'],
          answer: 1,
          explain:
            'Minor. It has the stability of a perfect fifth on the outside, but the third is lowered — so it sits solidly while sounding shaded rather than bright.',
          reviewId: 'ear-minor-triad',
          reviewCategory: 'ear-chords',
        },
        {
          kind: 'ear',
          question: 'Which triad is this?',
          prompt: { type: 'chord', symbol: 'Cdim' },
          options: ['Minor', 'Diminished', 'Augmented', 'Major'],
          answer: 1,
          explain:
            'Diminished. The outer interval is a tritone rather than a perfect fifth, which is why it sounds compressed and unresolved rather than merely sad.',
          reviewId: 'ear-dim-triad',
          reviewCategory: 'ear-chords',
        },
        {
          kind: 'build',
          title: 'Build an A minor triad',
          instruction: 'Play A, C and E together.',
          targetPitchClasses: [9, 0, 4],
          expectedCount: 3,
          hint: 'Root A, up three semitones to C (minor third), then up four more to E.',
          explain:
            'A minor: A–C–E. Minor third on the bottom, major third on top. Note that it uses only white keys — A minor is the relative minor of C major.',
          startMidi: 57,
          octaves: 2,
        },
      ],
    },
    {
      id: 'inversions',
      title: 'Inversions & Voicing',
      summary: 'Same chord, different bass note, different job.',
      minutes: 8,
      xp: 40,
      requires: ['triads'],
      cards: [
        {
          kind: 'concept',
          title: 'The bass note changes everything',
          body: [
            'A chord in **root position** has its root as the lowest note. Move that root up an octave and the third is now lowest — that is **first inversion**, written C/E. Do it again and the fifth is lowest: **second inversion**, C/G.',
            'The chord is the same three notes. What changes is weight and function. Root position sounds planted and final. First inversion sounds lighter and more mobile — it is what you use mid-phrase when you do not want the harmony to feel like it has arrived.',
            'Second inversion is the unstable one. With the fifth in the bass, the chord sounds like it is leaning on something and needs to move. Classical writing restricts it to very specific situations for exactly that reason.',
          ],
          widget: {
            type: 'chordSet',
            symbols: ['C', 'C/E', 'C/G'],
            caption: 'One chord, three bass notes. Listen to how the sense of arrival changes.',
          },
        },
        {
          kind: 'concept',
          title: 'Inversions make bass lines',
          body: [
            'The practical reason to know inversions is that they let the bass move smoothly while the harmony stays put — or let the harmony change while the bass holds still.',
            'Compare C → F → G → C in root position (bass leaps around) with C → C/E → F → G (bass walks C–E–F–G). Same chords, but the second one has a line in it. Bass lines that move by step sound composed; bass lines that only leap sound like block chords.',
            'Every time you see a slash chord in a chart — C/E, G/B, Am/F♯ — someone was thinking about the bass.',
          ],
          widget: {
            type: 'progression',
            romans: ['I', 'V/3', 'vi', 'IV'],
            tonic: 'C',
            mode: 'major',
            caption: 'The second chord is G with B in the bass, so the bass walks C–B–A–F.',
          },
          callouts: [
            {
              variant: 'pro',
              title: 'The pedal point',
              text: 'Hold one bass note while the chords change above it. It creates tension that builds automatically, and it is the cheapest way to make four bars of static harmony feel like they are going somewhere.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Voicing: which notes, in which octaves',
          body: [
            'Inversion is about the bass. **Voicing** is about the whole arrangement of a chord — how spread out it is, which notes are doubled, and which are left out.',
            'A **close** voicing packs everything inside an octave. It is dense and works well in the mid-range but turns to mud low down. A **drop 2** voicing takes the second-highest note down an octave, opening a gap in the middle; it is the default for guitar and big-band writing because it sounds clear on almost any instrument.',
            'A **shell** voicing keeps only the root, third and seventh. It is the minimum required to identify the chord, and it leaves maximum room for a melody and a bass player to work. Jazz pianists comp with shells constantly.',
          ],
          widget: {
            type: 'voicings',
            symbol: 'Cmaj7',
            caption: 'The same Cmaj7, voiced six ways. The notes are identical; the sound is not.',
          },
        },
        {
          kind: 'quiz',
          question: 'What does the chord symbol "G/B" mean?',
          options: [
            'G major and B major played together',
            'A G major chord with B as the lowest note',
            'A G chord in the key of B',
            'A chord alternating between G and B',
          ],
          answer: 1,
          explain:
            'A G major triad (G–B–D) with B in the bass — first inversion. Slash chords always mean "this chord over this bass note", and they exist almost entirely to control the bass line.',
          reviewId: 'chord-slash-notation',
          reviewCategory: 'chords',
        },
      ],
    },
    {
      id: 'sevenths',
      title: 'Seventh Chords',
      summary: 'Add a fourth note and the chord starts having opinions.',
      minutes: 10,
      xp: 45,
      requires: ['triads'],
      cards: [
        {
          kind: 'concept',
          title: 'One more third on top',
          body: [
            'Keep stacking. Add another third above the fifth and you have a seventh chord — four notes instead of three. This is the point where harmony stops being merely happy or sad and starts having genuine flavour.',
            'The five you need are: **maj7** (dreamy, warm), **m7** (cool, relaxed), **dominant 7** (restless, wants to move), **m7♭5** (melancholy and unstable), and **dim7** (maximum tension).',
            'The difference between maj7 and dominant 7 is one semitone on the top note — and it is the difference between "bossa nova café" and "the blues".',
          ],
          widget: {
            type: 'chordSet',
            symbols: ['Cmaj7', 'Cm7', 'C7', 'Cm7b5', 'Cdim7'],
            caption: 'The five essential sevenths, all on C.',
          },
        },
        {
          kind: 'concept',
          title: 'The dominant 7th is the engine of tonal music',
          body: [
            'A dominant 7th chord contains a tritone — between its third and its seventh. In G7, that is B and F.',
            'That tritone is unstable, and it resolves in a very specific way: the B (the leading tone) wants to rise a semitone to C, and the F wants to fall a semitone to E. Both voices move by the smallest possible distance, and both land inside a C major chord.',
            'That is why V7 → I is the strongest cadence in Western music. It is not convention — it is two semitone resolutions happening at once, and your ear hears both of them arrive.',
          ],
          widget: {
            type: 'progression',
            romans: ['V7', 'I'],
            tonic: 'C',
            mode: 'major',
            caption: 'G7 → C. The tritone B–F collapses inward to C–E.',
          },
          callouts: [
            {
              variant: 'insight',
              title: 'Guide tones',
              text: 'The 3rd and 7th of a chord are called guide tones because they carry all the harmonic information. Root and fifth tell you where you are; 3rd and 7th tell you what kind of chord it is. Jazz players voice-lead the guide tones and let the bass handle the rest.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Half-diminished and fully diminished',
          body: [
            '**m7♭5** (half-diminished, written ø7) is a diminished triad with a minor seventh on top. It softens the diminished sound into something melancholy rather than jagged. It is the ii chord of every minor key and appears in thousands of jazz standards.',
            '**dim7** stacks three minor thirds — four notes, each exactly three semitones apart. Because it is perfectly symmetrical, it has no root: any of its four notes can act as the bottom. That means one dim7 chord can resolve to four different keys, which is why classical composers used it as a universal modulation pivot.',
          ],
        },
        {
          kind: 'ear',
          question: 'Which seventh chord is this?',
          prompt: { type: 'chord', symbol: 'Cmaj7' },
          options: ['Dominant 7', 'Major 7', 'Minor 7', 'Half-diminished'],
          answer: 1,
          explain:
            'Major 7. Warm and slightly dreamy, with a gentle rub between the root and the seventh a semitone below it. Nothing about it wants to move — compare that to a dominant 7.',
          reviewId: 'ear-maj7',
          reviewCategory: 'ear-chords',
        },
        {
          kind: 'ear',
          question: 'Which seventh chord is this?',
          prompt: { type: 'chord', symbol: 'C7' },
          options: ['Major 7', 'Minor 7', 'Dominant 7', 'Diminished 7'],
          answer: 2,
          explain:
            'Dominant 7. Major triad, flat seventh. The tritone inside it creates the pull that makes cadences work — it sounds like it is about to go somewhere.',
          reviewId: 'ear-dom7',
          reviewCategory: 'ear-chords',
        },
        {
          kind: 'quiz',
          question: 'What makes a dominant 7th chord resolve so strongly to the tonic?',
          options: [
            'It is the loudest chord in the key',
            'Its tritone resolves by two simultaneous semitone steps into the tonic triad',
            'It contains four notes instead of three',
            'It is always played in root position',
          ],
          answer: 1,
          explain:
            'The tritone between the 3rd and 7th resolves inward: the leading tone rises a semitone and the seventh falls a semitone, both landing in the tonic chord. Two minimal moves arriving together is what the ear reads as resolution.',
          reviewId: 'chord-dom7-resolution',
          reviewCategory: 'chords',
        },
      ],
    },
    {
      id: 'extensions',
      title: 'Extensions & Colour',
      summary: '9ths, 11ths, 13ths — and knowing when to stop.',
      minutes: 9,
      xp: 45,
      requires: ['sevenths'],
      cards: [
        {
          kind: 'concept',
          title: 'Keep stacking past the octave',
          body: [
            'Add another third above the seventh and you get the 9th. Another gives the 11th, another the 13th. Past that you would be back at the root, so 13 is the ceiling — a 13th chord theoretically contains all seven notes of the scale.',
            'In practice nobody plays all seven. Extensions are colours you select, not a ladder you must climb. A "C13" usually means root, 3rd, ♭7 and 13th — four notes, with the 5th, 9th and 11th left out because they add nothing or actively clash.',
            'The rule of thumb: keep the 3rd and 7th (they define the chord), keep whichever extension you actually want to hear, and drop everything else.',
          ],
          widget: {
            type: 'chordSet',
            symbols: ['Cmaj7', 'Cmaj9', 'Cm9', 'C13'],
            caption: 'Extensions add air and sophistication without changing the chord\'s function.',
          },
        },
        {
          kind: 'concept',
          title: 'The eleventh problem',
          body: [
            'A natural 11th over a major or dominant chord clashes badly with the major third — they are a semitone apart when reduced to the same octave, and it sounds like a mistake rather than a colour.',
            'There are three standard solutions. Drop the third (giving a sus-like 11 chord). Raise the eleventh to ♯11 (the Lydian sound, which works beautifully). Or just do not use it.',
            'Over minor chords there is no problem at all — m11 chords are gorgeous, and they are everywhere in neo-soul and modern R&B.',
          ],
          callouts: [
            {
              variant: 'warning',
              title: 'The avoid note',
              text: 'Every chord/scale pairing has notes that clash. The natural 11 over a major chord is the classic example. "Avoid note" does not mean forbidden — it means do not sit on it.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Added tones versus extensions',
          body: [
            'An **add9** chord is not the same as a **9** chord. C9 implies a dominant 7th with a ninth on top: C–E–G–B♭–D. Cadd9 has no seventh at all: C–E–G–D.',
            'That distinction matters because add9 keeps the chord simple and open — indie rock and acoustic guitar territory — while the full 9 chord brings all the tension of a dominant with it.',
            'Similarly, **6/9** chords (root, 3rd, 5th, 6th, 9th) are lush but completely resolved. They are the classic way to end a jazz tune without the finality of a plain triad.',
          ],
        },
        {
          kind: 'quiz',
          question: 'Why is a natural 11th usually avoided over a major chord?',
          options: [
            'It is too high to hear clearly',
            'It clashes with the major third, a semitone away',
            'It duplicates the root',
            'It makes the chord minor',
          ],
          answer: 1,
          explain:
            'It sits a semitone above the major third when reduced to the same octave, producing a harsh clash. Raising it to ♯11 fixes this and gives the Lydian colour; dropping the third turns it into a suspension.',
          reviewId: 'chord-11-clash',
          reviewCategory: 'chords',
        },
        {
          kind: 'quiz',
          question: 'What is the difference between Cadd9 and C9?',
          options: [
            'Nothing, they are alternative spellings',
            'Cadd9 has no seventh; C9 includes a ♭7',
            'C9 has no third',
            'Cadd9 is played an octave higher',
          ],
          answer: 1,
          explain:
            'Cadd9 is a triad plus a ninth (C–E–G–D). C9 is a dominant 7th plus a ninth (C–E–G–B♭–D). The seventh is the whole difference, and it changes the chord from restful to restless.',
          reviewId: 'chord-add9-vs-9',
          reviewCategory: 'chords',
        },
      ],
    },
    {
      id: 'suspensions',
      title: 'Suspensions & Power Chords',
      summary: 'Chords that refuse to pick a side.',
      minutes: 6,
      xp: 30,
      requires: ['triads'],
      cards: [
        {
          kind: 'concept',
          title: 'Replace the third',
          body: [
            'A suspended chord swaps the third for either the second (sus2) or the fourth (sus4). Since the third is what makes a chord major or minor, removing it leaves the chord genuinely undecided.',
            'sus4 leans forward — the fourth sits a semitone above the third and wants to fall into it. Classically a suspension was exactly that: a note held over from the previous chord that then resolves down. Pop and rock kept the sound and dropped the obligation to resolve.',
            'sus2 is more open and ambient, less directional. It is the sound of a lot of post-rock and worship music, and of nearly every arpeggiated synth pad.',
          ],
          widget: {
            type: 'chordSet',
            symbols: ['Csus2', 'C', 'Csus4'],
            caption: 'Play sus4 then the plain triad and hear the fourth fall into the third.',
          },
        },
        {
          kind: 'concept',
          title: 'Power chords: not chords at all',
          body: [
            'A power chord is just a root and a fifth — two notes, no third. Strictly it is an interval, not a chord, since it has no quality.',
            'That ambiguity is the point. Under heavy distortion, a full triad generates intermodulation between its harmonics and turns to noise. Root and fifth share most of their harmonic series, so they stay clean no matter how much gain you add.',
            'It is a rare case of a musical convention that exists purely for a technical reason — and it defined the sound of half a century of rock.',
          ],
        },
        {
          kind: 'quiz',
          question: 'What note does a sus4 chord replace?',
          options: ['The root', 'The third', 'The fifth', 'The seventh'],
          answer: 1,
          explain:
            'The third. Because the third is the note that determines major or minor, removing it leaves the chord neither — which is exactly why suspensions sound unresolved and open.',
          reviewId: 'chord-sus4',
          reviewCategory: 'chords',
        },
      ],
    },
  ],
};

export const harmonyStage: Stage = {
  id: 'harmony',
  title: 'Harmony in Motion',
  tagline: 'Why chords move',
  description:
    'Chords in isolation are colours. Chords in sequence are sentences. This is where you learn the grammar.',
  tier: 'proficient',
  glyph: '🌀',
  color: palette.fuchsia,
  gradient: ['#D946EF', '#EC4899'],
  lessons: [
    {
      id: 'diatonic-chords',
      title: 'The Seven Chords of a Key',
      summary: 'Build a chord on every scale degree and the key comes alive.',
      minutes: 9,
      xp: 45,
      cards: [
        {
          kind: 'concept',
          title: 'One scale, seven chords',
          body: [
            'Take a major scale and build a triad on each degree using only notes from that scale. You get a fixed pattern of qualities that is the same in every major key:',
            '**I major, ii minor, iii minor, IV major, V major, vi minor, vii° diminished.**',
            'Capital Roman numerals mean major, lowercase means minor, and the little circle means diminished. Because the pattern never changes, learning it once means you know the chords of all twelve major keys.',
          ],
          widget: {
            type: 'progression',
            romans: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
            tonic: 'C',
            mode: 'major',
            caption: 'Every diatonic triad in C major, in order.',
          },
        },
        {
          kind: 'concept',
          title: 'Roman numerals are the reason theory is portable',
          body: [
            'Writing "C – Am – F – G" describes one song in one key. Writing "I – vi – IV – V" describes a *shape* that works in any key.',
            'This is why professionals think in numerals. Transposing becomes trivial, patterns across different songs become visible, and you can discuss a progression without anyone having to agree on a key first.',
            'Minor keys have their own pattern: **i, ii°, III, iv, v, VI, VII.** Note that the v is minor — which is why minor keys usually borrow a major V from harmonic minor when they want a strong cadence.',
          ],
          widget: {
            type: 'progression',
            romans: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
            tonic: 'A',
            mode: 'minor',
          },
        },
        {
          kind: 'quiz',
          question: 'In the key of D major, what chord is the vi?',
          options: ['B minor', 'G major', 'A major', 'F♯ minor'],
          answer: 0,
          explain:
            'B minor. The D major scale is D E F♯ G A B C♯; the sixth degree is B, and the vi chord is always minor. B–D–F♯.',
          reviewId: 'harmony-vi-of-D',
          reviewCategory: 'harmony',
        },
        {
          kind: 'quiz',
          question: 'Which diatonic triad in a major key is diminished?',
          options: ['ii', 'iii', 'vi', 'vii°'],
          answer: 3,
          explain:
            'The vii°, built on the leading tone. In C major that is B–D–F, containing the tritone B–F. Its instability is why it functions almost identically to a V7 chord with the root removed.',
          reviewId: 'harmony-diminished-degree',
          reviewCategory: 'harmony',
        },
      ],
    },
    {
      id: 'harmonic-function',
      title: 'Tonic, Predominant, Dominant',
      summary: 'Three jobs that explain almost every progression ever written.',
      minutes: 9,
      xp: 50,
      requires: ['diatonic-chords'],
      cards: [
        {
          kind: 'concept',
          title: 'Chords have jobs, not just names',
          lede: 'Home → away → tension → home. That is the sentence.',
          body: [
            'The seven diatonic chords sort into three functional families based on what they do rather than what they are called.',
            '**Tonic** (I, vi, iii) is home — stability, arrival, rest. **Predominant** (IV, ii) moves away from home and sets up what comes next. **Dominant** (V, vii°) is maximum tension and pulls hard back to tonic.',
            'The standard flow is Tonic → Predominant → Dominant → Tonic. Once you see it, you will find it running underneath a startling proportion of all recorded music.',
          ],
          widget: {
            type: 'progression',
            romans: ['I', 'IV', 'V', 'I'],
            tonic: 'C',
            mode: 'major',
            progressionId: 'i-iv-v-i',
          },
        },
        {
          kind: 'concept',
          title: 'Substitution within a family',
          body: [
            'Chords in the same functional family share notes and can stand in for each other. vi shares two notes with I, so vi can act as a softer, sadder tonic. ii shares two notes with IV, so ii can replace IV as a predominant.',
            'That is why I–vi–IV–V and I–vi–ii–V sound so similar. Functionally they are the same sentence with different word choices.',
            'It is also the key to reharmonisation: keep the function, swap the chord, and the progression stays coherent while sounding fresh.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'Instant upgrade',
              text: 'Anywhere you wrote IV, try ii7 instead. Anywhere you wrote V, try V7. Same function, more colour, zero risk of the progression falling apart.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Cadences: the punctuation marks',
          body: [
            'A cadence is how a musical phrase ends. **Authentic** (V → I) is a full stop — decisive, final. **Plagal** (IV → I) is gentler, a settling rather than a snap shut; it is the "Amen" at the end of a hymn.',
            '**Half cadence** ends *on* the V, leaving the phrase hanging like a comma or a question mark. **Deceptive** (V → vi) sets up a full stop and then swerves — the harmonic equivalent of a sentence that does not end where you expected.',
            'The deceptive cadence is why I–V–vi–IV loops forever. The V never gets to resolve to I, so the phrase never actually finishes.',
          ],
          widget: {
            type: 'progression',
            romans: ['I', 'V', 'vi', 'IV'],
            tonic: 'C',
            mode: 'major',
            progressionId: 'i-v-vi-iv',
            caption: 'The four-chord loop. The V→vi swerve is what keeps it circling.',
          },
        },
        {
          kind: 'ear',
          question: 'Which progression is this?',
          prompt: { type: 'progression', romans: ['I', 'V', 'vi', 'IV'], tonic: 'C', mode: 'major' },
          options: ['I–IV–V–I', 'I–V–vi–IV', 'vi–IV–I–V', 'I–vi–IV–V'],
          answer: 1,
          explain:
            'I–V–vi–IV. It starts bright, lifts to the dominant, drops into the relative minor and then resolves through IV — never quite landing back home, which is why it loops so naturally.',
          reviewId: 'ear-i-v-vi-iv',
          reviewCategory: 'ear-progressions',
        },
        {
          kind: 'quiz',
          question: 'A phrase ends V → vi. What is this cadence called?',
          options: ['Authentic', 'Plagal', 'Deceptive', 'Half'],
          answer: 2,
          explain:
            'Deceptive. The V sets up an arrival on I, but lands on vi instead — which shares two of its three notes with I, so it feels like an arrival while denying the expected one.',
          reviewId: 'harmony-deceptive-cadence',
          reviewCategory: 'harmony',
        },
      ],
    },
    {
      id: 'voice-leading',
      title: 'Voice Leading',
      summary: 'The difference between chords and music.',
      minutes: 10,
      xp: 55,
      requires: ['harmonic-function'],
      cards: [
        {
          kind: 'concept',
          title: 'Move as little as possible',
          lede: 'Good harmony is mostly about notes that do not move.',
          body: [
            'A chord progression is not a series of blocks. It is several independent lines happening at once, and the ear follows those lines rather than the blocks.',
            'The central principle is **minimal motion**: keep common tones where they are, and move the remaining voices to the nearest available note. C → Am shares C and E; only one note needs to move at all.',
            'Do this and progressions sound smooth and inevitable. Ignore it — play every chord in root position, leaping around — and even a perfect progression sounds like someone pressing buttons.',
          ],
          widget: {
            type: 'progression',
            romans: ['I', 'vi', 'IV', 'V'],
            tonic: 'C',
            mode: 'major',
            caption: 'Played with smooth voice leading: inversions chosen to minimise movement.',
          },
        },
        {
          kind: 'concept',
          title: 'Guide tones do the heavy lifting',
          body: [
            'In seventh-chord harmony, the 3rd and 7th of each chord are the guide tones. Follow them through a ii–V–I and something elegant happens: the 7th of one chord becomes the 3rd of the next, moving down by a single semitone.',
            'In C: Dm7 has F and C. G7 has B and F — the F stays put, and the C drops to B. Cmaj7 has E and B — the B stays, the F falls to E.',
            'Two voices, moving by semitone or not at all, carrying the entire harmonic story. This is why ii–V–I is the backbone of jazz: it is maximally smooth.',
          ],
          callouts: [
            {
              variant: 'insight',
              title: 'Why fifths dominate',
              text: 'Root motion by descending fifth gives the most common tones and the smoothest guide-tone movement of any root motion. That is the real reason the circle of fifths matters — it is a map of smooth connections, not a memorisation aid.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'The classical prohibitions, and why they exist',
          body: [
            'Traditional counterpoint forbids parallel fifths and octaves — two voices moving in the same direction while staying a fifth or octave apart.',
            'The reason is not arbitrary. Fifths and octaves blend so completely that when two voices move in parallel at those intervals, they stop sounding like two voices and merge into one. In four-part writing, where the whole point is independence, that is a loss.',
            'Which is also why rock guitarists use parallel fifths constantly and it sounds fantastic. They *want* one thick voice, not four independent ones. The rule is not about right and wrong; it is about whether you want independence or fusion.',
          ],
        },
        {
          kind: 'quiz',
          question: 'In a ii–V–I in C major, what happens to the note F?',
          options: [
            'It stays as a common tone between Dm7 and G7, then falls to E',
            'It rises to G immediately',
            'It is not present in any of the three chords',
            'It stays through all three chords',
          ],
          answer: 0,
          explain:
            'F is the 3rd of Dm7 and the 7th of G7, so it holds across both. Then it resolves down a semitone to E, the 3rd of Cmaj7. Holding then stepping by a semitone is what makes the cadence sound inevitable.',
          reviewId: 'harmony-guide-tone-f',
          reviewCategory: 'harmony',
        },
        {
          kind: 'quiz',
          question: 'Why does classical writing avoid parallel fifths?',
          options: [
            'They sound out of tune',
            'They cause two independent voices to fuse into one',
            'They are impossible to sing',
            'They only work in minor keys',
          ],
          answer: 1,
          explain:
            'Fifths blend almost completely, so voices moving in parallel fifths lose their independence and merge. In counterpoint that defeats the purpose. In rock, where a single thick sound is the goal, the same effect is desirable.',
          reviewId: 'harmony-parallel-fifths',
          reviewCategory: 'harmony',
        },
      ],
    },
    {
      id: 'progression-library',
      title: 'Progressions That Work',
      summary: 'A working vocabulary, with the mechanism behind each one.',
      minutes: 11,
      xp: 55,
      requires: ['harmonic-function'],
      cards: [
        {
          kind: 'concept',
          title: 'Borrowing is not cheating',
          body: [
            'Chord progressions are not copyrightable and never have been. The same handful of shapes underpins enormous amounts of music across every genre, and using them is craft rather than theft.',
            'What makes a song is melody, rhythm, arrangement, timbre, lyric and performance. The progression is the trellis, not the plant.',
            'The lessons below give you the most useful shapes along with *why* each works — because once you know the mechanism, you can modify it rather than just copy it.',
          ],
        },
        {
          kind: 'interactive',
          title: 'The ii–V–I',
          instruction: 'Play it, then transpose it around the circle of fifths.',
          widget: {
            type: 'progression',
            romans: ['ii7', 'V7', 'Imaj7'],
            tonic: 'C',
            mode: 'major',
            progressionId: 'ii-v-i',
          },
          body: [
            'Roots fall by fifths, guide tones move by semitone, and the whole thing lands with total certainty. It is the most efficient cadence in tonal harmony, and it is worth learning in all twelve keys.',
          ],
        },
        {
          kind: 'interactive',
          title: 'The Andalusian cadence',
          instruction: 'Listen for the stepwise descent and the surprise major chord at the end.',
          widget: {
            type: 'progression',
            romans: ['i', 'VII', 'VI', 'V'],
            tonic: 'A',
            mode: 'minor',
            progressionId: 'andalusian',
          },
          body: [
            'The bass walks down by step from the tonic, which alone would sound like a slow collapse. Then the final chord arrives major instead of minor — borrowed from harmonic minor — and the whole thing snaps into flamenco.',
          ],
        },
        {
          kind: 'interactive',
          title: 'The Royal Road',
          instruction: 'Notice that it never touches the tonic chord.',
          widget: {
            type: 'progression',
            romans: ['IVmaj7', 'V7', 'iii7', 'vi7'],
            tonic: 'C',
            mode: 'major',
            progressionId: 'royal-road',
          },
          body: [
            'IV → V sets up a resolution to I that never comes; instead it lands on iii, then slides to vi. Four bars of permanent yearning, which is exactly why it saturates J-pop, city pop and anime themes.',
          ],
        },
        {
          kind: 'ear',
          question: 'Which progression is this?',
          prompt: { type: 'progression', romans: ['i', 'VII', 'VI', 'V'], tonic: 'A', mode: 'minor' },
          options: ['ii–V–I', 'Andalusian cadence', '12-bar blues', 'I–vi–IV–V'],
          answer: 1,
          explain:
            'The Andalusian cadence. The stepwise descent in the bass followed by a major V chord is unmistakable once you have heard it a few times.',
          reviewId: 'ear-andalusian',
          reviewCategory: 'ear-progressions',
        },
        {
          kind: 'quiz',
          question: 'What makes the Royal Road progression feel permanently unresolved?',
          options: [
            'It uses only minor chords',
            'It never lands on the tonic chord',
            'It changes key every bar',
            'It has no dominant chord',
          ],
          answer: 1,
          explain:
            'It sets up a V → I resolution and then goes to iii instead, then to vi. The tonic chord never arrives, so the loop always sounds like it is still on its way somewhere.',
          reviewId: 'harmony-royal-road',
          reviewCategory: 'harmony',
        },
      ],
    },
  ],
};
