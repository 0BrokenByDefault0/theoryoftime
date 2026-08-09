import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { colors, gradients, motion, palette, radius, spacing, type } from '../../theme';
import { BuildCard, EarCard, InteractiveCard, LessonCard, QuizCard, ConceptCard } from '../../content/types';
import {
  mod,
  parseChordSymbol,
  requireNote,
  chordMidi,
  getScale,
  buildScale,
  toMidi,
} from '../../theory';
import { audioEngine } from '../../audio/engine';
import { playChord, playInterval, playProgression, playScale } from '../../audio/player';
import { useKeyboardVoices } from '../../audio/useAudio';
import { Piano } from '../music/Piano';
import { Widget } from '../widgets';
import { GradientButton, PlayButton } from '../ui/Button';
import { Callout, Pill } from '../ui/Text';
import { useInstrument } from '../widgets/shared';

export interface CardResult {
  /** Whether the card counted as answered correctly. Null for prose cards. */
  correct: boolean | null;
  /** True once the learner may move on. */
  done: boolean;
}

interface CardProps {
  card: LessonCard;
  tint: string;
  onResult: (result: CardResult) => void;
}

export function CardRenderer({ card, tint, onResult }: CardProps) {
  switch (card.kind) {
    case 'concept':
      return <ConceptCardView card={card} onResult={onResult} />;
    case 'interactive':
      return <InteractiveCardView card={card} onResult={onResult} />;
    case 'quiz':
      return <QuizCardView card={card} tint={tint} onResult={onResult} />;
    case 'ear':
      return <EarCardView card={card} tint={tint} onResult={onResult} />;
    case 'build':
      return <BuildCardView card={card} tint={tint} onResult={onResult} />;
  }
}

// ── Concept ───────────────────────────────────────────────────────────────

function ConceptCardView({
  card,
  onResult,
}: {
  card: ConceptCard;
  onResult: (r: CardResult) => void;
}) {
  useEffect(() => {
    onResult({ correct: null, done: true });
  }, [card, onResult]);

  return (
    <Animated.View entering={FadeInDown.duration(motion.base)}>
      <Text style={[type.title, styles.cardTitle]}>{card.title}</Text>
      {card.lede ? <Text style={styles.lede}>{card.lede}</Text> : null}
      {card.body.map((paragraph, i) => (
        <RichText key={i} text={paragraph} />
      ))}
      {card.widget ? <Widget spec={card.widget} /> : null}
      {card.callouts?.map((callout, i) => (
        <Callout key={i} variant={callout.variant} title={callout.title}>
          {callout.text}
        </Callout>
      ))}
    </Animated.View>
  );
}

/**
 * Minimal inline markdown: **bold** and *italic*. Lesson prose is written by
 * hand, so a full parser would be overkill — but emphasis genuinely helps
 * readability in dense explanations.
 */
function RichText({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean), [text]);
  return (
    <Text style={styles.paragraph}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={styles.bold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <Text key={i} style={styles.italic}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

// ── Interactive ───────────────────────────────────────────────────────────

function InteractiveCardView({
  card,
  onResult,
}: {
  card: InteractiveCard;
  onResult: (r: CardResult) => void;
}) {
  useEffect(() => {
    onResult({ correct: null, done: true });
  }, [card, onResult]);

  return (
    <Animated.View entering={FadeInDown.duration(motion.base)}>
      <Pill label="Try it" tint={palette.cyan} icon="▸" />
      <Text style={[type.title, styles.cardTitle, { marginTop: spacing.sm }]}>{card.title}</Text>
      <Text style={styles.instruction}>{card.instruction}</Text>
      <Widget spec={card.widget} />
      {card.body?.map((paragraph, i) => (
        <RichText key={i} text={paragraph} />
      ))}
      {card.callouts?.map((callout, i) => (
        <Callout key={i} variant={callout.variant} title={callout.title}>
          {callout.text}
        </Callout>
      ))}
    </Animated.View>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────

function QuizCardView({
  card,
  tint,
  onResult,
}: {
  card: QuizCard;
  tint: string;
  onResult: (r: CardResult) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      const correct = index === card.answer;
      setSelected(index);
      Haptics.notificationAsync(
        correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
      ).catch(() => undefined);
      onResult({ correct, done: true });
    },
    [answered, card.answer, onResult],
  );

  useEffect(() => {
    setSelected(null);
    onResult({ correct: null, done: false });
    // Resetting when the card changes is what makes a re-run of the lesson work.
  }, [card, onResult]);

  return (
    <Animated.View entering={FadeInDown.duration(motion.base)}>
      <Pill label="Check yourself" tint={tint} icon="?" />
      <Text style={[type.heading, styles.question]}>{card.question}</Text>
      {card.widget ? <Widget spec={card.widget} /> : null}

      <View style={styles.options}>
        {card.options.map((option, i) => (
          <OptionRow
            key={i}
            label={option}
            index={i}
            selected={selected}
            answer={card.answer}
            tint={tint}
            onPress={() => handleSelect(i)}
          />
        ))}
      </View>

      {answered ? (
        <Animated.View entering={FadeIn.duration(motion.base)} exiting={FadeOut}>
          <Callout
            variant={selected === card.answer ? 'insight' : 'warning'}
            title={selected === card.answer ? 'Correct' : 'Not quite'}
          >
            {card.explain}
          </Callout>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function OptionRow({
  label,
  index,
  selected,
  answer,
  tint,
  onPress,
}: {
  label: string;
  index: number;
  selected: number | null;
  answer: number;
  tint: string;
  onPress: () => void;
}) {
  const answered = selected !== null;
  const isCorrect = index === answer;
  const isSelected = index === selected;

  // Once answered, always reveal the right answer — a quiz that hides it
  // teaches nothing when the learner gets it wrong.
  const state = !answered
    ? 'idle'
    : isCorrect
      ? 'correct'
      : isSelected
        ? 'wrong'
        : 'dimmed';

  const stateStyle = {
    idle: { borderColor: colors.border, backgroundColor: colors.surface },
    correct: { borderColor: colors.success, backgroundColor: 'rgba(34,197,94,0.16)' },
    wrong: { borderColor: colors.danger, backgroundColor: 'rgba(244,63,94,0.16)' },
    dimmed: { borderColor: colors.border, backgroundColor: colors.surface, opacity: 0.4 },
  }[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={answered}
      style={[styles.option, stateStyle]}
      accessibilityRole="button"
    >
      <View style={[styles.optionMarker, { borderColor: answered ? 'transparent' : `${tint}88` }]}>
        <Text style={styles.optionMarkerText}>
          {state === 'correct' ? '✓' : state === 'wrong' ? '✕' : String.fromCharCode(65 + index)}
        </Text>
      </View>
      <Text style={[type.bodyStrong, styles.optionLabel]}>{label}</Text>
    </Pressable>
  );
}

// ── Ear training ──────────────────────────────────────────────────────────

function EarCardView({
  card,
  tint,
  onResult,
}: {
  card: EarCard;
  tint: string;
  onResult: (r: CardResult) => void;
}) {
  const instrument = useInstrument();
  const [selected, setSelected] = useState<number | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const answered = selected !== null;

  const play = useCallback(() => {
    setHasPlayed(true);
    audioEngine.stopAll();
    const prompt = card.prompt;
    switch (prompt.type) {
      case 'interval':
        playInterval(60, 60 + prompt.semitones, { instrument, style: prompt.style ?? 'melodic' });
        break;
      case 'chord': {
        const chord = parseChordSymbol(prompt.symbol, 4);
        if (chord) playChord(chord, { instrument, duration: 2.2 });
        break;
      }
      case 'scale':
        playScale(requireNote(prompt.tonic + '4'), getScale(prompt.scaleId), { instrument });
        break;
      case 'progression':
        playProgression(prompt.romans, { tonic: requireNote(prompt.tonic + '4'), mode: prompt.mode }, {
          instrument,
        });
        break;
    }
  }, [card.prompt, instrument]);

  useEffect(() => {
    setSelected(null);
    setHasPlayed(false);
    onResult({ correct: null, done: false });
    // Autoplay after a beat so the learner is not left staring at silence.
    const handle = setTimeout(play, 400);
    return () => clearTimeout(handle);
  }, [card, onResult, play]);

  const handleSelect = (index: number) => {
    if (answered) return;
    const correct = index === card.answer;
    setSelected(index);
    Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    ).catch(() => undefined);
    onResult({ correct, done: true });
  };

  return (
    <Animated.View entering={FadeInDown.duration(motion.base)}>
      <Pill label="Ear training" tint={palette.teal} icon="♪" />
      <Text style={[type.heading, styles.question]}>{card.question}</Text>

      <View style={styles.earPlayer}>
        <PlayButton playing={false} onPress={play} size={72} gradient={gradients.mint} label="Play again" />
        <Text style={[type.caption, { marginTop: spacing.sm }]}>
          {hasPlayed ? 'Tap to hear it again' : 'Listen…'}
        </Text>
      </View>

      <View style={styles.options}>
        {card.options.map((option, i) => (
          <OptionRow
            key={i}
            label={option}
            index={i}
            selected={selected}
            answer={card.answer}
            tint={tint}
            onPress={() => handleSelect(i)}
          />
        ))}
      </View>

      {answered ? (
        <Animated.View entering={FadeIn.duration(motion.base)}>
          <Callout
            variant={selected === card.answer ? 'listen' : 'warning'}
            title={selected === card.answer ? 'Correct' : 'Not quite'}
          >
            {card.explain}
          </Callout>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

// ── Build on the keyboard ─────────────────────────────────────────────────

function BuildCardView({
  card,
  tint,
  onResult,
}: {
  card: BuildCard;
  tint: string;
  onResult: (r: CardResult) => void;
}) {
  const instrument = useInstrument();
  const { active, press, release } = useKeyboardVoices(instrument);
  const [held, setHeld] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);

  const target = useMemo(() => new Set(card.targetPitchClasses.map((pc) => mod(pc, 12))), [card]);

  useEffect(() => {
    setHeld([]);
    setStatus('idle');
    setShowHint(false);
    onResult({ correct: null, done: false });
  }, [card, onResult]);

  const handlePress = useCallback(
    (midi: number) => {
      press(midi);
      setHeld((prev) => {
        if (prev.includes(midi)) return prev;
        const next = [...prev, midi];
        const pcs = new Set(next.map((m) => mod(m, 12)));

        // Only judge once the learner has played as many distinct notes as the
        // task asks for — otherwise a correct chord fails on its first note.
        if (pcs.size >= card.expectedCount) {
          const correct =
            pcs.size === target.size && [...pcs].every((pc) => target.has(pc));
          setStatus(correct ? 'correct' : 'wrong');
          Haptics.notificationAsync(
            correct
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Warning,
          ).catch(() => undefined);
          onResult({ correct, done: correct });
        }
        return next;
      });
    },
    [press, card.expectedCount, target, onResult],
  );

  const reset = () => {
    setHeld([]);
    setStatus('idle');
  };

  return (
    <Animated.View entering={FadeInDown.duration(motion.base)}>
      <Pill label="Play it" tint={palette.gold} icon="⌘" />
      <Text style={[type.title, styles.cardTitle, { marginTop: spacing.sm }]}>{card.title}</Text>
      <Text style={styles.instruction}>{card.instruction}</Text>

      <View style={styles.buildStatus}>
        <Text
          style={[
            type.bodyStrong,
            {
              color:
                status === 'correct'
                  ? colors.success
                  : status === 'wrong'
                    ? colors.warning
                    : colors.textDim,
            },
          ]}
        >
          {status === 'correct'
            ? '✓ That’s it'
            : status === 'wrong'
              ? 'Not quite — try again'
              : `${new Set(held.map((m) => mod(m, 12))).size} / ${card.expectedCount} notes`}
        </Text>
        {held.length ? (
          <Pressable onPress={reset} hitSlop={10}>
            <Text style={[type.caption, { color: tint }]}>Reset</Text>
          </Pressable>
        ) : null}
      </View>

      <Piano
        startMidi={card.startMidi ?? 60}
        octaves={card.octaves ?? 2}
        active={active}
        highlights={Object.fromEntries(
          held.map((m) => [
            m,
            {
              color: status === 'correct' ? colors.success : tint,
              outline: status !== 'correct',
            },
          ]),
        )}
        onPressKey={handlePress}
        onReleaseKey={release}
        labelMode="c-only"
      />

      {status === 'correct' ? (
        <Animated.View entering={FadeIn}>
          <Callout variant="insight" title="Correct">
            {card.explain}
          </Callout>
        </Animated.View>
      ) : (
        <View style={{ marginTop: spacing.md }}>
          {showHint ? (
            <Callout variant="pro" title="Hint">
              {card.hint}
            </Callout>
          ) : (
            <GradientButton
              label="Show a hint"
              gradient={gradients.ghost as unknown as readonly [string, string]}
              size="sm"
              haptic={false}
              onPress={() => setShowHint(true)}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { marginBottom: spacing.md },
  lede: {
    ...type.subheading,
    color: palette.gold,
    marginBottom: spacing.md,
    fontSize: 18,
    lineHeight: 25,
  },
  paragraph: {
    ...type.body,
    marginBottom: spacing.md,
  },
  bold: { color: colors.text, fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  instruction: {
    ...type.bodyStrong,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  question: { marginTop: spacing.md, marginBottom: spacing.lg },
  options: { gap: spacing.sm, marginTop: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  optionMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionMarkerText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  optionLabel: { flex: 1, fontSize: 15.5 },
  earPlayer: { alignItems: 'center', marginVertical: spacing.lg },
  buildStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});
