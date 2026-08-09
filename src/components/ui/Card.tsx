import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Gradient, colors, gradients, motion, radius, shadow, spacing } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BaseCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  padding?: number;
}

/**
 * The workhorse surface: a translucent panel with a hairline border and a
 * subtle top-light gradient, so cards read as glass rather than as flat boxes.
 */
export function GlassCard({
  children,
  style,
  onPress,
  disabled,
  padding = spacing.lg,
  /** Colour the border and inner glow — used to tint a card by curriculum stage. */
  tint,
}: BaseCardProps & { tint?: string }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const content = (
    <>
      <LinearGradient
        colors={gradients.ghost as unknown as readonly [string, string]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {tint ? (
        <LinearGradient
          colors={[`${tint}22`, 'transparent'] as unknown as readonly [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={{ padding }}>{children}</View>
    </>
  );

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    tint ? { borderColor: `${tint}44` } : null,
    disabled ? styles.disabled : null,
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{content}</View>;

  return (
    <AnimatedPressable
      style={[cardStyle, animatedStyle]}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.975, motion.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring);
      }}
      onPress={onPress}
    >
      {content}
    </AnimatedPressable>
  );
}

/**
 * A solid gradient card for hero moments — the current lesson, a completed
 * milestone, the daily goal.
 */
export function GradientCard({
  children,
  style,
  onPress,
  disabled,
  padding = spacing.lg,
  gradient = gradients.aurora,
  glowColor,
}: BaseCardProps & { gradient?: Gradient; glowColor?: string }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const content = (
    <LinearGradient
      colors={gradient as unknown as readonly [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientInner, { padding }]}
    >
      {children}
    </LinearGradient>
  );

  const cardStyle: StyleProp<ViewStyle> = [
    styles.gradientCard,
    glowColor
      ? {
          shadowColor: glowColor,
          shadowOpacity: 0.45,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        }
      : shadow.soft,
    disabled ? styles.disabled : null,
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{content}</View>;

  return (
    <AnimatedPressable
      style={[cardStyle, animatedStyle]}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.975, motion.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring);
      }}
      onPress={onPress}
    >
      {content}
    </AnimatedPressable>
  );
}

/**
 * A card that pulses when it becomes active. Used by the lesson player to draw
 * the eye to whatever is currently playing.
 */
export function PulseCard({
  children,
  active,
  color = colors.accent,
  style,
  padding = spacing.lg,
}: {
  children: ReactNode;
  active: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(active ? color : 'rgba(255,255,255,0.09)', { duration: motion.quick }),
    transform: [{ scale: withSpring(active ? 1.02 : 1, motion.spring) }],
    shadowOpacity: withTiming(active ? 0.5 : 0, { duration: motion.quick }),
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        { shadowColor: color, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } },
        animatedStyle,
        style,
      ]}
    >
      <View style={{ padding }}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  gradientCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  gradientInner: {
    borderRadius: radius.xl,
  },
  disabled: {
    opacity: 0.45,
  },
});
