import { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useActiveNight, useNights } from '../hooks/useStore';
import { TimeStepper } from '../components/TimeStepper';
import { Button, HeadingM, LinkButton } from '../components/ui';
import { layout } from '../constants/tokens';
import { alarmTimestampFor, isReminderMode, scheduleAlarm } from '../lib/alarm';
import { nightKey, now } from '../lib/time';

const DEFAULT_WAKE_MINUTES = 6 * 60 + 15;

export default function AlarmSet() {
  const router = useRouter();
  const { palette } = useTheme('night');
  const { begin } = useNights();
  const { active, open, setAlarm, clear } = useActiveNight();
  const [wakeMinutes, setWakeMinutes] = useState(DEFAULT_WAKE_MINUTES);
  const started = useRef(false);

  /**
   * The sleep timestamp is written the moment this sheet opens, not when it is
   * confirmed. If the user abandons here, the night is still logged.
   */
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const sleepAt = now();
    begin(sleepAt, 'tap');
    open(sleepAt);
  }, [begin, open]);

  const night = active?.night ?? nightKey(now());

  const handleStart = async () => {
    const at = alarmTimestampFor(night, wakeMinutes);
    const { id } = await scheduleAlarm(at, isReminderMode());
    setAlarm(at, id, isReminderMode());
    router.replace('/12-sleeping');
  };

  const handleSkipAlarm = () => {
    setAlarm(null, null, false);
    router.replace('/12-sleeping');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.scrim}
        activeOpacity={1}
        accessibilityLabel="Close"
        // Backing out keeps the night logged and only stops treating it as in
        // progress, so home is not stuck on the sleeping screen afterwards.
        onPress={() => {
          clear();
          router.back();
        }}
      />
      <View style={[styles.sheet, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <HeadingM palette={palette}>Wake me at</HeadingM>
        <View style={styles.stepper}>
          <TimeStepper minutes={wakeMinutes} onChange={setWakeMinutes} palette={palette} />
        </View>
        <Button label="Start the night" palette={palette} onPress={handleStart} />
        <LinkButton label="Skip the alarm" palette={palette} onPress={handleSkipAlarm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: layout.scrim,
  },
  sheet: {
    borderTopLeftRadius: layout.sheetRadius,
    borderTopRightRadius: layout.sheetRadius,
    borderTopWidth: 1,
    padding: 18,
    paddingBottom: 26,
  },
  stepper: {
    alignItems: 'center',
    marginVertical: 22,
  },
});
