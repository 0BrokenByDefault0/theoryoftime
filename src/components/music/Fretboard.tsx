import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors, palette, radius } from '../../theme';
import { SHARP_NAMES, FLAT_NAMES, mod } from '../../theory';

/** Standard tuning, low to high, as MIDI numbers: E2 A2 D3 G3 B3 E4. */
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];
export const DROP_D_TUNING = [38, 45, 50, 55, 59, 64];
export const BASS_TUNING = [28, 33, 38, 43];
export const UKULELE_TUNING = [67, 60, 64, 69];

export const TUNINGS: Array<{ id: string; name: string; midi: number[]; note: string }> = [
  { id: 'standard', name: 'Standard (EADGBE)', midi: STANDARD_TUNING, note: 'The default. Every shape you learn assumes it.' },
  { id: 'drop-d', name: 'Drop D', midi: DROP_D_TUNING, note: 'Low string down a tone — power chords become one finger.' },
  { id: 'bass', name: 'Bass (EADG)', midi: BASS_TUNING, note: 'Four strings, an octave below the guitar.' },
  { id: 'ukulele', name: 'Ukulele (GCEA)', midi: UKULELE_TUNING, note: 'Re-entrant: the top string is higher than the next.' },
];

export interface FretMarking {
  color: string;
  label?: string;
  outline?: boolean;
}

interface FretboardProps {
  tuning?: number[];
  frets?: number;
  /** Marks keyed by MIDI note or pitch class 0–11. */
  markings?: Record<number, FretMarking>;
  onPressFret?: (midi: number, string: number, fret: number) => void;
  width?: number;
  showFretNumbers?: boolean;
  flats?: boolean;
  /** Show note letters inside unmarked positions too. */
  showAllNotes?: boolean;
  activeNotes?: number[];
}

const INLAY_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAY_FRETS = [12, 24];

/**
 * A guitar fretboard.
 *
 * Rendered horizontally with the low string at the bottom, matching how a
 * right-handed player looks down at their own instrument — the orientation
 * that makes shapes transferable rather than something to mentally flip.
 */
export function Fretboard({
  tuning = STANDARD_TUNING,
  frets = 12,
  markings = {},
  onPressFret,
  width = 640,
  showFretNumbers = true,
  flats = false,
  showAllNotes = false,
  activeNotes = [],
}: FretboardProps) {
  const strings = [...tuning].reverse(); // Draw high string first (top row).
  const stringGap = 26;
  const nutWidth = 8;
  const fretWidth = (width - nutWidth - 26) / frets;
  const boardHeight = stringGap * (strings.length - 1);
  const padTop = 22;
  const height = boardHeight + padTop + (showFretNumbers ? 34 : 14);
  const activeSet = useMemo(() => new Set(activeNotes), [activeNotes]);

  const markFor = (midi: number): FretMarking | undefined =>
    markings[midi] ?? markings[mod(midi, 12)];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap}>
      <Svg width={width} height={height}>
        {/* Fretboard surface */}
        <Rect
          x={nutWidth}
          y={padTop - 12}
          width={width - nutWidth - 20}
          height={boardHeight + 24}
          fill="rgba(255,255,255,0.035)"
          rx={4}
        />

        {/* Inlays */}
        {Array.from({ length: frets }, (_, i) => i + 1).map((fret) => {
          const x = nutWidth + fretWidth * (fret - 0.5);
          const cy = padTop + boardHeight / 2;
          if (DOUBLE_INLAY_FRETS.includes(fret)) {
            return (
              <G key={`inlay-${fret}`}>
                <Circle cx={x} cy={cy - stringGap * 0.8} r={4} fill="rgba(255,255,255,0.16)" />
                <Circle cx={x} cy={cy + stringGap * 0.8} r={4} fill="rgba(255,255,255,0.16)" />
              </G>
            );
          }
          if (INLAY_FRETS.includes(fret)) {
            return <Circle key={`inlay-${fret}`} cx={x} cy={cy} r={4} fill="rgba(255,255,255,0.12)" />;
          }
          return null;
        })}

        {/* Nut */}
        <Rect x={0} y={padTop - 12} width={nutWidth} height={boardHeight + 24} fill="rgba(255,255,255,0.55)" rx={2} />

        {/* Frets */}
        {Array.from({ length: frets }, (_, i) => i + 1).map((fret) => (
          <Line
            key={`fret-${fret}`}
            x1={nutWidth + fretWidth * fret}
            y1={padTop - 12}
            x2={nutWidth + fretWidth * fret}
            y2={padTop + boardHeight + 12}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1.5}
          />
        ))}

        {/* Strings — thicker as they get lower, like real gauges */}
        {strings.map((_, i) => (
          <Line
            key={`string-${i}`}
            x1={0}
            y1={padTop + i * stringGap}
            x2={width - 20}
            y2={padTop + i * stringGap}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={0.8 + (i / strings.length) * 1.8}
          />
        ))}

        {/* Note positions */}
        {strings.map((openMidi, stringIndex) =>
          Array.from({ length: frets + 1 }, (_, fret) => {
            const midi = openMidi + fret;
            const mark = markFor(midi);
            const isActive = activeSet.has(midi);
            if (!mark && !showAllNotes && !isActive) return null;

            const x = fret === 0 ? nutWidth / 2 - 4 : nutWidth + fretWidth * (fret - 0.5);
            const y = padTop + stringIndex * stringGap;
            const name = (flats ? FLAT_NAMES : SHARP_NAMES)[mod(midi, 12)];
            const fill = isActive
              ? palette.gold
              : mark
                ? mark.outline
                  ? 'transparent'
                  : mark.color
                : 'rgba(255,255,255,0.10)';

            return (
              <G
                key={`n-${stringIndex}-${fret}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  onPressFret?.(midi, strings.length - 1 - stringIndex, fret);
                }}
              >
                <Circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill={fill}
                  stroke={mark?.outline ? mark.color : 'transparent'}
                  strokeWidth={mark?.outline ? 2.4 : 0}
                />
                <SvgText
                  x={x}
                  y={y + 3.6}
                  fontSize={9.5}
                  fontWeight="800"
                  fill={mark && !mark.outline && !isActive ? '#0A0C18' : colors.text}
                  textAnchor="middle"
                >
                  {mark?.label ?? name}
                </SvgText>
              </G>
            );
          }),
        )}

        {/* Fret numbers */}
        {showFretNumbers
          ? Array.from({ length: frets + 1 }, (_, fret) => (
              <SvgText
                key={`num-${fret}`}
                x={fret === 0 ? nutWidth / 2 - 4 : nutWidth + fretWidth * (fret - 0.5)}
                y={height - 8}
                fontSize={10}
                fontWeight="700"
                fill={colors.textFaint}
                textAnchor="middle"
              >
                {fret}
              </SvgText>
            ))
          : null}
      </Svg>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
