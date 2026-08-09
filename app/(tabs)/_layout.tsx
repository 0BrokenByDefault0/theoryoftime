import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, palette, radius, spacing, type } from '../../src/theme';

const TABS = [
  { name: 'index', label: 'Path', glyph: '◈' },
  { name: 'practice', label: 'Practice', glyph: '◎' },
  { name: 'studio', label: 'Studio', glyph: '▤' },
  { name: 'library', label: 'Library', glyph: '❋' },
  { name: 'profile', label: 'You', glyph: '◐' },
] as const;

/**
 * A floating glass tab bar.
 *
 * Built by hand rather than styled from the default because the app's whole
 * visual language is translucent panels over an aurora background, and a solid
 * opaque bar at the bottom would break that on every screen.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}

/** Derived from the navigator itself, so it tracks the router's own types. */
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function FloatingTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.md) }]} pointerEvents="box-none">
      <BlurView intensity={Platform.OS === 'ios' ? 42 : 90} tint="dark" style={styles.bar}>
        <View style={styles.barInner}>
          {state.routes.map((route, index) => {
            const tab = TABS.find((t) => t.name === route.name);
            if (!tab) return null;
            const focused = state.index === index;

            return (
              <TabButton
                key={route.key}
                label={tab.label}
                glyph={tab.glyph}
                focused={focused}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    Haptics.selectionAsync().catch(() => undefined);
                    navigation.navigate(route.name, route.params);
                  }
                }}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

function TabButton({
  label,
  glyph,
  focused,
  onPress,
}: {
  label: string;
  glyph: string;
  focused: boolean;
  onPress: () => void;
}) {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.12 : 1, motion.bouncy) }],
    opacity: withTiming(focused ? 1 : 0.5, { duration: motion.quick }),
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: motion.quick }),
    transform: [{ scale: withSpring(focused ? 1 : 0.4, motion.bouncy) }],
  }));

  return (
    <Pressable style={styles.tab} onPress={onPress} accessibilityRole="tab">
      <Animated.Text
        style={[
          styles.glyph,
          { color: focused ? palette.violet : colors.textMuted },
          iconStyle,
        ]}
      >
        {glyph}
      </Animated.Text>
      <Text
        style={[
          type.caption,
          styles.label,
          { color: focused ? colors.text : colors.textDim },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  bar: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  barInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,12,24,0.55)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  glyph: { fontSize: 19, marginBottom: 2 },
  label: { fontSize: 10.5, fontWeight: '700' },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.violet,
  },
});
