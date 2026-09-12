import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { useEffect, useRef, useState, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmSet() {
  const router = useRouter();
  const { saveSleepAt, saveAlarmTime } = useSleepState();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  
  const [selectedHour, setSelectedHour] = useState(6);
  const [selectedMinute, setSelectedMinute] = useState(15);

  useEffect(() => {
    saveSleepAt(Date.now());
    
    requestPermissions();
  }, []);
  
  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  };

  const handleStartNight = async () => {
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(selectedHour, selectedMinute, 0, 0);
    
    if (alarmDate.getTime() <= now.getTime()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
    
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to wake up!',
        body: 'Good morning from Mornify.',
        sound: true,
      },
      trigger: {
        date: alarmDate,
      },
    });

    saveAlarmTime(alarmDate.getTime());
    router.replace('/12-sleeping');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={() => router.back()} 
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => router.back()}
        backgroundStyle={{ backgroundColor: theme.nightSurface }}
        handleIndicatorStyle={{ backgroundColor: theme.nightMuted }}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Set Wake Time</Text>
          
          <View style={styles.timePickerContainer}>
            <Text style={styles.timeText}>
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </Text>
            {/* Minimal mock controls for hackathon phase 1 */}
            <View style={styles.timeControls}>
              <TouchableOpacity onPress={() => setSelectedHour((h) => (h + 1) % 24)} style={styles.timeButton}>
                <Text style={styles.timeButtonText}>+H</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedMinute((m) => (m + 15) % 60)} style={styles.timeButton}>
                <Text style={styles.timeButtonText}>+M</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartNight}>
            <Text style={styles.startButtonText}>Start the night</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.nightText,
    marginBottom: 32,
  },
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  timeText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: theme.nightText,
    marginBottom: 16,
  },
  timeControls: {
    flexDirection: 'row',
    gap: 16,
  },
  timeButton: {
    backgroundColor: theme.nightBorder,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  timeButtonText: {
    color: theme.nightText,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: theme.nightAccent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
