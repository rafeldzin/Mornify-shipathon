import { View, Text, StyleSheet } from 'react-native';

/**
 * Placeholder only. The team ships its own icon set — do not swap this for
 * lucide-react-native, @expo/vector-icons or any other library (CLAUDE.md).
 * Every slot renders a labelled dashed box so missing assets stay visible.
 */
export type IconName =
  | 'logo'
  | 'moon'
  | 'sun'
  | 'flame'
  | 'flame-off'
  | 'alarm'
  | 'bell'
  | 'freeze'
  | 'check'
  | 'plus'
  | 'minus'
  | 'arrow'
  | 'chevron'
  | 'back'
  | 'share'
  | 'invite'
  | 'settings'
  | 'home'
  | 'group'
  | 'chart'
  | 'calendar'
  | 'warning'
  | 'offline'
  | 'external';

export function Icon({
  name,
  size = 16,
  color,
  round = false,
}: {
  name: IconName;
  size?: number;
  color: string;
  round?: boolean;
}) {
  return (
    <View
      style={[
        styles.box,
        {
          minWidth: size + 8,
          height: size + 8,
          borderColor: color,
          borderRadius: round ? (size + 8) / 2 : Math.min(12, size / 3 + 2),
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.label, { color, fontSize: Math.max(7, Math.min(9.5, size / 3)) }]}
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    opacity: 0.42,
  },
  label: {
    letterSpacing: -0.2,
  },
});
