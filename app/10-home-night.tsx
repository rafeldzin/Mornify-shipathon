import { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useGroup } from '../hooks/useGroup';
import { useNights, useProfile, useStreak } from '../hooks/useStore';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { StreakCount } from '../components/StreakCount';
import {
  Body,
  Button,
  Caption,
  Card,
  Clock,
  GhostButton,
  Grow,
  HeadingM,
  Screen,
} from '../components/ui';
import { layout } from '../constants/tokens';
import {
  formatClock,
  formatMinutes,
  minuteDelta,
  minutesOfDay,
  nightKey,
  now,
  shiftNight,
} from '../lib/time';
import { lastCompleteLog } from '../lib/nights';
import { NUDGE_LEAD_MINUTES, shouldWarnAboutAlarm } from '../lib/alarm';
import { storage, keys } from '../lib/storage';

/**
 * One screen, two palettes. 10-home-night and 23-home-dawn are the same route —
 * the palette swaps on time of day, which is the concept, not two screens to
 * maintain. 23-home-dawn stays as a redirect so existing links keep working.
 */
export default function Home() {
  const router = useRouter();
  const { name: themeName, palette } = useTheme();
  const { baselineMinutes, name } = useProfile();
  const { current, atRisk, minutesLeft } = useStreak();
  const { logs } = useNights();
  const { groupId, members } = useGroup();

  const dawn = themeName === 'dawn';
  const groupRoute = !groupId ? '/04-group-setup' : members.length <= 1 ? '/30-group-empty' : '/31-group';

  // The freeze offer fires on risk and never on a timer — and at most once a
  // night, so a user who says "not tonight" is left alone.
  useFocusEffect(
    useCallback(() => {
      const tonight = nightKey(now());
      if (atRisk && storage.getString(keys.paywallShownFor) !== tonight) {
        storage.set(keys.paywallShownFor, tonight);
        router.push('/40-paywall');
      }
    }, [atRisk, router])
  );

  const lastNight = lastCompleteLog();
  const delta = minuteDelta(minutesOfDay(now()), baselineMinutes);

  return (
    <Screen palette={palette} style={{ paddingBottom: 0 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StreakCount count={current} palette={palette} />
        <TouchableOpacity onPress={() => router.push('/70-settings')}>
          <Icon name="settings" size={18} color={palette.text} />
        </TouchableOpacity>
      </View>

      {shouldWarnAboutAlarm() && (
        <TouchableOpacity onPress={() => router.push('/53-alarm-risk')} style={{ marginTop: 12 }}>
          <Card palette={palette}>
            <Caption palette={palette}>
              Android stopped Mornify in the background last night. Tap to fix the alarm.
            </Caption>
          </Card>
        </TouchableOpacity>
      )}

      {dawn ? (
        <DawnBody
          name={name}
          palette={palette}
          nudgeAt={formatMinutes(baselineMinutes - NUDGE_LEAD_MINUTES)}
          sleepAt={lastNight?.sleepAt ?? null}
          wakeAt={lastNight?.wakeAt ?? null}
          groupCount={members.length}
          onGroup={() => router.push(groupRoute as never)}
        />
      ) : (
        <NightBody
          palette={palette}
          baseline={formatMinutes(baselineMinutes)}
          delta={delta}
          atRisk={atRisk}
          minutesLeft={minutesLeft}
          onSleep={() => router.push('/11-alarm-set')}
        />
      )}

      <TabBar active="tonight" palette={palette} groupRoute={groupRoute} />
    </Screen>
  );
}

function NightBody({
  palette,
  baseline,
  delta,
  atRisk,
  minutesLeft,
  onSleep,
}: {
  palette: ReturnType<typeof useTheme>['palette'];
  baseline: string;
  delta: number;
  atRisk: boolean;
  minutesLeft: number;
  onSleep: () => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Caption palette={palette}>Your usual bedtime</Caption>
      <Clock value={baseline} palette={palette} size="large" style={{ marginTop: 5 }} />
      {/* Neutral information. Never red, never a warning. */}
      <Caption palette={palette} style={{ marginTop: 4, color: palette.accent }}>
        {describeDelta(delta)}
      </Caption>

      <View style={{ height: 30 }} />
      <Icon name="moon" size={104} color={palette.text} round />
      <View style={{ height: 24 }} />

      {atRisk && (
        <Caption palette={palette} style={{ marginBottom: 10 }}>
          Tonight still counts for another {minutesLeft} minutes.
        </Caption>
      )}
      <Button label="Going to sleep" palette={palette} onPress={onSleep} style={{ width: 190 }} />
    </View>
  );
}

function DawnBody({
  name,
  palette,
  nudgeAt,
  sleepAt,
  wakeAt,
  groupCount,
  onGroup,
}: {
  name: string;
  palette: ReturnType<typeof useTheme>['palette'];
  nudgeAt: string;
  sleepAt: number | null;
  wakeAt: number | null;
  groupCount: number;
  onGroup: () => void;
}) {
  return (
    <>
      <View style={{ height: 22 }} />
      <HeadingM palette={palette}>{name ? `Morning, ${name}` : 'Morning'}</HeadingM>
      <Body palette={palette} muted style={{ marginTop: 6 }}>
        {sleepAt ? `Logged. Next nudge at ${nudgeAt}.` : `Nothing logged yet. Next nudge at ${nudgeAt}.`}
      </Body>

      {sleepAt && (
        <Card palette={palette} style={{ marginTop: 18 }}>
          <Caption palette={palette} style={{ marginBottom: 9 }}>
            Last night{groupCount > 1 ? ` · ${groupCount} people` : ''}
          </Caption>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7 }}>
            <Clock value={formatClock(sleepAt)} palette={palette} size="inline" />
            <Icon name="arrow" size={12} color={palette.muted} />
            <Clock value={formatClock(wakeAt)} palette={palette} size="inline" />
          </View>
        </Card>
      )}

      <Grow />
      <GhostButton
        label="See the group"
        palette={palette}
        onPress={onGroup}
        style={{ marginBottom: layout.screenPadV }}
      />
    </>
  );
}

/** "8 minutes late", "on time", "12 minutes early". Information, not judgement. */
function describeDelta(delta: number): string {
  const minutes = Math.abs(delta);
  if (minutes < 3) return 'about your usual time';
  if (minutes >= 180) return 'well outside your usual time';
  return `${minutes} minutes ${delta > 0 ? 'late' : 'early'}`;
}
