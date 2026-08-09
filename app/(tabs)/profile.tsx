import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '../../src/components/ui/Screen';
import { GlassCard, GradientCard } from '../../src/components/ui/Card';
import { GhostButton, Segmented } from '../../src/components/ui/Button';
import { ProgressRing, Stat, StreakBadge, XPBar } from '../../src/components/ui/Progress';
import { Pill, SectionHeader } from '../../src/components/ui/Text';
import { ParamSlider } from '../../src/components/widgets/shared';
import { colors, gradients, palette, radius, spacing, type } from '../../src/theme';
import { INSTRUMENTS } from '../../src/audio/instruments';
import { audioEngine } from '../../src/audio/engine';
import { ACHIEVEMENTS } from '../../src/content/drills';
import { STAGES, TOTAL_LESSONS, stageProgress } from '../../src/content/curriculum';
import { useAccuracy, useLevel, useStore } from '../../src/state/store';

export default function ProfileScreen() {
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const stats = useStore((s) => s.stats);
  const settings = useStore((s) => s.settings);
  const progress = useStore((s) => s.progress);
  const unlocked = useStore((s) => s.unlockedAchievements);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetProgress = useStore((s) => s.resetProgress);
  const { level, intoLevel, forLevel } = useLevel();
  const accuracy = useAccuracy();

  const completed = useMemo(
    () => Object.fromEntries(Object.entries(progress).map(([id, p]) => [id, p.completed])),
    [progress],
  );
  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed],
  );

  const earnedAchievements = useMemo(
    () => new Set([...unlocked, ...deriveAchievements(xp, streak.current, stats, completed, level)]),
    [unlocked, xp, streak.current, stats, completed, level],
  );

  const hours = Math.floor(stats.timeSpent / 3600);
  const minutes = Math.floor((stats.timeSpent % 3600) / 60);

  return (
    <Screen tabBarPadding gradient={gradients.sunrise} intensity={0.35}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={type.overline}>Your progress</Text>
          <Text style={type.hero}>Level {level}</Text>
        </View>
        <StreakBadge days={streak.current} />
      </View>

      <GradientCard gradient={gradients.aurora} glowColor={palette.violet} style={styles.xpCard}>
        <XPBar xp={xp} level={level} xpIntoLevel={intoLevel} xpForLevel={forLevel} />
      </GradientCard>

      <GlassCard style={styles.statsCard}>
        <View style={styles.row}>
          <Stat value={completedCount} label="Lessons" tint={palette.emerald} />
          <Stat value={stats.drillsCompleted} label="Drill rounds" tint={palette.cyan} />
          <Stat
            value={stats.totalAnswers ? `${Math.round(accuracy * 100)}%` : '—'}
            label="Accuracy"
            tint={palette.amber}
          />
        </View>
        <View style={[styles.row, { marginTop: spacing.lg }]}>
          <Stat value={streak.longest} label="Best streak" tint={palette.rose} />
          <Stat
            value={hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
            label="Time practised"
            tint={palette.violet}
          />
          <Stat value={`${completedCount}/${TOTAL_LESSONS}`} label="Path" tint={palette.gold} />
        </View>
      </GlassCard>

      {/* Stage rings */}
      <SectionHeader title="Curriculum" subtitle="Progress by stage" style={styles.sectionHeader} />
      <GlassCard style={styles.stagesCard}>
        <View style={styles.ringGrid}>
          {STAGES.map((stage) => {
            const { fraction, done, total } = stageProgress(stage.id, completed);
            return (
              <View key={stage.id} style={styles.ringItem}>
                <ProgressRing progress={fraction} size={54} strokeWidth={5} gradient={stage.gradient}>
                  <Text style={{ fontSize: 16 }}>{stage.glyph}</Text>
                </ProgressRing>
                <Text style={[type.caption, styles.ringLabel]} numberOfLines={2}>
                  {stage.title}
                </Text>
                <Text style={[type.caption, { fontSize: 9.5, color: stage.color }]}>
                  {done}/{total}
                </Text>
              </View>
            );
          })}
        </View>
      </GlassCard>

      {/* Achievements */}
      <SectionHeader
        title="Achievements"
        subtitle={`${earnedAchievements.size} of ${ACHIEVEMENTS.length} unlocked`}
        style={styles.sectionHeader}
      />
      <View style={styles.achievementGrid}>
        {ACHIEVEMENTS.map((achievement) => {
          const earned = earnedAchievements.has(achievement.id);
          return (
            <View
              key={achievement.id}
              style={[
                styles.achievement,
                earned
                  ? { borderColor: `${achievement.color}66`, backgroundColor: `${achievement.color}18` }
                  : null,
              ]}
            >
              <Text style={[styles.achievementGlyph, earned ? null : styles.locked]}>
                {achievement.glyph}
              </Text>
              <Text
                style={[
                  type.caption,
                  { color: earned ? colors.text : colors.textFaint, textAlign: 'center' },
                ]}
                numberOfLines={2}
              >
                {achievement.title}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Settings */}
      <SectionHeader title="Settings" style={styles.sectionHeader} />

      <GlassCard style={styles.settingsCard}>
        <Text style={[type.overline, styles.settingLabel]}>Instrument</Text>
        <View style={styles.instrumentGrid}>
          {INSTRUMENTS.map((instrument) => {
            const active = settings.instrument === instrument.id;
            return (
              <View
                key={instrument.id}
                style={[
                  styles.instrument,
                  active
                    ? { borderColor: palette.violet, backgroundColor: `${palette.violet}22` }
                    : null,
                ]}
                onTouchEnd={() => {
                  updateSettings({ instrument: instrument.id });
                  audioEngine.playChord([60, 64, 67], {
                    instrument: instrument.id,
                    duration: 1.4,
                    spread: 0.02,
                  });
                }}
              >
                <Text style={{ fontSize: 18 }}>{instrument.glyph}</Text>
                <Text
                  style={[
                    type.caption,
                    { fontSize: 10, marginTop: 3, color: active ? colors.text : colors.textDim },
                  ]}
                  numberOfLines={1}
                >
                  {instrument.name}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        <ParamSlider
          label="Volume"
          value={settings.volume}
          min={0}
          max={1}
          onChange={(v) => updateSettings({ volume: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />

        <ParamSlider
          label="Daily XP goal"
          value={settings.dailyGoalXp}
          min={40}
          max={400}
          step={10}
          onChange={(v) => updateSettings({ dailyGoalXp: Math.round(v) })}
          format={(v) => `${Math.round(v)} XP`}
          tint={palette.amber}
        />

        <ParamSlider
          label="Tuning reference (A4)"
          value={settings.tuning}
          min={415}
          max={466}
          step={1}
          onChange={(v) => updateSettings({ tuning: Math.round(v) })}
          format={(v) => `${Math.round(v)} Hz`}
          tint={palette.cyan}
        />

        <View style={styles.divider} />

        <Text style={[type.overline, styles.settingLabel]}>Keyboard labels</Text>
        <Segmented
          options={[
            { value: 'none' as const, label: 'None' },
            { value: 'c-only' as const, label: 'C only' },
            { value: 'letters' as const, label: 'White' },
            { value: 'all' as const, label: 'All' },
          ]}
          value={settings.labelMode}
          onChange={(v) => updateSettings({ labelMode: v })}
        />

        <ToggleRow
          label="Prefer flats"
          hint="Spell black keys as B♭ rather than A♯"
          value={settings.preferFlats}
          onChange={(v) => updateSettings({ preferFlats: v })}
        />
        <ToggleRow
          label="Haptics"
          hint="Vibration feedback on keys and answers"
          value={settings.haptics}
          onChange={(v) => updateSettings({ haptics: v })}
        />
        <ToggleRow
          label="Key context in ear training"
          hint="Play a cadence before each question to orient the ear"
          value={settings.earTrainingContext}
          onChange={(v) => updateSettings({ earTrainingContext: v })}
        />
      </GlassCard>

      <GhostButton
        label="Reset all progress"
        tint={colors.danger}
        style={styles.reset}
        onPress={() =>
          Alert.alert(
            'Reset everything?',
            'This erases your XP, streak, lesson progress and review schedule. It cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: resetProgress },
            ],
          )
        }
      />

      <Text style={styles.footer}>
        Theory of Time · every sound synthesised on device · no account, no tracking
      </Text>
    </Screen>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.flex}>
        <Text style={[type.small, { color: colors.text }]}>{label}</Text>
        <Text style={[type.caption, { marginTop: 1 }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.14)', true: palette.violet }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

/**
 * Achievements are derived from state rather than stored, so they stay correct
 * even if an unlock event was missed (a crash, an interrupted session).
 */
function deriveAchievements(
  xp: number,
  streak: number,
  stats: { correctAnswers: number; drillsCompleted: number },
  completed: Record<string, boolean>,
  level: number,
): string[] {
  const earned: string[] = [];
  const doneCount = Object.values(completed).filter(Boolean).length;

  if (doneCount >= 1) earned.push('first-lesson');
  if (streak >= 3) earned.push('streak-3');
  if (streak >= 7) earned.push('streak-7');
  if (streak >= 30) earned.push('streak-30');
  if (level >= 5) earned.push('level-5');
  if (level >= 10) earned.push('level-10');
  if (level >= 20) earned.push('level-20');
  if (stats.correctAnswers >= 50) earned.push('ear-50');
  if (stats.correctAnswers >= 250) earned.push('ear-250');

  const stageDone = (id: string) => {
    const stage = STAGES.find((s) => s.id === id);
    return stage ? stage.lessons.every((l) => completed[l.id]) : false;
  };

  if (stageDone('first-sounds')) earned.push('stage-foundations');
  if (stageDone('modes')) earned.push('all-modes');
  if (stageDone('sound-design')) earned.push('producer');
  if (stageDone('mixing')) earned.push('mixer');
  if (doneCount >= TOTAL_LESSONS) earned.push('composer');

  return earned;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.lg },
  xpCard: { marginBottom: spacing.lg },
  statsCard: { marginBottom: spacing.lg },
  sectionHeader: { marginTop: spacing.sm },
  stagesCard: { marginBottom: spacing.lg },
  ringGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  ringItem: { width: '31%', alignItems: 'center', marginBottom: spacing.lg },
  ringLabel: { marginTop: 6, textAlign: 'center', fontSize: 10 },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  achievement: {
    width: '30.5%',
    marginHorizontal: '1.4%',
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  achievementGlyph: { fontSize: 22, marginBottom: 5 },
  locked: { opacity: 0.22 },
  settingsCard: { marginBottom: spacing.lg },
  settingLabel: { marginBottom: spacing.sm },
  instrumentGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  instrument: {
    width: '23%',
    marginHorizontal: '1%',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  reset: { marginBottom: spacing.lg },
  footer: {
    ...type.caption,
    textAlign: 'center',
    fontSize: 11,
    marginBottom: spacing.xl,
  },
});
