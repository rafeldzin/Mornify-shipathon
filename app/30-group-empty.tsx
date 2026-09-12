import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useGroup } from '../hooks/useGroup';

export default function GroupEmpty() {
  const router = useRouter();
  const { groupName, inviteCode } = useGroup();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my sleep group on Mornify! Code: ${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/23-home-dawn')}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{groupName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>👥</Text>
        </View>
        <Text style={styles.message}>It's just you so far. The comparison starts at two.</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Invite code</Text>
          <Text style={styles.codeText}>{inviteCode}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Share invite</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dawnBg,
    padding: 24,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    color: theme.dawnMuted,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.dawnText,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.dawnSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.dawnBorder,
  },
  iconText: {
    fontSize: 32,
  },
  message: {
    fontSize: 16,
    color: theme.dawnText,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 240,
  },
  codeCard: {
    backgroundColor: theme.dawnSurface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.dawnBorder,
    alignItems: 'center',
    width: '100%',
  },
  codeLabel: {
    fontSize: 14,
    color: theme.dawnMuted,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.dawnText,
    letterSpacing: 4,
  },
  shareButton: {
    backgroundColor: theme.dawnAccent,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
