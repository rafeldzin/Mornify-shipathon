import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Icon } from '../components/Icon';
import { Body, Button, Grow, HeadingL, LinkButton, Screen } from '../components/ui';

export default function Welcome() {
  const router = useRouter();
  const { palette } = useTheme('night');

  return (
    <Screen palette={palette} style={{ alignItems: 'center' }}>
      <Grow />
      <Icon name="logo" size={76} color={palette.text} round />
      <View style={{ height: 22 }} />
      <HeadingL palette={palette}>mornify</HeadingL>
      <Body palette={palette} muted style={{ marginTop: 9, maxWidth: 200, textAlign: 'center' }}>
        Sleep consistency, but with your people watching.
      </Body>
      <Grow />
      <Button label="Get started" palette={palette} onPress={() => router.push('/02-name')} />
      <LinkButton
        label="I have an invite code"
        palette={palette}
        onPress={() => router.push('/33-join')}
      />
    </Screen>
  );
}
