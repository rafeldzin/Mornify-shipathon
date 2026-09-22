import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useProfile } from '../hooks/useStore';
import { TimeStepper } from '../components/TimeStepper';
import { Button, Caption, Grow, HeadingL, Kicker, Screen } from '../components/ui';
import { NUDGE_LEAD_MINUTES } from '../lib/alarm';

export default function BedtimeStep() {
  const router = useRouter();
  const { palette } = useTheme('night');
  const { baselineMinutes, setBaselineMinutes } = useProfile();
  const [minutes, setMinutes] = useState(baselineMinutes);

  const handleContinue = () => {
    setBaselineMinutes(minutes);
    router.push('/04-group-setup');
  };

  return (
    <Screen palette={palette}>
      <Kicker palette={palette}>Step 2 of 3</Kicker>
      <HeadingL palette={palette} style={{ marginTop: 14 }}>
        When do you{'\n'}usually sleep?
      </HeadingL>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TimeStepper minutes={minutes} onChange={setMinutes} palette={palette} />
        {/* Seeds the consistency baseline. Not a goal, not a target. */}
        <Caption palette={palette} style={{ marginTop: 16 }}>
          We{'’'}ll nudge you {NUDGE_LEAD_MINUTES} minutes before.
        </Caption>
      </View>

      <Grow />
      <Button label="Continue" palette={palette} onPress={handleContinue} />
    </Screen>
  );
}
