import { palette } from '../../theme';
import { Stage } from '../types';

/**
 * Stage 9–11: sound design, mixing, and composition.
 *
 * These stages connect the theory to the thing most learners actually want to
 * do — make records. The synthesis lessons drive the real audio engine, so the
 * parameters being described are the parameters being heard.
 */

export const soundDesignStage: Stage = {
  id: 'sound-design',
  title: 'Sound Design',
  tagline: 'Building tone from scratch',
  description:
    'A synth is four modules and a signal path. Understand those and you can build any sound you can imagine — and reverse-engineer any sound you hear.',
  tier: 'proficient',
  glyph: '🎛️',
  color: palette.lime,
  gradient: ['#A3E635', '#14B8A6'],
  lessons: [
    {
      id: 'waveforms',
      title: 'Waveforms & Harmonics',
      summary: 'Why a saw sounds bright and a sine sounds like nothing.',
      minutes: 8,
      xp: 40,
      cards: [
        {
          kind: 'concept',
          title: 'Every sound is sine waves stacked up',
          lede: 'Timbre is not a mystery. It is a recipe of harmonics.',
          body: [
            'A sine wave is one frequency and nothing else. It sounds pure, flute-like, slightly boring — because there is nothing in it to analyse.',
            'Every other sound is a stack of sine waves: a **fundamental** that determines the pitch, plus **harmonics** at whole-number multiples of it. The relative levels of those harmonics are what your ear calls timbre.',
            'Change the recipe and you change the instrument, without changing the note at all. This is the entire basis of synthesis.',
          ],
          widget: {
            type: 'waveform',
            caption: 'Compare the four classic waveforms and their harmonic content.',
          },
        },
        {
          kind: 'concept',
          title: 'The four classic shapes',
          body: [
            '**Sine** — the fundamental only. Sub bass, soft leads, and the building block of FM synthesis.',
            '**Sawtooth** — every harmonic, each at 1/n amplitude. The brightest and richest of the four, and the starting point for strings, brass and supersaw leads.',
            '**Square** — odd harmonics only. Hollow and woody, like a clarinet. Narrow the pulse width and it thins out into something nasal and reedy.',
            '**Triangle** — odd harmonics at 1/n² amplitude, so they fall away fast. Almost as pure as a sine but with a little edge. Great for flutes and mellow bass.',
          ],
          callouts: [
            {
              variant: 'insight',
              title: 'Why square sounds hollow',
              text: 'A square wave has no even harmonics — no octaves above the fundamental in its spectrum. Your ear reads a missing octave series as hollowness, which is why clarinets and square waves share a family resemblance.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Detune and the supersaw',
          body: [
            'Layer two identical oscillators and you get the same sound, louder. Detune one slightly — a few cents — and their phases drift against each other, causing slow amplitude beating.',
            'That beating is what your ear reads as thickness, width and movement. It is the single cheapest way to make a synth sound expensive.',
            'Stack seven detuned saws and you have the supersaw — the defining sound of trance, and of a great deal of modern pop production.',
          ],
          callouts: [
            {
              variant: 'warning',
              text: 'Detuned oscillators in the sub-bass range cause the low end to wobble in and out of phase, which wrecks a mix. Keep the bottom octave mono and undetuned.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'Which waveform contains only odd harmonics?',
          options: ['Sine', 'Sawtooth', 'Square', 'White noise'],
          answer: 2,
          explain:
            'Square. It contains the 1st, 3rd, 5th, 7th harmonics and so on, with no even ones. The absence of the even series — including the octave — is what gives it its hollow, clarinet-like character.',
          reviewId: 'synth-square-harmonics',
          reviewCategory: 'sound-design',
        },
      ],
    },
    {
      id: 'filters',
      title: 'Filters',
      summary: 'Carving a sound out of a raw waveform.',
      minutes: 9,
      xp: 45,
      requires: ['waveforms'],
      cards: [
        {
          kind: 'concept',
          title: 'Subtractive synthesis: start rich, remove',
          body: [
            'The dominant approach to synthesis is subtractive: begin with a harmonically rich waveform and use a filter to remove what you do not want. It works the way sculpture works.',
            'A **low-pass** filter lets low frequencies through and attenuates highs above a cutoff point — this is by far the most used filter in music. A **high-pass** does the opposite, removing rumble and mud. A **band-pass** keeps only a slice.',
            'The **cutoff** sets where the filtering starts. **Resonance** (Q) boosts frequencies right at the cutoff point, creating a peak that whistles and, at high settings, self-oscillates into a sine wave.',
          ],
          widget: {
            type: 'filter',
            caption: 'Sweep the cutoff and watch the harmonics disappear. Push resonance and hear the peak sing.',
          },
        },
        {
          kind: 'concept',
          title: 'Slope: how steep is the cliff',
          body: [
            'Filters are rated in decibels per octave: 12 dB/oct (2-pole) or 24 dB/oct (4-pole) are the common ones.',
            'A gentle 12 dB slope is musical and leaves character above the cutoff. A steep 24 dB slope is surgical and cuts decisively. The classic Moog sound is a 24 dB ladder filter; the classic Oberheim sound is 12 dB.',
            'For mixing, steeper is usually better on a high-pass. For sound design, gentler often sounds more natural.',
          ],
        },
        {
          kind: 'concept',
          title: 'The filter envelope is where character lives',
          body: [
            'A static filter is just a tone control. What makes a synth expressive is *moving* the cutoff over the course of each note.',
            'Route an envelope to the cutoff and you get the classic synth gestures: a fast decay on the filter produces a pluck, a slow attack produces a swell, and a slow decay with high resonance produces the acid-house squelch.',
            'Nearly every recognisable synth sound in popular music is an oscillator plus a filter envelope. The oscillator is the raw material; the envelope is the performance.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'Key tracking',
              text: 'Link filter cutoff to pitch so high notes open the filter further. Without it, high notes sound progressively duller than low ones, because the fixed cutoff removes proportionally more of their harmonics.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'What does resonance (Q) do to a filter?',
          options: [
            'It makes the filter steeper',
            'It boosts frequencies right at the cutoff point',
            'It raises the overall volume',
            'It converts a low-pass into a high-pass',
          ],
          answer: 1,
          explain:
            'Resonance emphasises a narrow band at the cutoff frequency. Sweep a resonant filter and you hear that peak move through the harmonics — the classic synth whistle. At extreme settings the filter self-oscillates and produces a sine tone of its own.',
          reviewId: 'synth-resonance',
          reviewCategory: 'sound-design',
        },
      ],
    },
    {
      id: 'envelopes-lfos',
      title: 'Envelopes & LFOs',
      summary: 'ADSR, and the difference between a pluck and a pad.',
      minutes: 9,
      xp: 45,
      requires: ['filters'],
      cards: [
        {
          kind: 'concept',
          title: 'ADSR: four numbers that define a gesture',
          body: [
            '**Attack** — how long to reach full level. Fast is percussive; slow is a swell. **Decay** — how long to fall to the sustain level. **Sustain** — the level held while the key is down (a level, not a time). **Release** — how long to fade after the key is let go.',
            'Piano: near-zero attack, long decay, near-zero sustain. Organ: fast attack, full sustain, fast release — it just turns on and off. Pad: slow attack, high sustain, long release.',
            'Those three shapes cover an enormous amount of ground, and every one of them is the same oscillator underneath.',
          ],
          widget: {
            type: 'adsr',
            caption: 'Drag the envelope and play. The oscillator never changes — only the shape does.',
          },
        },
        {
          kind: 'concept',
          title: 'The attack transient carries the identity',
          body: [
            'Here is a genuinely surprising fact: if you record a piano note and a trumpet note, remove the first 50 milliseconds of each, and play them back, most listeners cannot reliably tell them apart.',
            'Almost all instrument recognition lives in the attack transient — the brief, noisy, chaotic moment when the sound starts. The sustained portion is far more generic than intuition suggests.',
            'For a producer this is enormously practical. Fix the transient and the sound reads correctly. Compress the transient away and even a great sample turns anonymous.',
          ],
          callouts: [
            {
              variant: 'listen',
              text: 'Set a synth to a 2-second attack and play a note. Whatever waveform you chose, it sounds like a string section — because you removed the only part that identified it as a synth.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'LFOs: modulation you can hear as movement',
          body: [
            'A **low-frequency oscillator** is an oscillator running below hearing range, used to modulate something else rather than to be heard directly.',
            'LFO to pitch is vibrato. LFO to amplitude is tremolo. LFO to filter cutoff is a wobble — the entire foundation of dubstep bass. LFO to pulse width is the slow shimmer of classic string machines.',
            'Rate and depth are the two controls that matter. Sync the rate to tempo and the movement locks to the track; leave it free-running and it drifts, which can sound more organic.',
          ],
        },
        {
          kind: 'quiz',
          question: 'Which ADSR setting produces a plucked sound?',
          options: [
            'Slow attack, high sustain, long release',
            'Fast attack, short decay, zero sustain',
            'Slow attack, zero decay, full sustain',
            'Fast attack, full sustain, long release',
          ],
          answer: 1,
          explain:
            'Fast attack, short decay, zero sustain — the sound appears instantly and dies away immediately, exactly like a plucked string. Adding sustain would turn it into a held tone.',
          reviewId: 'synth-pluck-adsr',
          reviewCategory: 'sound-design',
        },
        {
          kind: 'quiz',
          question: 'Why do instruments become hard to identify when their attack is removed?',
          options: [
            'The pitch changes',
            'Most timbral identity lives in the attack transient rather than the sustained tone',
            'The volume drops too low to hear',
            'The harmonics disappear',
          ],
          answer: 1,
          explain:
            'The transient — the brief chaotic onset — carries most of the information the ear uses to identify an instrument. Sustained portions of different instruments are far more similar to each other than they feel.',
          reviewId: 'synth-transient-identity',
          reviewCategory: 'sound-design',
        },
      ],
    },
  ],
};

export const mixingStage: Stage = {
  id: 'mixing',
  title: 'Arrangement & Mixing',
  tagline: 'Making it sound like a record',
  description:
    'Great parts badly arranged sound worse than modest parts well arranged. Frequency, dynamics, space — and the discipline of taking things away.',
  tier: 'advanced',
  glyph: '🎚️',
  color: palette.sky,
  gradient: ['#38BDF8', '#6366F1'],
  lessons: [
    {
      id: 'frequency-space',
      title: 'The Frequency Spectrum',
      summary: 'There is only so much room. Everything competes for it.',
      minutes: 9,
      xp: 50,
      cards: [
        {
          kind: 'concept',
          title: 'A mix is a space with finite room',
          lede: 'Two instruments in the same frequency range will always fight. One has to move.',
          body: [
            'The audible range spans roughly 20 Hz to 20 kHz, but musically useful energy is concentrated far more narrowly than that. When two sources occupy the same band at the same time, the ear cannot separate them — it hears one thicker, less distinct sound.',
            'This is called **masking**, and it is the fundamental problem mixing exists to solve. The solution is almost never "turn it up". It is to decide which element owns which range, and to get everything else out of the way.',
          ],
          widget: {
            type: 'frequencyBands',
            caption: 'The six working bands, and what lives in each.',
          },
        },
        {
          kind: 'concept',
          title: 'What lives where',
          body: [
            '**20–60 Hz (sub)** — felt more than heard. Kick and sub bass only; everything else should be filtered out of here.',
            '**60–250 Hz (bass)** — weight and warmth. Bass, kick body, the low end of guitars and piano. The most crowded region in most mixes.',
            '**250–500 Hz (low mid)** — where mud accumulates. If a mix sounds boxy or congested, this is almost always the culprit.',
            '**500 Hz–2 kHz (mid)** — body and tone. Vocals, snare, guitar. Your ear is highly sensitive here, so small changes have large effects.',
            '**2–6 kHz (presence)** — clarity, attack, intelligibility. Boost for definition, but this is also where harshness and listening fatigue live.',
            '**6–20 kHz (air)** — sheen and space. A gentle high shelf here is the classic "expensive" sound.',
          ],
        },
        {
          kind: 'concept',
          title: 'Subtractive EQ first',
          body: [
            'The instinct is to boost what you want more of. The discipline is to cut what you want less of.',
            'Cutting makes room without adding energy, avoids phase artefacts at the boosted frequency, and does not raise your overall level with every move. A mix built entirely from boosts ends up loud, harsh and no clearer than when you started.',
            'The most valuable single move in mixing: high-pass everything that is not a bass instrument. Most sources carry nothing useful below 100 Hz and plenty of energy that muddies the low end.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'Find the offending frequency',
              text: 'Set a narrow EQ band to a big boost, sweep it until the ugliness jumps out, then invert the gain to cut at that exact frequency. It takes ten seconds and works on almost any problem.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'A mix sounds boxy and congested. Which range should you look at first?',
          options: ['20–60 Hz', '250–500 Hz', '2–6 kHz', '10–20 kHz'],
          answer: 1,
          explain:
            '250–500 Hz, the low mids. Nearly every instrument has energy here, so it accumulates fast. A narrow cut around 300 Hz on a few non-essential sources usually clears a mix immediately.',
          reviewId: 'mix-mud-frequency',
          reviewCategory: 'production',
        },
        {
          kind: 'quiz',
          question: 'Why is cutting generally preferred to boosting?',
          options: [
            'Cutting is louder',
            'It creates space without adding energy or accumulating level across the mix',
            'Boosting is technically impossible on digital EQs',
            'Cutting has no effect on phase',
          ],
          answer: 1,
          explain:
            'Cutting makes room for other elements without raising overall level. A mix built from boosts gets progressively louder and harsher while the balance problems remain unsolved.',
          reviewId: 'mix-subtractive-eq',
          reviewCategory: 'production',
        },
      ],
    },
    {
      id: 'dynamics',
      title: 'Compression & Dynamics',
      summary: 'The most misunderstood tool in music production.',
      minutes: 10,
      xp: 55,
      requires: ['frequency-space'],
      cards: [
        {
          kind: 'concept',
          title: 'What a compressor actually does',
          body: [
            'A compressor turns down loud parts. That is the whole mechanism. Everything else — punch, glue, sustain, pumping — is a consequence of *when* and *how fast* it does that.',
            '**Threshold** is the level above which it starts working. **Ratio** is how hard it clamps: 4:1 means 4 dB over the threshold becomes 1 dB over. **Attack** is how quickly it responds. **Release** is how quickly it lets go. **Makeup gain** compensates for the level lost.',
            'The counter-intuitive part: a compressor makes things sound louder by making them quieter, then turning the whole thing up. The peaks come down, so the average can go up.',
          ],
          widget: {
            type: 'compressor',
            caption: 'The transfer curve. Below the threshold nothing happens; above it, the slope flattens.',
          },
        },
        {
          kind: 'concept',
          title: 'Attack and release are the creative controls',
          lede: 'Threshold and ratio decide how much. Attack and release decide what it sounds like.',
          body: [
            'A **slow attack** lets the initial transient through before clamping down. On a drum this makes the hit punchier — the stick attack survives while the body gets controlled.',
            'A **fast attack** catches the transient itself, flattening the hit. Useful for taming a spiky source, disastrous if you wanted punch.',
            'A **fast release** brings level back quickly, which raises perceived loudness and can cause audible pumping. A **slow release** is smoother and more transparent. Sync the release roughly to an eighth or sixteenth note and the compression breathes with the track.',
          ],
          callouts: [
            {
              variant: 'warning',
              title: 'The most common mistake',
              text: 'Using a fast attack on drums because it seems like it should control them better. It removes the transient — exactly the part that makes a drum sound like a drum. Start slow and only speed up if the source is genuinely out of control.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Parallel and sidechain compression',
          body: [
            '**Parallel compression** blends a heavily compressed copy under the uncompressed original. You get the density and sustain of extreme compression while keeping the original transients intact. It is the standard approach on drums and vocals.',
            '**Sidechain compression** uses one signal to trigger compression on another. Ducking the bass with the kick lets both occupy the low end without fighting — and pushed to extremes it becomes the pumping effect that defines a great deal of dance music.',
            'Both are cases of the same principle: rather than compromising a sound, run two versions and choose what you want from each.',
          ],
        },
        {
          kind: 'quiz',
          question: 'You want a snare to sound punchier. What attack setting?',
          options: [
            'Fastest possible, to catch the whole hit',
            'Slow enough to let the initial transient pass before compressing',
            'Attack has no effect on punch',
            'Turn the compressor off entirely',
          ],
          answer: 1,
          explain:
            'A slower attack (roughly 10–30 ms) lets the transient through untouched, then compresses the body. The contrast between the uncompressed spike and the controlled tail is what the ear reads as punch.',
          reviewId: 'mix-compressor-attack',
          reviewCategory: 'production',
        },
        {
          kind: 'quiz',
          question: 'What does parallel compression achieve?',
          options: [
            'It compresses two tracks at once',
            'It blends a heavily compressed copy under the original, adding density without losing transients',
            'It removes all dynamic range',
            'It compresses only the low frequencies',
          ],
          answer: 1,
          explain:
            'Mixing a crushed copy underneath the dry signal gives you the sustain and body of heavy compression while the original transients stay intact — density and punch at the same time.',
          reviewId: 'mix-parallel-compression',
          reviewCategory: 'production',
        },
      ],
    },
    {
      id: 'space-depth',
      title: 'Reverb, Delay & Space',
      summary: 'Turning a flat mix into a room.',
      minutes: 9,
      xp: 50,
      requires: ['dynamics'],
      cards: [
        {
          kind: 'concept',
          title: 'Depth comes from three cues',
          body: [
            'Your brain works out how far away a sound is from three things: how loud it is, how bright it is (air absorbs high frequencies over distance), and how much reflected sound arrives with it.',
            'So to push something back in a mix: turn it down slightly, roll off some top end, and add more reverb. To pull something forward: the reverse. Level alone is the weakest of the three cues and the one beginners over-rely on.',
          ],
        },
        {
          kind: 'concept',
          title: 'Pre-delay is the control that matters most',
          body: [
            '**Pre-delay** is the gap between the dry sound and the first reverb reflections. It corresponds physically to the distance between you and the nearest wall.',
            'A short pre-delay (0–10 ms) glues the reverb onto the source and makes it sound far away. A longer pre-delay (30–80 ms) keeps the dry signal clear and up front while still placing it in a large space — which is why it is the standard trick for vocals that need to be both intimate and grand.',
            'Set pre-delay to a musical value — a sixteenth or thirty-second note at the track tempo — and the reverb stops smearing the groove.',
          ],
          widget: {
            type: 'delayCalc',
            bpm: 120,
            caption: 'Use these values for pre-delay and delay times alike.',
          },
        },
        {
          kind: 'concept',
          title: 'Delay is often the better choice',
          body: [
            'Reverb adds density everywhere at once, which is why over-reverbed mixes turn to soup. A tempo-synced delay adds space while leaving gaps, so the mix stays defined.',
            'The standard producer move is a short slapback or a dotted-eighth delay with the feedback low and the wet signal filtered — high-passed so it does not muddy the low end, low-passed so it sits behind the source.',
            'A good default: always filter your sends. Reverb and delay returns almost never need anything below 300 Hz or above 8 kHz.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'One room, not five',
              text: 'Use one or two reverb sends for the whole mix rather than a separate reverb on every channel. Sources sharing a space sound like an ensemble; sources in different spaces sound like a collage.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'What does increasing pre-delay do?',
          options: [
            'Makes the reverb longer',
            'Separates the dry signal from the reverb, keeping the source clear and up front',
            'Removes low frequencies from the reverb',
            'Reduces the reverb volume',
          ],
          answer: 1,
          explain:
            'Pre-delay is the gap before the first reflections arrive. A longer gap keeps the dry sound distinct and forward while still placing it in a large space — the classic way to make a vocal intimate and huge at once.',
          reviewId: 'mix-predelay',
          reviewCategory: 'production',
        },
      ],
    },
    {
      id: 'arrangement',
      title: 'Arrangement',
      summary: 'The mix problem you should solve before mixing.',
      minutes: 9,
      xp: 50,
      requires: ['frequency-space'],
      cards: [
        {
          kind: 'concept',
          title: 'Most mix problems are arrangement problems',
          lede: 'If two things fight for the same space, the fix is usually to remove one.',
          body: [
            'When a mix will not come together, the cause is very often that too many elements are competing in the same frequency range at the same time. No amount of EQ fixes that — EQ can only redistribute what is already there.',
            'The real fix is arrangement: change an instrument\'s register, change its rhythm so it lands in the gaps, or cut it from that section entirely.',
            'Professional arrangements are usually far sparser than beginners expect. There is a reason the verse of a hit record often has four elements in it.',
          ],
        },
        {
          kind: 'concept',
          title: 'Contrast is what makes sections work',
          body: [
            'A chorus does not sound big because it is loud. It sounds big because the verse before it was small.',
            'Build contrast structurally: add elements, widen the stereo image, open the register upward, increase harmonic rhythm, bring the vocal double in. Then take some of it away for the next verse so the following chorus can lift again.',
            'The most common amateur mistake is having everything playing all the time. If the biggest moment in the track is also the only texture in the track, nothing can grow.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'The drop-everything trick',
              text: 'Cut the entire arrangement for one beat before a chorus. The silence costs nothing and makes the next bar feel twice as large as it is.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Register as an arrangement tool',
          body: [
            'Assign each element a lane and keep it there. Sub bass owns below 80 Hz. Bass owns 80–250. Chords sit in the mids. Melody and vocal sit above them. Percussion and air on top.',
            'When two elements must share a range, separate them in time instead — write the parts so they land in each other\'s gaps. Call and response is not just a stylistic device; it is a frequency-management strategy.',
          ],
        },
        {
          kind: 'quiz',
          question: 'A chorus does not feel big enough. What is the most effective first move?',
          options: [
            'Turn everything up',
            'Add more reverb',
            'Take elements out of the verse so the chorus has room to grow',
            'Add another layer of synths to the chorus',
          ],
          answer: 2,
          explain:
            'Impact is relative. If the verse is already full, the chorus has nothing to expand into. Thinning the verse costs nothing and makes the chorus land harder than any amount of added material.',
          reviewId: 'mix-chorus-contrast',
          reviewCategory: 'production',
        },
      ],
    },
    {
      id: 'loudness',
      title: 'Loudness & Mastering',
      summary: 'LUFS, headroom, and why the loudness war ended.',
      minutes: 8,
      xp: 45,
      requires: ['dynamics'],
      cards: [
        {
          kind: 'concept',
          title: 'Streaming changed the rules',
          body: [
            'Streaming platforms normalise playback loudness. Spotify, Apple Music and YouTube all turn tracks down to a target so that listeners are not constantly reaching for the volume.',
            'That means crushing a master to be as loud as possible no longer makes it louder in the listener\'s ears. It only makes it flatter, because the platform turns it down anyway — and now it is a squashed track playing at the same volume as a dynamic one.',
            'The loudness war is over, and dynamics won by default.',
          ],
        },
        {
          kind: 'concept',
          title: 'LUFS, and what to aim for',
          body: [
            '**LUFS** (Loudness Units relative to Full Scale) measures perceived loudness rather than peak level. Streaming targets sit around −14 LUFS integrated, though the exact figure varies by platform and changes over time.',
            'Practical guidance: master to somewhere between −14 and −9 LUFS depending on genre, and keep true peaks at or below −1 dBTP so lossy encoding does not introduce clipping.',
            'More important than any number: leave your mix around −6 dBFS of headroom before mastering. A mastering engineer — or a mastering plugin — cannot undo a mix that has already been squashed.',
          ],
          callouts: [
            {
              variant: 'warning',
              text: 'Never compare two versions of a track at different volumes. The louder one always sounds better for the first few seconds, whatever else is true about it. Level-match before you judge.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'What mastering actually is',
          body: [
            'Mastering is the final stage: gentle broad EQ, light compression for cohesion, limiting for level, and preparing the file for distribution. It is measured in fractions of a decibel.',
            'It is not a repair stage. If the low end is wrong, the vocal is buried, or the arrangement is cluttered, mastering cannot fix it — those are mix decisions and they have to be made in the mix.',
            'The best thing you can do for your master is deliver a mix that already sounds finished at a reasonable level.',
          ],
        },
        {
          kind: 'quiz',
          question: 'Why does over-limiting a master no longer make it louder on streaming?',
          options: [
            'Streaming platforms reject loud files',
            'Platforms normalise playback loudness, so a crushed track is simply turned down',
            'Limiters do not work on compressed audio formats',
            'Loud files use more bandwidth',
          ],
          answer: 1,
          explain:
            'Loudness normalisation turns every track toward a common target. A heavily limited master gets turned down to match a dynamic one, so all the crushing achieves is a loss of dynamics at the same playback volume.',
          reviewId: 'mix-loudness-normalisation',
          reviewCategory: 'production',
        },
      ],
    },
  ],
};

export const compositionStage: Stage = {
  id: 'composition',
  title: 'Composition',
  tagline: 'Putting it all to work',
  description:
    'Theory tells you what is possible. Composition is the practice of choosing. Melody, structure, reharmonisation, and knowing when to break your own rules.',
  tier: 'expert',
  glyph: '✍️',
  color: palette.gold,
  gradient: ['#FCD34D', '#FB923C', '#F43F5E'],
  lessons: [
    {
      id: 'melody-writing',
      title: 'Writing Melody',
      summary: 'Contour, range, repetition — what makes a line memorable.',
      minutes: 10,
      xp: 60,
      cards: [
        {
          kind: 'concept',
          title: 'Melody is mostly shape',
          body: [
            'People remember the **contour** of a melody — its rise and fall — far more reliably than its exact intervals. Hum a song you know and you will very likely get the shape right and some of the intervals wrong.',
            'So design the shape first. A good melody usually has one clear high point, arrives at it later than the midpoint, and moves mostly by step with a few deliberate leaps for drama.',
            'Leaps are expensive. Use one and the ear expects the line to turn around and fill in the gap by step. Ignoring that expectation repeatedly makes a melody feel restless and hard to sing.',
          ],
        },
        {
          kind: 'concept',
          title: 'Repetition is not laziness',
          body: [
            'Almost every memorable melody repeats a short motif, then varies it. Repetition is what makes something learnable in one listen; variation is what stops it being boring.',
            'The classic structure is **statement, repetition, departure** — say it, say it again (possibly transposed), then go somewhere new. It shows up in nursery rhymes, blues, and Beethoven.',
            'If a melody is not sticking, the problem is very often too much material rather than too little.',
          ],
          callouts: [
            {
              variant: 'pro',
              title: 'Sing it, do not draw it',
              text: 'Melodies written by clicking notes into a piano roll tend to have unsingable leaps and no breathing room. Sing the line first, even badly. Your voice enforces phrasing automatically.',
            },
          ],
        },
        {
          kind: 'concept',
          title: 'Tension notes and where to land',
          body: [
            'Chord tones (1, 3, 5, 7) are resting places. Non-chord tones are tension. A good melody spends its rhythmically strong beats on chord tones and uses tension notes as passing motion — or deliberately inverts that for effect.',
            'The most expressive single choice in melody writing is which chord tone you land on. Landing on the root sounds settled. The third sounds warm and defines the mood. The fifth sounds open and stable. The seventh sounds sophisticated and unresolved. The ninth sounds modern and floating.',
            'Same chord, same melody rhythm — completely different emotional result depending on which note you choose to hold.',
          ],
        },
        {
          kind: 'quiz',
          question: 'After a large melodic leap, what does the ear typically expect?',
          options: [
            'Another leap in the same direction',
            'Stepwise motion back in the opposite direction',
            'Silence',
            'A key change',
          ],
          answer: 1,
          explain:
            'Leaps create a gap the ear wants filled. Stepwise motion back in the opposite direction resolves that expectation, which is why melodies built from leap-then-step feel balanced and singable.',
          reviewId: 'comp-leap-resolution',
          reviewCategory: 'composition',
        },
      ],
    },
    {
      id: 'song-structure',
      title: 'Song Structure',
      summary: 'Why forms exist and what each section is for.',
      minutes: 9,
      xp: 55,
      requires: ['melody-writing'],
      cards: [
        {
          kind: 'concept',
          title: 'Sections have jobs',
          body: [
            '**Intro** establishes the world. **Verse** delivers information and stays relatively sparse. **Pre-chorus** builds tension and often withholds the tonic. **Chorus** is the emotional and melodic peak, and usually the most repetitive part. **Bridge** provides contrast — new harmony, new register, or a change of perspective. **Outro** releases.',
            'Common forms: verse–chorus, AABA (32-bar, the standard of the American songbook), 12-bar blues, and the loop-based structures of most electronic music where the "sections" are defined by which layers are present.',
          ],
        },
        {
          kind: 'concept',
          title: 'Harmonic rhythm is a structural tool',
          body: [
            '**Harmonic rhythm** is how often the chords change. Slow harmonic rhythm — one chord per two bars — feels spacious and lets a melody breathe. Fast harmonic rhythm creates urgency.',
            'Accelerating the harmonic rhythm into a chorus is one of the most reliable ways to build energy without adding a single instrument. Many pre-choruses do exactly this: two bars per chord, then one, then two chords per bar right before the drop.',
          ],
        },
        {
          kind: 'concept',
          title: 'Withhold the tonic',
          body: [
            'The tonic chord is home. Every bar you delay arriving there increases the satisfaction when you do.',
            'This is why so many pre-choruses avoid the I chord entirely, and why a chorus that opens on I lands so hard. It is also why loops built on vi–IV–I–V feel like they are always travelling — the I chord arrives in the middle rather than at the start.',
            'Delaying resolution is the cheapest and most powerful structural device available, and it costs nothing but patience.',
          ],
        },
        {
          kind: 'quiz',
          question: 'What is harmonic rhythm?',
          options: [
            'The rhythm played by the bass',
            'How frequently the chords change',
            'The strumming pattern of a guitar',
            'The tempo of a song',
          ],
          answer: 1,
          explain:
            'The rate of chord change. Slowing it creates space; accelerating it creates urgency. Speeding up harmonic rhythm into a chorus builds energy without adding any new instruments.',
          reviewId: 'comp-harmonic-rhythm',
          reviewCategory: 'composition',
        },
      ],
    },
    {
      id: 'reharmonisation',
      title: 'Reharmonisation',
      summary: 'Keep the melody, change everything underneath it.',
      minutes: 10,
      xp: 65,
      requires: ['song-structure'],
      cards: [
        {
          kind: 'concept',
          title: 'A melody note fits many chords',
          body: [
            'The note C is the root of C, the third of A♭, the fifth of F, the seventh of D♭maj7, the ninth of B♭, the eleventh of G minor and the thirteenth of E♭. One melody note, seven completely different harmonic contexts.',
            'Reharmonisation exploits this. Hold the melody, change the chords beneath it, and the same tune can go from cheerful to devastating without a single note of the melody moving.',
            'It is the core skill of jazz arranging, and it is the fastest way to make a familiar progression sound like yours.',
          ],
        },
        {
          kind: 'concept',
          title: 'A toolkit, roughly in order of risk',
          body: [
            '**Diatonic substitution** — swap a chord for another in the same functional family. I becomes vi or iii; IV becomes ii. Almost always safe.',
            '**Add extensions** — turn triads into sevenths and ninths. Colour without changing function.',
            '**Secondary dominants** — insert the V7 of whatever comes next. Adds pull and momentum.',
            '**Tritone substitution** — replace a V7 with the dominant a tritone away for a chromatic bass line.',
            '**Modal interchange** — borrow from the parallel minor for sudden emotional weight.',
            '**Constant structure** — move one voicing shape in parallel, ignoring function entirely. Modern, cinematic, and completely unbothered by the rules above.',
          ],
          widget: {
            type: 'progression',
            romans: ['Imaj7', 'VI7', 'ii7', 'V7', 'iii7', 'bIII7', 'ii7', 'V7'],
            tonic: 'C',
            mode: 'major',
            caption: 'A reharmonised turnaround: secondary dominants and a chromatic passing chord.',
          },
        },
        {
          kind: 'concept',
          title: 'Knowing when to stop',
          body: [
            'Reharmonisation is addictive, and the failure mode is obvious in retrospect: a version so dense that the original tune disappears underneath it.',
            'The test is whether the melody still sounds inevitable. If a listener who knows the song can still sing along without being thrown, the reharmonisation is working. If they cannot, you have written a different piece — which is fine, but you should know that is what happened.',
            'Restraint is the last thing anyone learns and the first thing that separates a good arrangement from a demonstration of technique.',
          ],
          callouts: [
            {
              variant: 'insight',
              text: 'Every rule in this app is a description of what listeners have been conditioned to expect. Breaking one on purpose, in a way you can hear and control, is not a mistake — it is the entire point of learning them.',
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'The melody note is C. Which of these chords does it function as the ninth of?',
          options: ['C major', 'F major', 'B♭ major', 'A minor'],
          answer: 2,
          explain:
            'B♭. The ninth of B♭ is C — a whole step above the root, an octave up. The same C is the root of C major, the fifth of F, and the third of A minor. One note, four functions.',
          reviewId: 'comp-reharm-ninth',
          reviewCategory: 'composition',
        },
      ],
    },
  ],
};
