import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { colors, radius, spacing, type } from '../../theme';
import { useStore } from '../../state/store';

/** Wrapper giving every widget a consistent frame and optional caption. */
export function WidgetFrame({
  children,
  caption,
  padded = true,
  tint,
}: {
  children: ReactNode;
  caption?: string;
  padded?: boolean;
  tint?: string;
}) {
  return (
    <View style={styles.frameOuter}>
      <View
        style={[
          styles.frame,
          padded ? { padding: spacing.md } : null,
          tint ? { borderColor: `${tint}33` } : null,
        ]}
      >
        {children}
      </View>
      {caption ? <Text style={[type.caption, styles.caption]}>{caption}</Text> : null}
    </View>
  );
}

/** A labelled slider with a live value readout. */
export function ParamSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format,
  tint = colors.accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  tint?: string;
}) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={[type.caption, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[type.mono, { fontSize: 12, color: tint }]}>
          {format ? format(value) : value.toFixed(2)}
        </Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor={tint}
        maximumTrackTintColor="rgba(255,255,255,0.14)"
        thumbTintColor={tint}
        style={styles.slider}
      />
    </View>
  );
}

/** The instrument the learner picked in settings, for every widget to share. */
export function useInstrument(): string {
  return useStore((s) => s.settings.instrument);
}

export function usePreferFlats(): boolean {
  return useStore((s) => s.settings.preferFlats);
}

export function useLabelMode() {
  return useStore((s) => s.settings.labelMode);
}

/** A horizontal row of small selectable chips. */
export function ChipRow<T extends string | number>({
  options,
  value,
  onChange,
  tint = colors.accent,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  tint?: string;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Text
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              type.caption,
              active
                ? { backgroundColor: `${tint}2E`, borderColor: tint, color: colors.text }
                : null,
            ]}
          >
            {option.label}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frameOuter: { marginVertical: spacing.sm },
  frame: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  caption: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    fontStyle: 'italic',
  },
  sliderRow: { marginBottom: spacing.sm },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  slider: { width: '100%', height: 32 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
});
