import { storage, keys } from './storage';
import { readLogs } from './nights';
import { computeStreak, DEFAULT_BASELINE_MINUTES } from './streak';
import { MINUTE, nightKey, now, shiftNight } from './time';
import { MISSED_ALARM_GRACE_MINUTES, markAlarmMissed } from './alarm';
import type { ActiveNight } from '../hooks/useStore';

export type Landing =
  | '/01-welcome'
  | '/12-sleeping'
  | '/20-alarm'
  | '/50-morning-fix'
  | '/51-streak-reset'
  | '/10-home-night';

function activeNight(): ActiveNight | null {
  const raw = storage.getString(keys.activeNight);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveNight;
  } catch {
    return null;
  }
}

/**
 * Runs on every cold open, before anything is rendered. It closes out nights
 * the app slept through and notices alarms that never fired — the night's
 * bedtime is already logged, so a missed alarm costs the user nothing but the
 * wake time.
 */
export function runHousekeeping() {
  const active = activeNight();
  if (!active || active.alarmAt === null) return;

  const overdueBy = now() - active.alarmAt;
  if (overdueBy > MISSED_ALARM_GRACE_MINUTES * MINUTE) {
    markAlarmMissed(active.alarmAt);
    storage.delete(keys.activeNight);
  }
}

/** Where a cold open should land. The route map in docs/DESIGN.md, in order. */
export function decideLanding(): Landing {
  if (!(storage.getBoolean(keys.onboarded) ?? false)) return '/01-welcome';

  const active = activeNight();
  if (active) {
    const ringing =
      active.alarmAt !== null &&
      now() >= active.alarmAt &&
      now() - active.alarmAt <= MISSED_ALARM_GRACE_MINUTES * MINUTE;
    return ringing ? '/20-alarm' : '/12-sleeping';
  }

  const logs = readLogs();
  const lastNight = shiftNight(nightKey(now()), -1);
  const baseline = storage.getNumber(keys.baselineBedtime) ?? DEFAULT_BASELINE_MINUTES;

  // Somebody forgot to tap. This screen is what keeps the dataset alive, so it
  // comes before anything else — but only once a day, and never on day one.
  const missingLastNight = logs.length > 0 && !logs.some((l) => l.night === lastNight);
  if (missingLastNight && storage.getString(keys.morningFixSeenFor) !== lastNight) {
    return '/50-morning-fix';
  }

  // A run that ended is acknowledged once, gently, and never again.
  const { current } = computeStreak(logs, baseline, now());
  const hadARun = (storage.getNumber(keys.longestStreak) ?? 0) > 1;
  if (
    current === 0 &&
    hadARun &&
    logs.length > 0 &&
    storage.getString(keys.resetSeenFor) !== lastNight
  ) {
    return '/51-streak-reset';
  }

  return '/10-home-night';
}

export function markMorningFixSeen() {
  storage.set(keys.morningFixSeenFor, shiftNight(nightKey(now()), -1));
}

export function markStreakResetSeen() {
  storage.set(keys.resetSeenFor, shiftNight(nightKey(now()), -1));
}
