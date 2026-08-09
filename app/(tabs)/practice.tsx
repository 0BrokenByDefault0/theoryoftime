import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '../../src/components/ui/Screen';
import { GlassCard, GradientCard } from '../../src/components/ui/Card';
import { ProgressBar, Stat } from '../../src/components/ui/Progress';
import { Pill, SectionHeader } from '../../src/components/ui/Text';
import { TIERS, colors, gradients, palette, radius, spacing, type } from '../../src/theme';
import { DRILLS } from '../../src/content/drills';
import { useAccuracy, useStore } from '../../src/state/store';
import { categoryMastery, dueCount } from '../../src/state/srs';

const MASTERY_CATEGORIES: Array<{ id: string; label: string; color: string }> = [
  { id: 'ear-intervals', label: 'Intervals by ear', color: palette.teal },
  { id: 'ear-chords', label: 'Chords by ear', color: palette.indigo },
  { id: 'ear-scales', label: 'Scales by ear', color: palette.violet },
  { id: 'ear-progressions', label: 'Progressions by ear', color: palette.fuchsia },
  { id: 'intervals', label: 'Interval theory', color: palette.cyan },
  { id: 'keys', label: 'Keys & signatures', color: palette.sky },
  { id: 'chords', label: 'Chord construction', color: palette.rose },
  { id: 'harmony', label: 'Harmony', color: palette.amber },
  { id: 'rhythm', label: 'Rhythm', color: palette.coral },
  { id: 'production', label: 'Production', color: palette.lime },
];

export default function PracticeScreen() {
  const router = useRouter();
  const reviews = useStore((s) => s.reviews);
  const stats = useStore((s) => s.stats);
  const recentDrills = useStore((s) => s.recentDrills);
  const accuracy = useAccuracy();

  const due = useMemo(() => dueCount(reviews), [reviews]);
  const deckSize = Object.keys(reviews).length;

  const mastery = useMemo(
    () =>
      MASTERY_CATEGORIES.map((category) => ({
        ...category,
        value: categoryMastery(reviews, category.id),
        count: Object.values(reviews).filter((r) => r.category === category.id).length,
      })).filter((m) => m.count > 0),
    [reviews],
  );

  const reviewDrill = DRILLS.find((d) => d.kind === 'review');
  const otherDrills = DRILLS.filter((d) => d.kind !== 'review');

  return (
    <Screen tabBarPadding gradient={gradients.ocean} intensity={0.45}>
      <View style={styles.header}>
        <Text style={type.overline}>Practice</Text>
        <Text style={type.hero}>Sharpen it</Text>
      </View>

      {/* Review */}
      {reviewDrill ? (
        <GradientCard
          gradient={due > 0 ? gradients.gold : gradients.ghost}
          glowColor={due > 0 ? palette.gold : undefined}
          onPress={() => router.push(`/drill/${reviewDrill.id}`)}
          style={styles.reviewCard}
        >
          <View style={styles.row}>
            <Text style={{ fontSize: 30 }}>🔄</Text>
            <View style={[styles.flex, { marginLeft: spacing.md }]}>
              <Text
                style={[
                  type.title,
                  { fontSize: 22, color: due > 0 ? '#0A0C18' : colors.text },
                ]}
              >
                {due > 0 ? `${due} due now` : 'Review deck'}
              </Text>
              <Text
                style={[
                  type.small,
                  { color: due > 0 ? 'rgba(10,12,24,0.75)' : colors.textMuted, marginTop: 2 },
                ]}
              >
                {deckSize > 0
                  ? `${deckSize} items learned · scheduled by memory decay`
                  : 'Complete lessons to start building your deck'}
              </Text>
            </View>
          </View>
        </GradientCard>
      ) : null}

      {/* Stats */}
      <GlassCard style={styles.statsCard}>
        <View style={styles.row}>
          <Stat
            value={stats.totalAnswers ? `${Math.round(accuracy * 100)}%` : '—'}
            label="Accuracy"
            tint={palette.cyan}
          />
          <Stat value={stats.totalAnswers} label="Questions" tint={palette.violet} />
          <Stat value={stats.bestDrillStreak} label="Best run" tint={palette.amber} />
        </View>
      </GlassCard>

      {/* Mastery */}
      {mastery.length ? (
        <>
          <SectionHeader
            title="Mastery"
            subtitle="Estimated recall strength, per topic"
            style={styles.sectionHeader}
          />
          <GlassCard style={styles.masteryCard}>
            {mastery.map((item, i) => (
              <View key={item.id} style={[styles.masteryRow, i === 0 ? { marginTop: 0 } : null]}>
                <View style={styles.masteryHeader}>
                  <Text style={[type.small, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[type.caption, { color: item.color }]}>
                    {Math.round(item.value * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={item.value}
                  height={6}
                  gradient={[item.color, `${item.color}88`]}
                />
              </View>
            ))}
          </GlassCard>
        </>
      ) : null}

      {/* Drills */}
      <SectionHeader
        title="Drills"
        subtitle="Procedurally generated — they never run out"
        style={styles.sectionHeader}
      />

      {otherDrills.map((drill, index) => {
        const recent = recentDrills.find((r) => r.drillId === drill.id);
        const tier = TIERS[drill.tier];
        return (
          <Animated.View key={drill.id} entering={FadeInDown.delay(index * 35).duration(280)}>
            <GlassCard
              tint={drill.color}
              style={styles.drillCard}
              onPress={() => router.push(`/drill/${drill.id}`)}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.drillGlyph,
                    { backgroundColor: `${drill.color}22`, borderColor: `${drill.color}55` },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{drill.glyph}</Text>
                </View>
                <View style={[styles.flex, { marginLeft: spacing.md }]}>
                  <View style={styles.row}>
                    <Text style={[type.subheading, styles.flex]}>{drill.title}</Text>
                    <Pill label={tier.label} tint={tier.color} />
                  </View>
                  <Text style={[type.small, { marginTop: 3 }]}>{drill.description}</Text>
                  {recent ? (
                    <Text style={[type.caption, { marginTop: 6, color: drill.color }]}>
                      Last round {Math.round((recent.correct / recent.total) * 100)}%
                    </Text>
                  ) : null}
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
  header: { marginBottom: spacing.lg },
  reviewCard: { marginBottom: spacing.lg },
  statsCard: { marginBottom: spacing.lg },
  sectionHeader: { marginTop: spacing.sm },
  masteryCard: { marginBottom: spacing.lg },
  masteryRow: { marginTop: spacing.md },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  drillCard: { marginBottom: spacing.md },
  drillGlyph: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
