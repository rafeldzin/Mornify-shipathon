import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';

export default function GroupSetup() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Step 3 of 3</Text>
      
      <Text style={styles.title}>Sleep with{'\n'}your people</Text>
      
      <Text style={styles.subtitle}>
        Your bedtime gets compared with a small group. Classmates, housemates, whoever.
      </Text>

      <View style={styles.grow} />

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/32-create')}>
        <Text style={styles.primaryButtonText}>Create a group</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/33-join')}>
        <Text style={styles.secondaryButtonText}>Join with a code</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.skipButton} onPress={() => router.back()}>
        <Text style={styles.skipButtonText}>Skip for now</Text>
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
  },
  kicker: {
    color: theme.nightMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.nightText,
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: theme.nightMuted,
    lineHeight: 24,
  },
  grow: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: theme.nightAccent,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.nightBorder,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: theme.nightText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  skipButtonText: {
    color: theme.nightMuted,
    fontSize: 14,
  },
});
