import { FlatList, View } from 'react-native';
import { palettes } from '../constants/tokens';
import { useGroup } from '../hooks/useGroup';
import { useNights, useProfile, useStreak } from '../hooks/useStore';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { Body, Caption, Clock, HeadingM, Screen } from '../components/ui';
import type { SleepLog } from '../lib/nights';
import { formatClock, keyToDate, monthName, shortDate } from '../lib/time';

/**
 * A list, not a graph. A line chart would imply measurement we do not do.
 * Filled dot = counted toward consistency, hollow = outside the window,
 * freeze icon = a frozen night. 61-history-empty is the empty state below.
 */
export default function History() {
  const palette = palettes.dawn;
  const { logs } = useNights();
  const { counted } = useStreak();
  const { groupId, members } = useGroup();

  const groupRoute = !groupId
    ? '/04-group-setup'
    : members.length <= 1
      ? '/30-group-empty'
      : '/31-group';

  return (
    <Screen palette={palette} style={{ paddingBottom: 0 }}>
      <HeadingM palette={palette}>History</HeadingM>
      {logs.length > 0 && (
        <Caption palette={palette} style={{ marginTop: 4 }}>
          {monthName(keyToDate(logs[0].night).getTime())}
        </Caption>
      )}

      {logs.length === 0 ? (
        <Empty palette={palette} />
      ) : (
        <FlatList
          style={{ marginTop: 16 }}
          data={logs}
          keyExtractor={(item) => item.night}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Row log={item} counted={counted.has(item.night)} palette={palette} />
          )}
        />
      )}

      <TabBar active="history" palette={palette} groupRoute={groupRoute} />
    </Screen>
  );
}

function Row({
  log,
  counted,
  palette,
}: {
  log: SleepLog;
  counted: boolean;
  palette: typeof palettes.dawn;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
        opacity: log.frozen ? 0.42 : 1,
      }}
    >
      <Caption palette={palette} style={{ width: 46 }}>
        {shortDate(keyToDate(log.night).getTime())}
      </Caption>

      {log.frozen ? (
        <>
          <Body palette={palette} muted style={{ flex: 1 }}>
            frozen
          </Body>
          <Icon name="freeze" size={12} color={palette.muted} />
        </>
      ) : (
        <>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Clock value={formatClock(log.sleepAt)} palette={palette} size="inline" />
            <Caption palette={palette}>→</Caption>
            <Clock value={formatClock(log.wakeAt)} palette={palette} size="inline" />
          </View>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              borderWidth: 1,
              borderColor: counted ? palette.accent : palette.border,
              backgroundColor: counted ? palette.accent : 'transparent',
            }}
          />
        </>
      )}
    </View>
  );
}

/** 61-history-empty — an invitation, not an apology. */
function Empty({ palette }: { palette: typeof palettes.dawn }) {
  const { name } = useProfile();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ opacity: 0.4 }}>
        <Icon name="calendar" size={52} color={palette.text} />
      </View>
      <Body palette={palette} muted style={{ marginTop: 16, maxWidth: 190, textAlign: 'center' }}>
        {name ? `Your first night shows up here tomorrow morning, ${name}.` : 'Your first night shows up here tomorrow morning.'}
      </Body>
    </View>
  );
}
