import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Aurora } from '../../src/components/ui/Screen';
import { GlassCard, GradientCard } from '../../src/components/ui/Card';
import { GhostButton, GradientButton, PlayButton } from '../../src/components/ui/Button';
import { ProgressBar, Stat } from '../../src/components/ui/Progress';
import { Callout, Pill } from '../../src/components/ui/Text';
import { Piano } from '../../src/components/music/Piano';
import { Staff } from '../../src/components/music/Staff';
import { colors, gradients, palette, radius, spacing, type } from '../../src/theme';
import { DRILLS_BY_ID } from '../../src/content/drills';
import { Question, generateRound, generateReviewRound, levelLabels } from '../../src/drills/generator';
import { getScale, mod, requireNote, toMidi } from '../../src/theory';
import { audioEngine } from '../../src/audio/engine';
import { playChord as playChordObj, playInterval, playProgression, playScale } from '../../src/audio/player';
import { useKeyboardVoices } from '../../src/audio/useAudio';
import { useStore } from '../../src/state/store';
import { dueItems } from '../../src/state/srs';

type Phase = 'level-select' | 'playing' | 'summary';

export default function DrillScreen() {
  const { drillId } = useLocalSearchParams<{ drillId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const drill = DRILLS_BY_ID[String(drillId)];
  const instrument = useStore((s) => s.settings.instrument);
  const reviews = useStore((s) => s.reviews);
  const recordDrill = useStore((s) => s.recordDrill);
  const recordAnswer = useStore((s) => s.recordAnswer);
  const gradeReview = useStore((s) => s.gradeReview);
  const addReviewItems = useStore((s) => s.addReviewItems);
  const addTime = useStore((s) => s.addTime);

  const [phase, setPhase] = useState<Phase>('level-select');
  const [level, setLevel] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const startedAt = useRef(Date.now());

  const isReview = drill?.kind === 'review';
  const question = questions[index];

  useEffect(() => {
    return () => {
      audioEngine.stopAll();
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      if (seconds > 2) addTime(seconds);
    };
  }, [addTime]);

  const begin = useCallback(
    (levelIndex: number) => {
      if (!drill) return;
      const round = isReview
        ? generateReviewRound(
            dueItems(reviews, Date.now(), drill.questions).map((r) => ({
              id: r.id,
              category: r.category,
            })),
            drill.questions,
          )
        : generateRound(drill, levelIndex);

      if (!round.length) return;

      setQuestions(round);
      setLevel(levelIndex);
      setIndex(0);
      setSelected(null);
      setCorrectCount(0);
      setStreak(0);
      setBestStreak(0);
      startedAt.current = Date.now();
      setPhase('playing');
    },
    [drill, isReview, reviews],
  );

  const playPrompt = useCallback(() => {
    if (!question) return;
    audioEngine.stopAll();
    const prompt = question.prompt;
    switch (prompt.kind) {
      case 'audio-interval':
        playInterval(prompt.low, prompt.high, { instrument, style: prompt.style });
        break;
      case 'audio-chord':
        audioEngine.playChord(prompt.midi, { instrument, duration: 2.2, spread: 0.015 });
        break;
      case 'audio-scale':
        playScale(prompt.tonic, getScale(prompt.scaleId), { instrument });
        break;
      case 'audio-progression':
        playProgression(prompt.romans, prompt.key, { instrument });
        break;
      default:
        break;
    }
  }, [question, instrument]);

  // Auto-play audio questions when they appear.
  useEffect(() => {
    if (phase !== 'playing' || !question) return;
    if (!question.prompt.kind.startsWith('audio')) return;
    const handle = setTimeout(playPrompt, 380);
    return () => clearTimeout(handle);
  }, [phase, question, playPrompt]);

  const answer = useCallback(
    (choice: number, overrideCorrect?: boolean) => {
      if (!question || selected !== null) return;
      const correct = overrideCorrect ?? choice === question.answer;
      setSelected(choice);

      Haptics.notificationAsync(
        correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
      ).catch(() => undefined);

      recordAnswer(correct);
      if (correct) {
        setCorrectCount((c) => c + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
      }

      if (question.reviewId && question.reviewCategory) {
        addReviewItems([{ id: question.reviewId, category: question.reviewCategory }]);
        gradeReview(question.reviewId, correct ? 4 : 1);
      }
    },
    [question, selected, recordAnswer, addReviewItems, gradeReview],
  );

  const next = useCallback(() => {
    if (!drill) return;
    audioEngine.stopAll();
    if (index >= questions.length - 1) {
      const xp = Math.round(drill.xpPerRound * (0.5 + (correctCount / Math.max(1, questions.length)) * 0.5));
      recordDrill(
        { drillId: drill.id, correct: correctCount, total: questions.length, bestStreak },
        xp,
      );
      setPhase('summary');
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }, [drill, index, questions.length, correctCount, bestStreak, recordDrill]);

  if (!drill) {
    return (
      <View style={styles.root}>
        <Aurora />
        <Text style={[type.title, { padding: spacing.xl, marginTop: insets.top + 40 }]}>
          Drill not found
        </Text>
      </View>
    );
  }

  const dueNow = dueItems(reviews, Date.now(), 100).length;

  return (
    <View style={styles.root}>
      <Aurora gradient={[drill.color, palette.violet]} intensity={0.45} />

      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => {
            audioEngine.stopAll();
            router.back();
          }}
          hitSlop={14}
          style={styles.headerButton}
        >
          <Text style={styles.headerGlyph}>✕</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[type.small, { color: colors.text, fontWeight: '700' }]}>{drill.title}</Text>
          {phase === 'playing' ? (
            <Text style={type.caption}>
              {index + 1} / {questions.length}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerButton}>
          {phase === 'playing' && streak >= 2 ? (
            <Text style={{ fontSize: 15 }}>{streak >= 5 ? '🔥' : '✦'}</Text>
          ) : null}
        </View>
      </View>

      {phase === 'playing' ? (
        <View style={styles.progressWrap}>
          <ProgressBar
            progress={(index + (selected !== null ? 1 : 0)) / Math.max(1, questions.length)}
            gradient={[drill.color, palette.violet]}
            height={5}
          />
        </View>
      ) : null}

      {phase === 'level-select' ? (
        <LevelSelect
          drill={drill}
          dueCount={dueNow}
          isReview={isReview}
          onStart={begin}
        />
      ) : phase === 'playing' && question ? (
        <QuestionView
          key={question.id}
          question={question}
          selected={selected}
          tint={drill.color}
          instrument={instrument}
          onAnswer={answer}
          onReplay={playPrompt}
          onNext={next}
          isLast={index >= questions.length - 1}
          insets={insets}
        />
      ) : (
        <DrillSummary
          drill={drill}
          correct={correctCount}
          total={questions.length}
          bestStreak={bestStreak}
          onRetry={() => begin(level)}
          onExit={() => router.back()}
          insets={insets}
        />
      )}
    </View>
  );
}

// ── Level select ──────────────────────────────────────────────────────────

function LevelSelect({
  drill,
  dueCount,
  isReview,
  onStart,
}: {
  drill: (typeof DRILLS_BY_ID)[string];
  dueCount: number;
  isReview: boolean;
  onStart: (level: number) => void;
}) {
  const labels = levelLabels(drill);

  return (
    <ScrollView contentContainerStyle={styles.selectContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.selectGlyph}>{drill.glyph}</Text>
      <Text style={[type.hero, { marginTop: spacing.md }]}>{drill.title}</Text>
      <Text style={[type.body, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        {drill.description}
      </Text>

      {isReview ? (
        dueCount > 0 ? (
          <GradientCard gradient={gradients.gold} glowColor={palette.gold}>
            <Text style={[type.title, { color: '#0A0C18' }]}>{dueCount} due</Text>
            <Text style={[type.body, { color: 'rgba(10,12,24,0.8)', marginTop: 4 }]}>
              These are scheduled for the moment just before you would have forgotten them.
            </Text>
            <GradientButton
              label="Start review"
              gradient={['#0A0C18', '#1E1B4B']}
              style={{ marginTop: spacing.lg }}
              onPress={() => onStart(0)}
            />
          </GradientCard>
        ) : (
          <GlassCard>
            <Text style={type.subheading}>Nothing due right now</Text>
            <Text style={[type.small, { marginTop: 6 }]}>
              Reviews appear as your memory of each item decays. Finish more lessons and drills to
              build the deck — then come back tomorrow.
            </Text>
          </GlassCard>
        )
      ) : (
        <>
          <Text style={[type.overline, { marginBottom: spacing.md }]}>Choose a level</Text>
          {labels.map((label, i) => (
            <Animated.View key={label} entering={FadeInDown.delay(i * 50).duration(280)}>
              <GlassCard tint={drill.color} style={styles.levelCard} onPress={() => onStart(i)}>
                <View style={styles.row}>
                  <View style={[styles.levelBadge, { borderColor: `${drill.color}77` }]}>
                    <Text style={[type.caption, { color: drill.color, fontWeight: '800' }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={[type.subheading, { flex: 1, marginLeft: spacing.md }]}>{label}</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
          <Text style={[type.caption, { marginTop: spacing.lg }]}>
            {drill.questions} questions · up to +{drill.xpPerRound} XP
          </Text>
        </>
      )}
    </ScrollView>
  );
}

// ── Question ──────────────────────────────────────────────────────────────

function QuestionView({
  question,
  selected,
  tint,
  instrument,
  onAnswer,
  onReplay,
  onNext,
  isLast,
  insets,
}: {
  question: Question;
  selected: number | null;
  tint: string;
  instrument: string;
  onAnswer: (choice: number, overrideCorrect?: boolean) => void;
  onReplay: () => void;
  onNext: () => void;
  isLast: boolean;
  insets: { bottom: number };
}) {
  const answered = selected !== null;
  const isAudio = question.prompt.kind.startsWith('audio');
  const isBuild = question.prompt.kind === 'build-chord';

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.questionContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[type.heading, styles.questionText]}>{question.question}</Text>

        {isAudio ? (
          <View style={styles.playerWrap}>
            <PlayButton playing={false} onPress={onReplay} size={80} gradient={[tint, palette.violet]} />
            <Text style={[type.caption, { marginTop: spacing.md }]}>Tap to hear it again</Text>
          </View>
        ) : null}

        {question.prompt.kind === 'staff' ? (
          <View style={styles.staffWrap}>
            <Staff
              notes={question.prompt.notes.map((n) => ({ note: requireNote(n) }))}
              clef={question.prompt.clef}
              keySignatureOf={
                question.prompt.keyTonic
                  ? { tonic: requireNote(question.prompt.keyTonic), mode: 'major' }
                  : undefined
              }
              width={300}
              lineGap={13}
            />
          </View>
        ) : null}

        {question.prompt.kind === 'text' ? (
          <View style={styles.textPrompt}>
            <Text style={[type.hero, { textAlign: 'center', color: tint }]}>
              {question.prompt.text}
            </Text>
          </View>
        ) : null}

        {isBuild && question.prompt.kind === 'build-chord' ? (
          <BuildPrompt
            targetPitchClasses={question.prompt.targetPitchClasses}
            instrument={instrument}
            tint={tint}
            answered={answered}
            onResolve={(correct) => onAnswer(0, correct)}
          />
        ) : null}

        {question.options.length ? (
          <View style={styles.options}>
            {question.options.map((option, i) => {
              const isCorrect = i === question.answer;
              const isSelected = i === selected;
              const state = !answered
                ? 'idle'
                : isCorrect
                  ? 'correct'
                  : isSelected
                    ? 'wrong'
                    : 'dim';
              const style = {
                idle: { borderColor: colors.border, backgroundColor: colors.surface },
                correct: { borderColor: colors.success, backgroundColor: 'rgba(34,197,94,0.16)' },
                wrong: { borderColor: colors.danger, backgroundColor: 'rgba(244,63,94,0.16)' },
                dim: { borderColor: colors.border, backgroundColor: colors.surface, opacity: 0.35 },
              }[state];

              return (
                <Pressable
                  key={i}
                  disabled={answered}
                  onPress={() => onAnswer(i)}
                  style={[styles.option, style]}
                >
                  <Text style={[type.bodyStrong, { flex: 1, fontSize: 15.5 }]}>{option}</Text>
                  {state === 'correct' ? <Text style={styles.tick}>✓</Text> : null}
                  {state === 'wrong' ? <Text style={styles.cross}>✕</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {answered && question.explain ? (
          <Animated.View entering={FadeIn.duration(240)}>
            <Callout variant={selected === question.answer ? 'insight' : 'warning'}>
              {question.explain}
            </Callout>
          </Animated.View>
        ) : null}
      </ScrollView>

      {answered ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <GradientButton
            label={isLast ? 'See results' : 'Next'}
            gradient={[tint, palette.violet]}
            size="lg"
            onPress={onNext}
          />
        </Animated.View>
      ) : null}
    </>
  );
}

/** Keyboard prompt used by the chord-spelling drill. */
function BuildPrompt({
  targetPitchClasses,
  instrument,
  tint,
  answered,
  onResolve,
}: {
  targetPitchClasses: number[];
  instrument: string;
  tint: string;
  answered: boolean;
  onResolve: (correct: boolean) => void;
}) {
  const { active, press, release } = useKeyboardVoices(instrument);
  const [held, setHeld] = useState<number[]>([]);
  const target = useMemo(() => new Set(targetPitchClasses.map((pc) => mod(pc, 12))), [targetPitchClasses]);

  const handlePress = useCallback(
    (midi: number) => {
      if (answered) return;
      press(midi);
      setHeld((prev) => {
        if (prev.includes(midi)) return prev;
        const next = [...prev, midi];
        const pcs = new Set(next.map((m) => mod(m, 12)));
        if (pcs.size >= target.size) {
          onResolve(pcs.size === target.size && [...pcs].every((pc) => target.has(pc)));
        }
        return next;
      });
    },
    [answered, press, target, onResolve],
  );

  return (
    <View style={{ marginVertical: spacing.md }}>
      <Text style={[type.caption, { marginBottom: spacing.sm }]}>
        {new Set(held.map((m) => mod(m, 12))).size} / {target.size} notes
      </Text>
      <Piano
        startMidi={60}
        octaves={2}
        active={active}
        highlights={Object.fromEntries(
          answered
            ? [...target].map((pc) => [pc, { color: colors.success }])
            : held.map((m) => [m, { color: tint, outline: true }]),
        )}
        onPressKey={handlePress}
        onReleaseKey={release}
        labelMode="c-only"
      />
    </View>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────

function DrillSummary({
  drill,
  correct,
  total,
  bestStreak,
  onRetry,
  onExit,
  insets,
}: {
  drill: (typeof DRILLS_BY_ID)[string];
  correct: number;
  total: number;
  bestStreak: number;
  onRetry: () => void;
  onExit: () => void;
  insets: { top?: number; bottom: number };
}) {
  const score = total ? correct / total : 0;
  const perfect = total > 0 && correct === total;

  const verdict =
    score === 1
      ? 'Perfect round'
      : score >= 0.85
        ? 'Strong'
        : score >= 0.6
          ? 'Getting there'
          : 'Keep going';

  return (
    <ScrollView contentContainerStyle={[styles.selectContent, { paddingBottom: insets.bottom + 40 }]}>
      <Text style={styles.selectGlyph}>{perfect ? '🏆' : score >= 0.6 ? '✓' : '↻'}</Text>
      <Text style={[type.hero, { marginTop: spacing.md }]}>{verdict}</Text>

      <GradientCard
        gradient={[drill.color, palette.violet]}
        glowColor={drill.color}
        style={{ marginTop: spacing.xl }}
      >
        <View style={styles.row}>
          <Stat value={`${Math.round(score * 100)}%`} label="Accuracy" tint="#FFFFFF" />
          <Stat value={`${correct}/${total}`} label="Correct" tint="#FFFFFF" />
          <Stat value={bestStreak} label="Best run" tint="#FFFFFF" />
        </View>
      </GradientCard>

      {score < 1 ? (
        <GlassCard style={{ marginTop: spacing.lg }}>
          <Text style={type.subheading}>What happens now</Text>
          <Text style={[type.small, { marginTop: 6 }]}>
            The items you missed have been moved to the front of your review schedule. You will see
            them again soon — that is the point, not a punishment.
          </Text>
        </GlassCard>
      ) : null}

      <View style={{ marginTop: spacing.xl }}>
        <GradientButton
          label="Go again"
          gradient={[drill.color, palette.violet]}
          size="lg"
          onPress={onRetry}
        />
        <GhostButton label="Done" size="lg" style={{ marginTop: spacing.md }} onPress={onExit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGlyph: { color: colors.text, fontSize: 17, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  progressWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  selectContent: { padding: spacing.lg, paddingTop: spacing.xl },
  selectGlyph: { fontSize: 52 },
  levelCard: { marginBottom: spacing.md },
  levelBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { color: colors.textDim, fontSize: 22 },
  questionContent: { paddingHorizontal: spacing.lg },
  questionText: { textAlign: 'center', marginBottom: spacing.lg },
  playerWrap: { alignItems: 'center', marginVertical: spacing.lg },
  staffWrap: { alignItems: 'center', marginVertical: spacing.lg },
  textPrompt: { paddingVertical: spacing.xl, alignItems: 'center' },
  options: { gap: spacing.sm, marginTop: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tick: { color: colors.success, fontSize: 17, fontWeight: '800' },
  cross: { color: colors.danger, fontSize: 17, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(5,6,13,0.9)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
