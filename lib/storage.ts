import { MMKV } from 'react-native-mmkv';

/** Local storage is the source of truth. Supabase only mirrors it. */
export const storage = new MMKV();

export const keys = {
  /** Profile */
  name: 'profile_name',
  /** Usual bedtime, minutes from midnight (23:30 -> 1410) */
  baselineBedtime: 'profile_baseline_bedtime',
  nudgeEnabled: 'profile_nudge_enabled',
  onboarded: 'profile_onboarded',
  /** Core loop */
  logs: 'sleep_logs',
  activeNight: 'active_night',
  freezesLeft: 'freezes_left',
  longestStreak: 'longest_streak',
  /** Alarm health */
  alarmMissedAt: 'alarm_missed_at',
  reminderMode: 'alarm_reminder_mode',
  /** One-shot flags, cleared per night */
  paywallShownFor: 'paywall_shown_for',
  resetSeenFor: 'streak_reset_seen_for',
  morningFixSeenFor: 'morning_fix_seen_for',
  /** Group (written by hooks/useGroup) */
  syncQueue: 'sync_queue',
  /** Developer mode — __DEV__ only */
  devClockOffset: 'dev_clock_offset_ms',
} as const;
