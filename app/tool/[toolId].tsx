import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '../../src/components/ui/Screen';
import { Widget } from '../../src/components/widgets';
import { colors, spacing, type } from '../../src/theme';
import { TOOLS_BY_ID } from '../../src/content/tools';
import { audioEngine } from '../../src/audio/engine';

export default function ToolScreen() {
  const { toolId } = useLocalSearchParams<{ toolId: string }>();
  const router = useRouter();
  const tool = TOOLS_BY_ID[String(toolId)];

  useEffect(() => () => audioEngine.stopAll(), []);

  if (!tool) {
    return (
      <Screen>
        <Text style={type.title}>Tool not found</Text>
      </Screen>
    );
  }

  return (
    <Screen gradient={[tool.color, '#6366F1']} intensity={0.42}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
        <Text style={styles.backText}>‹ Studio</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.glyph}>{tool.glyph}</Text>
        <Text style={[type.hero, { marginTop: spacing.sm }]}>{tool.title}</Text>
        <Text style={[type.body, { marginTop: spacing.sm }]}>{tool.description}</Text>
      </View>

      <Widget spec={tool.widget} />
      {tool.extras?.map((spec, i) => (
        <Widget key={i} spec={spec} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: spacing.md },
  backText: { ...type.small, color: colors.textMuted, fontWeight: '700' },
  hero: { marginBottom: spacing.lg },
  glyph: { fontSize: 40 },
});
