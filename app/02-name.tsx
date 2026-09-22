import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useProfile } from '../hooks/useStore';
import { Button, Caption, Grow, HeadingL, Kicker, Screen } from '../components/ui';
import { type } from '../constants/tokens';

const MIN_NAME_LENGTH = 2;

export default function NameStep() {
  const router = useRouter();
  const { palette } = useTheme('night');
  const { name, setName } = useProfile();
  const [value, setValue] = useState(name);

  const ready = value.trim().length >= MIN_NAME_LENGTH;

  const handleContinue = () => {
    setName(value.trim());
    router.push('/03-bedtime');
  };

  return (
    <Screen palette={palette}>
      <Kicker palette={palette}>Step 1 of 3</Kicker>
      <HeadingL palette={palette} style={{ marginTop: 14 }}>
        What should we{'\n'}call you?
      </HeadingL>

      <View style={{ height: 26 }} />
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Your name"
        placeholderTextColor={palette.muted}
        autoFocus
        autoCapitalize="words"
        maxLength={24}
        onSubmitEditing={() => ready && handleContinue()}
        style={{
          ...type.timeInline,
          color: palette.text,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
          paddingBottom: 9,
          paddingTop: 10,
        }}
      />
      <Caption palette={palette} style={{ marginTop: 11 }}>
        No email, no password. This is just what your group sees.
      </Caption>

      <Grow />
      {/* Disabled, but never invisible. */}
      <Button label="Continue" palette={palette} disabled={!ready} onPress={handleContinue} />
    </Screen>
  );
}
