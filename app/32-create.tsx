import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useGroup } from '../hooks/useGroup';
import { useState } from 'react';

export default function CreateGroup() {
  const router = useRouter();
  const { createGroup } = useGroup();
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');

  const handleCreate = async () => {
    if (name.trim().length < 2 || userName.trim().length < 2) return;
    const success = await createGroup(name.trim(), userName.trim());
    if (success) {
      router.replace('/30-group-empty');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Name your{'\n'}group</Text>

      <TextInput
        style={styles.input}
        placeholder="Group Name (e.g. TPB 3A)"
        placeholderTextColor={theme.nightMuted}
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <Text style={styles.hint}>Keep it recognizable. People join by code, not by search.</Text>

      <TextInput
        style={[styles.input, { marginTop: 24 }]}
        placeholder="Your Display Name"
        placeholderTextColor={theme.nightMuted}
        value={userName}
        onChangeText={setUserName}
      />

      <View style={styles.grow} />

      <TouchableOpacity 
        style={[styles.button, (name.length < 2 || userName.length < 2) && styles.buttonDisabled]} 
        onPress={handleCreate}
        disabled={name.length < 2 || userName.length < 2}
      >
        <Text style={styles.buttonText}>Create</Text>
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
  },
  hint: {
    color: theme.nightMuted,
    fontSize: 12,
    marginTop: 8,
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
