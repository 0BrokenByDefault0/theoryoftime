import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { colors } from '../src/theme';
import { audioEngine } from '../src/audio/engine';
import { useAudioEngine } from '../src/audio/useAudio';
import { useStore } from '../src/state/store';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const { ready } = useAudioEngine();
  const volume = useStore((s) => s.settings.volume);
  const tuning = useStore((s) => s.settings.tuning);

  // Keep the engine in step with the user's settings.
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.tuning = tuning;
  }, [tuning]);

  useEffect(() => {
    // Hide the splash as soon as the first frame can be drawn. Audio start-up
    // is not blocking — the app is usable while the graph builds.
    const handle = setTimeout(() => SplashScreen.hideAsync().catch(() => undefined), 220);
    return () => clearTimeout(handle);
  }, [ready]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="lesson/[lessonId]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="drill/[drillId]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="stage/[stageId]" />
            <Stack.Screen name="tool/[toolId]" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
