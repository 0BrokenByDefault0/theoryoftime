import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '../../src/components/ui/Screen';
import { GlassCard } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/Progress';
import { Pill } from '../../src/components/ui/Text';
import { TIERS, colors, radius, spacing, type } from '../../src/theme';
import { getStage, isLessonUnlocked, stageProgress } from '../../src/content/curriculum';
import { useStore } from '../../src/state/store';

export default function StageScreen() {
  const { stageId } = useLocalSearchParams<{ stageId: string }>();
  const router = useRouter();
  const progress = useStore((s) => s.progress);

  const stage = getStage(String(stageId));

  const completed = useMemo(
    () => Object.fromEntries(Object.entries(progress).map(([id, p]) => [id, p.completed])),
    [progress],
  );

  if (!stage) {
    return (
      <Screen>
        <Text style={type.title}>Stage not found</Text>
      </Screen>
    );
  }

  const { done, total, fraction } = stageProgress(stage.id, completed);
  const tier = TIERS[stage.tier];

  return (
    <Screen gradient={stage.gradient} intensity={0.5}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
        <Text style={styles.backText}>‹ Path</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.glyph}>{stage.glyph}</Text>
        <View style={styles.pillRow}>
          <Pill label={tier.label} tint={tier.color} />
          <Pill label={`${done}/${total} lessons`} tint={stage.color} />
        </View>
        <Text style={[type.hero, { marginTop: spacing.md }]}>{stage.title}</Text>
        <Text style={[type.body, { marginTop: spacing.sm }]}>{stage.description}</Text>
        <ProgressBar progress={fraction} gradient={stage.gradient} style={{ marginTop: spacing.lg }} />
      </View>

      {stage.lessons.map((lesson, index) => {
        const unlocked = isLessonUnlocked(lesson.id, completed);
        const record = progress[lesson.id];
        const isDone = record?.completed ?? false;
        const inProgress = !isDone && (record?.lastCardIndex ?? 0) > 0;

        return (
          <Animated.View key={lesson.id} entering={FadeInDown.delay(index * 45).duration(300)}>
            <GlassCard
              tint={isDone ? stage.color : undefined}
              disabled={!unlocked}
              style={styles.lessonCard}
              onPress={unlocked ? () => router.push(`/lesson/${lesson.id}`) : undefined}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.marker,
                    isDone
                      ? { backgroundColor: stage.color, borderColor: stage.color }
                      : { borderColor: unlocked ? `${stage.color}77` : colors.border },
                  ]}
                >
                  <Text style={[styles.markerText, isDone ? { color: '#0A0C18' } : null]}>
                    {isDone ? '✓' : unlocked ? String(index + 1) : '🔒'}
                  </Text>
                </View>

                <View style={[styles.flex, { marginLeft: spacing.md }]}>
                  <Text style={type.subheading}>{lesson.title}</Text>
                  <Text style={[type.small, { marginTop: 3 }]}>{lesson.summary}</Text>
                  <View style={[styles.row, { marginTop: spacing.sm, gap: spacing.sm }]}>
                    <Text style={type.caption}>{lesson.minutes} min</Text>
                    <Text style={type.caption}>·</Text>
                    <Text style={[type.caption, { color: stage.color }]}>+{lesson.xp} XP</Text>
                    {record?.bestScore ? (
                      <>
                        <Text style={type.caption}>·</Text>
                        <Text style={type.caption}>
                          Best {Math.round(record.bestScore * 100)}%
                        </Text>
                      </>
                    ) : null}
                    {inProgress ? <Pill label="Resume" tint={colors.warning} /> : null}
                  </View>
                </View>
              </View>
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
  back: { marginBottom: spacing.md },
  backText: { ...type.small, color: colors.textMuted, fontWeight: '700' },
  hero: { marginBottom: spacing.xl },
  glyph: { fontSize: 44, marginBottom: spacing.md },
  pillRow: { flexDirection: 'row', gap: spacing.sm },
  lessonCard: { marginBottom: spacing.md },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { color: colors.text, fontWeight: '800', fontSize: 14 },
});
