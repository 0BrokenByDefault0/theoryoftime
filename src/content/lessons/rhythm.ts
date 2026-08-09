import { palette } from '../../theme';
import { Stage } from '../types';

/**
 * Stage 7–8: rhythm, and then chromatic harmony.
 *
 * Rhythm is where most theory curricula go thin and where most producers
 * actually live, so it gets a full stage rather than an appendix.
 */

export const rhythmStage: Stage = {
  id: 'rhythm',
  title: 'Rhythm & Groove',
  tagline: 'Where music actually lives',
  description:
    'You can write a great song with three chords and a bad one with thirty. What you cannot do is write a great song with a dead rhythm.',
  tier: 'proficient',
  glyph: '🥁',
  color: palette.amber,
  gradient: ['#F59E0B', '#FB7185'],
  lessons: [
    {
      id: 'pulse-and-meter',
      title: 'Pulse, Beat & Meter',
      summary: 'How time gets organised into something you can nod to.',
      minutes: 8,
      xp: 40,
      cards: [
        {
          kind: 'concept',
          title: 'The beat is a decision, not a fact',
          body: [
            'A **pulse** is a steady stream of clicks. A **beat** is the level of that pulse you naturally tap along to. A **meter** is the pattern of strong and weak beats that groups them.',
            'The important thing is that meter is imposed by the listener, not carried by the sound. Play a completely even click track and people will start hearing it in groups of two or four anyway — the brain insists on finding structure.',
            'That is what a producer exploits. Accent every fourth click and you have 4/4. Accent every third and the same clicks become a waltz.',
          ],
          widget: {
            type: 'metronome',
            bpm: 100,
            beats: 4,
            caption: 'Change the beats per bar and hear the same tempo reorganise itself.',
          },
        },
        {
          kind: 'concept',
          title: 'Reading a time signature',
          body: [
            'The top number says how many beats are in a bar. The bottom number says which note value gets one beat: 4 means a quarter note, 8 means an eighth note.',
            'So 3/4 is three quarter-note beats — a waltz. 6/8 is six eighth notes, but grouped as two beats of three, which is why it rolls rather than marches.',
            'That grouping distinction is the whole difference between **simple** meter (beats divide into two) and **compound** meter (beats divide into three). 6/8 and 3/4 contain the same total duration and feel nothing alike.',
          ],
        },
        {
          kind: 'concept',
          title: 'The backbeat',
          body: [
            'In 4/4 the natural strong beats are 1 and 3. Popular music puts the snare on 2 and 4 instead — deliberately accenting the weak beats.',
            'That contradiction is the backbeat, and it is arguably the single most consequential rhythmic idea in recorded music. It creates a constant low-level tension between where the meter says the weight is and where the drums put it.',
            'Move the snare to 1 and 3 and rock music instantly turns into a march. Try it.',
          ],
          widget: {
            type: 'drumMachine',
            patternId: 'backbeat',
            caption: 'Drag the snare hits to beats 1 and 3 and hear the groove die.',
          },
        },
        {
          kind: 'quiz',
          question: 'What is the difference between 6/8 and 3/4?',
          options: [
            'Nothing — they are the same length',
            '6/8 groups as two beats of three; 3/4 groups as three beats of two',
            '6/8 is always faster',
            '3/4 cannot be used in popular music',
          ],
          answer: 1,
          explain:
            'They contain the same total duration but group it differently. 6/8 is compound — two big beats each divided into three. 3/4 is simple — three beats each divided into two. The accents land in completely different places.',
          reviewId: 'rhythm-68-vs-34',
          reviewCategory: 'rhythm',
        },
      ],
    },
    {
      id: 'subdivision-syncopation',
      title: 'Subdivision & Syncopation',
      summary: 'Groove comes from where you do not play.',
      minutes: 9,
      xp: 45,
      requires: ['pulse-and-meter'],
      cards: [
        {
          kind: 'concept',
          title: 'Counting the grid',
          body: [
            'Beats divide. Quarter notes become eighths ("1 and 2 and"), eighths become sixteenths ("1 e and a"). Being able to count sixteenths out loud is the single most useful rhythmic skill there is, and it takes about a week to acquire.',
            'The grid is not the music — but you cannot deliberately place something off the grid until you can feel where the grid is.',
          ],
        },
        {
          kind: 'concept',
          title: 'Syncopation is accented weakness',
          lede: 'Put the emphasis where the listener is not expecting weight.',
          body: [
            '**Syncopation** means accenting a beat or subdivision that the meter treats as weak — the "and" of 2, the "e" of 4, or a note that ties across a barline.',
            'The reason it works is prediction. Your brain is continuously guessing where the next accent lands. Syncopation violates that guess in a controlled way, and the small surprise reads as energy.',
            'This is also why *removing* a hit is as powerful as adding one. A missing kick on beat 3 is felt just as strongly as an unexpected one on the offbeat.',
          ],
          widget: {
            type: 'drumMachine',
            patternId: 'garage',
            caption: 'UK garage: the kick skips beat 3 entirely. The absence is the hook.',
          },
        },
        {
          kind: 'concept',
          title: 'Swing: the grid bends',
          body: [
            'Swing delays every second subdivision. At full swing the pair becomes a triplet — long, short, long, short. At zero it is perfectly even.',
            'But real swing is continuous, not binary. Most great grooves sit somewhere between the two, and DAWs express this as a percentage. Boom bap lives around 54–58%. Jazz sits closer to full triplet feel. House is usually dead straight.',
            'A 2% change in swing can be the difference between a beat that feels mechanical and one that feels human. It is worth spending real time on.',
          ],
          widget: {
            type: 'drumMachine',
            patternId: 'boom-bap',
            caption: 'Boom bap with swing. Take the swing to zero and hear it stiffen.',
          },
          callouts: [
            {
              variant: 'pro',
              title: 'Push and pull',
              text: 'Swing is global. Micro-timing is per-instrument. Dragging the snare 8–15 ms late makes a beat feel laid back; pushing the hats 5 ms early makes it feel urgent. Great programmed drums almost always have both.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'Why does syncopation create a sense of energy?',
          options: [
            'It makes the music louder',
            'It violates the listener\'s prediction of where the next accent falls',
            'It speeds up the tempo',
            'It adds more notes per bar',
          ],
          answer: 1,
          explain:
            'Listeners continuously predict the next strong beat. Accenting a weak position defeats that prediction in a controlled way, and the resulting small surprise is experienced as drive.',
          reviewId: 'rhythm-syncopation-why',
          reviewCategory: 'rhythm',
        },
      ],
    },
    {
      id: 'polyrhythm-clave',
      title: 'Polyrhythm & Clave',
      summary: 'Two grids at once, and the pattern that organises a whole band.',
      minutes: 10,
      xp: 50,
      requires: ['subdivision-syncopation'],
      cards: [
        {
          kind: 'concept',
          title: 'Three against two',
          body: [
            'A **polyrhythm** is two conflicting subdivisions running simultaneously. In a 3:2 polyrhythm one voice divides the span into three and another into two; they only coincide at the start and end.',
            'The result is a shimmer — the ear cannot settle on either grid as the true one, so it oscillates between them. West African music is built on this. So is a great deal of modern math rock and jazz.',
            'The classic mnemonic for 3:2 is the phrase "nice cup of tea", where the syllables land on the composite rhythm.',
          ],
        },
        {
          kind: 'concept',
          title: 'Euclidean rhythms',
          body: [
            'Take some number of hits and distribute them as evenly as possible across some number of steps. That simple algorithm generates a startling proportion of the world\'s traditional rhythms.',
            'Three hits in eight steps gives the Cuban tresillo — and, transposed to modern production, the backbone of reggaeton and a great deal of trap. Five in eight gives the cinquillo. Five in sixteen gives the bossa nova pattern.',
            'It is a good reminder that "exotic" rhythms are not arbitrary. They are what maximal evenness sounds like when the numbers do not divide neatly.',
          ],
          widget: {
            type: 'euclidean',
            pulses: 3,
            steps: 8,
            caption: 'Move the sliders. Watch how many named world rhythms fall out of pure arithmetic.',
          },
        },
        {
          kind: 'concept',
          title: 'Clave: the rhythmic key signature',
          body: [
            'In Afro-Cuban music the **clave** is a five-stroke pattern spanning two bars that every other part is felt against. It is not a groove you play over — it is the organising reference the whole ensemble aligns to.',
            'A band is either "in clave" or "out of clave", and being out of it is a real mistake in the tradition, not a stylistic choice. Reversing the two halves (3-2 versus 2-3) changes which bar carries the weight and changes the entire feel of an arrangement.',
            'Once you can hear clave, you start hearing it everywhere in salsa, Latin jazz, New Orleans music, and a lot of pop production that borrowed from all three.',
          ],
          widget: {
            type: 'drumMachine',
            patternId: 'son-clave',
            caption: 'The 3-2 son clave. Five strokes that organise everything else.',
          },
        },
        {
          kind: 'quiz',
          question: 'A 3:2 polyrhythm resolves — both parts line up again — after how many subdivisions?',
          options: ['3', '5', '6', '12'],
          answer: 2,
          explain:
            'Six — the lowest common multiple of 3 and 2. The two grids coincide at the start, drift apart, and meet again after six subdivisions. That cycle length is what gives a polyrhythm its characteristic shimmer.',
          reviewId: 'rhythm-32-polyrhythm',
          reviewCategory: 'rhythm',
        },
        {
          kind: 'quiz',
          question: 'Which rhythm does the Euclidean pattern E(3,8) produce?',
          options: ['The backbeat', 'The tresillo', 'A waltz', 'The amen break'],
          answer: 1,
          explain:
            'The tresillo — three hits spread as evenly as possible across eight steps, landing on 1, the "and" of 2, and 4. It underpins Cuban music, reggaeton, and a great deal of contemporary trap.',
          reviewId: 'rhythm-euclidean-38',
          reviewCategory: 'rhythm',
        },
      ],
    },
    {
      id: 'tempo-and-feel',
      title: 'Tempo & Feel',
      summary: 'BPM, half-time, and the numbers every producer memorises.',
      minutes: 7,
      xp: 35,
      requires: ['pulse-and-meter'],
      cards: [
        {
          kind: 'concept',
          title: 'Tempo is not the same as energy',
          body: [
            'Trap is usually written at 140 BPM but *feels* like 70, because the snare only lands on beat 3. That is **half-time feel**: the tempo is unchanged, but the backbeat is spread across twice the distance.',
            'The reverse — **double-time** — puts twice as many backbeats in the same span and doubles the perceived urgency without touching the BPM.',
            'This decoupling is enormously useful. It lets hi-hats stay busy at 140 while the whole track breathes at 70.',
          ],
        },
        {
          kind: 'concept',
          title: 'Delay times you will use forever',
          body: [
            'Every tempo-synced effect comes from one formula: **60,000 ÷ BPM = the length of a quarter note in milliseconds.**',
            'At 120 BPM a quarter note is 500 ms, an eighth is 250 ms, a sixteenth is 125 ms. A dotted eighth — the classic guitar and synth delay — is 375 ms.',
            'The same numbers set reverb pre-delay, compressor release times, and LFO rates. Knowing this one calculation is the difference between effects that lock into a track and effects that smear it.',
          ],
          widget: {
            type: 'delayCalc',
            bpm: 120,
            caption: 'Every useful delay time at your tempo. Dotted eighth is the one to try first.',
          },
          callouts: [
            {
              variant: 'pro',
              title: 'Release times',
              text: 'Set a compressor\'s release to roughly an eighth or sixteenth note at the track tempo. The gain reduction then breathes in time with the music instead of pumping against it.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'At 120 BPM, how long is a dotted eighth note in milliseconds?',
          options: ['250 ms', '375 ms', '500 ms', '750 ms'],
          answer: 1,
          explain:
            '60,000 ÷ 120 = 500 ms for a quarter note. An eighth is 250 ms, and a dot adds half again: 250 + 125 = 375 ms. This is the classic rhythmic delay setting.',
          reviewId: 'rhythm-dotted-eighth-120',
          reviewCategory: 'production',
        },
        {
          kind: 'quiz',
          question: 'What makes a 140 BPM trap beat feel like 70 BPM?',
          options: [
            'The tempo is automated downward',
            'The backbeat falls only on beat 3, spreading the groove over twice the span',
            'The hi-hats are played at half speed',
            'The kick drum is pitched down',
          ],
          answer: 1,
          explain:
            'Half-time feel. With the snare on beat 3 only, the listener perceives the backbeat cycle as twice as long, so the track feels half as fast — while the hats can stay busy at the real tempo.',
          reviewId: 'rhythm-half-time',
          reviewCategory: 'rhythm',
        },
      ],
    },
  ],
};

export const chromaticStage: Stage = {
  id: 'chromatic',
  title: 'Chromatic Harmony',
  tagline: 'Leaving the key on purpose',
  description:
    'Everything interesting in harmony happens when you step outside the seven notes — deliberately, and with a way back.',
  tier: 'advanced',
  glyph: '🌗',
  color: palette.rose,
  gradient: ['#FB7185', '#D946EF'],
  lessons: [
    {
      id: 'secondary-dominants',
      title: 'Secondary Dominants',
      summary: 'Borrow a V chord from a key you are not in.',
      minutes: 10,
      xp: 55,
      cards: [
        {
          kind: 'concept',
          title: 'Any chord can be a temporary tonic',
          lede: 'If V→I is the strongest move in music, use it on chords other than I.',
          body: [
            'In C major, the ii chord is Dm. The dominant of D would be A7 — a chord containing C♯, which is not in C major at all.',
            'Play C – A7 – Dm and the A7 makes the Dm land far harder than it otherwise would. You have borrowed a dominant from another key purely to strengthen an arrival. That is a **secondary dominant**, written V/ii ("five of two").',
            'You can do this for almost any diatonic chord: V/ii, V/iii, V/IV, V/V, V/vi. Each one adds exactly one chromatic note and instantly sounds more sophisticated.',
          ],
          widget: {
            type: 'progression',
            romans: ['I', 'VI7', 'ii7', 'V7', 'I'],
            tonic: 'C',
            mode: 'major',
            progressionId: 'secondary-dominant',
            caption: 'A7 is V/ii — it makes the Dm7 feel like an arrival rather than a step.',
          },
        },
        {
          kind: 'concept',
          title: 'How to spot one in the wild',
          body: [
            'A secondary dominant is almost always a major or dominant-7th chord where the key would predict a minor one, and it resolves down a fifth.',
            'In C major, seeing an E7 where you expected Em is the tell. E7 contains G♯, which points at A — and sure enough the next chord is usually Am.',
            'The Beatles used these constantly, which is a large part of why their harmony sounds richer than the three-chord songs around them while remaining completely singable.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'Instant sophistication',
              text: 'Take any progression that goes to vi. Insert the dominant of vi immediately before it. C–F–G–Am becomes C–F–E7–Am. One chord changed, and the whole thing sounds considered.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'In the key of C major, what chord is V/V?',
          options: ['G7', 'D7', 'A7', 'E7'],
          answer: 1,
          explain:
            'D7. The V of C is G, and the V of G is D — so D7 is "five of five". It contains F♯, which is outside C major, and it pulls hard into the G chord.',
          reviewId: 'chromatic-v-of-v',
          reviewCategory: 'chromatic',
        },
      ],
    },
    {
      id: 'modal-interchange',
      title: 'Borrowed Chords',
      summary: 'Steal from the parallel minor and everything gets wistful.',
      minutes: 9,
      xp: 55,
      requires: ['secondary-dominants'],
      cards: [
        {
          kind: 'concept',
          title: 'Two keys, one tonic',
          body: [
            'C major and C minor share a tonic but almost nothing else. **Modal interchange** means writing in one and borrowing chords from the other.',
            'The most-used borrowings from parallel minor into major are **iv** (minor four), **♭VI**, **♭VII** and **♭III**. Each brings a flat degree into an otherwise bright key, and the effect is immediate and reliable: wistfulness, nostalgia, a shadow crossing the room.',
            'The minor iv in particular is one of the most emotionally efficient chords available. C – F – Fm – C has broken more hearts than most entire albums.',
          ],
          widget: {
            type: 'progression',
            romans: ['Imaj7', 'iv7', 'Imaj7', 'bVImaj7'],
            tonic: 'C',
            mode: 'major',
            progressionId: 'modal-interchange',
            caption: 'The iv and ♭VI are borrowed from C minor. Listen for the drop.',
          },
        },
        {
          kind: 'concept',
          title: 'Why it works',
          body: [
            'Borrowed chords work because the tonic does not move. Your ear stays anchored to the same home note, so it interprets the foreign chords as a change of *lighting* rather than a change of location.',
            'That is the crucial difference from modulation. Modulating means moving house. Modal interchange means the same room at dusk.',
            'Because the anchor holds, you can borrow very freely without confusing anyone — far more freely than beginners usually dare.',
          ],
          callouts: [
            {
              variant: 'listen',
              text: 'Radiohead, the Beach Boys, and most Disney ballads lean on borrowed minor chords in major keys. Once you know the sound, you cannot stop hearing it.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'Why does a borrowed chord not sound like a key change?',
          options: [
            'It is played more quietly',
            'The tonic stays the same, so the ear reads it as a change of colour rather than location',
            'It only lasts one beat',
            'It contains no chromatic notes',
          ],
          answer: 1,
          explain:
            'Modal interchange keeps the tonal centre fixed and swaps chords around it. Since home has not moved, the ear interprets the foreign notes as shading. Modulation, by contrast, actually relocates the tonic.',
          reviewId: 'chromatic-interchange-why',
          reviewCategory: 'chromatic',
        },
      ],
    },
    {
      id: 'tritone-sub',
      title: 'Tritone Substitution',
      summary: 'Two dominants that share a tritone can swap places.',
      minutes: 9,
      xp: 60,
      requires: ['secondary-dominants'],
      cards: [
        {
          kind: 'concept',
          title: 'The same tritone, two roots',
          body: [
            'G7 contains B and F. D♭7 contains F and C♭ — which is the same note as B. The two chords share their tritone entirely; only the roots differ, and those roots are a tritone apart.',
            'Since the tritone is what makes a dominant resolve, and both chords contain the same one, either can resolve to C. G7 → C is the standard cadence. D♭7 → C is the tritone substitution.',
            'The difference is the bass. Instead of falling a fifth, the root slides down a semitone into the tonic — smoother, sleeker, unmistakably jazz.',
          ],
          widget: {
            type: 'progression',
            romans: ['ii7', 'bII7', 'Imaj7'],
            tonic: 'C',
            mode: 'major',
            progressionId: 'tritone-sub',
            caption: 'Dm7 – D♭7 – Cmaj7. The bass walks down chromatically: D, D♭, C.',
          },
        },
        {
          kind: 'concept',
          title: 'When to reach for it',
          body: [
            'Any V7 can be substituted. The classic use is in a ii–V–I, turning Dm7 – G7 – Cmaj7 into Dm7 – D♭7 – Cmaj7, which produces a chromatically descending bass line.',
            'It also changes the available tensions. What was the ♭9 of G7 becomes the natural 13 of D♭7, so the substitution recolours the melody options as well as the bass.',
            'Use it sparingly. Substituting every dominant makes a tune sound like a demonstration rather than a piece of music.',
          ],
        },
        {
          kind: 'quiz',
          question: 'Which chord is the tritone substitution for G7?',
          options: ['C7', 'D♭7', 'E7', 'B♭7'],
          answer: 1,
          explain:
            'D♭7 — a tritone away from G. Both chords contain the tritone B/F (spelled C♭/F in D♭7), so both resolve naturally to C. The substitution replaces a falling fifth in the bass with a falling semitone.',
          reviewId: 'chromatic-tritone-sub-g7',
          reviewCategory: 'chromatic',
        },
      ],
    },
    {
      id: 'modulation',
      title: 'Modulation',
      summary: 'Moving the tonic without losing the listener.',
      minutes: 10,
      xp: 60,
      requires: ['modal-interchange'],
      cards: [
        {
          kind: 'concept',
          title: 'Changing home',
          body: [
            'Modulation is a genuine change of tonal centre — not a borrowed chord, but a new home that the music then treats as home.',
            'The easiest destinations are the **closely related keys**: the dominant (up a fifth), the subdominant (down a fifth), and the relative major or minor. Each of these shares six of seven notes with the original, so the move is almost frictionless.',
            'The further you go around the circle of fifths, the more notes change, and the more preparation the listener needs to follow you.',
          ],
          widget: { type: 'circle', caption: 'Neighbouring keys share six of seven notes. Distance on the wheel is distance to the ear.' },
        },
        {
          kind: 'concept',
          title: 'Three ways to get there',
          body: [
            '**Pivot chord.** Find a chord that exists in both keys, land on it, then reinterpret it as belonging to the new key. Smooth to the point of being invisible — the listener does not notice the seam.',
            '**Direct (pump-up).** Just move everything up a semitone or a tone with no preparation. It is blunt, obvious, and enormously effective in the last chorus of a pop song for exactly that reason.',
            '**Common tone.** Hold a single note while everything underneath it changes. The held note becomes the bridge, and the shift feels like a camera move rather than a cut.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'The dominant shortcut',
              text: 'The fastest way into any key is to play its V7 chord. A dominant seventh points at exactly one tonic, so one chord is often enough to relocate the listener entirely.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'Which key is most closely related to C major?',
          options: ['F♯ major', 'G major', 'E♭ major', 'B major'],
          answer: 1,
          explain:
            'G major — one step clockwise on the circle of fifths, differing from C major by a single note (F♯). Closely related keys share six of their seven notes, which is what makes modulating between them so smooth.',
          reviewId: 'chromatic-closely-related',
          reviewCategory: 'chromatic',
        },
        {
          kind: 'quiz',
          question: 'What is a pivot chord?',
          options: [
            'A chord played in the bass only',
            'A chord that belongs to both the old key and the new one',
            'The final chord of a piece',
            'A chord built on the tritone',
          ],
          answer: 1,
          explain:
            'A chord shared by both keys. The music arrives at it in the old key and leaves it in the new one, so the modulation happens without a perceptible seam.',
          reviewId: 'chromatic-pivot-chord',
          reviewCategory: 'chromatic',
        },
      ],
    },
  ],
};
