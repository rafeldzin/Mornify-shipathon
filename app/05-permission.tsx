import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useProfile } from '../hooks/useStore';
import { Icon } from '../components/Icon';
import { Body, Button, Caption, Card, Grow, HeadingM, LinkButton, Screen } from '../components/ui';
import { requestPermission, scheduleBedtimeNudge } from '../lib/alarm';

export default function PermissionStep() {
  const router = useRouter();
  const { palette } = useTheme('night');
  const { baselineMinutes, nudgeEnabled, completeOnboarding } = useProfile();
  const [busy, setBusy] = useState(false);

  const finish = () => {
    completeOnboarding();
    router.replace('/10-home-night');
  };

  const handleAllow = async () => {
    setBusy(true);
    const granted = await requestPermission();
    if (granted && nudgeEnabled) {
      await scheduleBedtimeNudge(baselineMinutes);
    }
    setBusy(false);
    finish();
  };

  return (
    <Screen palette={palette}>
      <View style={{ height: 24 }} />
      <Icon name="bell" size={52} color={palette.text} />
      <HeadingM palette={palette} style={{ marginTop: 18 }}>
        We need to wake you
      </HeadingM>
      <Body palette={palette} muted style={{ marginTop: 10 }}>
        Mornify sets one alarm and one bedtime nudge. Nothing else.
      </Body>

      {/* The OEM warning comes before a failure, not after one. */}
      <Card palette={palette} style={{ marginTop: 16 }}>
        <Caption palette={palette}>
          On Xiaomi, Oppo and Vivo, also allow Autostart or the alarm may not fire.
        </Caption>
      </Card>

      <Grow />
      <Button
        label={busy ? 'Waiting for Android' : 'Allow notifications'}
        palette={palette}
        disabled={busy}
        onPress={handleAllow}
      />
      <LinkButton label="Not now" palette={palette} onPress={finish} />
    </Screen>
  );
}
