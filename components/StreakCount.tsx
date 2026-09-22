import { View, Text } from 'react-native';
import { Icon } from './Icon';
import type { Palette } from '../constants/tokens';

/** The flame number is the one coloured element in either palette. */
export function StreakCount({
  count,
  palette,
  unit = 'nights',
}: {
  count: number;
  palette: Palette;
  unit?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Icon name={count > 0 ? 'flame' : 'flame-off'} size={16} color={palette.text} />
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: palette.flame,
          fontVariant: ['tabular-nums'],
        }}
      >
        {count}
      </Text>
      <Text style={{ fontSize: 11, color: palette.muted }}>{unit}</Text>
    </View>
  );
}
