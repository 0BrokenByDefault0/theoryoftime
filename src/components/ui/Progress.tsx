import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Gradient, colors, gradients, radius, spacing, type } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingProps {
  /** 0–1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  gradient?: Gradient;
  /** Rendered in the middle of the ring. */
  children?: React.ReactNode;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}

/** An animated progress ring. Used for stage mastery and daily goals. */
export function ProgressRing({
  progress,
  size = 72,
  strokeWidth = 7,
  gradient = gradients.aurora,
  children,
  trackColor = 'rgba(255,255,255,0.10)',
  style,
}: RingProps) {
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const animated = useSharedValue(0);
  const gradientId = React.useId();

  useEffect(() => {
    animated.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 700 });
  }, [progress, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradient[0]} />
            <Stop offset="1" stopColor={gradient[gradient.length - 1]} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          // Start at 12 o'clock instead of 3 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ? <View style={styles.ringCenter}>{children}</View> : null}
    </View>
  );
}

/** A horizontal progress bar with a gradient fill. */
export function ProgressBar({
  progress,
  height = 8,
  gradient = gradients.aurora,
  style,
  trackColor = 'rgba(255,255,255,0.08)',
}: {
  progress: number;
  height?: number;
  gradient?: Gradient;
  style?: StyleProp<ViewStyle>;
  trackColor?: string;
}) {
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 600 });
  }, [progress, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animated.value * 100}%`,
  }));

  return (
    <View
      style={[
        { height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' },
        style,
      ]}
    >
      <Animated.View style={[{ height: '100%', borderRadius: height / 2 }, fillStyle]}>
        <LinearGradient
          colors={gradient as unknown as readonly [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** XP bar with level markers — the persistent progress readout. */
export function XPBar({
  xp,
  level,
  xpIntoLevel,
  xpForLevel,
  style,
}: {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <View style={styles.xpHeader}>
        <View style={styles.row}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{level}</Text>
          </View>
          <Text style={[type.small, { color: colors.text, marginLeft: spacing.sm }]}>
            Level {level}
          </Text>
        </View>
        <Text style={type.caption}>
          {xpIntoLevel} / {xpForLevel} XP
        </Text>
      </View>
      <ProgressBar progress={xpForLevel ? xpIntoLevel / xpForLevel : 0} height={9} />
      <Text style={[type.caption, { marginTop: spacing.xs }]}>{xp.toLocaleString()} XP total</Text>
    </View>
  );
}

/** A small labelled statistic. Used across the profile and lesson summaries. */
export function Stat({
  value,
  label,
  tint = colors.text,
  style,
}: {
  value: string | number;
  label: string;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.stat, style]}>
      <Text style={[type.numeral, { color: tint, fontSize: 26 }]}>{value}</Text>
      <Text style={[type.caption, { marginTop: 2 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Streak flame with the count. Small, but it is the retention hook. */
export function StreakBadge({ days, style }: { days: number; style?: StyleProp<ViewStyle> }) {
  const alive = days > 0;
  return (
    <View
      style={[
        styles.streak,
        { borderColor: alive ? 'rgba(245,158,11,0.5)' : colors.border },
        style,
      ]}
    >
      <Text style={{ fontSize: 15, opacity: alive ? 1 : 0.35 }}>🔥</Text>
      <Text
        style={[
          type.small,
          { color: alive ? colors.text : colors.textDim, marginLeft: 5, fontWeight: '800' },
        ]}
      >
        {days}
      </Text>
    </View>
  );
}

/** Dot row showing position within a lesson. */
export function StepDots({
  count,
  index,
  tint = colors.accent,
  style,
}: {
  count: number;
  index: number;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.dots, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === index
              ? { backgroundColor: tint, width: 20 }
              : i < index
                ? { backgroundColor: `${tint}88` }
                : null,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  stat: { alignItems: 'center', flex: 1 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.surface,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});
