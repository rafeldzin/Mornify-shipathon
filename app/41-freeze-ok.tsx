import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';

export default function FreezeOk() {
  const router = useRouter();
  const { streak } = useSleepState();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>✅</Text>
        </View>
        
        <Text style={styles.title}>Streak saved</Text>
        
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak} nights</Text>
        </View>

        <Text style={styles.message}>
          Tonight doesn't count against you. Sleep well.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.replace('/12-sleeping')}
      >
        <Text style={styles.buttonText}>Going to sleep</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.nightBg,
    padding: 24,
    paddingTop: 80,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.nightBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.nightText,
    marginBottom: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.streakFlame,
  },
  message: {
    fontSize: 16,
    color: theme.nightText,
    opacity: 0.72,
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 24,
  },
  button: {
    backgroundColor: theme.nightAccent,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
