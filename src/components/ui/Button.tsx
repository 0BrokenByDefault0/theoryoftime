import React, { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Gradient, colors, gradients, hitSlop, motion, radius, spacing, type } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonSize = 'sm' | 'md' | 'lg';

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 38, paddingHorizontal: spacing.lg, fontSize: 14 },
  md: { height: 50, paddingHorizontal: spacing.xl, fontSize: 16 },
  lg: { height: 60, paddingHorizontal: spacing.xl, fontSize: 18 },
};

interface ButtonProps {
  label: string;
  onPress: () => void;
  gradient?: Gradient;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Fire a haptic tap on press. On by default for primary actions. */
  haptic?: boolean;
  fullWidth?: boolean;
}

/** Shared press-scale animation so every button in the app reacts identically. */
function usePress(disabled?: boolean) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    animatedStyle,
    onPressIn: () => {
      if (!disabled) scale.value = withSpring(0.955, motion.bouncy);
    },
    onPressOut: () => {
      scale.value = withSpring(1, motion.bouncy);
    },
  };
}

export function GradientButton({
  label,
  onPress,
  gradient = gradients.aurora,
  size = 'md',
  disabled,
  loading,
  icon,
  style,
  haptic = true,
  fullWidth = true,
}: ButtonProps) {
  const dims = SIZES[size];
  const press = usePress(disabled);

  return (
    <AnimatedPressable
      style={[
        styles.shadowWrap,
        { shadowColor: gradient[gradient.length - 1] },
        fullWidth ? styles.fullWidth : null,
        disabled || loading ? styles.disabled : null,
        press.animatedStyle,
        style,
      ]}
      disabled={disabled || loading}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        onPress();
      }}
    >
      <LinearGradient
        colors={gradient as unknown as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, { height: dims.height, paddingHorizontal: dims.paddingHorizontal }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.label, { fontSize: dims.fontSize }, icon ? styles.labelWithIcon : null]}>
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

export function GhostButton({
  label,
  onPress,
  size = 'md',
  disabled,
  icon,
  style,
  fullWidth = true,
  tint,
  haptic = false,
}: Omit<ButtonProps, 'gradient'> & { tint?: string }) {
  const dims = SIZES[size];
  const press = usePress(disabled);

  return (
    <AnimatedPressable
      style={[
        styles.button,
        styles.ghost,
        {
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          borderColor: tint ? `${tint}66` : colors.borderStrong,
        },
        fullWidth ? styles.fullWidth : null,
        disabled ? styles.disabled : null,
        press.animatedStyle,
        style,
      ]}
      disabled={disabled}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        if (haptic) Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
    >
      <View style={styles.row}>
        {icon}
        <Text
          style={[
            styles.label,
            { fontSize: dims.fontSize, color: tint ?? colors.text },
            icon ? styles.labelWithIcon : null,
          ]}
        >
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

/** A round icon button — play/stop transports, close buttons, steppers. */
export function IconButton({
  glyph,
  onPress,
  size = 44,
  tint = colors.text,
  background = colors.surfaceStrong,
  disabled,
  style,
  haptic = true,
  accessibilityLabel,
}: {
  glyph: string;
  onPress: () => void;
  size?: number;
  tint?: string;
  background?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  accessibilityLabel?: string;
}) {
  const press = usePress(disabled);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? glyph}
      hitSlop={hitSlop}
      style={[
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        disabled ? styles.disabled : null,
        press.animatedStyle,
        style,
      ]}
      disabled={disabled}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        if (haptic) Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
    >
      <Text style={{ fontSize: size * 0.42, color: tint }}>{glyph}</Text>
    </AnimatedPressable>
  );
}

/**
 * The transport button used everywhere audio is auditioned. It swaps glyph and
 * colour when playing, so there is never ambiguity about what pressing it does.
 */
export function PlayButton({
  playing,
  onPress,
  size = 56,
  gradient = gradients.aurora,
  label,
}: {
  playing: boolean;
  onPress: () => void;
  size?: number;
  gradient?: Gradient;
  label?: string;
}) {
  const press = usePress(false);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label ?? (playing ? 'Stop' : 'Play')}
      style={[
        styles.shadowWrap,
        { shadowColor: gradient[1] ?? gradient[0], borderRadius: size / 2 },
        press.animatedStyle,
      ]}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        onPress();
      }}
    >
      <LinearGradient
        colors={
          (playing ? ([colors.surfaceStrong, colors.surface] as const) : gradient) as unknown as readonly [
            string,
            string,
          ]
        }
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: size * 0.38, color: colors.text, marginLeft: playing ? 0 : 3 }}>
          {playing ? '■' : '▶'}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

/** Segmented control for switching between a handful of options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tint = colors.accent,
  style,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmented, style]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.segment,
              active ? { backgroundColor: `${tint}2E`, borderColor: `${tint}88` } : null,
            ]}
            onPress={() => {
              Haptics.selectionAsync().catch(() => undefined);
              onChange(option.value);
            }}
          >
            <Text
              style={[
                type.caption,
                { color: active ? colors.text : colors.textDim, textAlign: 'center' },
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.lg,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  button: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.surface,
  },
  fullWidth: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: {
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  labelWithIcon: { marginLeft: spacing.sm },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'transparent',
  },
  disabled: { opacity: 0.4 },
});
