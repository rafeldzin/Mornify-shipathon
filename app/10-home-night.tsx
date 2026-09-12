import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { useEffect } from 'react';

export default function HomeNight() {
  const router = useRouter();
  const { sleepAt } = useSleepState();

  useEffect(() => {
    if (sleepAt) {
      router.replace('/12-sleeping');
    }
  }, [sleepAt]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/11-alarm-set')}
      >
        <Text style={styles.buttonText}>Going to sleep</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.nightAccent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    shadowColor: theme.nightAccent,
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
