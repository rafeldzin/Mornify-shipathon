import { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, type, type Palette } from '../constants/tokens';

/** Screen padding is 14 vertical / 18 horizontal everywhere (docs/DESIGN.md). */
export function Screen({
  palette,
  background,
  children,
  style,
}: {
  palette: Palette;
  background?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background ?? palette.bg }}>
      <View
        style={[
          {
            flex: 1,
            paddingHorizontal: layout.screenPadH,
            paddingVertical: layout.screenPadV,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

export function Button({
  label,
  onPress,
  palette,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  palette: Palette;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: palette.accent, opacity: disabled ? 0.38 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: palette.onAccent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({
  label,
  onPress,
  palette,
  tone = 'default',
  style,
}: {
  label: string;
  onPress: () => void;
  palette: Palette;
  /** Destructive actions are outlined, never filled (docs/DESIGN.md). */
  tone?: 'default' | 'destructive';
  style?: StyleProp<ViewStyle>;
}) {
  const color = tone === 'destructive' ? palette.flame : palette.text;
  const border = tone === 'destructive' ? palette.flame : palette.border;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, styles.ghost, { borderColor: border }, style]}
    >
      <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function LinkButton({
  label,
  onPress,
  palette,
  style,
}: {
  label: string;
  onPress: () => void;
  palette: Palette;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.link}>
      <Text style={[{ ...type.body, color: palette.muted, textAlign: 'center' }, style]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Card({
  palette,
  children,
  style,
}: {
  palette: Palette;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Kicker({ palette, children }: { palette: Palette; children: ReactNode }) {
  return <Text style={{ ...type.kicker, color: palette.muted }}>{children}</Text>;
}

export function HeadingL({
  palette,
  children,
  style,
}: {
  palette: Palette;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[{ ...type.headingL, color: palette.text }, style]}>{children}</Text>;
}

export function HeadingM({
  palette,
  children,
  style,
}: {
  palette: Palette;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[{ ...type.headingM, color: palette.text }, style]}>{children}</Text>;
}

export function Body({
  palette,
  children,
  muted,
  style,
}: {
  palette: Palette;
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[{ ...type.body, color: muted ? palette.muted : palette.text }, style]}>
      {children}
    </Text>
  );
}

export function Caption({
  palette,
  children,
  style,
}: {
  palette: Palette;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[{ ...type.caption, color: palette.muted }, style]}>{children}</Text>;
}

/** Clock numerals are tabular so the layout never jitters. */
export function Clock({
  value,
  palette,
  size = 'large',
  style,
}: {
  value: string;
  palette: Palette;
  size?: 'hero' | 'large' | 'inline';
  style?: StyleProp<TextStyle>;
}) {
  const scale =
    size === 'hero' ? type.timeHero : size === 'large' ? type.timeLarge : type.timeInline;
  return (
    <Text style={[{ ...scale, color: palette.text }, styles.tabular, style]}>{value}</Text>
  );
}

export function Grow() {
  return <View style={{ flex: 1 }} />;
}

export function Divider({ palette }: { palette: Palette }) {
  return <View style={{ height: 1, backgroundColor: palette.border }} />;
}

const styles = StyleSheet.create({
  button: {
    height: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    paddingVertical: layout.cardPadV,
    paddingHorizontal: layout.cardPadH,
  },
  link: {
    paddingVertical: 12,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
