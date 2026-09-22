import { Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes } from '../constants/tokens';
import { Icon } from '../components/Icon';
import { Body, Button, Caption, Card, GhostButton, Grow, Screen } from '../components/ui';
import { clearAlarmMissed, setReminderMode } from '../lib/alarm';

/**
 * Shown after a detected missed alarm, not to everyone. The second button is
 * the honest exit: we stop calling it an alarm rather than fight the OEM.
 */
export default function AlarmRisk() {
  const router = useRouter();
  const palette = palettes.night;

  const useReminderInstead = () => {
    setReminderMode(true);
    clearAlarmMissed();
    router.replace('/10-home-night');
  };

  return (
    <Screen palette={palette}>
      <Card palette={palette} style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Icon name="warning" size={14} color={palette.flame} />
        <Caption palette={palette} style={{ flex: 1 }}>
          Your alarm probably won{'’'}t fire
        </Caption>
      </Card>

      <Body palette={palette}>
        Android stopped Mornify in the background last night. On this phone you need to allow it
        to run.
      </Body>

      <Card palette={palette} style={{ marginTop: 16 }}>
        <Caption palette={palette} style={{ lineHeight: 19 }}>
          Settings › Apps › Mornify{'\n'}› Battery › Unrestricted{'\n'}› Autostart › On
        </Caption>
      </Card>

      <Grow />
      <Button
        label="Open settings"
        palette={palette}
        onPress={() => Linking.openSettings()}
        style={{ marginBottom: 10 }}
      />
      <GhostButton label="Use a reminder instead" palette={palette} onPress={useReminderInstead} />
      <View style={{ height: 4 }} />
    </Screen>
  );
}
