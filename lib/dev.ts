import { storage, keys } from './storage';
import { SleepLog, readLogs, writeLogs, upsertLog } from './nights';
import { DAY, MINUTE, dateKey, nightKey, now, shiftNight, timestampForNight } from './time';
import { DEFAULT_BASELINE_MINUTES } from './streak';

/**
 * Developer mode. The core loop happens once a night, which is the single
 * biggest drag on iteration speed — this is how it gets tested many times an
 * hour instead.
 *
 * Every function here is a no-op unless __DEV__, and the developer screen and
 * badge render nothing in release, so Metro drops this code from the production
 * bundle. Verified by `npm run check:release`.
 */
export const DEV_MODE = __DEV__;

function guard(): boolean {
  return __DEV__;
}

/** How far the app's clock is shifted from the real one. */
export function clockOffset(): number {
  if (!guard()) return 0;
  return storage.getNumber(keys.devClockOffset) ?? 0;
}

export function shiftClock(milliseconds: number) {
  if (!guard()) return;
  storage.set(keys.devClockOffset, clockOffset() + milliseconds);
}

/** Jump to a time of day today, keeping the fake date. */
export function jumpToTimeOfDay(hour: number, minute: number) {
  if (!guard()) return;
  const target = new Date(now());
  target.setHours(hour, minute, 0, 0);
  storage.set(keys.devClockOffset, clockOffset() + (target.getTime() - now()));
}

export function setClockTo(timestamp: number) {
  if (!guard()) return;
  storage.set(keys.devClockOffset, timestamp - Date.now());
}

export function resetClock() {
  if (!guard()) return;
  storage.delete(keys.devClockOffset);
}

/** Write a night at an arbitrary date, as if it had been tapped live. */
export function writeFakeNight(
  night: string,
  bedtimeMinutes: number,
  wakeMinutes = 6 * 60 + 15
): SleepLog | undefined {
  if (!guard()) return undefined;
  return upsertLog(night, {
    sleepAt: timestampForNight(night, bedtimeMinutes),
    wakeAt: timestampForNight(night, wakeMinutes),
    source: 'tap',
    frozen: false,
    loggedAt: timestampForNight(night, bedtimeMinutes),
  });
}

/**
 * Fast-forward the streak: writes `count` consecutive nights ending last night,
 * each within tolerance of the baseline, with a few minutes of jitter so the
 * history list and the "later than yesterday" line have something to say.
 */
export function seedStreak(count: number, baselineMinutes?: number) {
  if (!guard()) return;
  const baseline = baselineMinutes ?? storage.getNumber(keys.baselineBedtime) ?? DEFAULT_BASELINE_MINUTES;
  let night = shiftNight(nightKey(now()), -1);
  for (let i = 0; i < count; i += 1) {
    const jitter = [12, -7, 3, 21, -14, 8, -3][i % 7];
    writeFakeNight(night, baseline + jitter, 6 * 60 + 15 + jitter);
    night = shiftNight(night, -1);
  }
}

/** Leave last night empty so 50-morning-fix has something to fix. */
export function skipLastNight() {
  if (!guard()) return;
  const lastNight = shiftNight(nightKey(now()), -1);
  writeLogs(readLogs().filter((l) => l.night !== lastNight));
}

export function clearNights() {
  if (!guard()) return;
  storage.delete(keys.logs);
  storage.delete(keys.activeNight);
  storage.delete(keys.longestStreak);
  storage.delete(keys.paywallShownFor);
  storage.delete(keys.resetSeenFor);
}

export function clearEverything() {
  if (!guard()) return;
  storage.clearAll();
}

/** A readable label for the badge: "Tue 22 Sep · 23:42 (+2h)". */
export function clockLabel(): string {
  const t = now();
  const d = new Date(t);
  const offset = clockOffset();
  const hours = offset / (60 * MINUTE);
  const shown =
    offset === 0
      ? ''
      : ` (${hours > 0 ? '+' : ''}${Math.abs(hours) >= 1 ? `${hours.toFixed(1)}h` : `${Math.round(offset / MINUTE)}m`})`;
  return `${dateKey(d)} ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}${shown}`;
}

export const devDurations = { MINUTE, HOUR: 60 * MINUTE, DAY };
