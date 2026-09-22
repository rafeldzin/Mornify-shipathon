import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, IconName } from './Icon';
import { layout } from '../constants/tokens';
import type { Palette } from '../constants/tokens';

type Tab = 'tonight' | 'group' | 'history';

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'tonight', label: 'Tonight', icon: 'home' },
  { key: 'group', label: 'Group', icon: 'group' },
  { key: 'history', label: 'History', icon: 'chart' },
];

export function TabBar({
  active,
  palette,
  groupRoute,
}: {
  active: Tab;
  palette: Palette;
  /** 30-group-empty until somebody else joins. */
  groupRoute: string;
}) {
  const router = useRouter();

  const routeFor = (tab: Tab) =>
    tab === 'tonight' ? '/10-home-night' : tab === 'group' ? groupRoute : '/60-history';

  return (
    <View style={[styles.bar, { borderTopColor: palette.border }]}>
      {TABS.map((tab) => {
        const on = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { opacity: on ? 1 : 0.45 }]}
            onPress={() => !on && router.replace(routeFor(tab.key) as never)}
          >
            <Icon name={tab.icon} size={22} color={palette.text} />
            <Text style={[styles.label, { color: palette.text }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: layout.tabBar,
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 9.5,
  },
});
