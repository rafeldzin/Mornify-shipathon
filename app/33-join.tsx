import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useGroup } from '../hooks/useGroup';
import { useState } from 'react';

export default function JoinGroup() {
  const router = useRouter();
  const { joinGroup } = useGroup();
  const [code, setCode] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (code.length !== 6 || userName.trim().length < 2) return;
    const success = await joinGroup(code, userName.trim());
    if (success) {
      router.replace('/31-group');
    } else {
      setError('Invalid invite code');
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric, uppercase, filter ambiguous
    const filtered = text.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '');
    setCode(filtered.substring(0, 6));
    setError('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Enter the{'\n'}code</Text>

      <TextInput
        style={styles.input}
        placeholder="6-Character Code"
        placeholderTextColor={theme.nightMuted}
        value={code}
        onChangeText={handleCodeChange}
        autoCapitalize="characters"
        maxLength={6}
        autoFocus
      />
      <Text style={styles.hint}>Ask whoever made the group.</Text>

      <TextInput
        style={[styles.input, { marginTop: 24 }]}
        placeholder="Your Display Name"
        placeholderTextColor={theme.nightMuted}
        value={userName}
        onChangeText={setUserName}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.grow} />

      <TouchableOpacity 
        style={[styles.button, (code.length !== 6 || userName.length < 2) && styles.buttonDisabled]} 
        onPress={handleJoin}
        disabled={code.length !== 6 || userName.length < 2}
      >
        <Text style={styles.buttonText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.nightBg,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 32,
  },
  backText: {
    color: theme.nightMuted,
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.nightText,
    marginBottom: 40,
    lineHeight: 40,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: theme.nightBorder,
    color: theme.nightText,
    fontSize: 20,
    paddingVertical: 12,
    letterSpacing: 2,
  },
  hint: {
    color: theme.nightMuted,
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    color: theme.streakFlame,
    marginTop: 16,
    fontSize: 14,
  },
  grow: {
    flex: 1,
  },
  button: {
    backgroundColor: theme.nightAccent,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
