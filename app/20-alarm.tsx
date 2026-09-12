import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { useGroup } from '../hooks/useGroup';
import { useState, useEffect } from 'react';

export default function AlarmRinging() {
  const router = useRouter();
  const { sleepAt, saveWakeAtAndIncrementStreak } = useSleepState();
  const { syncLog } = useGroup();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWakeUp = () => {
    saveWakeAtAndIncrementStreak(Date.now());
    syncLog(sleepAt, Date.now());
    router.replace('/21-morning-card');
  };

  const formattedTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleWakeUp}>
        <Text style={styles.buttonText}>I'm up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dawnBg,
    justifyContent: 'space-between',
    padding: 32,
    paddingTop: 80,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: theme.dawnText,
  },
  button: {
    backgroundColor: theme.dawnAccent,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: theme.dawnAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
