import { ScrollView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { palettes } from '../constants/tokens';
import { Body, Caption, HeadingM, Kicker, Screen } from '../components/ui';
import * as dev from '../lib/dev';
import { useNights, useProfile, useStreak, useFreezes, useActiveNight } from '../hooks/useStore';
import { CONSISTENCY_TOLERANCE_MINUTES } from '../lib/streak';
import { formatMinutes, nightKey, now, shiftNight } from '../lib/time';

const ROUTES = [
  '01-welcome', '02-name', '03-bedtime', '04-group-setup', '05-permission',
  '10-home-night', '11-alarm-set', '12-sleeping',
  '20-alarm', '21-morning-card',
  '30-group-empty', '31-group', '32-create', '33-join',
  '40-paywall', '41-freeze-ok', '42-freezes',
  '50-morning-fix', '51-streak-reset', '53-alarm-risk',
  '60-history', '70-settings', '71-leave',
];

/**
 * Developer mode — __DEV__ only, and the whole screen is dropped from release
 * bundles by the guard below (see npm run check:release).
 */
export default function DeveloperMode() {
  if (!__DEV__) return <Redirect href="/" />;

  const router = useRouter();
  const palette = palettes.night;
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const { logs } = useNights();
  const { current, longest, atRisk, minutesLeft } = useStreak();
  const { baselineMinutes, name } = useProfile();
  const { freezesLeft, addFreezes } = useFreezes();
  const { active, clear } = useActiveNight();

  const run = (fn: () => void) => () => {
    fn();
    refresh();
  };

  return (
    <Screen palette={palette}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <HeadingM palette={palette}>Developer mode</HeadingM>
          <TouchableOpacity onPress={() => router.back()}>
            <Caption palette={palette}>Close</Caption>
          </TouchableOpacity>
        </View>
        <Caption palette={palette} style={{ marginTop: 4 }}>
          Not shipped. Every control here writes to the same local store the app uses.
        </Caption>

        <Kicker palette={palette}>Clock</Kicker>
        <Body palette={palette} style={styles.value}>
          {dev.clockLabel()}
        </Body>
        <Row>
          <Chip label="-1 h" onPress={run(() => dev.shiftClock(-dev.devDurations.HOUR))} />
          <Chip label="+15 m" onPress={run(() => dev.shiftClock(15 * dev.devDurations.MINUTE))} />
          <Chip label="+1 h" onPress={run(() => dev.shiftClock(dev.devDurations.HOUR))} />
          <Chip label="+1 day" onPress={run(() => dev.shiftClock(dev.devDurations.DAY))} />
        </Row>
        <Row>
          <Chip label="Evening 23:40" onPress={run(() => dev.jumpToTimeOfDay(23, 40))} />
          <Chip label="Morning 06:15" onPress={run(() => dev.jumpToTimeOfDay(6, 15))} />
          <Chip label="Real time" onPress={run(dev.resetClock)} />
        </Row>

        <Kicker palette={palette}>Streak</Kicker>
        <Body palette={palette} style={styles.value}>
          {current} now · {longest} longest · baseline {formatMinutes(baselineMinutes)} ±
          {CONSISTENCY_TOLERANCE_MINUTES}m · {logs.length} nights logged
        </Body>
        <Body palette={palette} muted style={{ marginBottom: 8 }}>
          {atRisk ? `at risk, ${minutesLeft} minutes left` : 'not at risk'}
        </Body>
        <Row>
          <Chip label="Seed 5 nights" onPress={run(() => dev.seedStreak(5))} />
          <Chip label="Seed 13 nights" onPress={run(() => dev.seedStreak(13))} />
          <Chip label="Skip last night" onPress={run(dev.skipLastNight)} />
        </Row>
        <Row>
          <Chip
            label="Fake last night 23:42"
            onPress={run(() =>
              dev.writeFakeNight(shiftNight(nightKey(now()), -1), 23 * 60 + 42)
            )}
          />
          <Chip
            label="Fake last night 02:10"
            onPress={run(() => dev.writeFakeNight(shiftNight(nightKey(now()), -1), 2 * 60 + 10))}
          />
        </Row>

        <Kicker palette={palette}>Freezes</Kicker>
        <Body palette={palette} style={styles.value}>
          {freezesLeft} left
        </Body>
        <Row>
          <Chip label="+1 freeze" onPress={run(() => addFreezes(1))} />
          <Chip label="+5 freezes" onPress={run(() => addFreezes(5))} />
        </Row>

        <Kicker palette={palette}>State</Kicker>
        <Body palette={palette} style={styles.value}>
          {name ? `${name}, ` : 'no name, '}
          {active ? `night open since ${new Date(active.sleepAt).toLocaleTimeString()}` : 'no night open'}
        </Body>
        <Row>
          <Chip label="Close open night" onPress={run(clear)} />
          <Chip label="Clear nights" onPress={run(dev.clearNights)} />
          <Chip label="Wipe everything" onPress={run(dev.clearEverything)} />
        </Row>

        <Kicker palette={palette}>Go to a screen</Kicker>
        <View style={styles.routes}>
          {ROUTES.map((route) => (
            <Chip key={route} label={route} onPress={() => router.push(`/${route}` as never)} />
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress}>
      <Text style={styles.chipLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  value: {
    marginTop: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  routes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: palettes.night.border,
    backgroundColor: palettes.night.surface,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  chipLabel: {
    color: palettes.night.text,
    fontSize: 11.5,
  },
});
