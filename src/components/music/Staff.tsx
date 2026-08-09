import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, palette } from '../../theme';
import {
  Key,
  LETTER_NAMES,
  Note,
  keySignature,
  keySignatureNotes,
  mod,
  toMidi,
} from '../../theory';

export type Clef = 'treble' | 'bass';

export interface StaffNote {
  note: Note;
  /** Highlight colour. Defaults to the ink colour. */
  color?: string;
  /** Small text under the note — a degree, an interval, a finger number. */
  label?: string;
}

interface StaffProps {
  notes: StaffNote[];
  clef?: Clef;
  /** Draw the key signature accidentals after the clef. */
  keySignatureOf?: Key;
  /** Stack the notes as a chord instead of spacing them left to right. */
  chord?: boolean;
  width?: number;
  /** Distance between adjacent staff lines. Everything scales from this. */
  lineGap?: number;
  /** Index of the note currently sounding — it lights up. */
  activeIndex?: number;
  showNoteNames?: boolean;
}

/**
 * Western staff notation.
 *
 * Vertical position is derived from the note's *letter*, not its pitch: C♯ and
 * C occupy the same line, and the sharp is drawn as a separate accidental.
 * Getting that right is what separates real notation from a piano roll.
 */
export function Staff({
  notes,
  clef = 'treble',
  keySignatureOf,
  chord = false,
  width = 320,
  lineGap = 11,
  activeIndex,
  showNoteNames = false,
}: StaffProps) {
  const staffHeight = lineGap * 4;
  const padTop = lineGap * 5;
  const padBottom = lineGap * 5 + (showNoteNames ? 18 : 0);
  const height = staffHeight + padTop + padBottom;
  const staffTop = padTop;

  // The reference note sitting on the bottom staff line.
  const bottomLineDiatonic = clef === 'treble' ? diatonicIndex(4, 2) : diatonicIndex(2, 4); // E4 / G2

  /** Vertical pixel position for a note. Each staff step is half a line gap. */
  const yFor = (note: Note) => {
    const index = diatonicIndex(note.octave, note.letter);
    const stepsAboveBottom = index - bottomLineDiatonic;
    return staffTop + staffHeight - stepsAboveBottom * (lineGap / 2);
  };

  const signatureAccidentals = useMemo(() => {
    if (!keySignatureOf) return [];
    const count = keySignature(keySignatureOf);
    const letters = keySignatureNotes(keySignatureOf);
    const sharp = count > 0;
    // Standard placements: sharps and flats each have a fixed vertical order.
    const trebleSharpOctaves = [5, 5, 5, 5, 4, 5, 4]; // F5 C5 G5 D5 A4 E5 B4
    const trebleFlatOctaves = [4, 5, 4, 5, 4, 5, 4]; // B4 E5 A4 D5 G4 C5 F4
    return letters.map((letterName, i) => {
      const letter = LETTER_NAMES.indexOf(letterName as (typeof LETTER_NAMES)[number]);
      const trebleOctave = (sharp ? trebleSharpOctaves : trebleFlatOctaves)[i];
      const octave = clef === 'treble' ? trebleOctave : trebleOctave - 2;
      return {
        glyph: sharp ? '♯' : '♭',
        y: yFor({ letter, alter: 0, octave }),
      };
    });
  }, [keySignatureOf, clef, lineGap]);

  const clefWidth = lineGap * 4.2;
  const signatureWidth = signatureAccidentals.length * (lineGap * 0.75);
  const contentLeft = lineGap + clefWidth + signatureWidth + lineGap;
  const contentWidth = Math.max(lineGap * 3, width - contentLeft - lineGap * 2);
  const spacing = chord ? 0 : contentWidth / Math.max(1, notes.length);

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height}>
        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Line
            key={i}
            x1={lineGap * 0.5}
            y1={staffTop + i * lineGap}
            x2={width - lineGap * 0.5}
            y2={staffTop + i * lineGap}
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={1}
          />
        ))}

        {/* Clef */}
        <G>
          {clef === 'treble' ? (
            <Path
              d={trebleClefPath(lineGap * 1.1, staffTop + lineGap * 3, lineGap)}
              stroke={colors.text}
              strokeWidth={lineGap * 0.19}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : (
            <G>
              <Path
                d={bassClefPath(lineGap * 1.2, staffTop + lineGap, lineGap)}
                stroke={colors.text}
                strokeWidth={lineGap * 0.22}
                strokeLinecap="round"
                fill="none"
              />
              <Ellipse
                cx={lineGap * 3.4}
                cy={staffTop + lineGap * 0.55}
                rx={lineGap * 0.16}
                ry={lineGap * 0.16}
                fill={colors.text}
              />
              <Ellipse
                cx={lineGap * 3.4}
                cy={staffTop + lineGap * 1.45}
                rx={lineGap * 0.16}
                ry={lineGap * 0.16}
                fill={colors.text}
              />
            </G>
          )}
        </G>

        {/* Key signature */}
        {signatureAccidentals.map((acc, i) => (
          <SvgText
            key={i}
            x={lineGap + clefWidth + i * (lineGap * 0.75)}
            y={acc.y + lineGap * 0.36}
            fontSize={lineGap * 1.8}
            fontWeight="700"
            fill={colors.text}
            textAnchor="middle"
          >
            {acc.glyph}
          </SvgText>
        ))}

        {/* Notes */}
        {notes.map((item, i) => {
          const x = chord ? contentLeft + contentWidth / 2 : contentLeft + spacing * (i + 0.5);
          const y = yFor(item.note);
          const active = activeIndex === i;
          const ink = active ? palette.gold : (item.color ?? colors.text);
          const stemUp = y > staffTop + staffHeight / 2;

          return (
            <G key={`${toMidi(item.note)}-${i}`}>
              {/* Ledger lines above and below the staff */}
              {ledgerLines(y, staffTop, staffHeight, lineGap).map((ly, li) => (
                <Line
                  key={li}
                  x1={x - lineGap * 0.95}
                  y1={ly}
                  x2={x + lineGap * 0.95}
                  y2={ly}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1}
                />
              ))}

              {/* Accidental */}
              {item.note.alter !== 0 ? (
                <SvgText
                  x={x - lineGap * 1.5}
                  y={y + lineGap * 0.36}
                  fontSize={lineGap * 1.7}
                  fontWeight="700"
                  fill={ink}
                  textAnchor="middle"
                >
                  {accidentalGlyph(item.note.alter)}
                </SvgText>
              ) : null}

              {/* Stem */}
              {!chord ? (
                <Line
                  x1={stemUp ? x + lineGap * 0.62 : x - lineGap * 0.62}
                  y1={y}
                  x2={stemUp ? x + lineGap * 0.62 : x - lineGap * 0.62}
                  y2={stemUp ? y - lineGap * 3.2 : y + lineGap * 3.2}
                  stroke={ink}
                  strokeWidth={lineGap * 0.14}
                  strokeLinecap="round"
                />
              ) : null}

              {/* Notehead — tilted, as engraved noteheads are */}
              <Ellipse
                cx={x}
                cy={y}
                rx={lineGap * 0.66}
                ry={lineGap * 0.48}
                fill={ink}
                transform={`rotate(-18 ${x} ${y})`}
              />

              {item.label ? (
                <SvgText
                  x={x}
                  y={staffTop + staffHeight + lineGap * 3.4}
                  fontSize={lineGap * 1.05}
                  fontWeight="800"
                  fill={item.color ?? colors.textMuted}
                  textAnchor="middle"
                >
                  {item.label}
                </SvgText>
              ) : null}

              {showNoteNames ? (
                <SvgText
                  x={x}
                  y={height - 4}
                  fontSize={lineGap * 1}
                  fontWeight="700"
                  fill={colors.textDim}
                  textAnchor="middle"
                >
                  {LETTER_NAMES[mod(item.note.letter, 7)]}
                  {item.note.alter !== 0 ? accidentalGlyph(item.note.alter) : ''}
                </SvgText>
              ) : null}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ── Geometry helpers ──────────────────────────────────────────────────────

/** Absolute diatonic step index — counts letter names, ignoring accidentals. */
function diatonicIndex(octave: number, letter: number): number {
  return octave * 7 + letter;
}

function accidentalGlyph(alter: number): string {
  return alter === 1 ? '♯' : alter === -1 ? '♭' : alter === 2 ? '𝄪' : alter === -2 ? '𝄫' : '♮';
}

/** Ledger line positions needed to reach a note outside the staff. */
function ledgerLines(y: number, staffTop: number, staffHeight: number, lineGap: number): number[] {
  const lines: number[] = [];
  const bottom = staffTop + staffHeight;
  // Only lines, not spaces — hence stepping a full gap at a time.
  for (let ly = staffTop - lineGap; ly >= y - 0.1; ly -= lineGap) lines.push(ly);
  for (let ly = bottom + lineGap; ly <= y + 0.1; ly += lineGap) lines.push(ly);
  return lines;
}

/**
 * A treble clef drawn as a spiral plus an S-curve, generated rather than
 * hand-digitised. iOS system fonts do not reliably carry U+1D11E, so drawing
 * the glyph as geometry is the only way to guarantee it renders.
 */
function trebleClefPath(x: number, y: number, unit: number): string {
  const points: string[] = [];

  // The lower spiral, wound around the G line.
  const turns = 1.85;
  const steps = 46;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2 + Math.PI * 0.55;
    const radius = unit * 0.22 + t * unit * 1.02;
    const px = x + unit * 1.05 + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle) * 0.92;
    points.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }

  // The stem sweeping up, curling over the top, and hooking back down.
  const topX = x + unit * 1.05;
  points.push(
    `C ${topX + unit * 1.5} ${y - unit * 1.6} ${topX + unit * 1.3} ${y - unit * 3.4} ${topX + unit * 0.15} ${y - unit * 4.1}`,
  );
  points.push(
    `C ${topX - unit * 1.15} ${y - unit * 4.9} ${topX - unit * 1.25} ${y - unit * 2.6} ${topX + unit * 0.05} ${y - unit * 1.35}`,
  );

  // The tail below the staff.
  points.push(
    `C ${topX + unit * 0.9} ${y + unit * 0.6} ${topX + unit * 1.0} ${y + unit * 2.2} ${topX + unit * 0.05} ${y + unit * 2.75}`,
  );
  points.push(
    `C ${topX - unit * 0.75} ${y + unit * 3.1} ${topX - unit * 1.0} ${y + unit * 2.2} ${topX - unit * 0.5} ${y + unit * 1.85}`,
  );

  return points.join(' ');
}

/** The bass clef's comma-shaped hook, anchored on the F line. */
function bassClefPath(x: number, y: number, unit: number): string {
  return [
    `M ${x + unit * 1.9} ${y + unit * 0.35}`,
    `C ${x + unit * 1.9} ${y - unit * 0.55} ${x + unit * 0.35} ${y - unit * 0.7} ${x + unit * 0.35} ${y + unit * 0.3}`,
    `C ${x + unit * 0.35} ${y + unit * 1.1} ${x + unit * 1.55} ${y + unit * 1.15} ${x + unit * 1.75} ${y + unit * 2.0}`,
    `C ${x + unit * 2.0} ${y + unit * 3.1} ${x + unit * 0.9} ${y + unit * 3.7} ${x} ${y + unit * 3.5}`,
  ].join(' ');
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start' },
});
