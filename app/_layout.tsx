import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../constants/theme';

export default function RootLayout() {
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
