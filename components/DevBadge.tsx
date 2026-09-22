import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes } from '../constants/tokens';
import { clockLabel } from '../lib/dev';

/**
 * The way into developer mode, and a constant reminder that the clock may be
 * faked. Renders nothing outside __DEV__, so it leaves the release build.
 */
export function DevBadge() {
  if (!__DEV__) return null;

  const router = useRouter();
  const [label, setLabel] = useState(clockLabel);

  useEffect(() => {
    const timer = setInterval(() => setLabel(clockLabel()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <TouchableOpacity
      style={styles.badge}
      onPress={() => router.push('/99-dev')}
      accessibilityLabel="Open developer mode"
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palettes.night.accent,
    backgroundColor: 'rgba(11,17,32,0.82)',
    zIndex: 999,
  },
  text: {
    color: palettes.night.accent,
    fontSize: 10,
  },
});
