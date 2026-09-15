import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { useGroup } from '../hooks/useGroup';
import * as Notifications from 'expo-notifications';

export default function Sleeping() {
  const router = useRouter();
  const { sleepAt, alarmTime, clearSleepState, saveWakeAtAndIncrementStreak } = useSleepState();
  const { syncLog } = useGroup();

  const handleCancel = async () => {
    clearSleepState();
    await Notifications.cancelAllScheduledNotificationsAsync();
    router.replace('/10-home-night');
  };

  const handleWakeUpNow = async () => {
    const now = Date.now();
    saveWakeAtAndIncrementStreak(now);
    syncLog(sleepAt, now);
    await Notifications.cancelAllScheduledNotificationsAsync();
    router.replace('/21-morning-card');
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '--:--';
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.timeBlock}>
          <Text style={styles.label}>Went to sleep at</Text>
          <Text style={styles.sleepAtTime}>{formatTime(sleepAt)}</Text>
        </View>

        <View style={styles.timeBlock}>
          <Text style={styles.label}>Waking up at</Text>
          <Text style={styles.alarmTime}>{formatTime(alarmTime)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.wakeUpButton} onPress={handleWakeUpNow}>
          <Text style={styles.wakeUpText}>Wake Up Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel tonight</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.sleepingBg,
    justifyContent: 'space-between',
    padding: 32,
    paddingTop: 80,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 48,
  },
  timeBlock: {
    alignItems: 'center',
  },
  label: {
    color: theme.nightMuted,
    fontSize: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sleepAtTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.nightText,
    opacity: 0.72,
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.nightText,
    opacity: 0.42,
  },
  actions: {
    gap: 16,
  },
  wakeUpButton: {
    backgroundColor: theme.nightAccent,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
  },
  wakeUpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.nightBorder,
  },
  cancelText: {
    color: theme.nightMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});
