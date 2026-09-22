import { storage, keys } from './storage';

/**
 * Every timestamp in the app comes from here, never from Date.now() directly.
 * In development the clock can be shifted (see lib/dev.ts) so the once-a-night
 * loop can be tested many times an hour. In release this is Date.now().
 */
export function now(): number {
  if (__DEV__) {
    return Date.now() + (storage.getNumber(keys.devClockOffset) ?? 0);
  }
  return Date.now();
}

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/**
 * A night is named after the evening it started. Anything logged before noon
 * belongs to the previous evening — sleeping at 00:17 on Tuesday is Monday night.
 */
export const NIGHT_ROLLOVER_HOUR = 12;

export function nightKey(timestamp: number): string {
  const d = new Date(timestamp);
  if (d.getHours() < NIGHT_ROLLOVER_HOUR) {
    d.setDate(d.getDate() - 1);
  }
  return dateKey(d);
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, NIGHT_ROLLOVER_HOUR, 0, 0, 0);
}

/** Shift a night key by whole nights. shiftNight(k, -1) is the night before. */
export function shiftNight(key: string, nights: number): string {
  const d = keyToDate(key);
  d.setDate(d.getDate() + nights);
  return dateKey(d);
}

export function nightsBetween(from: string, to: string): number {
  return Math.round((keyToDate(to).getTime() - keyToDate(from).getTime()) / DAY);
}

/** 23:42 — never a duration. Product rule #1. */
export function formatClock(timestamp: number | null | undefined): string {
  if (timestamp === null || timestamp === undefined) return '--:--';
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Ordering within a night. 23:05 comes before 00:17, which plain minutes-of-day
 * gets exactly backwards — this is what the group ranking sorts on.
 */
export function nightOrder(timestamp: number): number {
  const m = minutesOfDay(timestamp);
  return m < NIGHT_ROLLOVER_HOUR * 60 ? m + 1440 : m;
}

export function minutesOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  return d.getHours() * 60 + d.getMinutes();
}

export function formatMinutes(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
}

/** Smallest distance between two times of day, in minutes. 23:50 and 00:10 are 20 apart. */
export function minuteDistance(a: number, b: number): number {
  const d = Math.abs((((a - b) % 1440) + 1440) % 1440);
  return Math.min(d, 1440 - d);
}

/** Signed minutes: positive means later than the baseline. */
export function minuteDelta(actual: number, baseline: number): number {
  let d = (((actual - baseline) % 1440) + 1440) % 1440;
  if (d > 720) d -= 1440;
  return d;
}

/** The wall-clock timestamp of a time-of-day on a given night. */
export function timestampForNight(nightKeyValue: string, minutes: number): number {
  const d = keyToDate(nightKeyValue);
  d.setHours(0, 0, 0, 0);
  // Anything before noon belongs to the morning after the night started.
  const m = ((minutes % 1440) + 1440) % 1440;
  d.setMinutes(m < NIGHT_ROLLOVER_HOUR * 60 ? m + 1440 : m);
  return d.getTime();
}

export const weekday = (timestamp: number) =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date(timestamp).getDay()
  ];

export const monthName = (timestamp: number) =>
  [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][new Date(timestamp).getMonth()];

/** "Mon 15" — the history list format. */
export function shortDate(timestamp: number): string {
  const d = new Date(timestamp);
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  return `${wd} ${d.getDate()}`;
}
