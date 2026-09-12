import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { useGroup } from '../hooks/useGroup';
import { useEffect, useMemo } from 'react';

export default function MorningCard() {
  const router = useRouter();
  const { sleepAt, wakeAt, streak } = useSleepState();
  const { groupId, groupName, members, userId, refreshGroup } = useGroup();

  useEffect(() => {
    if (groupId) {
      refreshGroup();
    }
  }, [groupId]);

  const sortedMembers = useMemo(() => {
    return [...members]
      .filter(m => m.sleep_at)
      .sort((a, b) => (a.sleep_at as number) - (b.sleep_at as number));
  }, [members]);

  const userRank = useMemo(() => {
    if (!userId) return null;
    const index = sortedMembers.findIndex(m => m.user_id === userId);
    return index !== -1 ? index + 1 : null;
  }, [sortedMembers, userId]);

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '--:--';
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>

        <View style={styles.timesContainer}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Bedtime</Text>
            <Text style={styles.timeValue}>{formatTime(sleepAt)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Wake up</Text>
            <Text style={styles.timeValue}>{formatTime(wakeAt)}</Text>
          </View>
        </View>

        {groupId && (
          <View style={styles.groupInfoContainer}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{groupName}</Text>
              <Text style={styles.groupCount}>{members.length} people</Text>
            </View>
            {sortedMembers.slice(0, 3).map((m, i) => (
              <View key={m.user_id} style={[styles.memberRow, m.user_id === userId && styles.youRow]}>
                <Text style={styles.rank}>{i + 1}</Text>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>{m.user_id === userId ? 'You' : m.name}</Text>
                <Text style={styles.memberTime}>{formatTime(m.sleep_at)}</Text>
              </View>
            ))}
            {userRank && userRank > 3 && (
              <View style={[styles.memberRow, styles.youRow]}>
                <Text style={styles.rank}>{userRank}</Text>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>YO</Text>
                </View>
                <Text style={styles.memberName}>You</Text>
                <Text style={styles.memberTime}>{formatTime(sleepAt)}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.doneButton} 
        onPress={() => router.replace('/23-home-dawn')}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dawnBg,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.dawnSurface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.dawnBorder,
    shadowColor: theme.dawnText,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
    marginBottom: 48,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: theme.streakFlame,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.dawnMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  timesContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.dawnBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: theme.dawnMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.dawnText,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: theme.dawnBorder,
  },
  groupInfoContainer: {
    width: '100%',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.dawnBorder,
    paddingTop: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 14,
    color: theme.dawnText,
    fontWeight: '600',
  },
  groupCount: {
    fontSize: 12,
    color: theme.dawnMuted,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  youRow: {
    backgroundColor: 'rgba(245,147,50,.09)',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  rank: {
    width: 20,
    fontSize: 12,
    color: theme.dawnMuted,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.dawnBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: theme.dawnMuted,
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    color: theme.dawnText,
    fontWeight: '500',
  },
  memberTime: {
    fontSize: 14,
    color: theme.dawnText,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: theme.dawnText,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
  },
  doneButtonText: {
    color: theme.dawnSurface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
