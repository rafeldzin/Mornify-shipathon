import { useCallback, useEffect, useMemo } from 'react';
import {
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVObject,
  useMMKVString,
} from 'react-native-mmkv';
import { storage, keys } from '../lib/storage';
import {
  SleepLog,
  LogSource,
  readLogs,
  startNight,
  recordWake,
  discardNight,
  freezeNight,
  upsertLog,
} from '../lib/nights';
import {
  DEFAULT_BASELINE_MINUTES,
  computeStreak,
  streakRisk,
} from '../lib/streak';
import { nightKey, now } from '../lib/time';

export { storage } from '../lib/storage';

export interface ActiveNight {
  night: string;
  sleepAt: number;
  alarmAt: number | null;
  notificationId: string | null;
  /** The alarm was downgraded to a plain reminder for this night. */
  reminderOnly?: boolean;
}

export function useProfile() {
  const [name, setName] = useMMKVString(keys.name, storage);
  const [baseline, setBaseline] = useMMKVNumber(keys.baselineBedtime, storage);
  const [nudge, setNudge] = useMMKVBoolean(keys.nudgeEnabled, storage);
  const [onboarded, setOnboarded] = useMMKVBoolean(keys.onboarded, storage);

  return {
    name: name ?? '',
    /** Usual bedtime in minutes from midnight. Seeds the consistency baseline. */
    baselineMinutes: baseline ?? DEFAULT_BASELINE_MINUTES,
    nudgeEnabled: nudge ?? true,
    onboarded: onboarded ?? false,
    setName,
    setBaselineMinutes: setBaseline,
    setNudgeEnabled: setNudge,
    completeOnboarding: () => setOnboarded(true),
  };
}

/** The night log, re-read whenever anything writes to it. */
export function useNights() {
  const [raw] = useMMKVString(keys.logs, storage);
  const logs = useMemo<SleepLog[]>(() => readLogs(), [raw]);

  const begin = useCallback(
    (sleepAt: number, source: LogSource = 'tap') => startNight(sleepAt, source),
    []
  );
  const wake = useCallback((wakeAt: number, night?: string) => recordWake(wakeAt, night), []);
  const discard = useCallback((night: string) => discardNight(night), []);
  const freeze = useCallback((night: string) => freezeNight(night), []);
  const patch = useCallback(
    (night: string, values: Partial<SleepLog>) => upsertLog(night, values),
    []
  );

  return { logs, begin, wake, discard, freeze, patch };
}

export function useActiveNight() {
  const [active, setActive] = useMMKVObject<ActiveNight>(keys.activeNight, storage);

  const open = useCallback(
    (sleepAt: number) => {
      setActive({ night: nightKey(sleepAt), sleepAt, alarmAt: null, notificationId: null });
    },
    [setActive]
  );

  const setAlarm = useCallback(
    (alarmAt: number | null, notificationId: string | null, reminderOnly = false) => {
      setActive((current) =>
        current ? { ...current, alarmAt, notificationId, reminderOnly } : current
      );
    },
    [setActive]
  );

  const clear = useCallback(() => setActive(undefined), [setActive]);

  return { active: active ?? null, open, setAlarm, clear };
}

export function useFreezes() {
  const [freezes, setFreezes] = useMMKVNumber(keys.freezesLeft, storage);
  const freezesLeft = freezes ?? 0;

  const addFreezes = useCallback(
    (amount: number) => {
      const next = (storage.getNumber(keys.freezesLeft) ?? 0) + amount;
      setFreezes(next);
      return next;
    },
    [setFreezes]
  );

  /** Spends one freeze on the given night. Returns false when there is none. */
  const spendFreeze = useCallback(
    (night: string) => {
      const left = storage.getNumber(keys.freezesLeft) ?? 0;
      if (left <= 0) return false;
      setFreezes(left - 1);
      freezeNight(night);
      return true;
    },
    [setFreezes]
  );

  return { freezesLeft, addFreezes, spendFreeze };
}

export function useStreak() {
  const { logs } = useNights();
  const { baselineMinutes } = useProfile();
  const [storedLongest, setStoredLongest] = useMMKVNumber(keys.longestStreak, storage);

  const result = useMemo(
    () => computeStreak(logs, baselineMinutes, now()),
    [logs, baselineMinutes]
  );

  const longest = Math.max(result.longest, storedLongest ?? 0);

  useEffect(() => {
    if (longest > (storedLongest ?? 0)) setStoredLongest(longest);
  }, [longest, storedLongest, setStoredLongest]);

  const risk = useMemo(
    () => streakRisk(logs, baselineMinutes, now(), result.current),
    [logs, baselineMinutes, result.current]
  );

  return {
    current: result.current,
    longest,
    counted: result.counted,
    ...risk,
  };
}

/**
 * Compatibility surface for the group and paywall screens. New screens should
 * take useStreak / useNights / useFreezes directly.
 */
export function useSleepState() {
  const { logs } = useNights();
  const { current } = useStreak();
  const { freezesLeft, addFreezes, spendFreeze } = useFreezes();
  const { active } = useActiveNight();

  const latest = logs.find((l) => l.sleepAt !== null);

  return {
    streak: current,
    freezesLeft,
    addFreezes,
    spendFreeze,
    sleepAt: active?.sleepAt ?? latest?.sleepAt ?? null,
    wakeAt: latest?.wakeAt ?? null,
    alarmTime: active?.alarmAt ?? null,
  };
}
