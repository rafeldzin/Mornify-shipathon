import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes } from '../constants/tokens';
import { useFreezes, useStreak } from '../hooks/useStore';
import { Icon } from '../components/Icon';
import { StreakCount } from '../components/StreakCount';
import { Body, Button, Grow, HeadingM, Screen } from '../components/ui';
import { getLog } from '../lib/nights';
import { nightKey, now } from '../lib/time';

/**
 * Where the freeze is actually spent: the purchase is upstream, this is the
 * night being marked. Confirmation routes straight back into the core loop —
 * no receipt screen, no bundle upsell.
 */
export default function FreezeOk() {
  const router = useRouter();
  const palette = palettes.night;
  const { spendFreeze } = useFreezes();
  const { current } = useStreak();
  const spent = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (spent.current) return;
    spent.current = true;
    const tonight = nightKey(now());
    if (getLog(tonight)?.frozen) {
      setSaved(true);
      return;
    }
    setSaved(spendFreeze(tonight));
  }, [spendFreeze]);

  return (
    <Screen palette={palette} style={{ alignItems: 'center' }}>
      <Grow />
      <Icon name="check" size={88} color={palette.text} round />
      <HeadingM palette={palette} style={{ marginTop: 22 }}>
        {saved ? 'Streak saved' : 'No freeze to use'}
      </HeadingM>
      <View style={{ height: 12 }} />
      <StreakCount count={current} palette={palette} />
      <Body palette={palette} muted style={{ marginTop: 14, maxWidth: 200, textAlign: 'center' }}>
        {saved
          ? "Tonight doesn't count against you. Sleep well."
          : 'Tonight still counts if you start it before the window closes.'}
      </Body>
      <Grow />
      <Button
        label="Going to sleep"
        palette={palette}
        onPress={() => router.replace('/11-alarm-set')}
      />
    </Screen>
  );
}
