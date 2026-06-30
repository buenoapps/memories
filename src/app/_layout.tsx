import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PlaybackProvider } from '@/context/playback';
import { lockPortrait } from '@/hooks/use-orientation';
import { useMemoryNotifications } from '@/hooks/use-notifications';
import { SettingsProvider } from '@/hooks/use-settings';

// Show scheduled "On This Day" reminders while the app is foregrounded too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useMemoryNotifications();

  // The app is portrait-only except for the full-screen media screens, which
  // opt back into rotation themselves. Re-assert the lock on launch.
  useEffect(() => {
    lockPortrait();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SettingsProvider>
            <PlaybackProvider>
              <AnimatedSplashOverlay />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="year/[year]" />
                <Stack.Screen name="settings" options={{ presentation: 'card' }} />
                <Stack.Screen
                  name="viewer"
                  options={{ presentation: 'transparentModal', animation: 'fade' }}
                />
                <Stack.Screen
                  name="slideshow"
                  options={{ presentation: 'fullScreenModal', animation: 'fade' }}
                />
              </Stack>
            </PlaybackProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
