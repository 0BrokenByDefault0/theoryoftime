import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, palette, radius, spacing, type } from '../../theme';
import {
  DELAY_PRESETS,
  DRUM_PATTERNS,
  DRUM_PATTERNS_BY_ID,
  DrumVoice,
  EUCLIDEAN_EXAMPLES,
  delayMs,
  euclideanRhythm,
  tempoLabel,
} from '../../theory';
import { audioEngine } from '../../audio/engine';
import { Envelope, Waveform } from '../../audio/instruments';
import { useDrumLoop, useMetronome } from '../../audio/useAudio';
import { DrumLoop } from '../../audio/sequencer';
import {
  ADSRCurve,
  CompressorCurve,
  FilterCurve,
  FilterType,
  FrequencyBands,
  HarmonicSpectrum,
  WaveformShape,
} from '../music/Curves';
import { RhythmGrid, RhythmStrip, GridTrack } from '../music/RhythmGrid';
import { PlayButton } from '../ui/Button';
import { DataRow, Pill } from '../ui/Text';
import { ChipRow, ParamSlider, WidgetFrame, useInstrument } from './shared';

const DRUM_COLORS: Record<string, string> = {
  kick: palette.rose,
  snare: palette.amber,
  clap: palette.gold,
  hat: palette.cyan,
  openhat: palette.sky,
  rim: palette.lime,
  perc: palette.violet,
};

// ── Metronome ─────────────────────────────────────────────────────────────

export function MetronomeWidget({
  bpm: initialBpm = 100,
  beats: initialBeats = 4,
  caption,
}: {
  bpm?: number;
  beats?: number;
  caption?: string;
}) {
  const [bpm, setBpm] = useState(initialBpm);
  const [beats, setBeats] = useState(initialBeats);
  const [subdivision, setSubdivision] = useState(1);

  const { running, beat, toggle } = useMetronome({ bpm, beats, subdivision });

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.title}>{Math.round(bpm)}</Text>
          <Text style={type.caption}>BPM · {tempoLabel(bpm)}</Text>
        </View>
        <PlayButton playing={running} onPress={toggle} size={52} />
      </View>

      <View style={styles.beatRow}>
        {Array.from({ length: beats }, (_, i) => (
          <View
            key={i}
            style={[
              styles.beatDot,
              beat === i
                ? { backgroundColor: i === 0 ? palette.gold : palette.violet, transform: [{ scale: 1.25 }] }
                : null,
            ]}
          />
        ))}
      </View>

      <ParamSlider
        label="Tempo"
        value={bpm}
        min={40}
        max={220}
        step={1}
        onChange={setBpm}
        format={(v) => `${Math.round(v)} BPM`}
      />

      <Text style={[type.overline, { marginTop: spacing.sm, marginBottom: 6 }]}>Beats per bar</Text>
      <ChipRow
        options={[2, 3, 4, 5, 6, 7].map((n) => ({ value: n, label: String(n) }))}
        value={beats}
        onChange={setBeats}
      />

      <Text style={[type.overline, { marginTop: spacing.md, marginBottom: 6 }]}>Subdivision</Text>
      <ChipRow
        options={[
          { value: 1, label: 'Quarters' },
          { value: 2, label: 'Eighths' },
          { value: 3, label: 'Triplets' },
          { value: 4, label: 'Sixteenths' },
        ]}
        value={subdivision}
        onChange={setSubdivision}
        tint={palette.cyan}
      />
    </WidgetFrame>
  );
}

// ── Drum machine ──────────────────────────────────────────────────────────

export function DrumMachineWidget({
  patternId = 'four-on-floor',
  caption,
}: {
  patternId?: string;
  caption?: string;
}) {
  const preset = DRUM_PATTERNS_BY_ID[patternId] ?? DRUM_PATTERNS[0];
  const [currentId, setCurrentId] = useState(preset.id);
  const [bpm, setBpm] = useState(preset.bpm);
  const [swing, setSwing] = useState(preset.swing ?? 0);
  const [tracks, setTracks] = useState<GridTrack[]>(() => toTracks(preset.id));

  // Switching preset replaces the whole grid; the sliders follow the preset's
  // own tempo and swing so each one arrives sounding the way it should.
  const loadPreset = useCallback((id: string) => {
    const next = DRUM_PATTERNS_BY_ID[id];
    if (!next) return;
    setCurrentId(id);
    setBpm(next.bpm);
    setSwing(next.swing ?? 0);
    setTracks(toTracks(id));
  }, []);

  const loopTracks = useMemo(
    () => tracks.map((t) => ({ voice: t.id, hits: t.hits })),
    [tracks],
  );

  const { running, step, toggle } = useDrumLoop({ bpm, steps: 16, tracks: loopTracks, swing });

  const toggleCell = useCallback((trackId: string, stepIndex: number) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              hits: t.hits.includes(stepIndex)
                ? t.hits.filter((h) => h !== stepIndex)
                : [...t.hits, stepIndex].sort((a, b) => a - b),
            }
          : t,
      ),
    );
  }, []);

  const info = DRUM_PATTERNS_BY_ID[currentId];

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>{info?.name}</Text>
          <Text style={type.caption}>{info?.genre}</Text>
        </View>
        <PlayButton playing={running} onPress={toggle} size={48} />
      </View>

      <View style={{ marginVertical: spacing.md }}>
        <RhythmGrid tracks={tracks} currentStep={step} onToggle={toggleCell} compact />
      </View>

      <ParamSlider
        label="Tempo"
        value={bpm}
        min={60}
        max={190}
        step={1}
        onChange={setBpm}
        format={(v) => `${Math.round(v)} BPM`}
      />
      <ParamSlider
        label="Swing"
        value={swing}
        min={0}
        max={1}
        onChange={setSwing}
        format={(v) => `${Math.round(50 + v * 16.7)}%`}
        tint={palette.amber}
      />

      {info ? <Text style={[type.small, { marginTop: spacing.sm }]}>{info.note}</Text> : null}

      <Text style={[type.overline, { marginTop: spacing.md, marginBottom: 6 }]}>Presets</Text>
      <ChipRow
        options={DRUM_PATTERNS.map((p) => ({ value: p.id, label: p.name }))}
        value={currentId}
        onChange={loadPreset}
      />
    </WidgetFrame>
  );
}

function toTracks(patternId: string): GridTrack[] {
  const pattern = DRUM_PATTERNS_BY_ID[patternId];
  if (!pattern) return [];
  return pattern.tracks.map((t) => ({
    id: t.id,
    label: t.label,
    hits: [...t.hits],
    color: DRUM_COLORS[t.id] ?? palette.violet,
  }));
}

// ── Euclidean rhythm ──────────────────────────────────────────────────────

export function EuclideanWidget({
  pulses: initialPulses = 3,
  steps: initialSteps = 8,
  caption,
}: {
  pulses?: number;
  steps?: number;
  caption?: string;
}) {
  const [pulses, setPulses] = useState(initialPulses);
  const [steps, setSteps] = useState(initialSteps);
  const [rotation, setRotation] = useState(0);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [loop, setLoop] = useState<DrumLoop | null>(null);

  const pattern = useMemo(
    () => euclideanRhythm(Math.round(pulses), Math.round(steps), Math.round(rotation)),
    [pulses, steps, rotation],
  );

  const named = EUCLIDEAN_EXAMPLES.find(
    (e) => e.pulses === Math.round(pulses) && e.steps === Math.round(steps),
  );

  useEffect(() => () => loop?.stop(), [loop]);

  const toggle = useCallback(() => {
    loop?.stop();
    if (running) {
      setRunning(false);
      setCurrentStep(-1);
      setLoop(null);
      return;
    }
    const hits = pattern.flatMap((on, i) => (on ? [i] : []));
    const next = new DrumLoop({
      bpm: 110,
      steps: Math.round(steps),
      tracks: [
        { voice: 'perc', hits },
        { voice: 'hat', hits: Array.from({ length: Math.round(steps) }, (_, i) => i) },
      ],
      onStep: setCurrentStep,
    });
    next.start();
    setLoop(next);
    setRunning(true);
  }, [loop, running, pattern, steps]);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>
            E({Math.round(pulses)}, {Math.round(steps)})
          </Text>
          <Text style={type.caption}>{named ? named.name : 'Custom pattern'}</Text>
        </View>
        <PlayButton playing={running} onPress={toggle} size={46} />
      </View>

      <View style={{ marginVertical: spacing.md }}>
        <RhythmStrip pattern={pattern} currentStep={currentStep} beatDivision={4} height={32} />
      </View>

      <ParamSlider
        label="Pulses"
        value={pulses}
        min={1}
        max={Math.round(steps)}
        step={1}
        onChange={setPulses}
        format={(v) => String(Math.round(v))}
      />
      <ParamSlider
        label="Steps"
        value={steps}
        min={2}
        max={16}
        step={1}
        onChange={(v) => {
          setSteps(v);
          if (pulses > v) setPulses(v);
        }}
        format={(v) => String(Math.round(v))}
        tint={palette.cyan}
      />
      <ParamSlider
        label="Rotation"
        value={rotation}
        min={0}
        max={Math.round(steps) - 1}
        step={1}
        onChange={setRotation}
        format={(v) => String(Math.round(v))}
        tint={palette.amber}
      />

      <Text style={[type.overline, { marginTop: spacing.sm, marginBottom: 6 }]}>Known rhythms</Text>
      <ChipRow
        options={EUCLIDEAN_EXAMPLES.map((e) => ({
          value: `${e.pulses}-${e.steps}`,
          label: `E(${e.pulses},${e.steps})`,
        }))}
        value={`${Math.round(pulses)}-${Math.round(steps)}`}
        onChange={(v) => {
          const [p, s] = String(v).split('-').map(Number);
          setSteps(s);
          setPulses(p);
          setRotation(0);
        }}
      />
    </WidgetFrame>
  );
}

// ── ADSR ──────────────────────────────────────────────────────────────────

const ADSR_PRESETS: Array<{ id: string; label: string; envelope: Envelope }> = [
  { id: 'pluck', label: 'Pluck', envelope: { attack: 0.002, decay: 0.25, sustain: 0, release: 0.2 } },
  { id: 'piano', label: 'Piano', envelope: { attack: 0.004, decay: 1.1, sustain: 0.15, release: 0.5 } },
  { id: 'organ', label: 'Organ', envelope: { attack: 0.02, decay: 0.05, sustain: 0.9, release: 0.1 } },
  { id: 'pad', label: 'Pad', envelope: { attack: 0.9, decay: 0.8, sustain: 0.8, release: 1.6 } },
  { id: 'swell', label: 'Swell', envelope: { attack: 1.8, decay: 0.4, sustain: 0.7, release: 2.2 } },
];

export function ADSRWidget({ caption }: { caption?: string }) {
  const [envelope, setEnvelope] = useState<Envelope>(ADSR_PRESETS[1].envelope);
  const [preset, setPreset] = useState('piano');

  const set = (key: keyof Envelope) => (value: number) => {
    setEnvelope((prev) => ({ ...prev, [key]: value }));
    setPreset('custom');
  };

  /**
   * Plays through the live engine rather than a mock, so the curve on screen
   * is genuinely the curve being heard.
   */
  const play = useCallback(() => {
    const now = audioEngine.now;
    [60, 64, 67].forEach((midi, i) => {
      audioEngine.playNote(midi, {
        instrument: 'sine',
        time: now + i * 0.06,
        duration: envelope.attack + envelope.decay + 0.6,
        velocity: 0.75,
      });
    });
  }, [envelope]);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>Envelope</Text>
          <Text style={type.caption}>Attack · Decay · Sustain · Release</Text>
        </View>
        <PlayButton playing={false} onPress={play} size={46} />
      </View>

      <View style={styles.center}>
        <ADSRCurve envelope={envelope} width={300} height={140} />
      </View>

      <ParamSlider
        label="Attack"
        value={envelope.attack}
        min={0.001}
        max={2}
        onChange={set('attack')}
        format={(v) => `${(v * 1000).toFixed(0)} ms`}
      />
      <ParamSlider
        label="Decay"
        value={envelope.decay}
        min={0.01}
        max={3}
        onChange={set('decay')}
        format={(v) => `${(v * 1000).toFixed(0)} ms`}
        tint={palette.cyan}
      />
      <ParamSlider
        label="Sustain"
        value={envelope.sustain}
        min={0}
        max={1}
        onChange={set('sustain')}
        format={(v) => `${Math.round(v * 100)}%`}
        tint={palette.emerald}
      />
      <ParamSlider
        label="Release"
        value={envelope.release}
        min={0.01}
        max={3}
        onChange={set('release')}
        format={(v) => `${(v * 1000).toFixed(0)} ms`}
        tint={palette.amber}
      />

      <Text style={[type.overline, { marginTop: spacing.sm, marginBottom: 6 }]}>Presets</Text>
      <ChipRow
        options={ADSR_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
        value={preset}
        onChange={(id) => {
          const found = ADSR_PRESETS.find((p) => p.id === id);
          if (found) {
            setEnvelope(found.envelope);
            setPreset(found.id);
          }
        }}
      />
    </WidgetFrame>
  );
}

// ── Filter ────────────────────────────────────────────────────────────────

export function FilterWidget({ caption }: { caption?: string }) {
  const [type_, setType] = useState<FilterType>('lowpass');
  const [cutoff, setCutoff] = useState(1200);
  const [q, setQ] = useState(1);
  const [gain, setGain] = useState(0);

  const play = useCallback(() => {
    // A saw chord has plenty of harmonics for the filter to act on.
    audioEngine.playChord([48, 55, 60, 64], {
      instrument: 'pad',
      duration: 2.2,
      velocity: 0.7,
    });
  }, []);

  const isShelfOrPeak = ['peaking', 'lowshelf', 'highshelf'].includes(type_);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>Filter response</Text>
          <Text style={type.caption}>
            {Math.round(cutoff)} Hz · Q {q.toFixed(1)}
          </Text>
        </View>
        <PlayButton playing={false} onPress={play} size={46} />
      </View>

      <View style={styles.center}>
        <FilterCurve type={type_} cutoff={cutoff} Q={q} gainDb={gain} width={310} height={160} />
      </View>

      <ChipRow
        options={[
          { value: 'lowpass' as FilterType, label: 'Low pass' },
          { value: 'highpass' as FilterType, label: 'High pass' },
          { value: 'bandpass' as FilterType, label: 'Band pass' },
          { value: 'peaking' as FilterType, label: 'Peak' },
          { value: 'lowshelf' as FilterType, label: 'Low shelf' },
          { value: 'highshelf' as FilterType, label: 'High shelf' },
          { value: 'notch' as FilterType, label: 'Notch' },
        ]}
        value={type_}
        onChange={setType}
      />

      <View style={{ marginTop: spacing.md }}>
        <ParamSlider
          label="Cutoff"
          value={cutoff}
          min={30}
          max={18000}
          step={10}
          onChange={setCutoff}
          format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} kHz` : `${Math.round(v)} Hz`)}
          tint={palette.cyan}
        />
        <ParamSlider
          label="Resonance (Q)"
          value={q}
          min={0.1}
          max={18}
          onChange={setQ}
          format={(v) => v.toFixed(1)}
          tint={palette.fuchsia}
        />
        {isShelfOrPeak ? (
          <ParamSlider
            label="Gain"
            value={gain}
            min={-24}
            max={24}
            step={0.5}
            onChange={setGain}
            format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`}
            tint={palette.amber}
          />
        ) : null}
      </View>
    </WidgetFrame>
  );
}

// ── Waveform ──────────────────────────────────────────────────────────────

const WAVEFORMS: Array<{ id: Waveform; label: string; note: string }> = [
  { id: 'sine', label: 'Sine', note: 'Fundamental only. No harmonics at all — pure and hollow.' },
  { id: 'triangle', label: 'Triangle', note: 'Odd harmonics falling off as 1/n². Soft, flute-like.' },
  { id: 'square', label: 'Square', note: 'Odd harmonics only. Hollow and woody, like a clarinet.' },
  { id: 'sawtooth', label: 'Saw', note: 'Every harmonic at 1/n. The brightest and richest of the four.' },
];

export function WaveformWidget({ caption }: { caption?: string }) {
  const [waveform, setWaveform] = useState<Waveform>('sawtooth');
  const info = WAVEFORMS.find((w) => w.id === waveform);

  const play = useCallback(() => {
    // Raw oscillator with no filter, so the harmonic content is unmasked.
    audioEngine.playNote(57, { instrument: 'sine', duration: 1.4, velocity: 0.6 });
    audioEngine.playNote(57, { instrument: waveform === 'sine' ? 'sine' : 'pluck', duration: 1.4 });
  }, [waveform]);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>{info?.label}</Text>
        </View>
        <PlayButton playing={false} onPress={play} size={44} />
      </View>

      <View style={styles.waveRow}>
        <View style={styles.waveCol}>
          <Text style={[type.overline, { marginBottom: 4 }]}>Shape</Text>
          <WaveformShape waveform={waveform} width={132} height={60} />
        </View>
        <View style={styles.waveCol}>
          <Text style={[type.overline, { marginBottom: 4 }]}>Harmonics</Text>
          <HarmonicSpectrum waveform={waveform} width={148} height={64} />
        </View>
      </View>

      <Text style={[type.small, { marginVertical: spacing.sm }]}>{info?.note}</Text>

      <ChipRow
        options={WAVEFORMS.map((w) => ({ value: w.id, label: w.label }))}
        value={waveform}
        onChange={setWaveform}
        tint={palette.emerald}
      />
    </WidgetFrame>
  );
}

// ── Compressor ────────────────────────────────────────────────────────────

export function CompressorWidget({ caption }: { caption?: string }) {
  const [threshold, setThreshold] = useState(-18);
  const [ratio, setRatio] = useState(4);
  const [knee, setKnee] = useState(6);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>Compressor</Text>
          <Text style={type.caption}>
            {threshold.toFixed(0)} dB · {ratio.toFixed(1)}:1
          </Text>
        </View>
        <Pill
          label={ratio >= 10 ? 'Limiting' : ratio >= 4 ? 'Compressing' : 'Gentle'}
          tint={ratio >= 10 ? palette.rose : ratio >= 4 ? palette.amber : palette.emerald}
        />
      </View>

      <View style={styles.center}>
        <CompressorCurve threshold={threshold} ratio={ratio} knee={knee} width={230} height={230} />
      </View>

      <ParamSlider
        label="Threshold"
        value={threshold}
        min={-60}
        max={0}
        step={0.5}
        onChange={setThreshold}
        format={(v) => `${v.toFixed(1)} dB`}
      />
      <ParamSlider
        label="Ratio"
        value={ratio}
        min={1}
        max={20}
        step={0.1}
        onChange={setRatio}
        format={(v) => `${v.toFixed(1)}:1`}
        tint={palette.amber}
      />
      <ParamSlider
        label="Knee"
        value={knee}
        min={0}
        max={24}
        step={0.5}
        onChange={setKnee}
        format={(v) => `${v.toFixed(1)} dB`}
        tint={palette.cyan}
      />

      <Text style={[type.small, { marginTop: spacing.sm }]}>
        Below the threshold the curve follows the dotted unity line — nothing happens. Above it, the
        slope flattens: that flattening is the compression.
      </Text>
    </WidgetFrame>
  );
}

// ── Frequency bands & delay calculator ────────────────────────────────────

export function FrequencyBandsWidget({ caption }: { caption?: string }) {
  return (
    <WidgetFrame caption={caption}>
      <FrequencyBands width={300} height={76} />
    </WidgetFrame>
  );
}

export function DelayCalcWidget({
  bpm: initialBpm = 120,
  caption,
}: {
  bpm?: number;
  caption?: string;
}) {
  const [bpm, setBpm] = useState(initialBpm);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.title}>{Math.round(bpm)}</Text>
          <Text style={type.caption}>BPM · {tempoLabel(bpm)}</Text>
        </View>
      </View>

      <ParamSlider
        label="Tempo"
        value={bpm}
        min={60}
        max={200}
        step={1}
        onChange={setBpm}
        format={(v) => `${Math.round(v)} BPM`}
      />

      <View style={{ marginTop: spacing.sm }}>
        {DELAY_PRESETS.map((preset) => (
          <DataRow
            key={preset.label}
            label={`${preset.label} — ${preset.note}`}
            value={`${delayMs(bpm, preset.beats).toFixed(1)} ms`}
            mono
            tint={palette.cyan}
          />
        ))}
      </View>
    </WidgetFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', marginVertical: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  beatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
    justifyContent: 'center',
  },
  beatDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  waveRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  waveCol: { flex: 1 },
});
