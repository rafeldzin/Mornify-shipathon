import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Body, Button, GhostButton, Grow, HeadingL, Kicker, LinkButton, Screen } from '../components/ui';

export default function GroupSetup() {
  const router = useRouter();
  const { palette } = useTheme('night');

  return (
    <Screen palette={palette}>
      <Kicker palette={palette}>Step 3 of 3</Kicker>
      <HeadingL palette={palette} style={{ marginTop: 14 }}>
        Sleep with{'\n'}your people
      </HeadingL>
      <Body palette={palette} muted style={{ marginTop: 11 }}>
        Your bedtime gets compared with a small group. Classmates, housemates, whoever.
      </Body>

      <Grow />
      <Button
        label="Create a group"
        palette={palette}
        onPress={() => router.push('/32-create')}
        style={{ marginBottom: 10 }}
      />
      <GhostButton
        label="Join with a code"
        palette={palette}
        onPress={() => router.push('/33-join')}
      />
      {/* Skip stays visible. A forced group wall at install is where solo users churn. */}
      <LinkButton
        label="Skip for now"
        palette={palette}
        onPress={() => router.push('/05-permission')}
      />
      <View style={{ height: 4 }} />
    </Screen>
  );
}
