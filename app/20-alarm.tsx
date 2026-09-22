import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes } from '../constants/tokens';
import { useActiveNight, useNights } from '../hooks/useStore';
import { useGroup } from '../hooks/useGroup';
import { Icon } from '../components/Icon';
import { Body, Button, Clock, Grow, LinkButton, Screen } from '../components/ui';
import { alarmTimestampFor, cancelAlarm, isReminderMode, scheduleAlarm } from '../lib/alarm';
import { MINUTE, formatClock, now, weekday } from '../lib/time';

const SNOOZE_MINUTES = 9;

/**
 * Dawn starts here — the app changes character at the exact moment the day
 * does, before the user has done anything.
 */
export default function AlarmRinging() {
  const router = useRouter();
  const palette = palettes.dawn;
  const { active, setAlarm, clear } = useActiveNight();
  const { wake } = useNights();
  const { syncLog } = useGroup();
  const [tick, setTick] = useState(now());

  useEffect(() => {
    const timer = setInterval(() => setTick(now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUp = async () => {
    const wakeAt = now();
    if (active) await cancelAlarm(active.notificationId);
    const log = wake(wakeAt, active?.night);
    clear();
    if (log) syncLog(log.sleepAt, log.wakeAt, log.source ?? 'tap', log.loggedAt);
    router.replace('/21-morning-card');
  };

  const handleSnooze = async () => {
    if (active) await cancelAlarm(active.notificationId);
    const at = now() + SNOOZE_MINUTES * MINUTE;
    const { id } = await scheduleAlarm(at, isReminderMode());
    setAlarm(at, id, isReminderMode());
  };

  const date = new Date(tick);

  return (
    <Screen palette={palette} style={{ alignItems: 'center' }}>
      <Grow />
      <Body palette={palette} muted>
        {weekday(tick)}, {date.getDate()} {date.toLocaleString(undefined, { month: 'long' })}
      </Body>
      <Clock value={formatClock(tick)} palette={palette} size="hero" style={{ marginTop: 9 }} />
      <View style={{ height: 26 }} />
      <Icon name="sun" size={96} color={palette.text} round />
      <Grow />
      <Button label="I'm up" palette={palette} onPress={handleUp} />
      <LinkButton
        label={`Snooze ${SNOOZE_MINUTES} min`}
        palette={palette}
        onPress={handleSnooze}
      />
    </Screen>
  );
}
