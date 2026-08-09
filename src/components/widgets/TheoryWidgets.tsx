import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, degreeColor, palette, radius, spacing, type } from '../../theme';
import {
  Chord,
  Key,
  MODE_BRIGHTNESS_ORDER,
  Note,
  SIMPLE_INTERVALS,
  buildScale,
  chordMidi,
  chordSymbol,
  chordVoicing,
  degreeOf,
  getProgression,
  getScale,
  identifyChords,
  intervalAbbr,
  intervalFromSemitones,
  intervalName,
  INTERVAL_REFERENCES,
  mod,
  noteName,
  parseChordSymbol,
  pitchClass,
  progressionToChords,
  requireNote,
  toMidi,
  VOICING_LABELS,
  VOICING_NOTES,
  VoicingStyle,
  voiceChord,
} from '../../theory';
import { audioEngine } from '../../audio/engine';
import { arpeggiateChord, playChord, playInterval, playProgression, playScale } from '../../audio/player';
import { useKeyboardVoices } from '../../audio/useAudio';
import { Piano, KeyHighlight } from '../music/Piano';
import { CircleOfFifths } from '../music/CircleOfFifths';
import { Staff } from '../music/Staff';
import { Fretboard } from '../music/Fretboard';
import { GhostButton, IconButton, PlayButton } from '../ui/Button';
import { Pill } from '../ui/Text';
import { ChipRow, WidgetFrame, useInstrument, useLabelMode, usePreferFlats } from './shared';

/** Build the highlight map for a scale so degrees keep their colours. */
function scaleHighlights(tonic: Note, scaleId: string, showDegrees: boolean): Record<number, KeyHighlight> {
  const scale = getScale(scaleId);
  const notes = buildScale(tonic, scale);
  const map: Record<number, KeyHighlight> = {};
  notes.forEach((note, i) => {
    map[pitchClass(note)] = {
      color: degreeColor(i + 1),
      label: showDegrees ? scale.degrees[i] : undefined,
    };
  });
  return map;
}

function chordHighlights(chord: Chord): Record<number, KeyHighlight> {
  const map: Record<number, KeyHighlight> = {};
  chordMidi(chord).forEach((midi, i) => {
    map[midi] = { color: degreeColor(i + 1) };
  });
  return map;
}

// ── Piano widget ──────────────────────────────────────────────────────────

export function PianoWidget({
  startMidi = 60,
  octaves = 2,
  scale,
  chord,
  notes,
  labelMode,
  showDegrees,
  caption,
}: {
  startMidi?: number;
  octaves?: number;
  scale?: { tonic: string; scaleId: string };
  chord?: string;
  notes?: number[];
  labelMode?: 'none' | 'letters' | 'c-only' | 'all';
  showDegrees?: boolean;
  caption?: string;
}) {
  const instrument = useInstrument();
  const defaultLabelMode = useLabelMode();
  const flats = usePreferFlats();
  const { active, press, release } = useKeyboardVoices(instrument);

  const highlights = useMemo(() => {
    if (scale) return scaleHighlights(requireNote(scale.tonic), scale.scaleId, showDegrees ?? false);
    if (chord) {
      const parsed = parseChordSymbol(chord, 4);
      if (parsed) return chordHighlights(parsed);
    }
    if (notes) {
      const map: Record<number, KeyHighlight> = {};
      notes.forEach((midi, i) => (map[midi] = { color: degreeColor(i + 1) }));
      return map;
    }
    return {};
  }, [scale, chord, notes, showDegrees]);

  return (
    <WidgetFrame caption={caption} padded={false}>
      <Piano
        startMidi={startMidi}
        octaves={octaves}
        highlights={highlights}
        active={active}
        onPressKey={press}
        onReleaseKey={release}
        labelMode={labelMode ?? defaultLabelMode}
        flats={flats}
      />
    </WidgetFrame>
  );
}

// ── Scale widget ──────────────────────────────────────────────────────────

export function ScaleWidget({
  tonic,
  scaleId,
  caption,
}: {
  tonic: string;
  scaleId: string;
  caption?: string;
}) {
  const instrument = useInstrument();
  const flats = usePreferFlats();
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [direction, setDirection] = useState<'up' | 'both'>('up');

  const tonicNote = useMemo(() => requireNote(tonic + '4'), [tonic]);
  const scale = getScale(scaleId);
  const notes = useMemo(() => buildScale(tonicNote, scale), [tonicNote, scale]);
  const midiRun = useMemo(() => [...notes.map(toMidi), toMidi(tonicNote) + 12], [notes, tonicNote]);

  const highlights = useMemo(
    () => scaleHighlights(tonicNote, scaleId, true),
    [tonicNote, scaleId],
  );

  const handlePlay = useCallback(() => {
    if (playing) {
      audioEngine.stopAll();
      setPlaying(false);
      setStep(-1);
      return;
    }
    setPlaying(true);
    const { duration } = playScale(tonicNote, scale, {
      instrument,
      direction,
      onStep: setStep,
    });
    setTimeout(
      () => {
        setPlaying(false);
        setStep(-1);
      },
      duration * 1000 + 500,
    );
  }, [playing, tonicNote, scale, instrument, direction]);

  const activeMidi = step >= 0 ? [midiRun[step % midiRun.length]] : [];

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>
            {noteName(tonicNote)} {scale.name}
          </Text>
          <Text style={[type.caption, { marginTop: 2 }]}>{scale.degrees.join('  ')}</Text>
        </View>
        <PlayButton playing={playing} onPress={handlePlay} size={46} />
      </View>

      <Text style={[type.small, { marginBottom: spacing.sm }]}>{scale.mood}</Text>

      <View style={styles.noteRow}>
        {notes.map((note, i) => (
          <View
            key={i}
            style={[
              styles.noteChip,
              {
                borderColor: degreeColor(i + 1),
                backgroundColor: step === i ? degreeColor(i + 1) : `${degreeColor(i + 1)}1F`,
              },
            ]}
          >
            <Text
              style={[
                type.bodyStrong,
                { color: step === i ? '#0A0C18' : colors.text, fontSize: 15 },
              ]}
            >
              {noteName(note, { unicode: true })}
            </Text>
            <Text
              style={[
                type.caption,
                { color: step === i ? 'rgba(10,12,24,0.7)' : colors.textDim, fontSize: 10 },
              ]}
            >
              {scale.degrees[i]}
            </Text>
          </View>
        ))}
      </View>

      <Piano
        startMidi={toMidi(tonicNote) - (toMidi(tonicNote) % 12)}
        octaves={2}
        highlights={highlights}
        active={activeMidi}
        readOnly
        labelMode="none"
        flats={flats}
        height={110}
      />

      <View style={{ marginTop: spacing.sm }}>
        <ChipRow
          options={[
            { value: 'up' as const, label: 'Ascending' },
            { value: 'both' as const, label: 'Up & down' },
          ]}
          value={direction}
          onChange={setDirection}
        />
      </View>

      <Text style={[type.caption, { marginTop: spacing.sm }]}>{scale.usedIn}</Text>
    </WidgetFrame>
  );
}

// ── Chord widgets ─────────────────────────────────────────────────────────

export function ChordWidget({
  symbol,
  showStaff = true,
  caption,
}: {
  symbol: string;
  showStaff?: boolean;
  caption?: string;
}) {
  const instrument = useInstrument();
  const [step, setStep] = useState(-1);
  const [inversion, setInversion] = useState(0);

  const chord = useMemo(() => {
    const parsed = parseChordSymbol(symbol, 4);
    return parsed ? { ...parsed, inversion } : null;
  }, [symbol, inversion]);

  if (!chord) {
    return (
      <WidgetFrame caption={caption}>
        <Text style={type.small}>Could not parse chord “{symbol}”.</Text>
      </WidgetFrame>
    );
  }

  const midi = chordMidi(chord);
  const highlights = chordHighlights(chord);
  const inversionCount = chordMidi({ ...chord, inversion: 0 }).length;

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.title}>{chordSymbol(chord)}</Text>
          <Text style={[type.caption, { marginTop: 2 }]}>
            {chord.quality.name} · {chord.quality.degrees.join(' ')}
          </Text>
        </View>
        <View style={styles.transport}>
          <IconButton
            glyph="≋"
            size={40}
            onPress={() => arpeggiateChord(chord, { instrument, onStep: setStep })}
            accessibilityLabel="Arpeggiate"
          />
          <PlayButton
            playing={false}
            onPress={() => {
              setStep(-1);
              playChord(chord, { instrument });
            }}
            size={46}
          />
        </View>
      </View>

      <Text style={[type.small, { marginBottom: spacing.sm }]}>{chord.quality.mood}</Text>

      <Piano
        startMidi={Math.min(...midi) - mod(Math.min(...midi), 12)}
        octaves={2}
        highlights={highlights}
        active={step >= 0 ? [midi[step]] : []}
        readOnly
        labelMode="none"
        height={112}
      />

      {showStaff ? (
        <View style={{ marginTop: spacing.sm }}>
          <Staff
            notes={chordMidi(chord).map((_, i) => ({
              note: chordVoicing(chord)[i],
              color: degreeColor(i + 1),
            }))}
            chord
            width={280}
          />
        </View>
      ) : null}

      {inversionCount > 1 ? (
        <View style={{ marginTop: spacing.sm }}>
          <ChipRow
            options={Array.from({ length: inversionCount }, (_, i) => ({
              value: i,
              label: i === 0 ? 'Root' : `Inv ${i}`,
            }))}
            value={inversion}
            onChange={setInversion}
          />
        </View>
      ) : null}

      <Text style={[type.caption, { marginTop: spacing.sm }]}>{chord.quality.usedIn}</Text>
    </WidgetFrame>
  );
}

export function ChordSetWidget({ symbols, caption }: { symbols: string[]; caption?: string }) {
  const instrument = useInstrument();
  const [selected, setSelected] = useState(0);

  const chords = useMemo(
    () => symbols.map((s) => parseChordSymbol(s, 4)).filter((c): c is Chord => c !== null),
    [symbols],
  );

  const current = chords[Math.min(selected, chords.length - 1)];

  return (
    <WidgetFrame caption={caption}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chordScroll}>
        {chords.map((chord, i) => {
          const active = i === selected;
          return (
            <View key={i} style={styles.chordButtonWrap}>
              <GhostButton
                label={chordSymbol(chord)}
                size="sm"
                fullWidth={false}
                tint={active ? palette.violet : undefined}
                onPress={() => {
                  setSelected(i);
                  playChord(chord, { instrument });
                }}
              />
            </View>
          );
        })}
      </ScrollView>

      {current ? (
        <>
          <View style={[styles.headerRow, { marginTop: spacing.sm }]}>
            <View style={styles.flex}>
              <Text style={type.subheading}>{current.quality.name}</Text>
              <Text style={[type.caption, { marginTop: 2 }]}>
                {current.quality.degrees.join(' ')}
              </Text>
            </View>
            <Pill label={`Tension ${current.quality.tension}/10`} tint={palette.rose} />
          </View>
          <Text style={[type.small, { marginTop: 4, marginBottom: spacing.sm }]}>
            {current.quality.mood}
          </Text>
          <Piano
            startMidi={60}
            octaves={2}
            highlights={chordHighlights(current)}
            readOnly
            labelMode="none"
            height={104}
          />
        </>
      ) : null}
    </WidgetFrame>
  );
}

export function VoicingsWidget({ symbol, caption }: { symbol: string; caption?: string }) {
  const instrument = useInstrument();
  const [style, setStyle] = useState<VoicingStyle>('close');

  const chord = useMemo(() => parseChordSymbol(symbol, 4), [symbol]);
  if (!chord) return null;

  const midi = voiceChord(chord, style);
  const lowest = Math.min(...midi);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>
            {chordSymbol(chord)} · {VOICING_LABELS[style]}
          </Text>
        </View>
        <PlayButton
          playing={false}
          onPress={() =>
            audioEngine.playChord(midi, { instrument, duration: 2.4, spread: 0.02, velocity: 0.78 })
          }
          size={44}
        />
      </View>

      <Text style={[type.small, { marginVertical: spacing.sm }]}>{VOICING_NOTES[style]}</Text>

      <Piano
        startMidi={Math.min(48, lowest - mod(lowest, 12))}
        octaves={3}
        highlights={Object.fromEntries(midi.map((m, i) => [m, { color: degreeColor(i + 1) }]))}
        readOnly
        labelMode="c-only"
        height={104}
      />

      <View style={{ marginTop: spacing.sm }}>
        <ChipRow
          options={(Object.keys(VOICING_LABELS) as VoicingStyle[]).map((v) => ({
            value: v,
            label: VOICING_LABELS[v],
          }))}
          value={style}
          onChange={setStyle}
        />
      </View>
    </WidgetFrame>
  );
}

// ── Progression widget ────────────────────────────────────────────────────

export function ProgressionWidget({
  romans,
  tonic,
  mode,
  progressionId,
  caption,
}: {
  romans: string[];
  tonic: string;
  mode: 'major' | 'minor';
  progressionId?: string;
  caption?: string;
}) {
  const instrument = useInstrument();
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [currentTonic, setCurrentTonic] = useState(tonic);

  const key: Key = useMemo(
    () => ({ tonic: requireNote(currentTonic + '4'), mode }),
    [currentTonic, mode],
  );

  const chords = useMemo(() => progressionToChords(romans, key, 4), [romans, key]);
  const info = progressionId ? safeProgression(progressionId) : null;

  const handlePlay = useCallback(() => {
    if (playing) {
      audioEngine.stopAll();
      setPlaying(false);
      setStep(-1);
      return;
    }
    setPlaying(true);
    const { duration } = playProgression(romans, key, {
      instrument,
      beatsPerChord: romans.length > 8 ? 4 : 2,
      onStep: setStep,
    });
    setTimeout(
      () => {
        setPlaying(false);
        setStep(-1);
      },
      duration * 1000 + 400,
    );
  }, [playing, romans, key, instrument]);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>{info?.name ?? 'Progression'}</Text>
          <Text style={[type.caption, { marginTop: 2 }]}>
            {noteName(key.tonic)} {mode}
          </Text>
        </View>
        <PlayButton playing={playing} onPress={handlePlay} size={46} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
        {chords.map((chord, i) => {
          const active = step === i;
          return (
            <View
              key={i}
              style={[
                styles.chordCell,
                active ? { backgroundColor: `${palette.violet}33`, borderColor: palette.violet } : null,
              ]}
            >
              <Text style={[type.caption, { color: active ? palette.violet : colors.textDim }]}>
                {romans[i]}
              </Text>
              <Text style={[type.subheading, { marginTop: 2 }]}>{chordSymbol(chord)}</Text>
            </View>
          );
        })}
      </ScrollView>

      {info ? (
        <Text style={[type.small, { marginTop: spacing.md }]}>{info.why}</Text>
      ) : null}
      {info?.heardIn.length ? (
        <Text style={[type.caption, { marginTop: spacing.sm }]}>
          Heard in: {info.heardIn.join(' · ')}
        </Text>
      ) : null}

      <View style={{ marginTop: spacing.md }}>
        <Text style={[type.overline, { marginBottom: 6 }]}>Transpose</Text>
        <ChipRow
          options={['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((t) => ({ value: t, label: t }))}
          value={currentTonic}
          onChange={setCurrentTonic}
        />
      </View>
    </WidgetFrame>
  );
}

function safeProgression(id: string) {
  try {
    return getProgression(id);
  } catch {
    return null;
  }
}

// ── Circle of fifths ──────────────────────────────────────────────────────

export function CircleWidget({ caption }: { caption?: string }) {
  const instrument = useInstrument();
  const [selected, setSelected] = useState<Key>({ tonic: requireNote('C'), mode: 'major' });

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.center}>
        <CircleOfFifths
          size={300}
          selected={selected}
          onSelect={(key) => {
            setSelected(key);
            playProgression(['I', 'IV', 'V', 'I'], key, {
              instrument,
              bpm: 150,
              beatsPerChord: 1,
              withBass: false,
            });
          }}
        />
      </View>
      <Text style={[type.small, { marginTop: spacing.md, textAlign: 'center' }]}>
        Tap any key to hear its I–IV–V–I. Neighbouring keys differ by one accidental.
      </Text>
    </WidgetFrame>
  );
}

// ── Staff ─────────────────────────────────────────────────────────────────

export function StaffWidget({
  notes,
  clef = 'treble',
  keyTonic,
  keyMode = 'major',
  chord,
  caption,
}: {
  notes: string[];
  clef?: 'treble' | 'bass';
  keyTonic?: string;
  keyMode?: 'major' | 'minor';
  chord?: boolean;
  caption?: string;
}) {
  const instrument = useInstrument();
  const [step, setStep] = useState(-1);

  const parsed = useMemo(
    () => notes.map((n) => requireNote(n, clef === 'bass' ? 3 : 4)),
    [notes, clef],
  );
  const midi = useMemo(() => parsed.map(toMidi), [parsed]);

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={[type.caption]}>
            {keyTonic ? `${keyTonic} ${keyMode}` : clef === 'bass' ? 'Bass clef' : 'Treble clef'}
          </Text>
        </View>
        <PlayButton
          playing={false}
          size={42}
          onPress={() => {
            if (chord) {
              audioEngine.playChord(midi, { instrument, duration: 2, spread: 0.02 });
            } else {
              audioEngine.playSequence(midi, { instrument, noteLength: 0.42, onStep: setStep });
              setTimeout(() => setStep(-1), midi.length * 420 + 500);
            }
          }}
        />
      </View>
      <Staff
        notes={parsed.map((note) => ({ note }))}
        clef={clef}
        chord={chord}
        keySignatureOf={keyTonic ? { tonic: requireNote(keyTonic), mode: keyMode } : undefined}
        activeIndex={step}
        width={320}
        showNoteNames
      />
    </WidgetFrame>
  );
}

// ── Fretboard ─────────────────────────────────────────────────────────────

export function FretboardWidget({
  scale,
  chord,
  caption,
}: {
  scale?: { tonic: string; scaleId: string };
  chord?: string;
  caption?: string;
}) {
  const instrument = useInstrument();
  const [active, setActive] = useState<number[]>([]);

  const markings = useMemo(() => {
    if (scale) {
      const tonic = requireNote(scale.tonic);
      const def = getScale(scale.scaleId);
      const map: Record<number, { color: string; label?: string }> = {};
      buildScale(tonic, def).forEach((note, i) => {
        map[pitchClass(note)] = { color: degreeColor(i + 1), label: def.degrees[i] };
      });
      return map;
    }
    if (chord) {
      const parsed = parseChordSymbol(chord, 3);
      if (parsed) {
        const map: Record<number, { color: string }> = {};
        chordMidi(parsed).forEach((midi, i) => {
          map[mod(midi, 12)] = { color: degreeColor(i + 1) };
        });
        return map;
      }
    }
    return {};
  }, [scale, chord]);

  return (
    <WidgetFrame caption={caption} padded={false}>
      <Fretboard
        markings={markings}
        activeNotes={active}
        onPressFret={(midi) => {
          setActive([midi]);
          audioEngine.playNote(midi, { instrument, duration: 1.1, velocity: 0.8 });
          setTimeout(() => setActive([]), 500);
        }}
      />
    </WidgetFrame>
  );
}

// ── Interval lab ──────────────────────────────────────────────────────────

export function IntervalLabWidget({ caption }: { caption?: string }) {
  const instrument = useInstrument();
  const [semitones, setSemitones] = useState(4);
  const [style, setStyle] = useState<'melodic' | 'harmonic'>('melodic');
  const root = 60;

  const interval = useMemo(() => intervalFromSemitones(semitones), [semitones]);

  const reference = INTERVAL_REFERENCES[semitones];

  return (
    <WidgetFrame caption={caption}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={type.subheading}>{intervalName(interval)}</Text>
          <Text style={[type.caption, { marginTop: 2 }]}>
            {intervalAbbr(interval)} · {semitones} semitone{semitones === 1 ? '' : 's'}
          </Text>
        </View>
        <PlayButton
          playing={false}
          size={46}
          onPress={() => playInterval(root, root + semitones, { instrument, style })}
        />
      </View>

      {reference ? (
        <View style={{ marginTop: spacing.sm }}>
          <Text style={[type.small, { color: colors.text }]}>{reference.colour}</Text>
          <Text style={[type.caption, { marginTop: 6 }]}>↑ {reference.up}</Text>
          <Text style={type.caption}>↓ {reference.down}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: spacing.md }}>
        <Piano
          startMidi={60}
          octaves={1}
          highlights={{
            [root]: { color: palette.gold },
            [root + semitones]: { color: palette.violet },
          }}
          readOnly
          labelMode="none"
          height={100}
        />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <ChipRow
          options={SIMPLE_INTERVALS.map((iv) => ({
            value: iv.semitones,
            label: intervalAbbr(iv),
          }))}
          value={semitones}
          onChange={setSemitones}
        />
      </View>
      <View style={{ marginTop: spacing.sm }}>
        <ChipRow
          options={[
            { value: 'melodic' as const, label: 'Melodic' },
            { value: 'harmonic' as const, label: 'Harmonic' },
          ]}
          value={style}
          onChange={setStyle}
          tint={palette.cyan}
        />
      </View>
    </WidgetFrame>
  );
}

// ── Mode comparison ───────────────────────────────────────────────────────

export function ModeCompareWidget({
  tonic = 'D',
  caption,
}: {
  tonic?: string;
  caption?: string;
}) {
  const instrument = useInstrument();
  const [selected, setSelected] = useState('dorian');
  const tonicNote = useMemo(() => requireNote(tonic + '4'), [tonic]);
  const scale = getScale(selected);

  return (
    <WidgetFrame caption={caption}>
      <Text style={[type.overline, { marginBottom: spacing.sm }]}>Bright → Dark</Text>
      {MODE_BRIGHTNESS_ORDER.map((id, index) => {
        const def = getScale(id);
        const active = id === selected;
        return (
          <View
            key={id}
            style={[
              styles.modeRow,
              active ? { backgroundColor: `${palette.violet}22`, borderColor: palette.violet } : null,
            ]}
            onTouchEnd={() => {
              setSelected(id);
              // A drone under the scale is what makes a mode audible as a mode
              // rather than as a rotation of its parent major scale.
              audioEngine.playNote(toMidi(tonicNote) - 24, {
                instrument: 'pad',
                duration: 3.4,
                velocity: 0.5,
              });
              playScale(tonicNote, def, { instrument, bpm: 190 });
            }}
          >
            <View style={styles.flex}>
              <Text style={[type.bodyStrong, { fontSize: 15 }]}>{def.name}</Text>
              <Text style={[type.caption, { marginTop: 1 }]}>{def.degrees.join(' ')}</Text>
            </View>
            <View style={styles.brightnessBar}>
              {Array.from({ length: 7 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.brightnessDot,
                    i <= 6 - index ? { backgroundColor: palette.gold } : null,
                  ]}
                />
              ))}
            </View>
          </View>
        );
      })}
      <Text style={[type.small, { marginTop: spacing.md }]}>{scale.mood}</Text>
    </WidgetFrame>
  );
}

// ── Chord detective ───────────────────────────────────────────────────────

export function ChordDetectiveWidget({ caption }: { caption?: string }) {
  const instrument = useInstrument();
  const [held, setHeld] = useState<number[]>([]);
  const { active, press, release } = useKeyboardVoices(instrument);

  const handlePress = useCallback(
    (midi: number) => {
      press(midi);
      setHeld((prev) => (prev.includes(midi) ? prev : [...prev, midi].sort((a, b) => a - b)));
    },
    [press],
  );

  const matches = useMemo(() => (held.length >= 2 ? identifyChords(held, 4) : []), [held]);

  return (
    <WidgetFrame caption={caption} padded={false}>
      <View style={{ padding: spacing.md }}>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <Text style={type.subheading}>
              {matches.length ? matches[0].symbol : held.length ? 'Keep going…' : 'Play some notes'}
            </Text>
            <Text style={[type.caption, { marginTop: 2 }]}>
              {matches.length
                ? matches[0].exact
                  ? matches[0].quality.name
                  : `Closest match — ${matches[0].quality.name}`
                : 'Hold two or more keys together'}
            </Text>
          </View>
          <IconButton glyph="⟲" size={38} onPress={() => setHeld([])} accessibilityLabel="Clear" />
        </View>

        {matches.length > 1 ? (
          <View style={styles.altRow}>
            {matches.slice(1).map((m) => (
              <Pill key={m.symbol} label={m.symbol} tint={palette.cyan} />
            ))}
          </View>
        ) : null}
      </View>

      <Piano
        startMidi={48}
        octaves={3}
        active={active}
        highlights={Object.fromEntries(held.map((m) => [m, { color: palette.violet, outline: true }]))}
        onPressKey={handlePress}
        onReleaseKey={release}
        labelMode="c-only"
      />
    </WidgetFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  transport: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  noteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  noteChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    minWidth: 46,
  },
  chordScroll: { marginHorizontal: -2 },
  chordButtonWrap: { marginRight: spacing.sm },
  chordCell: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    minWidth: 76,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'transparent',
    marginBottom: 5,
  },
  brightnessBar: { flexDirection: 'row', gap: 3 },
  brightnessDot: {
    width: 5,
    height: 14,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  altRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
});
