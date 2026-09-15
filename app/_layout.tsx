import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../constants/theme';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      router.push('/20-alarm');
    });
    return () => subscription.remove();
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.nightBg }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.nightBg },
        }}
      >
        <Stack.Screen 
          name="11-alarm-set" 
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: 'transparent' }
          }} 
        />
        <Stack.Screen 
          name="40-paywall" 
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: 'transparent' }
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
