import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes } from '../constants/tokens';
import { useStreak } from '../hooks/useStore';
import { Icon } from '../components/Icon';
import { Body, Button, Card, Caption, Grow, HeadingM, Screen } from '../components/ui';
import { markStreakResetSeen } from '../lib/housekeeping';
import { nightKey, now, shiftNight, keyToDate, weekday } from '../lib/time';

/**
 * Losing a streak must not erase the evidence you were ever consistent, so the
 * longest run is preserved and shown. No guilt, no red, no lecture.
 */
export default function StreakReset() {
  const router = useRouter();
  const palette = palettes.dawn;
  const { longest } = useStreak();

  useEffect(() => {
    markStreakResetSeen();
  }, []);

  const endedOn = weekday(keyToDate(shiftNight(nightKey(now()), -1)).getTime());

  return (
    <Screen palette={palette}>
      <Grow />
      <View style={{ alignItems: 'center' }}>
        <View style={{ opacity: 0.3 }}>
          <Icon name="flame-off" size={52} color={palette.text} />
        </View>
        <HeadingM palette={palette} style={{ marginTop: 18 }}>
          Back to 1
        </HeadingM>
        <Body palette={palette} muted style={{ marginTop: 11, maxWidth: 220, textAlign: 'center' }}>
          Your run ended on {endedOn}. It happens.
        </Body>
      </View>
      <Grow />

      <Card palette={palette} style={styles.card}>
        <Caption palette={palette}>Longest run</Caption>
        <Body palette={palette} style={{ fontWeight: '600' }}>
          {longest} nights
        </Body>
      </Card>

      <Button
        label="Start again tonight"
        palette={palette}
        onPress={() => router.replace('/10-home-night')}
      />
    </Screen>
  );
}

const styles = {
  card: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
};
