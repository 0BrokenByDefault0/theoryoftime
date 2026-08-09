import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '../../src/components/ui/Screen';
import { GlassCard } from '../../src/components/ui/Card';
import { Segmented } from '../../src/components/ui/Button';
import { DataRow, Pill, SectionHeader } from '../../src/components/ui/Text';
import { colors, gradients, palette, radius, spacing, tensionColor, type } from '../../src/theme';
import {
  CHORD_FAMILY_LABELS,
  CHORD_QUALITIES,
  ChordFamily,
  METERS,
  PROGRESSIONS,
  PROGRESSION_CATEGORY_LABELS,
  SCALES,
  SCALE_FAMILY_LABELS,
  ScaleFamily,
  TEMPO_MAP,
  requireNote,
  scaleNoteNames,
} from '../../src/theory';
import { GLOSSARY, GLOSSARY_CATEGORIES, searchGlossary } from '../../src/content/glossary';

type Section = 'scales' | 'chords' | 'progressions' | 'rhythm' | 'glossary';

export default function LibraryScreen() {
  const router = useRouter();
  const [section, setSection] = useState<Section>('scales');
  const [query, setQuery] = useState('');

  return (
    <Screen tabBarPadding gradient={gradients.dusk} intensity={0.4}>
      <View style={styles.header}>
        <Text style={type.overline}>Library</Text>
        <Text style={type.hero}>Look it up</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search everything…"
        placeholderTextColor={colors.textFaint}
        style={styles.search}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <Segmented
        options={[
          { value: 'scales' as Section, label: 'Scales' },
          { value: 'chords' as Section, label: 'Chords' },
          { value: 'progressions' as Section, label: 'Prog.' },
          { value: 'rhythm' as Section, label: 'Rhythm' },
        ]}
        value={section === 'glossary' ? 'scales' : section}
        onChange={setSection}
        style={styles.segmented}
      />

      <Pressable onPress={() => setSection('glossary')} style={styles.glossaryLink}>
        <Text
          style={[
            type.caption,
            { color: section === 'glossary' ? palette.violet : colors.textDim },
          ]}
        >
          {section === 'glossary' ? '● Glossary' : 'Open the glossary →'}
        </Text>
      </Pressable>

      {section === 'scales' ? <ScalesSection query={query} /> : null}
      {section === 'chords' ? <ChordsSection query={query} /> : null}
      {section === 'progressions' ? <ProgressionsSection query={query} /> : null}
      {section === 'rhythm' ? <RhythmSection query={query} /> : null}
      {section === 'glossary' ? <GlossarySection query={query} /> : null}
    </Screen>
  );
}

function ScalesSection({ query }: { query: string }) {
  const router = useRouter();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SCALES;
    return SCALES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.aliases.some((a) => a.toLowerCase().includes(q)) ||
        s.mood.toLowerCase().includes(q) ||
        s.usedIn.toLowerCase().includes(q),
    );
  }, [query]);

  const families = useMemo(
    () => [...new Set(filtered.map((s) => s.family))] as ScaleFamily[],
    [filtered],
  );

  return (
    <>
      {families.map((family) => (
        <View key={family}>
          <SectionHeader title={SCALE_FAMILY_LABELS[family]} style={styles.sectionHeader} />
          {filtered
            .filter((s) => s.family === family)
            .map((scale) => (
              <GlassCard
                key={scale.id}
                style={styles.entryCard}
                onPress={() => router.push('/tool/scale-explorer')}
              >
                <View style={styles.rowBetween}>
                  <Text style={type.subheading}>{scale.name}</Text>
                  <Text style={[type.caption, { color: palette.cyan }]}>
                    {scale.intervals.length} notes
                  </Text>
                </View>
                <Text style={[type.mono, styles.degrees]}>{scale.degrees.join('  ')}</Text>
                <Text style={[type.mono, { fontSize: 13, color: palette.violet, marginTop: 3 }]}>
                  {scaleNoteNames(requireNote('C4'), scale)}
                </Text>
                <Text style={[type.small, { marginTop: spacing.sm }]}>{scale.mood}</Text>
                <Text style={[type.caption, { marginTop: 5 }]}>{scale.usedIn}</Text>
                {scale.aliases.length ? (
                  <Text style={[type.caption, { marginTop: 5, fontStyle: 'italic' }]}>
                    Also called: {scale.aliases.join(', ')}
                  </Text>
                ) : null}
              </GlassCard>
            ))}
        </View>
      ))}
      {!filtered.length ? <EmptyState query={query} /> : null}
    </>
  );
}

function ChordsSection({ query }: { query: string }) {
  const router = useRouter();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHORD_QUALITIES;
    return CHORD_QUALITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.mood.toLowerCase().includes(q) ||
        c.usedIn.toLowerCase().includes(q),
    );
  }, [query]);

  const families = useMemo(
    () => [...new Set(filtered.map((c) => c.family))] as ChordFamily[],
    [filtered],
  );

  return (
    <>
      {families.map((family) => (
        <View key={family}>
          <SectionHeader title={CHORD_FAMILY_LABELS[family]} style={styles.sectionHeader} />
          {filtered
            .filter((c) => c.family === family)
            .map((quality) => (
              <GlassCard
                key={quality.id}
                style={styles.entryCard}
                onPress={() => router.push('/tool/chord-builder')}
              >
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={type.subheading}>{quality.name}</Text>
                    <Text style={[type.mono, { marginTop: 3, color: palette.violet }]}>
                      C{quality.symbol}
                    </Text>
                  </View>
                  <Pill
                    label={`Tension ${quality.tension}`}
                    tint={tensionColor(quality.tension)}
                  />
                </View>
                <Text style={[type.mono, styles.degrees]}>{quality.degrees.join('  ')}</Text>
                <Text style={[type.small, { marginTop: spacing.sm }]}>{quality.mood}</Text>
                <Text style={[type.caption, { marginTop: 5 }]}>{quality.usedIn}</Text>
              </GlassCard>
            ))}
        </View>
      ))}
      {!filtered.length ? <EmptyState query={query} /> : null}
    </>
  );
}

function ProgressionsSection({ query }: { query: string }) {
  const router = useRouter();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROGRESSIONS;
    return PROGRESSIONS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.romans.join(' ').toLowerCase().includes(q) ||
        p.why.toLowerCase().includes(q) ||
        p.heardIn.join(' ').toLowerCase().includes(q),
    );
  }, [query]);

  const categories = useMemo(() => [...new Set(filtered.map((p) => p.category))], [filtered]);

  return (
    <>
      {categories.map((category) => (
        <View key={category}>
          <SectionHeader
            title={PROGRESSION_CATEGORY_LABELS[category]}
            style={styles.sectionHeader}
          />
          {filtered
            .filter((p) => p.category === category)
            .map((progression) => (
              <GlassCard
                key={progression.id}
                style={styles.entryCard}
                onPress={() => router.push('/tool/progression-lab')}
              >
                <View style={styles.rowBetween}>
                  <Text style={[type.subheading, styles.flex]}>{progression.name}</Text>
                  <Text style={[type.caption, { color: palette.amber }]}>
                    {'★'.repeat(progression.difficulty)}
                  </Text>
                </View>
                <Text style={[type.mono, { marginTop: 5, color: palette.violet, fontSize: 15 }]}>
                  {progression.romans.join(' – ')}
                </Text>
                <Text style={[type.small, { marginTop: spacing.sm }]}>{progression.why}</Text>
                <Text style={[type.caption, { marginTop: 6 }]}>
                  Heard in: {progression.heardIn.join(' · ')}
                </Text>
              </GlassCard>
            ))}
        </View>
      ))}
      {!filtered.length ? <EmptyState query={query} /> : null}
    </>
  );
}

function RhythmSection({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const meters = METERS.filter(
    (m) => !q || m.label.includes(q) || m.feel.toLowerCase().includes(q) || m.heardIn.toLowerCase().includes(q),
  );

  return (
    <>
      <SectionHeader title="Time signatures" style={styles.sectionHeader} />
      {meters.map((meter) => (
        <GlassCard key={meter.id} style={styles.entryCard}>
          <View style={styles.rowBetween}>
            <Text style={type.title}>{meter.label}</Text>
            <Pill
              label={meter.type}
              tint={
                meter.type === 'simple'
                  ? palette.emerald
                  : meter.type === 'compound'
                    ? palette.cyan
                    : palette.rose
              }
            />
          </View>
          <Text style={[type.caption, { marginTop: 4 }]}>
            Grouped as {meter.grouping.join(' + ')}
          </Text>
          <Text style={[type.small, { marginTop: spacing.sm }]}>{meter.feel}</Text>
          <Text style={[type.caption, { marginTop: 5 }]}>{meter.heardIn}</Text>
        </GlassCard>
      ))}

      <SectionHeader title="Tempo map" style={styles.sectionHeader} />
      <GlassCard style={styles.entryCard}>
        {TEMPO_MAP.map((entry) => (
          <DataRow
            key={entry.label}
            label={`${entry.range[0]}–${entry.range[1]} BPM · ${entry.label}`}
            value={entry.genres}
          />
        ))}
      </GlassCard>
    </>
  );
}

function GlossarySection({ query }: { query: string }) {
  const filtered = useMemo(() => searchGlossary(query), [query]);
  const categories = useMemo(
    () => GLOSSARY_CATEGORIES.filter((c) => filtered.some((e) => e.category === c)),
    [filtered],
  );

  return (
    <>
      <Text style={[type.caption, { marginBottom: spacing.md }]}>
        {filtered.length} of {GLOSSARY.length} terms
      </Text>
      {categories.map((category) => (
        <View key={category}>
          <SectionHeader title={category} style={styles.sectionHeader} />
          {filtered
            .filter((e) => e.category === category)
            .map((entry) => (
              <GlassCard key={entry.term} style={styles.entryCard} padding={spacing.md}>
                <Text style={type.subheading}>{entry.term}</Text>
                <Text style={[type.small, { marginTop: 5 }]}>{entry.definition}</Text>
                {entry.inPractice ? (
                  <Text style={[type.caption, styles.inPractice]}>{entry.inPractice}</Text>
                ) : null}
              </GlassCard>
            ))}
        </View>
      ))}
      {!filtered.length ? <EmptyState query={query} /> : null}
    </>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <GlassCard style={styles.entryCard}>
      <Text style={type.subheading}>Nothing matched “{query}”</Text>
      <Text style={[type.small, { marginTop: 5 }]}>
        Try a shorter search, or switch section — the same word can live in scales, chords or the
        glossary.
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  header: { marginBottom: spacing.lg },
  search: {
    ...type.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  segmented: { marginBottom: spacing.sm },
  glossaryLink: { paddingVertical: spacing.sm, alignItems: 'flex-end' },
  sectionHeader: { marginTop: spacing.lg },
  entryCard: { marginBottom: spacing.md },
  degrees: { marginTop: 6, color: colors.textMuted, fontSize: 13 },
  inPractice: {
    marginTop: 8,
    fontStyle: 'italic',
    color: colors.textDim,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.14)',
    paddingLeft: spacing.sm,
  },
});
