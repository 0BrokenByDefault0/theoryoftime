import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, motion, palette } from '../../theme';
import { CIRCLE_OF_FIFTHS, Key, KeyMode, circleDistance, noteName, requireNote } from '../../theory';

const TAU = Math.PI * 2;

/** Point on a circle, with 0 at 12 o'clock and angles running clockwise. */
function polar(cx: number, cy: number, r: number, fraction: number) {
  const angle = fraction * TAU - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

/** SVG path for a donut segment between two radii. */
function ringSegment(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startFraction: number,
  endFraction: number,
): string {
  const p1 = polar(cx, cy, outerR, startFraction);
  const p2 = polar(cx, cy, outerR, endFraction);
  const p3 = polar(cx, cy, innerR, endFraction);
  const p4 = polar(cx, cy, innerR, startFraction);
  const largeArc = endFraction - startFraction > 0.5 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

interface CircleOfFifthsProps {
  size?: number;
  /** The currently selected key. Its segment lights up. */
  selected?: Key;
  onSelect?: (key: Key) => void;
  /**
   * Dim keys that are harmonically distant from the selection, so the
   * "closely related keys" idea becomes visible rather than memorised.
   */
  showRelatedness?: boolean;
  /** Show the key-signature accidental count in each outer segment. */
  showSignatures?: boolean;
}

/**
 * The circle of fifths, rendered as two concentric interactive rings.
 *
 * Outer ring: major keys. Inner ring: their relative minors. Adjacent keys
 * differ by exactly one accidental, which is the whole reason the layout is
 * worth learning — so the accidental counts are drawn right on the wheel.
 */
export function CircleOfFifths({
  size = 320,
  selected,
  onSelect,
  showRelatedness = true,
  showSignatures = true,
}: CircleOfFifthsProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const majorInnerR = outerR * 0.66;
  const minorOuterR = majorInnerR - 3;
  const minorInnerR = outerR * 0.36;

  const segments = useMemo(() => {
    const step = 1 / 12;
    return CIRCLE_OF_FIFTHS.map((position, i) => {
      // Rotate back by half a segment so C sits centred at the top.
      const start = i * step - step / 2;
      const end = start + step;
      const mid = (start + end) / 2;
      return { position, start, end, mid };
    });
  }, []);

  const relatedness = useMemo(() => {
    if (!selected || !showRelatedness) return null;
    const map = new Map<string, number>();
    CIRCLE_OF_FIFTHS.forEach((p) => {
      map.set(
        `${p.major}:major`,
        circleDistance(selected, { tonic: requireNote(p.major), mode: 'major' }),
      );
      map.set(
        `${p.minor}:minor`,
        circleDistance(selected, { tonic: requireNote(p.minor), mode: 'minor' }),
      );
    });
    return map;
  }, [selected, showRelatedness]);

  const opacityFor = (name: string, mode: KeyMode) => {
    if (!relatedness) return 1;
    const distance = relatedness.get(`${name}:${mode}`) ?? 6;
    // Distance 0–1 is "closely related"; beyond 3 the key shares few notes.
    return Math.max(0.22, 1 - distance * 0.16);
  };

  const isSelected = (name: string, mode: KeyMode) =>
    selected !== undefined &&
    selected.mode === mode &&
    noteName(selected.tonic, { unicode: false }) === name;

  const handlePress = (name: string, mode: KeyMode) => {
    Haptics.selectionAsync().catch(() => undefined);
    onSelect?.({ tonic: requireNote(name), mode });
  };

  const scale = useSharedValue(1);
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, motion.spring) }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="cof-major" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.violet} />
            <Stop offset="1" stopColor={palette.fuchsia} />
          </SvgGradient>
          <SvgGradient id="cof-minor" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.cyan} />
            <Stop offset="1" stopColor={palette.blue} />
          </SvgGradient>
        </Defs>

        {/* Major ring */}
        {segments.map(({ position, start, end, mid }) => {
          const active = isSelected(position.major, 'major');
          const label = polar(cx, cy, (majorInnerR + outerR) / 2, mid);
          const sig = polar(cx, cy, majorInnerR + (outerR - majorInnerR) * 0.24, mid);
          return (
            <G key={`major-${position.major}`} onPress={() => handlePress(position.major, 'major')}>
              <Path
                d={ringSegment(cx, cy, majorInnerR, outerR, start, end)}
                fill={active ? 'url(#cof-major)' : 'rgba(255,255,255,0.055)'}
                stroke={active ? palette.fuchsia : 'rgba(255,255,255,0.10)'}
                strokeWidth={active ? 1.6 : 1}
                opacity={opacityFor(position.major, 'major')}
              />
              <SvgText
                x={label.x}
                y={label.y + 6}
                fontSize={size * 0.058}
                fontWeight="800"
                fill={active ? '#FFFFFF' : colors.text}
                textAnchor="middle"
                opacity={opacityFor(position.major, 'major')}
              >
                {position.major}
              </SvgText>
              {showSignatures ? (
                <SvgText
                  x={sig.x}
                  y={sig.y + 3}
                  fontSize={size * 0.032}
                  fontWeight="700"
                  fill={active ? 'rgba(255,255,255,0.85)' : colors.textDim}
                  textAnchor="middle"
                  opacity={opacityFor(position.major, 'major')}
                >
                  {position.accidentals === 0
                    ? '—'
                    : position.accidentals > 0
                      ? `${position.accidentals}♯`
                      : `${Math.abs(position.accidentals)}♭`}
                </SvgText>
              ) : null}
            </G>
          );
        })}

        {/* Relative minor ring */}
        {segments.map(({ position, start, end, mid }) => {
          const active = isSelected(position.minor, 'minor');
          const label = polar(cx, cy, (minorInnerR + minorOuterR) / 2, mid);
          return (
            <G key={`minor-${position.minor}`} onPress={() => handlePress(position.minor, 'minor')}>
              <Path
                d={ringSegment(cx, cy, minorInnerR, minorOuterR, start, end)}
                fill={active ? 'url(#cof-minor)' : 'rgba(255,255,255,0.03)'}
                stroke={active ? palette.cyan : 'rgba(255,255,255,0.08)'}
                strokeWidth={active ? 1.5 : 0.8}
                opacity={opacityFor(position.minor, 'minor')}
              />
              <SvgText
                x={label.x}
                y={label.y + 4.5}
                fontSize={size * 0.042}
                fontWeight="700"
                fill={active ? '#FFFFFF' : colors.textMuted}
                textAnchor="middle"
                opacity={opacityFor(position.minor, 'minor')}
              >
                {position.minor}m
              </SvgText>
            </G>
          );
        })}

        {/* Hub */}
        <Circle
          cx={cx}
          cy={cy}
          r={minorInnerR - 4}
          fill="rgba(10,12,24,0.85)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
        {selected ? (
          <>
            <SvgText
              x={cx}
              y={cy - 2}
              fontSize={size * 0.085}
              fontWeight="800"
              fill={colors.text}
              textAnchor="middle"
            >
              {noteName(selected.tonic)}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + size * 0.055}
              fontSize={size * 0.037}
              fontWeight="700"
              fill={selected.mode === 'major' ? palette.fuchsia : palette.cyan}
              textAnchor="middle"
            >
              {selected.mode.toUpperCase()}
            </SvgText>
          </>
        ) : (
          <SvgText
            x={cx}
            y={cy + 4}
            fontSize={size * 0.038}
            fontWeight="700"
            fill={colors.textDim}
            textAnchor="middle"
          >
            Tap a key
          </SvgText>
        )}
      </Svg>
    </Animated.View>
  );
}

/**
 * A stripped-down wheel for lesson illustrations — no interaction, just the
 * twelve positions with an optional set highlighted.
 */
export function MiniCircle({
  size = 130,
  highlight = [],
  tint = palette.violet,
}: {
  size?: number;
  /** Major key names to light up, e.g. ['C','G','F']. */
  highlight?: string[];
  tint?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;

  return (
    <View style={styles.center}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={1} fill="none" />
        {CIRCLE_OF_FIFTHS.map((position, i) => {
          const point = polar(cx, cy, r, i / 12);
          const on = highlight.includes(position.major);
          return (
            <G key={position.major}>
              <Circle cx={point.x} cy={point.y} r={on ? 11 : 8} fill={on ? tint : 'rgba(255,255,255,0.07)'} />
              <SvgText
                x={point.x}
                y={point.y + 3.5}
                fontSize={9}
                fontWeight="800"
                fill={on ? '#0A0C18' : colors.textDim}
                textAnchor="middle"
              >
                {position.major}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
