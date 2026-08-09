import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '../../src/components/ui/Screen';
import { GlassCard } from '../../src/components/ui/Card';
import { SectionHeader } from '../../src/components/ui/Text';
import { colors, palette, radius, spacing, type } from '../../src/theme';
import { TOOLS } from '../../src/content/tools';

/**
 * The Studio tab: the same interactive widgets the lessons use, unlocked and
 * standalone. Once someone understands a concept, they should be able to keep
 * playing with it without hunting for the lesson it came from.
 */
export default function StudioScreen() {
  const router = useRouter();

  const groups = [
    { title: 'Explore', subtitle: 'Find things out by playing', ids: ['keyboard', 'chord-detective', 'circle', 'interval-lab', 'fretboard'] },
    { title: 'Reference tools', subtitle: 'The things you look up constantly', ids: ['scale-explorer', 'chord-builder', 'voicing-lab', 'progression-lab', 'mode-lab'] },
    { title: 'Rhythm', subtitle: 'Time, groove and feel', ids: ['metronome', 'drum-machine', 'euclidean', 'delay-calc'] },
    { title: 'Sound design', subtitle: 'Live synthesis you can hear', ids: ['synth-lab', 'filter-lab', 'waveform-lab', 'compressor-lab', 'frequency-map'] },
  ];

  return (
    <Screen tabBarPadding gradient={['#A3E635', '#14B8A6', '#6366F1']} intensity={0.4}>
      <View style={styles.header}>
        <Text style={type.overline}>Studio</Text>
        <Text style={type.hero}>Play with it</Text>
        <Text style={[type.body, { marginTop: spacing.sm }]}>
          Every tool here makes real sound. Nothing is a diagram — the filter curve is the filter
          you are hearing, and the envelope is the one shaping the note.
        </Text>
      </View>

      {groups.map((group) => (
        <View key={group.title}>
          <SectionHeader title={group.title} subtitle={group.subtitle} style={styles.sectionHeader} />
          <View style={styles.grid}>
            {group.ids.map((id, index) => {
              const tool = TOOLS.find((t) => t.id === id);
              if (!tool) return null;
              return (
                <Animated.View
                  key={tool.id}
                  entering={FadeInDown.delay(index * 30).duration(260)}
                  style={styles.gridItem}
                >
                  <GlassCard
                    tint={tool.color}
                    padding={spacing.md}
                    style={styles.toolCard}
                    onPress={() => router.push(`/tool/${tool.id}`)}
                  >
                    <View
                      style={[
                        styles.toolGlyph,
                        { backgroundColor: `${tool.color}22`, borderColor: `${tool.color}55` },
                      ]}
                    >
                      <Text style={{ fontSize: 19 }}>{tool.glyph}</Text>
                    </View>
                    <Text style={[type.subheading, styles.toolTitle]} numberOfLines={2}>
                      {tool.title}
                    </Text>
                    <Text style={[type.caption, { marginTop: 3 }]} numberOfLines={3}>
                      {tool.blurb}
                    </Text>
                  </GlassCard>
                </Animated.View>
              );
            })}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  sectionHeader: { marginTop: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  gridItem: { width: '50%', paddingHorizontal: spacing.xs, marginBottom: spacing.sm },
  toolCard: { minHeight: 152 },
  toolGlyph: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    marginBottom: spacing.sm,
  },
  toolTitle: { fontSize: 15, lineHeight: 19 },
});
