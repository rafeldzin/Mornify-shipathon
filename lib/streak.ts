import { SleepLog } from './nights';
import { minuteDistance, minutesOfDay, nightKey, shiftNight, timestampForNight } from './time';

/**
 * The streak counts consistency, not duration (CLAUDE.md, rule 3). A night
 * counts when the reported bedtime lands within this many minutes of the user's
 * own baseline — sleeping at 01:00 every night keeps a streak just as well as
 * sleeping at 22:00 every night does.
 *
 * One constant, deliberately, so it can be tuned after testing with real users.
 */
export const CONSISTENCY_TOLERANCE_MINUTES = 60;

/** How close to the window closing the freeze offer is allowed to appear. */
export const PAYWALL_TRIGGER_MINUTES = 15;

/** Default baseline until onboarding sets one: 23:30. */
export const DEFAULT_BASELINE_MINUTES = 23 * 60 + 30;

export interface StreakResult {
  current: number;
  longest: number;
  /** Nights that counted, for the history list dots. */
  counted: Set<string>;
}

/** Does this night count toward consistency? */
export function nightCounts(log: SleepLog | undefined, baselineMinutes: number): boolean {
  if (!log) return false;
  if (log.frozen) return true;
  if (log.sleepAt === null) return false;
  return (
    minuteDistance(minutesOfDay(log.sleepAt), baselineMinutes) <= CONSISTENCY_TOLERANCE_MINUTES
  );
}

export function computeStreak(
  logs: SleepLog[],
  baselineMinutes: number,
  timestamp: number
): StreakResult {
  const byNight = new Map(logs.map((l) => [l.night, l]));
  const counted = new Set<string>();
  for (const log of logs) {
    if (nightCounts(log, baselineMinutes)) counted.add(log.night);
  }

  const tonight = nightKey(timestamp);
  const lastNight = shiftNight(tonight, -1);

  // Tonight may simply not have happened yet, so an unlogged tonight does not
  // break anything. A gap older than that does.
  let cursor = byNight.has(tonight) ? tonight : lastNight;
  let current = 0;
  while (counted.has(cursor)) {
    current += 1;
    cursor = shiftNight(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  const nights = [...counted].sort();
  let previous: string | null = null;
  for (const night of nights) {
    run = previous !== null && shiftNight(previous, 1) === night ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = night;
  }

  return { current, longest: Math.max(longest, current), counted };
}

/**
 * The freeze offer fires on risk and never on a timer (CLAUDE.md, rule 7):
 * a live streak, nothing logged tonight, and the tolerance window about to shut.
 */
export function streakRisk(
  logs: SleepLog[],
  baselineMinutes: number,
  timestamp: number,
  currentStreak: number
): { atRisk: boolean; minutesLeft: number; closesAt: number } {
  const tonight = nightKey(timestamp);
  const closesAt = timestampForNight(tonight, baselineMinutes + CONSISTENCY_TOLERANCE_MINUTES);
  const minutesLeft = Math.floor((closesAt - timestamp) / 60000);
  const loggedTonight = logs.some((l) => l.night === tonight && (l.sleepAt !== null || l.frozen));

  return {
    atRisk:
      currentStreak > 0 &&
      !loggedTonight &&
      minutesLeft > 0 &&
      minutesLeft <= PAYWALL_TRIGGER_MINUTES,
    minutesLeft,
    closesAt,
  };
}

/** Did the streak just break? Used to show 51-streak-reset once, the morning after. */
export function streakJustBroke(
  logs: SleepLog[],
  baselineMinutes: number,
  timestamp: number
): boolean {
  const lastNight = shiftNight(nightKey(timestamp), -1);
  const log = logs.find((l) => l.night === lastNight);
  if (!log) return logs.length > 0;
  return !nightCounts(log, baselineMinutes);
}
