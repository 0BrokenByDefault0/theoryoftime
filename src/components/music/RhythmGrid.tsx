import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, palette, radius, spacing, type } from '../../theme';

export interface GridTrack {
  id: string;
  label: string;
  hits: number[];
  color: string;
}

interface RhythmGridProps {
  tracks: GridTrack[];
  steps?: number;
  /** Step currently sounding, or -1. */
  currentStep?: number;
  onToggle?: (trackId: string, step: number) => void;
  /** Beats per bar, used to draw the heavier downbeat divisions. */
  beatDivision?: number;
  readOnly?: boolean;
  compact?: boolean;
}

/**
 * A step sequencer grid.
 *
 * Beat boundaries are drawn heavier than subdivisions so that syncopation is
 * visible as displacement from the strong columns rather than as an
 * undifferentiated row of squares.
 */
export function RhythmGrid({
  tracks,
  steps = 16,
  currentStep = -1,
  onToggle,
  beatDivision = 4,
  readOnly = false,
  compact = false,
}: RhythmGridProps) {
  const cellSize = compact ? 15 : 19;
  const gap = compact ? 2.5 : 3.5;

  return (
    <View>
      {/* Beat ruler */}
      <View style={[styles.row, { marginLeft: compact ? 44 : 62, marginBottom: 5 }]}>
        {Array.from({ length: steps }, (_, i) => (
          <View key={i} style={{ width: cellSize, marginRight: gap, alignItems: 'center' }}>
            {i % beatDivision === 0 ? (
              <Text style={[type.caption, { fontSize: 9.5, color: colors.textFaint }]}>
                {i / beatDivision + 1}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      {tracks.map((track) => (
        <View key={track.id} style={[styles.row, { marginBottom: gap }]}>
          <Text
            style={[
              type.caption,
              { width: compact ? 42 : 60, fontSize: compact ? 9.5 : 11, color: track.color },
            ]}
            numberOfLines={1}
          >
            {track.label}
          </Text>
          {Array.from({ length: steps }, (_, step) => (
            <GridCell
              key={step}
              on={track.hits.includes(step)}
              downbeat={step % beatDivision === 0}
              playing={currentStep === step}
              color={track.color}
              size={cellSize}
              gap={gap}
              onPress={
                readOnly
                  ? undefined
                  : () => {
                      Haptics.selectionAsync().catch(() => undefined);
                      onToggle?.(track.id, step);
                    }
              }
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function GridCell({
  on,
  downbeat,
  playing,
  color,
  size,
  gap,
  onPress,
}: {
  on: boolean;
  downbeat: boolean;
  playing: boolean;
  color: string;
  size: number;
  gap: number;
  onPress?: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(playing && on ? 1.22 : 1, motion.bouncy) }],
    backgroundColor: withTiming(
      on ? color : downbeat ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.045)',
      { duration: motion.quick },
    ),
    shadowOpacity: withTiming(playing && on ? 0.8 : 0, { duration: 120 }),
  }));

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Animated.View
        style={[
          styles.cell,
          {
            width: size,
            height: size,
            marginRight: gap,
            shadowColor: color,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            borderColor: playing ? 'rgba(255,255,255,0.55)' : 'transparent',
          },
          animatedStyle,
        ]}
      />
    </Pressable>
  );
}

/**
 * A single-line rhythm readout — used to show one pattern (a clave, a
 * Euclidean rhythm) inline in a lesson.
 */
export function RhythmStrip({
  pattern,
  currentStep = -1,
  color = palette.cyan,
  beatDivision = 4,
  height = 26,
}: {
  pattern: boolean[];
  currentStep?: number;
  color?: string;
  beatDivision?: number;
  height?: number;
}) {
  return (
    <View style={styles.row}>
      {pattern.map((on, i) => (
        <View
          key={i}
          style={[
            styles.stripCell,
            {
              height,
              backgroundColor: on ? color : 'rgba(255,255,255,0.06)',
              borderColor:
                currentStep === i ? 'rgba(255,255,255,0.7)' : i % beatDivision === 0 ? 'rgba(255,255,255,0.18)' : 'transparent',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  cell: {
    borderRadius: 5,
    borderWidth: 1.5,
  },
  stripCell: {
    flex: 1,
    marginRight: 2.5,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
