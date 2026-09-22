import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes, layout } from '../constants/tokens';
import { useGroup } from '../hooks/useGroup';
import { Body, GhostButton, HeadingM, LinkButton } from '../components/ui';

export default function LeaveGroup() {
  const router = useRouter();
  const palette = palettes.dawn;
  const { groupName, leaveGroup } = useGroup();

  const handleLeave = async () => {
    await leaveGroup();
    router.replace('/10-home-night');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={() => router.back()} />
      <View style={[styles.sheet, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <HeadingM palette={palette}>Leave {groupName ?? 'this group'}?</HeadingM>
        <Body palette={palette} muted style={{ marginTop: 9 }}>
          Your nights stay on your phone. You{'’'}ll stop seeing the group and they{'’'}ll
          stop seeing you.
        </Body>
        {/* Outlined, never filled — a filled red button gets mis-tapped at 6am. */}
        <GhostButton
          label="Leave group"
          palette={palette}
          tone="destructive"
          onPress={handleLeave}
          style={{ marginTop: 18 }}
        />
        <LinkButton label="Cancel" palette={palette} onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: layout.scrim,
  },
  sheet: {
    borderTopLeftRadius: layout.sheetRadius,
    borderTopRightRadius: layout.sheetRadius,
    borderTopWidth: 1,
    padding: 18,
    paddingBottom: 26,
  },
});
