import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes } from '../constants/tokens';
import { useNights } from '../hooks/useStore';
import { useGroup } from '../hooks/useGroup';
import { TimeStepper } from '../components/TimeStepper';
import {
  Body,
  Button,
  Card,
  Grow,
  HeadingM,
  Kicker,
  LinkButton,
  Screen,
} from '../components/ui';
import { upsertLog } from '../lib/nights';
import { markMorningFixSeen } from '../lib/housekeeping';
import { nightKey, now, shiftNight, timestampForNight, weekday } from '../lib/time';

/**
 * Shown when the app opens and last night has no entry. This screen is what
 * keeps the dataset alive — one tap, three buckets, no typing, no guilt.
 */
const BUCKETS = [
  { label: 'Before 23:00', minutes: 22 * 60 + 30 },
  { label: '23:00 – 00:00', minutes: 23 * 60 + 30 },
  { label: 'After 00:00', minutes: 45 },
];

export default function MorningFix() {
  const router = useRouter();
  const palette = palettes.dawn;
  const { syncLog } = useGroup();
  const [exact, setExact] = useState<number | null>(null);

  const night = shiftNight(nightKey(now()), -1);

  const record = (minutes: number) => {
    const log = upsertLog(night, {
      sleepAt: timestampForNight(night, minutes),
      // Recalled, not lived. Kept apart from a live tap on purpose.
      source: 'morning_fix',
      frozen: false,
      loggedAt: now(),
    });
    markMorningFixSeen();
    syncLog(log.sleepAt, log.wakeAt, 'morning_fix', log.loggedAt);
    router.replace('/10-home-night');
  };

  const skip = () => {
    markMorningFixSeen();
    router.replace('/51-streak-reset');
  };

  return (
    <Screen palette={palette}>
      <Kicker palette={palette}>{weekday(now())}</Kicker>
      <HeadingM palette={palette} style={{ marginTop: 12 }}>
        We missed{'\n'}last night
      </HeadingM>
      <Body palette={palette} muted style={{ marginTop: 9 }}>
        Roughly what time did you go to sleep?
      </Body>

      {exact === null ? (
        <>
          <View style={{ marginTop: 18 }}>
            {BUCKETS.map((bucket) => (
              <TouchableOpacity key={bucket.label} onPress={() => record(bucket.minutes)}>
                <Card palette={palette} style={{ marginBottom: 9 }}>
                  <Body palette={palette}>{bucket.label}</Body>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
          <LinkButton
            label="Enter exact time"
            palette={palette}
            onPress={() => setExact(23 * 60 + 30)}
          />
        </>
      ) : (
        <View style={{ marginTop: 28, alignItems: 'center' }}>
          <TimeStepper minutes={exact} onChange={setExact} palette={palette} />
          <Button
            label="Save"
            palette={palette}
            onPress={() => record(exact)}
            style={{ marginTop: 28 }}
          />
        </View>
      )}

      <Grow />
      <LinkButton label="Skip — I didn't sleep here" palette={palette} onPress={skip} />
    </Screen>
  );
}
