import React, { useCallback, useMemo, useRef } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing, type } from '../../theme';
import { SHARP_NAMES, FLAT_NAMES, isBlackKey, mod } from '../../theory';

export interface KeyHighlight {
  /** Fill colour for the key. */
  color: string;
  /** Small text drawn on the key — a degree number, an interval, a finger. */
  label?: string;
  /** Draw a ring instead of a fill. Used to mark the root. */
  outline?: boolean;
}

export type LabelMode = 'none' | 'letters' | 'c-only' | 'all';

interface PianoProps {
  /** Lowest MIDI note shown. Defaults to C3. */
  startMidi?: number;
  /** How many octaves to render. */
  octaves?: number;
  /** Notes currently sounding — these glow. */
  active?: number[];
  /**
   * Per-pitch-class or per-MIDI highlighting. Keys are either a MIDI number or
   * a pitch class 0–11 (pitch classes apply to every octave).
   */
  highlights?: Record<number, KeyHighlight>;
  onPressKey?: (midi: number) => void;
  onReleaseKey?: (midi: number) => void;
  /** Height of the white keys. */
  height?: number;
  labelMode?: LabelMode;
  /** Prefer flat spellings in labels. */
  flats?: boolean;
  /** Fill the width instead of scrolling. Good for small ranges. */
  fit?: boolean;
  /** Disable interaction — for display-only diagrams. */
  readOnly?: boolean;
  scrollable?: boolean;
}

const WHITE_KEY_WIDTH = 46;
const BLACK_KEY_RATIO = 0.62;

/**
 * An interactive piano keyboard.
 *
 * White keys lay out in a row and black keys are positioned absolutely over
 * the seams between them, which is the only way to get the real (uneven)
 * keyboard geometry rather than an evenly-spaced approximation.
 */
export function Piano({
  startMidi = 48,
  octaves = 2,
  active = [],
  highlights = {},
  onPressKey,
  onReleaseKey,
  height = 168,
  labelMode = 'c-only',
  flats = false,
  fit = false,
  readOnly = false,
  scrollable = true,
}: PianoProps) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const activeSet = useMemo(() => new Set(active), [active]);

  const keys = useMemo(() => {
    const total = octaves * 12 + 1;
    return Array.from({ length: total }, (_, i) => startMidi + i);
  }, [startMidi, octaves]);

  const whiteKeys = useMemo(() => keys.filter((m) => !isBlackKey(m)), [keys]);
  const blackKeys = useMemo(() => keys.filter((m) => isBlackKey(m)), [keys]);

  const whiteWidth = fit && containerWidth > 0 ? containerWidth / whiteKeys.length : WHITE_KEY_WIDTH;
  const blackWidth = whiteWidth * BLACK_KEY_RATIO;
  const totalWidth = whiteWidth * whiteKeys.length;

  const whiteIndexOf = useCallback(
    (midi: number) => whiteKeys.findIndex((m) => m >= midi),
    [whiteKeys],
  );

  const resolveHighlight = useCallback(
    (midi: number): KeyHighlight | undefined => highlights[midi] ?? highlights[mod(midi, 12)],
    [highlights],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const body = (
    <View style={{ width: totalWidth, height }}>
      {whiteKeys.map((midi, index) => (
        <PianoKey
          key={midi}
          midi={midi}
          black={false}
          width={whiteWidth}
          height={height}
          left={index * whiteWidth}
          active={activeSet.has(midi)}
          highlight={resolveHighlight(midi)}
          labelMode={labelMode}
          flats={flats}
          readOnly={readOnly}
          onPressKey={onPressKey}
          onReleaseKey={onReleaseKey}
        />
      ))}
      {blackKeys.map((midi) => {
        // A black key sits on the seam to the left of the next white key.
        const nextWhite = whiteIndexOf(midi);
        if (nextWhite < 0) return null;
        return (
          <PianoKey
            key={midi}
            midi={midi}
            black
            width={blackWidth}
            height={height * 0.62}
            left={nextWhite * whiteWidth - blackWidth / 2}
            active={activeSet.has(midi)}
            highlight={resolveHighlight(midi)}
            labelMode={labelMode}
            flats={flats}
            readOnly={readOnly}
            onPressKey={onPressKey}
            onReleaseKey={onReleaseKey}
          />
        );
      })}
    </View>
  );

  if (fit || !scrollable) {
    return (
      <View style={styles.container} onLayout={onLayout}>
        {containerWidth > 0 || !fit ? body : null}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {body}
    </ScrollView>
  );
}

interface KeyProps {
  midi: number;
  black: boolean;
  width: number;
  height: number;
  left: number;
  active: boolean;
  highlight?: KeyHighlight;
  labelMode: LabelMode;
  flats: boolean;
  readOnly: boolean;
  onPressKey?: (midi: number) => void;
  onReleaseKey?: (midi: number) => void;
}

const PianoKey = React.memo(function PianoKey({
  midi,
  black,
  width,
  height,
  left,
  active,
  highlight,
  labelMode,
  flats,
  readOnly,
  onPressKey,
  onReleaseKey,
}: KeyProps) {
  const pressed = useSharedValue(0);
  const isPressed = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: withSpring(1 - pressed.value * 0.02, motion.bouncy) }],
    opacity: withTiming(1 - pressed.value * 0.15, { duration: motion.quick }),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: withTiming(active ? 1 : 0, { duration: active ? 60 : 260 }),
  }));

  const name = (flats ? FLAT_NAMES : SHARP_NAMES)[mod(midi, 12)];
  const octave = Math.floor(midi / 12) - 1;
  const showLabel =
    labelMode === 'all' ||
    (labelMode === 'letters' && !black) ||
    (labelMode === 'c-only' && mod(midi, 12) === 0);

  const label = highlight?.label ?? (showLabel ? (mod(midi, 12) === 0 ? `C${octave}` : name) : null);

  const baseColor = black ? '#12141F' : '#EDEFF7';
  const fill = highlight && !highlight.outline ? highlight.color : baseColor;
  const textColor = highlight && !highlight.outline
    ? '#0A0C18'
    : black
      ? 'rgba(255,255,255,0.6)'
      : 'rgba(10,12,24,0.55)';

  const handlePressIn = () => {
    if (readOnly || isPressed.current) return;
    isPressed.current = true;
    pressed.value = 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPressKey?.(midi);
  };

  const handlePressOut = () => {
    if (readOnly || !isPressed.current) return;
    isPressed.current = false;
    pressed.value = 0;
    onReleaseKey?.(midi);
  };

  return (
    <Animated.View
      style={[
        black ? styles.blackKey : styles.whiteKey,
        {
          left,
          width,
          height,
          backgroundColor: fill,
          borderColor: highlight?.outline ? highlight.color : undefined,
          borderWidth: highlight?.outline ? 2.5 : black ? 0 : StyleSheet.hairlineWidth,
          zIndex: black ? 2 : 1,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={readOnly}
        accessibilityRole="button"
        accessibilityLabel={`${name}${octave}`}
      >
        {/* Glow overlay, driven by whether the note is sounding. */}
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]} pointerEvents="none">
          <LinearGradient
            colors={
              [
                `${highlight?.color ?? colors.accent}00`,
                highlight?.color ?? colors.accent,
              ] as unknown as readonly [string, string]
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Subtle shading so keys read as physical objects. */}
        {!black ? (
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.14)'] as unknown as readonly [string, string]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : (
          <LinearGradient
            colors={
              ['rgba(255,255,255,0.14)', 'rgba(0,0,0,0.4)'] as unknown as readonly [string, string]
            }
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}

        {label ? (
          <Text
            style={[
              styles.keyLabel,
              {
                color: active ? '#0A0C18' : textColor,
                fontSize: Math.min(12, width * 0.34),
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

/**
 * A compact, non-interactive keyboard used inline in lesson text to show a
 * chord shape or an interval at a glance.
 */
export function MiniPiano({
  notes,
  startMidi = 60,
  octaves = 1,
  color = colors.accent,
  height = 62,
}: {
  notes: number[];
  startMidi?: number;
  octaves?: number;
  color?: string;
  height?: number;
}) {
  const highlights = useMemo(() => {
    const map: Record<number, KeyHighlight> = {};
    notes.forEach((midi, i) => {
      map[midi] = { color: i === 0 ? color : `${color}CC` };
    });
    return map;
  }, [notes, color]);

  return (
    <Piano
      startMidi={startMidi}
      octaves={octaves}
      highlights={highlights}
      height={height}
      labelMode="none"
      readOnly
      fit
      scrollable={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#05060D',
  },
  scrollContent: { paddingRight: spacing.xs },
  whiteKey: {
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    borderColor: 'rgba(10,12,24,0.28)',
    overflow: 'hidden',
  },
  blackKey: {
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 7,
  },
  keyLabel: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
