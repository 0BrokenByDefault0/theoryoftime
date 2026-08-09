import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Defs,
  G,
  Line,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { colors, palette, radius, spacing, type } from '../../theme';
import { Envelope, Waveform } from '../../audio/instruments';

/**
 * Visualisations for the production half of the curriculum.
 *
 * Each one is a genuine plot of the thing it describes — the filter curve is
 * computed from the biquad magnitude response, the compressor plot is the real
 * transfer function — so what a learner sees matches what they hear.
 */

// ── ADSR ──────────────────────────────────────────────────────────────────

export function ADSRCurve({
  envelope,
  width = 300,
  height = 130,
  color = palette.violet,
  /** Show which segment is which. */
  labels = true,
}: {
  envelope: Envelope;
  width?: number;
  height?: number;
  color?: string;
  labels?: boolean;
}) {
  const pad = 16;
  const w = width - pad * 2;
  const h = height - pad * 2 - (labels ? 14 : 0);

  // Normalise the times so the shape is readable whatever the absolute values.
  const { attack, decay, sustain, release } = envelope;
  const sustainHold = Math.max(0.25, (attack + decay + release) * 0.5);
  const total = attack + decay + sustainHold + release;
  const x = (t: number) => pad + (t / total) * w;
  const y = (level: number) => pad + h - level * h;

  const attackEnd = attack;
  const decayEnd = attack + decay;
  const sustainEnd = decayEnd + sustainHold;
  const releaseEnd = total;

  const path = [
    `M ${x(0)} ${y(0)}`,
    `L ${x(attackEnd)} ${y(1)}`,
    `L ${x(decayEnd)} ${y(sustain)}`,
    `L ${x(sustainEnd)} ${y(sustain)}`,
    `L ${x(releaseEnd)} ${y(0)}`,
  ].join(' ');

  const fillPath = `${path} L ${x(releaseEnd)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  const segments = [
    { label: 'A', from: 0, to: attackEnd },
    { label: 'D', from: attackEnd, to: decayEnd },
    { label: 'S', from: decayEnd, to: sustainEnd },
    { label: 'R', from: sustainEnd, to: releaseEnd },
  ];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id="adsr-fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.4" />
          <Stop offset="1" stopColor={color} stopOpacity="0.02" />
        </SvgGradient>
      </Defs>
      <Line x1={pad} y1={y(0)} x2={pad + w} y2={y(0)} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
      <Line x1={pad} y1={y(1)} x2={pad + w} y2={y(1)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
      <Path d={fillPath} fill="url(#adsr-fill)" />
      <Path d={path} stroke={color} strokeWidth={2.4} fill="none" strokeLinejoin="round" />

      {segments.map((seg) => (
        <G key={seg.label}>
          <Line
            x1={x(seg.to)}
            y1={pad}
            x2={x(seg.to)}
            y2={y(0)}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
          />
          {labels ? (
            <SvgText
              x={x((seg.from + seg.to) / 2)}
              y={height - 3}
              fontSize={10}
              fontWeight="800"
              fill={colors.textDim}
              textAnchor="middle"
            >
              {seg.label}
            </SvgText>
          ) : null}
        </G>
      ))}
    </Svg>
  );
}

// ── Filter response ───────────────────────────────────────────────────────

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'peaking' | 'lowshelf' | 'highshelf' | 'notch';

/**
 * Magnitude response of a biquad filter, computed from the standard RBJ
 * cookbook coefficients — the same maths the audio engine's filter runs.
 */
function biquadMagnitude(
  type: FilterType,
  freq: number,
  cutoff: number,
  Q: number,
  gainDb: number,
  sampleRate = 48000,
): number {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (2 * Math.PI * cutoff) / sampleRate;
  const cosw0 = Math.cos(w0);
  const sinw0 = Math.sin(w0);
  const alpha = sinw0 / (2 * Q);

  let b0 = 1;
  let b1 = 0;
  let b2 = 0;
  let a0 = 1;
  let a1 = 0;
  let a2 = 0;

  switch (type) {
    case 'lowpass':
      b0 = (1 - cosw0) / 2;
      b1 = 1 - cosw0;
      b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'highpass':
      b0 = (1 + cosw0) / 2;
      b1 = -(1 + cosw0);
      b2 = (1 + cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'bandpass':
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'notch':
      b0 = 1;
      b1 = -2 * cosw0;
      b2 = 1;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'peaking':
      b0 = 1 + alpha * A;
      b1 = -2 * cosw0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosw0;
      a2 = 1 - alpha / A;
      break;
    case 'lowshelf': {
      const sq = 2 * Math.sqrt(A) * alpha;
      b0 = A * (A + 1 - (A - 1) * cosw0 + sq);
      b1 = 2 * A * (A - 1 - (A + 1) * cosw0);
      b2 = A * (A + 1 - (A - 1) * cosw0 - sq);
      a0 = A + 1 + (A - 1) * cosw0 + sq;
      a1 = -2 * (A - 1 + (A + 1) * cosw0);
      a2 = A + 1 + (A - 1) * cosw0 - sq;
      break;
    }
    case 'highshelf': {
      const sq = 2 * Math.sqrt(A) * alpha;
      b0 = A * (A + 1 + (A - 1) * cosw0 + sq);
      b1 = -2 * A * (A - 1 + (A + 1) * cosw0);
      b2 = A * (A + 1 + (A - 1) * cosw0 - sq);
      a0 = A + 1 - (A - 1) * cosw0 + sq;
      a1 = 2 * (A - 1 - (A + 1) * cosw0);
      a2 = A + 1 - (A - 1) * cosw0 - sq;
      break;
    }
  }

  const w = (2 * Math.PI * freq) / sampleRate;
  const cosw = Math.cos(w);
  const cos2w = Math.cos(2 * w);
  const sinw = Math.sin(w);
  const sin2w = Math.sin(2 * w);

  const numRe = b0 + b1 * cosw + b2 * cos2w;
  const numIm = -(b1 * sinw + b2 * sin2w);
  const denRe = a0 + a1 * cosw + a2 * cos2w;
  const denIm = -(a1 * sinw + a2 * sin2w);

  const num = Math.sqrt(numRe * numRe + numIm * numIm);
  const den = Math.sqrt(denRe * denRe + denIm * denIm);
  return den === 0 ? 0 : num / den;
}

const MIN_HZ = 20;
const MAX_HZ = 20000;

export function FilterCurve({
  type = 'lowpass',
  cutoff = 1000,
  Q = 1,
  gainDb = 0,
  width = 320,
  height = 150,
  color = palette.cyan,
  showGrid = true,
}: {
  type?: FilterType;
  cutoff?: number;
  Q?: number;
  gainDb?: number;
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
}) {
  const pad = 18;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const DB_RANGE = 30;

  const xForHz = (hz: number) =>
    pad + (Math.log10(hz / MIN_HZ) / Math.log10(MAX_HZ / MIN_HZ)) * w;
  const yForDb = (db: number) => pad + h / 2 - (db / DB_RANGE) * (h / 2);

  const path = useMemo(() => {
    const points: string[] = [];
    const steps = 128;
    for (let i = 0; i <= steps; i++) {
      const hz = MIN_HZ * Math.pow(MAX_HZ / MIN_HZ, i / steps);
      const mag = biquadMagnitude(type, hz, cutoff, Q, gainDb);
      const db = Math.max(-DB_RANGE, Math.min(DB_RANGE, 20 * Math.log10(Math.max(mag, 1e-6))));
      points.push(`${i === 0 ? 'M' : 'L'} ${xForHz(hz).toFixed(2)} ${yForDb(db).toFixed(2)}`);
    }
    return points.join(' ');
  }, [type, cutoff, Q, gainDb, width, height]);

  const gridHz = [50, 100, 500, 1000, 5000, 10000];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id="filter-fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.28" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </SvgGradient>
      </Defs>

      {showGrid
        ? gridHz.map((hz) => (
            <G key={hz}>
              <Line
                x1={xForHz(hz)}
                y1={pad}
                x2={xForHz(hz)}
                y2={pad + h}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <SvgText
                x={xForHz(hz)}
                y={height - 4}
                fontSize={8.5}
                fill={colors.textFaint}
                textAnchor="middle"
                fontWeight="700"
              >
                {hz >= 1000 ? `${hz / 1000}k` : hz}
              </SvgText>
            </G>
          ))
        : null}

      <Line
        x1={pad}
        y1={yForDb(0)}
        x2={pad + w}
        y2={yForDb(0)}
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={1}
      />
      <Path d={`${path} L ${pad + w} ${pad + h} L ${pad} ${pad + h} Z`} fill="url(#filter-fill)" />
      <Path d={path} stroke={color} strokeWidth={2.4} fill="none" strokeLinejoin="round" />

      {/* Cutoff marker */}
      <Line
        x1={xForHz(cutoff)}
        y1={pad}
        x2={xForHz(cutoff)}
        y2={pad + h}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="3 4"
        opacity={0.7}
      />
    </Svg>
  );
}

// ── Compressor ────────────────────────────────────────────────────────────

export function CompressorCurve({
  threshold = -18,
  ratio = 4,
  knee = 6,
  width = 220,
  height = 220,
  color = palette.amber,
}: {
  threshold?: number;
  ratio?: number;
  knee?: number;
  width?: number;
  height?: number;
  color?: string;
}) {
  const pad = 24;
  const size = Math.min(width, height) - pad * 2;
  const MIN_DB = -60;

  const toX = (db: number) => pad + ((db - MIN_DB) / -MIN_DB) * size;
  const toY = (db: number) => pad + size - ((db - MIN_DB) / -MIN_DB) * size;

  /** The real soft-knee compressor transfer function. */
  const output = (input: number) => {
    const over = input - threshold;
    if (over <= -knee / 2) return input;
    if (over >= knee / 2) return threshold + over / ratio;
    // Quadratic interpolation across the knee.
    const x = over + knee / 2;
    return input + ((1 / ratio - 1) * x * x) / (2 * knee);
  };

  const path = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const input = MIN_DB + (i / 80) * -MIN_DB;
      points.push(`${i === 0 ? 'M' : 'L'} ${toX(input).toFixed(2)} ${toY(output(input)).toFixed(2)}`);
    }
    return points.join(' ');
  }, [threshold, ratio, knee, width, height]);

  return (
    <Svg width={width} height={height}>
      <Rect x={pad} y={pad} width={size} height={size} fill="rgba(255,255,255,0.03)" rx={8} />
      {/* Unity line — where output equals input */}
      <Line
        x1={toX(MIN_DB)}
        y1={toY(MIN_DB)}
        x2={toX(0)}
        y2={toY(0)}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      {/* Threshold */}
      <Line
        x1={toX(threshold)}
        y1={pad}
        x2={toX(threshold)}
        y2={pad + size}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="3 4"
        opacity={0.6}
      />
      <Path d={path} stroke={color} strokeWidth={2.6} fill="none" strokeLinejoin="round" />
      <SvgText x={pad} y={pad - 8} fontSize={9} fontWeight="700" fill={colors.textFaint}>
        OUT
      </SvgText>
      <SvgText
        x={pad + size}
        y={pad + size + 14}
        fontSize={9}
        fontWeight="700"
        fill={colors.textFaint}
        textAnchor="end"
      >
        IN (0 dB)
      </SvgText>
    </Svg>
  );
}

// ── Waveform shapes and harmonics ─────────────────────────────────────────

/** One cycle of a classic oscillator waveform. */
export function WaveformShape({
  waveform,
  width = 120,
  height = 54,
  color = palette.emerald,
  cycles = 2,
}: {
  waveform: Waveform;
  width?: number;
  height?: number;
  color?: string;
  cycles?: number;
}) {
  const path = useMemo(() => {
    const points: string[] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * cycles;
      const phase = t % 1;
      let value: number;
      switch (waveform) {
        case 'sine':
          value = Math.sin(phase * Math.PI * 2);
          break;
        case 'square':
          value = phase < 0.5 ? 1 : -1;
          break;
        case 'sawtooth':
          value = 2 * phase - 1;
          break;
        case 'triangle':
          value = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
          break;
      }
      const x = (i / steps) * width;
      const y = height / 2 - value * (height / 2 - 3);
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return points.join(' ');
  }, [waveform, width, height, cycles]);

  return (
    <Svg width={width} height={height}>
      <Line
        x1={0}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="rgba(255,255,255,0.09)"
        strokeWidth={1}
      />
      <Path d={path} stroke={color} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * The harmonic series of a waveform, drawn as bars.
 *
 * This is the picture that makes subtractive synthesis click: a saw has every
 * harmonic, a square has only the odd ones, and a sine has exactly one.
 */
export function HarmonicSpectrum({
  waveform,
  width = 200,
  height = 90,
  color = palette.fuchsia,
  count = 12,
}: {
  waveform: Waveform;
  width?: number;
  height?: number;
  color?: string;
  count?: number;
}) {
  const amplitudes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const n = i + 1;
      switch (waveform) {
        case 'sine':
          return n === 1 ? 1 : 0;
        case 'sawtooth':
          return 1 / n;
        case 'square':
          return n % 2 === 1 ? 1 / n : 0;
        case 'triangle':
          return n % 2 === 1 ? 1 / (n * n) : 0;
      }
    });
  }, [waveform, count]);

  const barWidth = width / count;

  return (
    <Svg width={width} height={height}>
      {amplitudes.map((amp, i) => (
        <Rect
          key={i}
          x={i * barWidth + barWidth * 0.18}
          y={height - Math.max(1.5, amp * (height - 12))}
          width={barWidth * 0.64}
          height={Math.max(1.5, amp * (height - 12))}
          rx={2}
          fill={i === 0 ? color : `${color}AA`}
        />
      ))}
      <Line x1={0} y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
    </Svg>
  );
}

/** A labelled frequency-band ruler used throughout the mixing lessons. */
export function FrequencyBands({ width = 320, height = 76 }: { width?: number; height?: number }) {
  const bands = [
    { from: 20, to: 60, label: 'Sub', note: 'Felt, not heard', color: palette.indigo },
    { from: 60, to: 250, label: 'Bass', note: 'Weight & warmth', color: palette.violet },
    { from: 250, to: 500, label: 'Low mid', note: 'Mud lives here', color: palette.fuchsia },
    { from: 500, to: 2000, label: 'Mid', note: 'Body & tone', color: palette.rose },
    { from: 2000, to: 6000, label: 'Presence', note: 'Clarity & attack', color: palette.amber },
    { from: 6000, to: 20000, label: 'Air', note: 'Sheen & space', color: palette.cyan },
  ];

  const xForHz = (hz: number) =>
    (Math.log10(hz / MIN_HZ) / Math.log10(MAX_HZ / MIN_HZ)) * width;

  return (
    <View>
      <Svg width={width} height={height}>
        {bands.map((band) => {
          const x1 = xForHz(band.from);
          const x2 = xForHz(band.to);
          return (
            <G key={band.label}>
              <Rect
                x={x1 + 1}
                y={0}
                width={Math.max(2, x2 - x1 - 2)}
                height={30}
                rx={5}
                fill={`${band.color}55`}
                stroke={`${band.color}AA`}
                strokeWidth={1}
              />
              <SvgText
                x={(x1 + x2) / 2}
                y={19}
                fontSize={9}
                fontWeight="800"
                fill={colors.text}
                textAnchor="middle"
              >
                {band.label}
              </SvgText>
              <SvgText
                x={(x1 + x2) / 2}
                y={44}
                fontSize={8}
                fontWeight="600"
                fill={colors.textDim}
                textAnchor="middle"
              >
                {band.from >= 1000 ? `${band.from / 1000}k` : band.from}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <View style={styles.bandLegend}>
        {bands.map((band) => (
          <View key={band.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: band.color }]} />
            <Text style={[type.caption, { fontSize: 10 }]} numberOfLines={1}>
              {band.note}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bandLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
  legendDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
});
