import { storage, keys } from './storage';
import { nightKey, now } from './time';

/**
 * The local night log. This is the source of truth for the streak, the history
 * list and the morning card — Supabase only ever mirrors it (CLAUDE.md, rule 6).
 *
 * Mirrors the sleep_logs table: logged_at is kept apart from sleep_at, because a
 * night recalled the next morning is not the same as one logged live.
 */
export type LogSource = 'tap' | 'alarm' | 'morning_fix';

export interface SleepLog {
  /** The evening the night started, YYYY-MM-DD. One log per night. */
  night: string;
  sleepAt: number | null;
  wakeAt: number | null;
  /** null on a frozen night — nothing was reported, so nothing is claimed. */
  source: LogSource | null;
  /** Saved by a streak freeze rather than by sleeping on time. */
  frozen: boolean;
  /** When the entry was written, which is not when the night happened. */
  loggedAt: number;
  createdAt: number;
  syncedAt: number | null;
}

export function readLogs(): SleepLog[] {
  const raw = storage.getString(keys.logs);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SleepLog[];
    return Array.isArray(parsed) ? parsed.sort(byNightDesc) : [];
  } catch {
    return [];
  }
}

export function writeLogs(logs: SleepLog[]) {
  storage.set(keys.logs, JSON.stringify([...logs].sort(byNightDesc)));
}

const byNightDesc = (a: SleepLog, b: SleepLog) => (a.night < b.night ? 1 : a.night > b.night ? -1 : 0);

export function getLog(night: string): SleepLog | undefined {
  return readLogs().find((l) => l.night === night);
}

export function upsertLog(night: string, patch: Partial<SleepLog>): SleepLog {
  const logs = readLogs();
  const existing = logs.find((l) => l.night === night);
  const merged: SleepLog = {
    night,
    sleepAt: null,
    wakeAt: null,
    source: null,
    frozen: false,
    createdAt: now(),
    loggedAt: now(),
    syncedAt: null,
    ...existing,
    ...patch,
  };
  const next = logs.filter((l) => l.night !== night).concat(merged);
  writeLogs(next);
  return merged;
}

/**
 * Written the moment the alarm sheet opens, not when it is confirmed — if the
 * user abandons there, the night is still logged (docs/DESIGN.md, 11-alarm-set).
 */
export function startNight(sleepAt: number, source: LogSource = 'tap'): SleepLog {
  return upsertLog(nightKey(sleepAt), { sleepAt, source, loggedAt: now(), frozen: false });
}

export function recordWake(wakeAt: number, night?: string): SleepLog | undefined {
  const key = night ?? latestOpenNight();
  if (!key) return undefined;
  return upsertLog(key, { wakeAt, loggedAt: now() });
}

/** A night with a bedtime but no wake time yet. */
export function latestOpenNight(): string | undefined {
  return readLogs().find((l) => l.sleepAt !== null && l.wakeAt === null)?.night;
}

export function discardNight(night: string) {
  writeLogs(readLogs().filter((l) => l.night !== night));
}

export function freezeNight(night: string): SleepLog {
  return upsertLog(night, {
    frozen: true,
    source: null,
    sleepAt: null,
    wakeAt: null,
    loggedAt: now(),
  });
}

export function markSynced(night: string) {
  upsertLog(night, { syncedAt: now() });
}

/** Most recent night with both timestamps — what the morning card and home show. */
export function lastCompleteLog(): SleepLog | undefined {
  return readLogs().find((l) => l.sleepAt !== null && l.wakeAt !== null);
}

/** The one before that, for the "12 minutes later than yesterday" line. */
export function previousCompleteLog(): SleepLog | undefined {
  return readLogs().filter((l) => l.sleepAt !== null && l.wakeAt !== null)[1];
}
