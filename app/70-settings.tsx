import { useState } from 'react';
import { Linking, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes, type } from '../constants/tokens';
import { PRIVACY_POLICY_URL } from '../constants/links';
import { useFreezes, useProfile } from '../hooks/useStore';
import { useGroup } from '../hooks/useGroup';
import { usePurchases } from '../hooks/usePurchases';
import { Icon } from '../components/Icon';
import { TimeStepper } from '../components/TimeStepper';
import { Body, Caption, Grow, HeadingM, Screen } from '../components/ui';
import { cancelNudge, scheduleBedtimeNudge } from '../lib/alarm';
import { formatMinutes } from '../lib/time';

/** No account section, because there is no account. */
export default function Settings() {
  const router = useRouter();
  const palette = palettes.dawn;
  const {
    name,
    setName,
    baselineMinutes,
    setBaselineMinutes,
    nudgeEnabled,
    setNudgeEnabled,
  } = useProfile();
  const { groupId, groupName } = useGroup();
  const { freezesLeft } = useFreezes();
  const { restorePurchases } = usePurchases();

  const [editing, setEditing] = useState<'none' | 'name' | 'bedtime'>('none');
  const [draftName, setDraftName] = useState(name);
  const [restored, setRestored] = useState<string | null>(null);

  const commitName = () => {
    if (draftName.trim().length >= 2) setName(draftName.trim());
    setEditing('none');
  };

  const changeBedtime = async (minutes: number) => {
    setBaselineMinutes(minutes);
    if (nudgeEnabled) await scheduleBedtimeNudge(minutes);
  };

  const toggleNudge = async (value: boolean) => {
    setNudgeEnabled(value);
    if (value) await scheduleBedtimeNudge(baselineMinutes);
    else await cancelNudge();
  };

  const handleRestore = async () => {
    const ok = await restorePurchases();
    setRestored(ok ? 'Purchases restored' : 'Nothing to restore on this account');
  };

  return (
    <Screen palette={palette}>
      <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
        <Icon name="back" size={16} color={palette.text} />
      </TouchableOpacity>
      <HeadingM palette={palette} style={{ marginTop: 16 }}>
        Settings
      </HeadingM>

      <View style={{ marginTop: 18 }}>
        {editing === 'name' ? (
          <View style={[styles.row, { borderBottomColor: palette.border }]}>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              onBlur={commitName}
              onSubmitEditing={commitName}
              autoFocus
              maxLength={24}
              style={{ ...type.timeInline, color: palette.text, flex: 1 }}
            />
          </View>
        ) : (
          <Row
            label="Name"
            value={name || 'Not set'}
            palette={palette}
            onPress={() => {
              setDraftName(name);
              setEditing('name');
            }}
          />
        )}

        <Row
          label="Usual bedtime"
          value={formatMinutes(baselineMinutes)}
          palette={palette}
          onPress={() => setEditing(editing === 'bedtime' ? 'none' : 'bedtime')}
        />
        {editing === 'bedtime' && (
          <View style={{ alignItems: 'center', paddingVertical: 18 }}>
            <TimeStepper minutes={baselineMinutes} onChange={changeBedtime} palette={palette} />
            <Caption palette={palette} style={{ marginTop: 12 }}>
              Changing this changes what counts as consistent.
            </Caption>
          </View>
        )}

        <View style={[styles.row, { borderBottomColor: palette.border }]}>
          <Body palette={palette} style={{ flex: 1 }}>
            Bedtime nudge
          </Body>
          <Switch
            value={nudgeEnabled}
            onValueChange={toggleNudge}
            trackColor={{ true: palette.accent, false: palette.border }}
          />
        </View>

        <Row
          label="Group"
          value={groupName ?? 'None'}
          palette={palette}
          onPress={() => router.push(groupId ? '/31-group' : '/04-group-setup')}
        />
        <Row
          label="Streak freezes"
          value={String(freezesLeft)}
          palette={palette}
          onPress={() => router.push('/42-freezes')}
        />
        {/* Required for store review. */}
        <Row label="Restore purchases" palette={palette} onPress={handleRestore} />
        {PRIVACY_POLICY_URL !== '' && (
          <Row
            label="Privacy policy"
            palette={palette}
            icon="external"
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          />
        )}
        {groupId && (
          <Row label="Leave group" palette={palette} onPress={() => router.push('/71-leave')} />
        )}
      </View>

      {restored && (
        <Caption palette={palette} style={{ marginTop: 14 }}>
          {restored}
        </Caption>
      )}

      <Grow />
      <Caption palette={palette} style={{ textAlign: 'center', opacity: 0.45 }}>
        Mornify 1.0 · Bandung
      </Caption>
    </Screen>
  );
}

function Row({
  label,
  value,
  palette,
  onPress,
  icon = 'chevron',
}: {
  label: string;
  value?: string;
  palette: typeof palettes.dawn;
  onPress: () => void;
  icon?: 'chevron' | 'external';
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, { borderBottomColor: palette.border }]}>
      <Body palette={palette} style={{ flex: 1 }}>
        {label}
      </Body>
      {value !== undefined && (
        <Body palette={palette} muted>
          {value}
        </Body>
      )}
      <Icon name={icon} size={12} color={palette.muted} />
    </TouchableOpacity>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 9,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
};
