import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes } from '../constants/tokens';
import { useActiveNight, useNights } from '../hooks/useStore';
import { Icon } from '../components/Icon';
import { Caption, Clock, Grow, LinkButton, Screen } from '../components/ui';
import { cancelAlarm, isReminderMode } from '../lib/alarm';
import { formatClock } from '../lib/time';

/** The darkest screen in the app, looked at in a dark room by someone about to sleep. */
export default function Sleeping() {
  const router = useRouter();
  const palette = palettes.night;
  const { active, clear } = useActiveNight();
  const { discard } = useNights();

  // Not in the original spec, but a real hole: someone who wakes before the
  // alarm otherwise has no way to close the night.
  const handleUpEarly = async () => {
    if (active) await cancelAlarm(active.notificationId);
    router.replace('/20-alarm');
  };

  const handleCancel = async () => {
    if (active) {
      await cancelAlarm(active.notificationId);
      discard(active.night);
    }
    clear();
    router.replace('/10-home-night');
  };

  return (
    <Screen palette={palette} background={palette.deep} style={{ alignItems: 'center' }}>
      <Grow />
      <Caption palette={palette} style={{ opacity: 0.42 }}>
        Sleeping since
      </Caption>
      <Clock
        value={formatClock(active?.sleepAt ?? null)}
        palette={palette}
        size="large"
        style={{ marginTop: 7, opacity: 0.72 }}
      />

      <View style={{ height: 34 }} />
      <View style={{ opacity: 0.22 }}>
        <Icon name="alarm" size={52} color={palette.text} />
      </View>
      <Caption palette={palette} style={{ marginTop: 11, opacity: 0.42 }}>
        {active?.alarmAt
          ? `${active.reminderOnly || isReminderMode() ? 'Reminder' : 'Alarm'} at ${formatClock(active.alarmAt)}`
          : 'No alarm set'}
      </Caption>

      <Grow />
      {/* Literally true — we have no sensors. This line is the privacy story. */}
      <Caption palette={palette} style={{ opacity: 0.3, maxWidth: 190, textAlign: 'center' }}>
        You can lock your phone. Nothing is recorded.
      </Caption>
      <LinkButton
        label="I'm up already"
        palette={palette}
        onPress={handleUpEarly}
        style={{ opacity: 0.42 }}
      />
      <LinkButton
        label="Cancel tonight"
        palette={palette}
        onPress={handleCancel}
        style={{ opacity: 0.42 }}
      />
    </Screen>
  );
}
