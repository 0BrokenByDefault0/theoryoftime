import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Gradient, colors, gradients, spacing } from '../../theme';

interface AuroraProps {
  /** Two-to-three colour wash bled behind the content. */
  gradient?: Gradient;
  /** 0–1. How strongly the wash shows through. */
  intensity?: number;
}

/**
 * The ambient background. Two offset radial-ish washes plus the base colour —
 * enough to make every screen feel lit from somewhere without costing a frame.
 */
export function Aurora({ gradient = gradients.aurora, intensity = 0.5 }: AuroraProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
      <LinearGradient
        colors={[gradient[0], 'transparent'] as unknown as readonly [string, string]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.75 }}
        style={[styles.wash, { opacity: intensity * 0.55 }]}
      />
      <LinearGradient
        colors={[
          'transparent',
          gradient[gradient.length - 1],
        ] as unknown as readonly [string, string]}
        start={{ x: 1, y: 0.15 }}
        end={{ x: 0.15, y: 1 }}
        style={[styles.washLower, { opacity: intensity * 0.32 }]}
      />
      <LinearGradient
        colors={gradients.fade as unknown as readonly [string, string]}
        style={styles.vignette}
      />
    </View>
  );
}

interface ScreenProps {
  children: ReactNode;
  /** Scroll the content. Turn off for full-bleed interactive screens. */
  scroll?: boolean;
  gradient?: Gradient;
  intensity?: number;
  /** Respect the top safe area. Off when a custom header handles it. */
  padTop?: boolean;
  padBottom?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Rendered above the scroll view, pinned. */
  header?: ReactNode;
  /** Rendered below, pinned — action bars and the like. */
  footer?: ReactNode;
  /** Extra bottom padding so content clears the floating tab bar. */
  tabBarPadding?: boolean;
}

export function Screen({
  children,
  scroll = true,
  gradient,
  intensity,
  padTop = true,
  padBottom = true,
  contentStyle,
  style,
  header,
  footer,
  tabBarPadding = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = padTop ? insets.top + spacing.sm : 0;
  const paddingBottom =
    (padBottom ? insets.bottom + spacing.lg : 0) + (tabBarPadding ? 96 : 0);

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        { paddingTop, paddingBottom, paddingHorizontal: spacing.lg },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        { paddingTop, paddingBottom, paddingHorizontal: spacing.lg },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.flex, style]}>
      <Aurora gradient={gradient} intensity={intensity} />
      {header}
      <Animated.View style={styles.flex} entering={FadeIn.duration(240)}>
        {body}
      </Animated.View>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wash: {
    position: 'absolute',
    top: -180,
    left: -140,
    right: -60,
    height: 620,
    borderRadius: 400,
    transform: [{ scaleX: 1.4 }],
  },
  washLower: {
    position: 'absolute',
    bottom: -200,
    left: -100,
    right: -160,
    height: 520,
    borderRadius: 400,
    transform: [{ scaleX: 1.3 }],
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },
});
