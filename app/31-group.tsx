import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useGroup, GroupMember } from '../hooks/useGroup';
import { useSleepState } from '../hooks/useStore';
import { useEffect } from 'react';

export default function GroupActive() {
  const router = useRouter();
  const { groupName, inviteCode, members, refreshGroup, userId } = useGroup();

  useEffect(() => {
    refreshGroup();
  }, []);

  const sortedMembers = [...members].sort((a, b) => {
    if (!a.sleep_at && !b.sleep_at) return 0;
    if (!a.sleep_at) return 1;
    if (!b.sleep_at) return -1;
    return a.sleep_at - b.sleep_at;
  });

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'no log';
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item, index }: { item: GroupMember; index: number }) => {
    const isYou = item.user_id === userId;
    const hasLog = item.sleep_at !== null;

    return (
      <View style={[styles.memberRow, isYou && styles.youRow, !hasLog && styles.noLogRow]}>
        <Text style={[styles.rank, !hasLog && styles.noLogText]}>{hasLog ? index + 1 : '—'}</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.substring(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={[styles.memberName, !hasLog && styles.noLogText]}>{isYou ? 'You' : item.name}</Text>
        <Text style={[styles.memberTime, !hasLog && styles.noLogText]}>{formatTime(item.sleep_at)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{groupName}</Text>
          <Text style={styles.subtitle}>{members.length} people · {inviteCode}</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/23-home-dawn')}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Last night</Text>

      <FlatList
        data={sortedMembers}
        keyExtractor={(item) => item.user_id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dawnBg,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.dawnText,
  },
  subtitle: {
    fontSize: 12,
    color: theme.dawnMuted,
    marginTop: 4,
  },
  backButton: {
    color: theme.dawnMuted,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.dawnMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  listContent: {
    gap: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.dawnBorder,
  },
  youRow: {
    backgroundColor: 'rgba(245,147,50,.09)',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  noLogRow: {
    opacity: 0.42,
  },
  rank: {
    width: 24,
    fontSize: 12,
    color: theme.dawnMuted,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.dawnBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.dawnMuted,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: theme.dawnText,
    fontWeight: '500',
  },
  memberTime: {
    fontSize: 16,
    color: theme.dawnText,
    fontWeight: '600',
  },
  noLogText: {
    color: theme.dawnMuted,
    fontWeight: '400',
  },
});
