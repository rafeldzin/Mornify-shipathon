import { useEffect, useMemo } from 'react';
import { View, Share, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { palettes, layout } from '../constants/tokens';
import { useGroup, GroupMember } from '../hooks/useGroup';
import { useStreak } from '../hooks/useStore';
import { Icon } from '../components/Icon';
import { StreakCount } from '../components/StreakCount';
import {
  Body,
  Button,
  Caption,
  Card,
  Clock,
  GhostButton,
  Grow,
  Kicker,
  Screen,
} from '../components/ui';
import { lastCompleteLog, previousCompleteLog } from '../lib/nights';
import { formatClock, minuteDelta, minutesOfDay, nightOrder, weekday } from '../lib/time';
import { isOffline } from '../lib/sync';

/**
 * The product. Two clock times, a comparison, a streak — read in one second by
 * someone half awake. Never a duration: we know when buttons were pressed, not
 * how long anyone slept.
 */
export default function MorningCard() {
  const router = useRouter();
  const palette = palettes.dawn;
  const params = useLocalSearchParams<{ offline?: string }>();
  const { current } = useStreak();
  const { groupId, groupName, members, userId, refreshGroup } = useGroup();

  const log = lastCompleteLog();
  const previous = previousCompleteLog();
  const offline = params.offline === '1' || isOffline();

  useEffect(() => {
    if (groupId && !offline) refreshGroup();
  }, [groupId, offline]);

  const ranked = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.sleep_at === null) return 1;
        if (b.sleep_at === null) return -1;
        return nightOrder(a.sleep_at) - nightOrder(b.sleep_at);
      }),
    [members]
  );

  const rank = userId ? ranked.findIndex((m) => m.user_id === userId) + 1 : 0;

  const shareLine = [
    `${formatClock(log?.sleepAt ?? null)} → ${formatClock(log?.wakeAt ?? null)}`,
    rank > 0 ? `${ordinal(rank)} of ${ranked.length}` : null,
    groupName,
    `${current} nights consistent`,
    'mornify',
  ]
    .filter(Boolean)
    .join(' · ');

  const handleShare = () => Share.share({ message: shareLine });

  return (
    <Screen palette={palette}>
      {offline && (
        <Card palette={palette} style={{ marginBottom: 14, flexDirection: 'row', gap: 8 }}>
          <Icon name="offline" size={14} color={palette.muted} />
          <Caption palette={palette} style={{ flex: 1 }}>
            Saved on your phone. Your group sees it when you{'’'}re back online.
          </Caption>
        </Card>
      )}

      <Kicker palette={palette}>{log ? weekday(log.sleepAt ?? 0) : ''}</Kicker>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 9, marginTop: 12 }}>
        <Clock value={formatClock(log?.sleepAt ?? null)} palette={palette} />
        <Icon name="arrow" size={14} color={palette.muted} />
        <Clock value={formatClock(log?.wakeAt ?? null)} palette={palette} />
      </View>
      <Caption palette={palette} style={{ marginTop: 7 }}>
        {describeAgainstYesterday(log?.sleepAt ?? null, previous?.sleepAt ?? null)}
      </Caption>

      {groupId && (
        <Card palette={palette} style={{ marginTop: 16, opacity: offline ? 0.5 : 1 }}>
          <View style={styles.groupHeader}>
            <Caption palette={palette}>{groupName}</Caption>
            <Caption palette={palette}>
              {offline ? 'waiting for sync' : `${members.length} people`}
            </Caption>
          </View>
          {ranked.slice(0, 4).map((member, index) => (
            <MemberRow
              key={member.user_id}
              member={member}
              index={index}
              you={member.user_id === userId}
              palette={palette}
            />
          ))}
        </Card>
      )}

      <Grow />

      <Card palette={palette} style={styles.streakCard}>
        <StreakCount count={current} palette={palette} />
        <Caption palette={palette}>{offline ? 'counted locally' : 'consistent'}</Caption>
      </Card>

      <View style={{ flexDirection: 'row', gap: 9 }}>
        <GhostButton label="Share" palette={palette} onPress={handleShare} style={{ flex: 1 }} />
        <Button
          label="Done"
          palette={palette}
          onPress={() => router.replace('/10-home-night')}
          style={{ flex: 1 }}
        />
      </View>
    </Screen>
  );
}

function MemberRow({
  member,
  index,
  you,
  palette,
}: {
  member: GroupMember;
  index: number;
  you: boolean;
  palette: typeof palettes.dawn;
}) {
  const missing = member.sleep_at === null;
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: palette.border },
        you && { backgroundColor: 'rgba(245,147,50,0.09)' },
        // Never shamed, only greyed.
        missing && { opacity: 0.42 },
      ]}
    >
      <Text style={[styles.rank, { color: palette.muted }]}>{missing ? '—' : index + 1}</Text>
      <View style={[styles.avatar, { backgroundColor: palette.border }]}>
        <Text style={{ fontSize: 9.5, fontWeight: '600', color: palette.muted }}>
          {member.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Body palette={palette} style={{ flex: 1 }}>
        {you ? 'You' : member.name}
      </Body>
      <Body palette={palette} muted>
        {missing ? 'no log' : formatClock(member.sleep_at)}
      </Body>
    </View>
  );
}

function describeAgainstYesterday(sleepAt: number | null, previousSleepAt: number | null): string {
  if (sleepAt === null) return '';
  if (previousSleepAt === null) return 'Your first night on the board.';
  const delta = minuteDelta(minutesOfDay(sleepAt), minutesOfDay(previousSleepAt));
  if (Math.abs(delta) < 3) return 'Same time as yesterday';
  return `${Math.abs(delta)} minutes ${delta > 0 ? 'later' : 'earlier'} than yesterday`;
}

const ordinal = (n: number) => {
  const suffix = ['th', 'st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] ?? 'th';
  return `${n}${suffix}`;
};

const styles = {
  groupHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 9,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 9,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 4,
  },
  rank: {
    fontSize: 10.5,
    width: 15,
  },
  avatar: {
    width: layout.avatar,
    height: layout.avatar,
    borderRadius: layout.avatar / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  streakCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 11,
  },
};
