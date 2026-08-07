import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '../../src/components/ui/Screen';
import { GlassCard, GradientCard } from '../../src/components/ui/Card';
import { ProgressBar, ProgressRing, StreakBadge } from '../../src/components/ui/Progress';
import { Pill, SectionHeader } from '../../src/components/ui/Text';
import { TIERS, colors, gradients, palette, radius, spacing, type } from '../../src/theme';
import {
  STAGES,
  isLessonUnlocked,
  isStageUnlocked,
  nextLesson,
  stageProgress,
  TOTAL_LESSONS,
} from '../../src/content/curriculum';
import { useDailyProgress, useDueReviewCount, useLevel, useStore } from '../../src/state/store';

export default function PathScreen() {
  const router = useRouter();
  const progress = useStore((s) => s.progress);
  const streak = useStore((s) => s.streak);
  const { level, intoLevel, forLevel } = useLevel();
  const daily = useDailyProgress();
  const dueReviews = useDueReviewCount();

  const completed = useMemo(
    () => Object.fromEntries(Object.entries(progress).map(([id, p]) => [id, p.completed])),
    [progress],
  );

  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed],
  );

  const next = useMemo(() => nextLesson(completed), [completed]);

  return (
    <Screen tabBarPadding gradient={gradients.aurora} intensity={0.55}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={type.overline}>Your path</Text>
          <Text style={type.hero}>Theory of Time</Text>
        </View>
        <StreakBadge days={streak.current} />
      </View>

      {/* Daily ring + level */}
      <GlassCard style={styles.dailyCard}>
        <View style={styles.row}>
          <ProgressRing progress={daily.fraction} size={78} strokeWidth={8}>
            <Text style={[type.numeral, { fontSize: 20 }]}>{daily.earned}</Text>
            <Text style={[type.caption, { fontSize: 9.5 }]}>/ {daily.goal} XP</Text>
          </ProgressRing>
          <View style={[styles.flex, { marginLeft: spacing.lg }]}>
            <Text style={type.subheading}>
              {daily.fraction >= 1 ? 'Daily goal complete' : 'Today’s goal'}
            </Text>
            <Text style={[type.small, { marginTop: 2, marginBottom: spacing.sm }]}>
              Level {level} · {intoLevel}/{forLevel} XP to next
            </Text>
            <ProgressBar progress={forLevel ? intoLevel / forLevel : 0} height={7} />
          </View>
        </View>
      </GlassCard>

      {/* Continue */}
      {next ? (
        <Animated.View entering={FadeInDown.duration(320)}>
          <GradientCard
            gradient={next.stage.gradient}
            glowColor={next.stage.color}
            style={styles.continueCard}
            onPress={() => router.push(`/lesson/${next.lesson.id}`)}
          >
            <View style={styles.row}>
              <Text style={styles.continueGlyph}>{next.stage.glyph}</Text>
              <View style={[styles.flex, { marginLeft: spacing.md }]}>
                <Text style={styles.continueOverline}>
                  {completedCount === 0 ? 'Start here' : 'Continue'} · {next.stage.title}
                </Text>
                <Text style={styles.continueTitle}>{next.lesson.title}</Text>
              </View>
            </View>
            <Text style={styles.continueSummary}>{next.lesson.summary}</Text>
            <View style={[styles.row, { marginTop: spacing.md }]}>
              <Pill label={`${next.lesson.minutes} min`} tint="#FFFFFF" />
              <View style={{ width: spacing.sm }} />
              <Pill label={`+${next.lesson.xp} XP`} tint="#FFFFFF" />
            </View>
          </GradientCard>
        </Animated.View>
      ) : (
        <GradientCard gradient={gradients.gold} style={styles.continueCard}>
          <Text style={styles.continueTitle}>Every lesson complete</Text>
          <Text style={styles.continueSummary}>
            You have finished the entire path. Keep it sharp with daily review and the practice
            drills — mastery is maintenance, not a finish line.
          </Text>
        </GradientCard>
      )}

      {/* Review nudge */}
      {dueReviews > 0 ? (
        <GlassCard
          tint={palette.gold}
          style={styles.reviewCard}
          onPress={() => router.push('/drill/review')}
        >
          <View style={styles.row}>
            <Text style={{ fontSize: 22 }}>🔄</Text>
            <View style={[styles.flex, { marginLeft: spacing.md }]}>
              <Text style={type.subheading}>{dueReviews} items due for review</Text>
              <Text style={[type.caption, { marginTop: 2 }]}>
                Scheduled for right before you would have forgotten them.
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </GlassCard>
      ) : null}

      {/* Stage path */}
      <SectionHeader
        title="The path"
        subtitle={`${completedCount} of ${TOTAL_LESSONS} lessons complete`}
        style={styles.sectionHeader}
      />

      {STAGES.map((stage, index) => {
        const unlocked = isStageUnlocked(stage.id, completed);
        const { done, total, fraction } = stageProgress(stage.id, completed);
        const tier = TIERS[stage.tier];

        return (
          <Animated.View key={stage.id} entering={FadeInDown.delay(index * 40).duration(300)}>
            <GlassCard
              tint={unlocked ? stage.color : undefined}
              disabled={!unlocked}
              style={styles.stageCard}
              onPress={unlocked ? () => router.push(`/stage/${stage.id}`) : undefined}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.stageGlyphWrap,
                    { backgroundColor: `${stage.color}22`, borderColor: `${stage.color}55` },
                  ]}
                >
                  <Text style={styles.stageGlyph}>{unlocked ? stage.glyph : '🔒'}</Text>
                </View>

                <View style={[styles.flex, { marginLeft: spacing.md }]}>
                  <View style={styles.row}>
                    <Text style={[type.caption, { color: tier.color }]}>{tier.label}</Text>
                    <Text style={[type.caption, { marginLeft: spacing.sm }]}>
                      {done}/{total}
                    </Text>
                  </View>
                  <Text style={[type.subheading, { marginTop: 1 }]}>{stage.title}</Text>
                  <Text style={[type.caption, { marginTop: 2 }]} numberOfLines={1}>
                    {stage.tagline}
                  </Text>
                </View>

                <ProgressRing
                  progress={fraction}
                  size={40}
                  strokeWidth={4}
                  gradient={stage.gradient}
                >
                  {fraction >= 1 ? (
                    <Text style={{ color: stage.color, fontSize: 13, fontWeight: '800' }}>✓</Text>
                  ) : (
                    <Text style={[type.caption, { fontSize: 10 }]}>
                      {Math.round(fraction * 100)}
                    </Text>
                  )}
                </ProgressRing>
              </View>

              {unlocked ? (
                <Text style={[type.small, { marginTop: spacing.md }]}>{stage.description}</Text>
              ) : (
                <Text style={[type.caption, { marginTop: spacing.md, fontStyle: 'italic' }]}>
                  Finish two-thirds of {STAGES[index - 1]?.title} to unlock.
                </Text>
              )}
            </GlassCard>
          </Animated.View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  dailyCard: { marginBottom: spacing.lg },
  continueCard: { marginBottom: spacing.lg },
  continueGlyph: { fontSize: 34 },
  continueOverline: {
    ...type.overline,
    color: 'rgba(255,255,255,0.75)',
  },
  continueTitle: {
    ...type.title,
    color: '#FFFFFF',
    fontSize: 24,
    marginTop: 2,
  },
  continueSummary: {
    ...type.body,
    color: 'rgba(255,255,255,0.88)',
    marginTop: spacing.sm,
    fontSize: 15,
  },
  reviewCard: { marginBottom: spacing.lg },
  chevron: { color: colors.textDim, fontSize: 24, marginLeft: spacing.sm },
  sectionHeader: { marginTop: spacing.sm },
  stageCard: { marginBottom: spacing.md },
  stageGlyphWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  stageGlyph: { fontSize: 22 },
});
