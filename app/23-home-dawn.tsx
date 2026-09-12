import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { useGroup } from '../hooks/useGroup';

export default function HomeDawn() {
  const router = useRouter();
  const { streak, sleepAt, wakeAt } = useSleepState();
  const { groupId, members, userId } = useGroup();

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '--:--';
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleGroupNavigation = () => {
    if (!groupId) {
      router.push('/04-group-setup'); // Assuming 04-group-setup exists or just route to a create/join choice screen
    } else if (members.length <= 1) {
      router.push('/30-group-empty');
    } else {
      router.push('/31-group');
    }
  };
  
  // Need rank summary logic
  const sortedMembers = [...members]
    .filter(m => m.sleep_at)
    .sort((a, b) => (a.sleep_at as number) - (b.sleep_at as number));
  const userRank = userId ? sortedMembers.findIndex(m => m.user_id === userId) + 1 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>🔥 {streak} Day Streak</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Last Night</Text>
        <View style={styles.summaryCard}>
          {groupId && (
            <Text style={styles.groupContextText}>
              Last night · {members.length} people
            </Text>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Went to bed</Text>
            <Text style={styles.summaryValue}>{formatTime(sleepAt)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Woke up</Text>
            <Text style={styles.summaryValue}>{formatTime(wakeAt)}</Text>
          </View>
          
          {groupId && userRank > 0 && (
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{userRank}{['st','nd','rd'][((userRank+90)%100-10)%10-1]||'th'} of {members.length}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.groupButton} onPress={handleGroupNavigation}>
        <Text style={styles.groupButtonText}>{groupId ? 'See the group' : 'Join a group'}</Text>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  streakBadge: {
    backgroundColor: theme.streakFlame,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.dawnText,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: theme.dawnSurface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.dawnBorder,
  },
  groupContextText: {
    fontSize: 12,
    color: theme.dawnMuted,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: theme.dawnBorder,
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.dawnMuted,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    color: theme.dawnText,
    fontWeight: '700',
  },
  rankContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.dawnBorder,
  },
  rankText: {
    fontSize: 12,
    color: theme.dawnText,
    fontWeight: '600',
  },
  groupButton: {
    backgroundColor: theme.dawnAccent,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  groupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
