import { palette } from '../theme';
import { WidgetSpec } from './types';

/**
 * Standalone tools.
 *
 * Each one wraps a widget the curriculum already uses, so there is exactly one
 * implementation of every interactive idea in the app.
 */

export interface Tool {
  id: string;
  title: string;
  blurb: string;
  glyph: string;
  color: string;
  /** Longer explanation shown at the top of the tool screen. */
  description: string;
  widget: WidgetSpec;
  /** Extra widgets stacked below the primary one. */
  extras?: WidgetSpec[];
}

export const TOOLS: Tool[] = [
  {
    id: 'keyboard',
    title: 'Keyboard',
    blurb: 'Four octaves, eight instruments, always in tune.',
    glyph: '🎹',
    color: palette.violet,
    description:
      'A plain playable keyboard. Change the instrument in Settings — the same notes through a pad and through a pluck teach different things.',
    widget: { type: 'piano', startMidi: 48, octaves: 3, labelMode: 'c-only' },
  },
  {
    id: 'chord-detective',
    title: 'Chord Detective',
    blurb: 'Play anything; it tells you what you played.',
    glyph: '🔎',
    color: palette.cyan,
    description:
      'Hold any combination of notes and this names it — with alternatives, because chord identification is genuinely ambiguous. C E G A is both C6 and Am7, and which one it *is* depends on what comes next.',
    widget: { type: 'chordDetective' },
  },
  {
    id: 'circle',
    title: 'Circle of Fifths',
    blurb: 'Every key, every signature, one wheel.',
    glyph: '🎡',
    color: palette.fuchsia,
    description:
      'Tap any key to hear its I–IV–V–I. Keys next to each other differ by one accidental and share six of seven notes, which is why modulating between neighbours is so smooth.',
    widget: { type: 'circle' },
  },
  {
    id: 'interval-lab',
    title: 'Interval Lab',
    blurb: 'Every interval, with the song that unlocks it.',
    glyph: '📐',
    color: palette.teal,
    description:
      'Build any interval, hear it melodically or harmonically, and get the reference song that will make it stick.',
    widget: { type: 'intervalLab' },
  },
  {
    id: 'fretboard',
    title: 'Fretboard',
    blurb: 'Scales and chords mapped to guitar.',
    glyph: '🎸',
    color: palette.amber,
    description:
      'Scale degrees mapped across twelve frets, so shapes stop being memorised patterns and start being visible intervals.',
    widget: { type: 'fretboard', scale: { tonic: 'A', scaleId: 'minor-pentatonic' } },
  },
  {
    id: 'scale-explorer',
    title: 'Scale Explorer',
    blurb: '35 scales, every tonic, played on demand.',
    glyph: '🪜',
    color: palette.emerald,
    description:
      'From the major scale to Hirajoshi. Each one comes with its degrees, its mood, and where you have actually heard it.',
    widget: { type: 'scale', tonic: 'C', scaleId: 'ionian' },
  },
  {
    id: 'chord-builder',
    title: 'Chord Builder',
    blurb: 'Triads through 13ths, with inversions.',
    glyph: '🧱',
    color: palette.indigo,
    description:
      'Every chord quality in the app, on the keyboard and on the staff, with a tension rating and a note on where it belongs.',
    widget: { type: 'chord', symbol: 'Cmaj7' },
    extras: [{ type: 'chordSet', symbols: ['C', 'Cm', 'Cdim', 'Caug', 'Csus4', 'C7', 'Cmaj7', 'Cm7', 'C9', 'C13'] }],
  },
  {
    id: 'voicing-lab',
    title: 'Voicing Lab',
    blurb: 'Seven ways to play one chord.',
    glyph: '🗂️',
    color: palette.rose,
    description:
      'Close, open, drop 2, drop 3, shell, rootless, spread. Identical notes, completely different results — this is the difference between knowing chords and being able to use them.',
    widget: { type: 'voicings', symbol: 'Cmaj9' },
  },
  {
    id: 'progression-lab',
    title: 'Progression Lab',
    blurb: '25 progressions with the mechanism explained.',
    glyph: '🔗',
    color: palette.violet,
    description:
      'Play any progression in any key, with smooth voice leading applied automatically, and read why it works rather than just that it does.',
    widget: {
      type: 'progression',
      romans: ['I', 'V', 'vi', 'IV'],
      tonic: 'C',
      mode: 'major',
      progressionId: 'i-v-vi-iv',
    },
  },
  {
    id: 'mode-lab',
    title: 'Mode Lab',
    blurb: 'All seven modes over a drone.',
    glyph: '🎨',
    color: palette.fuchsia,
    description:
      'Ordered by brightness rather than by scale degree, each one over a tonic drone — because a mode only sounds like a mode when the bass agrees with it.',
    widget: { type: 'modeCompare', tonic: 'D' },
  },
  {
    id: 'metronome',
    title: 'Metronome',
    blurb: 'Any tempo, any meter, any subdivision.',
    glyph: '⏱️',
    color: palette.coral,
    description:
      'Sample-accurate timing scheduled on the audio clock, so it will not drift the way a JavaScript timer would.',
    widget: { type: 'metronome', bpm: 100, beats: 4 },
  },
  {
    id: 'drum-machine',
    title: 'Drum Machine',
    blurb: '12 genre patterns you can edit live.',
    glyph: '🥁',
    color: palette.amber,
    description:
      'Load a genre pattern, then break it. Move the snare off the backbeat, remove the kick from beat 3, push the swing — every change is audible immediately.',
    widget: { type: 'drumMachine', patternId: 'boom-bap' },
  },
  {
    id: 'euclidean',
    title: 'Euclidean Rhythms',
    blurb: 'World rhythms from pure arithmetic.',
    glyph: '⚙️',
    color: palette.lime,
    description:
      'Distribute N hits as evenly as possible across M steps and traditional rhythms fall out — the tresillo, the cinquillo, the bossa clave. Move the sliders and find them.',
    widget: { type: 'euclidean', pulses: 3, steps: 8 },
  },
  {
    id: 'delay-calc',
    title: 'Delay Calculator',
    blurb: 'Every tempo-synced time, in milliseconds.',
    glyph: '📊',
    color: palette.sky,
    description:
      'The most-used numbers in a mixing session. Delay times, reverb pre-delay, compressor release — they all come from the same calculation.',
    widget: { type: 'delayCalc', bpm: 120 },
  },
  {
    id: 'synth-lab',
    title: 'Envelope Lab',
    blurb: 'ADSR, driving a real voice.',
    glyph: '📈',
    color: palette.emerald,
    description:
      'Shape the envelope and play it. The curve on screen is the curve you are hearing — turn the attack up to two seconds and any waveform becomes a string section.',
    widget: { type: 'adsr' },
  },
  {
    id: 'filter-lab',
    title: 'Filter Lab',
    blurb: 'Seven filter types with true response curves.',
    glyph: '🎛️',
    color: palette.cyan,
    description:
      'The plot is computed from the actual biquad coefficients, not sketched. Push the resonance and watch the peak appear exactly where you hear it.',
    widget: { type: 'filter' },
  },
  {
    id: 'waveform-lab',
    title: 'Waveform Lab',
    blurb: 'Shapes and their harmonic recipes.',
    glyph: '〰️',
    color: palette.violet,
    description:
      'Every waveform next to its harmonic series. This is the picture that makes subtractive synthesis click — a saw has every harmonic, a square only the odd ones, a sine exactly one.',
    widget: { type: 'waveform' },
  },
  {
    id: 'compressor-lab',
    title: 'Compressor Lab',
    blurb: 'The transfer curve, made visible.',
    glyph: '🎚️',
    color: palette.rose,
    description:
      'Threshold, ratio and knee plotted as the real transfer function. Below the threshold the curve follows unity; above it, the slope flattens — and that flattening is the whole effect.',
    widget: { type: 'compressor' },
  },
  {
    id: 'frequency-map',
    title: 'Frequency Map',
    blurb: 'What lives where in a mix.',
    glyph: '🌈',
    color: palette.gold,
    description:
      'The six working bands and what belongs in each. Mixing is mostly deciding who owns which range and getting everyone else out of the way.',
    widget: { type: 'frequencyBands' },
  },
];

export const TOOLS_BY_ID: Record<string, Tool> = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
