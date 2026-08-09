import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { Gradient, colors, gradients, radius, spacing, type } from '../../theme';

type TextProps = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  color?: string;
};

const make =
  (base: TextStyle) =>
  ({ children, style, numberOfLines, color }: TextProps) => (
    <Text style={[base, color ? { color } : null, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );

export const Hero = make(type.hero);
export const Title = make(type.title);
export const Heading = make(type.heading);
export const Subheading = make(type.subheading);
export const Body = make(type.body);
export const BodyStrong = make(type.bodyStrong);
export const Small = make(type.small);
export const Caption = make(type.caption);
export const Overline = make(type.overline);
export const Mono = make(type.mono);

/** A section header with an optional trailing action. */
export function SectionHeader({
  title,
  subtitle,
  action,
  style,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.flex}>
        <Text style={type.heading}>{title}</Text>
        {subtitle ? <Text style={[type.small, { marginTop: 3 }]}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

/** A coloured chip. The app's main way of labelling anything. */
export function Pill({
  label,
  tint = colors.accent,
  filled = false,
  style,
  textStyle,
  icon,
}: {
  label: string;
  tint?: string;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: string;
}) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: filled ? tint : `${tint}1F`,
          borderColor: filled ? tint : `${tint}55`,
        },
        style,
      ]}
    >
      {icon ? <Text style={styles.pillIcon}>{icon}</Text> : null}
      <Text
        style={[
          type.caption,
          { color: filled ? '#0A0C18' : tint, fontWeight: '800' },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/** Gradient-filled display text for hero numbers and headings. */
export function GradientText({
  children,
  gradient = gradients.aurora,
  style,
}: {
  children: string;
  gradient?: Gradient;
  style?: StyleProp<TextStyle>;
}) {
  // React Native cannot fill glyphs with a gradient directly. MaskedView draws
  // the text as an alpha mask and lets the gradient show through it, which is
  // the only approach that renders identically on both platforms.
  return (
    <MaskedView
      style={styles.gradientTextWrap}
      maskElement={<Text style={[type.hero, style]}>{children}</Text>}
    >
      <LinearGradient
        colors={gradient as unknown as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Transparent copy sizes the gradient to the glyphs. */}
        <Text style={[type.hero, style, styles.gradientTextSizer]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

/**
 * A callout box for the "why this matters" asides that run through the
 * lessons. Variants carry meaning: insight, warning, and pro tip.
 */
export function Callout({
  children,
  variant = 'insight',
  title,
  style,
}: {
  children: ReactNode;
  variant?: 'insight' | 'warning' | 'pro' | 'listen';
  title?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const config = {
    insight: { icon: '◆', tint: colors.accent, label: 'Insight' },
    warning: { icon: '▲', tint: colors.warning, label: 'Watch out' },
    pro: { icon: '★', tint: '#FCD34D', label: 'Pro move' },
    listen: { icon: '♪', tint: '#22D3EE', label: 'Listen for' },
  }[variant];

  return (
    <View style={[styles.callout, { borderLeftColor: config.tint }, style]}>
      <View style={styles.calloutHeader}>
        <Text style={{ color: config.tint, fontSize: 12 }}>{config.icon}</Text>
        <Text style={[type.overline, { color: config.tint, marginLeft: 6 }]}>
          {title ?? config.label}
        </Text>
      </View>
      {typeof children === 'string' ? (
        <Text style={[type.body, { color: colors.text, fontSize: 15.5 }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

/** Key/value row used in reference tables. */
export function DataRow({
  label,
  value,
  tint,
  mono,
}: {
  label: string;
  value: string;
  tint?: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.dataRow}>
      <Text style={[type.small, { flex: 1 }]}>{label}</Text>
      <Text
        style={[
          mono ? type.mono : type.small,
          { color: tint ?? colors.text, fontWeight: '700', textAlign: 'right', flex: 1.2 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  pillIcon: { fontSize: 11, marginRight: 4 },
  gradientTextWrap: { alignSelf: 'flex-start' },
  gradientTextSizer: { opacity: 0 },
  callout: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
  },
  calloutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
