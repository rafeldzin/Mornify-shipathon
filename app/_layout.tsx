import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { palettes } from '../constants/tokens';
import { DevBadge } from '../components/DevBadge';
import { ensureChannels } from '../lib/alarm';

const sheet = {
  presentation: 'transparentModal' as const,
  animation: 'slide_from_bottom' as const,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    ensureChannels();
  }, []);

  useEffect(() => {
    // Tapping the alarm notification goes to 20-alarm; the bedtime nudge does
    // not, so the app never hijacks the screen on an ordinary reminder.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === '20-alarm') router.push('/20-alarm');
    });
    return () => subscription.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: palettes.night.bg }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palettes.night.bg },
          }}
        >
          <Stack.Screen name="11-alarm-set" options={sheet} />
          <Stack.Screen name="40-paywall" options={sheet} />
          <Stack.Screen name="71-leave" options={sheet} />
        </Stack>
        <DevBadge />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
