import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Aurora } from '../../src/components/ui/Screen';
import { GlassCard, GradientCard } from '../../src/components/ui/Card';
import { GradientButton, GhostButton } from '../../src/components/ui/Button';
import { ProgressBar, Stat } from '../../src/components/ui/Progress';
import { CardRenderer, CardResult } from '../../src/components/lesson/CardRenderer';
import { colors, gradients, radius, spacing, type } from '../../src/theme';
import { LESSONS_BY_ID, STAGE_OF_LESSON, nextLesson } from '../../src/content/curriculum';
import { QuizCard, EarCard } from '../../src/content/types';
import { audioEngine } from '../../src/audio/engine';
import { useStore } from '../../src/state/store';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const lesson = LESSONS_BY_ID[String(lessonId)];
  const stage = STAGE_OF_LESSON[String(lessonId)];

  const startLesson = useStore((s) => s.startLesson);
  const savePosition = useStore((s) => s.saveLessonPosition);
  const completeLesson = useStore((s) => s.completeLesson);
  const recordAnswer = useStore((s) => s.recordAnswer);
  const addReviewItems = useStore((s) => s.addReviewItems);
  const gradeReview = useStore((s) => s.gradeReview);
  const addTime = useStore((s) => s.addTime);
  const progress = useStore((s) => s.progress);

  const [index, setIndex] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [answers, setAnswers] = useState<Array<boolean | null>>([]);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  // Resume where the learner left off, but never on the summary screen.
  useEffect(() => {
    if (!lesson) return;
    startLesson(lesson.id);
    const saved = progress[lesson.id]?.lastCardIndex ?? 0;
    setIndex(Math.min(saved, lesson.cards.length - 1));
    startedAt.current = Date.now();
    // Only on mount / lesson change — later store updates must not rewind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  useEffect(() => {
    return () => {
      audioEngine.stopAll();
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      if (seconds > 2) addTime(seconds);
    };
  }, [addTime]);

  // handleResult must stay referentially stable, or every card would re-run its
  // mount effect on each render. It reads the live index through a ref rather
  // than closing over it.
  const indexRef = useRef(index);
  indexRef.current = index;

  const handleResult = useCallback((result: CardResult) => {
    setCanAdvance(result.done);
    if (result.correct !== null) {
      setAnswers((prev) => {
        const next = [...prev];
        next[indexRef.current] = result.correct;
        return next;
      });
    }
  }, []);

  const card = lesson?.cards[index];

  const gradedCount = useMemo(
    () => lesson?.cards.filter((c) => c.kind === 'quiz' || c.kind === 'ear' || c.kind === 'build').length ?? 0,
    [lesson],
  );

  const correctCount = useMemo(() => answers.filter((a) => a === true).length, [answers]);

  const advance = useCallback(() => {
    if (!lesson || !card) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    audioEngine.stopAll();

    // Feed the answer into spaced repetition before moving on.
    if (card.kind === 'quiz' || card.kind === 'ear') {
      const graded = card as QuizCard | EarCard;
      if (graded.reviewId && graded.reviewCategory) {
        addReviewItems([{ id: graded.reviewId, category: graded.reviewCategory }]);
        gradeReview(graded.reviewId, answers[index] === true ? 4 : 1);
      }
      if (answers[index] !== null && answers[index] !== undefined) {
        recordAnswer(answers[index] === true);
      }
    }

    if (index >= lesson.cards.length - 1) {
      const score = gradedCount ? correctCount / gradedCount : 1;
      completeLesson(lesson.id, score, lesson.xp);
      setFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      return;
    }

    const next = index + 1;
    setIndex(next);
    setCanAdvance(false);
    savePosition(lesson.id, next);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [
    lesson,
    card,
    index,
    answers,
    gradedCount,
    correctCount,
    addReviewItems,
    gradeReview,
    recordAnswer,
    completeLesson,
    savePosition,
  ]);

  const goBack = useCallback(() => {
    if (index === 0) {
      router.back();
      return;
    }
    audioEngine.stopAll();
    setIndex(index - 1);
    setCanAdvance(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [index, router]);

  if (!lesson || !stage) {
    return (
      <View style={styles.root}>
        <Aurora />
        <Text style={[type.title, { padding: spacing.xl, marginTop: insets.top + 40 }]}>
          Lesson not found
        </Text>
      </View>
    );
  }

  if (finished) {
    return <LessonSummary lessonId={lesson.id} correct={correctCount} total={gradedCount} />;
  }

  const fraction = (index + 1) / lesson.cards.length;

  return (
    <View style={styles.root}>
      <Aurora gradient={stage.gradient} intensity={0.42} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={goBack} hitSlop={14} style={styles.headerButton}>
          <Text style={styles.headerGlyph}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[type.caption, { color: stage.color }]} numberOfLines={1}>
            {stage.title}
          </Text>
          <Text style={[type.small, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>
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
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar progress={fraction} gradient={stage.gradient} height={6} />
        <Text style={[type.caption, { marginTop: 6, textAlign: 'right' }]}>
          {index + 1} / {lesson.cards.length}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {card ? (
          <CardRenderer
            key={`${lesson.id}-${index}`}
            card={card}
            tint={stage.color}
            onResult={handleResult}
          />
        ) : null}
      </ScrollView>

      {/* Footer action */}
      <Animated.View
        entering={FadeInUp.duration(220)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <GradientButton
          label={index >= lesson.cards.length - 1 ? 'Finish lesson' : 'Continue'}
          gradient={stage.gradient}
          disabled={!canAdvance}
          onPress={advance}
          size="lg"
        />
      </Animated.View>
    </View>
  );
}

function LessonSummary({
  lessonId,
  correct,
  total,
}: {
  lessonId: string;
  correct: number;
  total: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lesson = LESSONS_BY_ID[lessonId];
  const stage = STAGE_OF_LESSON[lessonId];
  const progress = useStore((s) => s.progress);
  const streak = useStore((s) => s.streak);

  const completed = useMemo(
    () => Object.fromEntries(Object.entries(progress).map(([id, p]) => [id, p.completed])),
    [progress],
  );
  const next = useMemo(() => nextLesson(completed), [completed]);

  const score = total ? correct / total : 1;
  const perfect = total > 0 && correct === total;

  return (
    <View style={styles.root}>
      <Aurora gradient={stage.gradient} intensity={0.7} />
      <ScrollView
        contentContainerStyle={[
          styles.summaryContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.summaryHero}>
          <Text style={styles.summaryGlyph}>{perfect ? '🏆' : '✓'}</Text>
          <Text style={[type.hero, { textAlign: 'center', marginTop: spacing.md }]}>
            {perfect ? 'Flawless' : 'Lesson complete'}
          </Text>
          <Text style={[type.body, { textAlign: 'center', marginTop: spacing.sm }]}>
            {lesson.title}
          </Text>
        </Animated.View>

        <GradientCard gradient={stage.gradient} glowColor={stage.color} style={styles.summaryCard}>
          <View style={styles.statRow}>
            <Stat value={`+${lesson.xp}`} label="XP earned" tint="#FFFFFF" />
            <Stat
              value={total ? `${Math.round(score * 100)}%` : '—'}
              label={total ? `${correct}/${total} correct` : 'No questions'}
              tint="#FFFFFF"
            />
            <Stat value={streak.current} label="Day streak" tint="#FFFFFF" />
          </View>
        </GradientCard>

        {next ? (
          <GlassCard
            tint={stage.color}
            style={styles.nextCard}
            onPress={() => router.replace(`/lesson/${next.lesson.id}`)}
          >
            <Text style={type.overline}>Up next · {next.stage.title}</Text>
            <Text style={[type.subheading, { marginTop: 4 }]}>{next.lesson.title}</Text>
            <Text style={[type.small, { marginTop: 4 }]}>{next.lesson.summary}</Text>
          </GlassCard>
        ) : null}

        <View style={styles.summaryActions}>
          {next ? (
            <GradientButton
              label="Next lesson"
              gradient={stage.gradient}
              size="lg"
              onPress={() => router.replace(`/lesson/${next.lesson.id}`)}
            />
          ) : null}
          <GhostButton
            label="Back to the path"
            size="lg"
            style={{ marginTop: spacing.md }}
            onPress={() => router.dismissAll()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
    backgroundColor: colors.surface,
  },
  headerGlyph: { color: colors.text, fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  progressWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(5,6,13,0.85)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  summaryContent: { paddingHorizontal: spacing.lg },
  summaryHero: { alignItems: 'center', marginBottom: spacing.xl },
  summaryGlyph: { fontSize: 62 },
  summaryCard: { marginBottom: spacing.lg },
  statRow: { flexDirection: 'row' },
  nextCard: { marginBottom: spacing.xl },
  summaryActions: { marginTop: spacing.md },
});
