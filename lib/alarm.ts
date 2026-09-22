import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { storage, keys } from './storage';
import { now, timestampForNight, nightKey } from './time';

/**
 * expo-notifications schedules notifications, not true alarms. On Android this
 * needs an importance-MAX channel, POST_NOTIFICATIONS, exact-alarm permission
 * and, on Xiaomi/Oppo/Vivo, Autostart. When that is not enough we do not fight
 * the OEM: the app downgrades to a reminder and says so (53-alarm-risk).
 */
export const ALARM_CHANNEL_ID = 'alarm';
export const NUDGE_CHANNEL_ID = 'bedtime-nudge';

/** How long after the alarm time we decide it never fired. */
export const MISSED_ALARM_GRACE_MINUTES = 45;

/** The bedtime nudge lands this long before the usual bedtime. */
export const NUDGE_LEAD_MINUTES = 15;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Alarm',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 400, 250, 400],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    enableVibrate: true,
  });
  await Notifications.setNotificationChannelAsync(NUDGE_CHANNEL_ID, {
    name: 'Bedtime nudge',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

export async function hasPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function requestPermission(): Promise<boolean> {
  await ensureChannels();
  const settings = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return settings.granted;
}

export interface ScheduledAlarm {
  id: string | null;
  at: number;
}

/**
 * The wake-up alarm. `reminderOnly` is the honest downgrade: same schedule,
 * quieter channel, and the copy elsewhere stops calling it an alarm.
 */
export async function scheduleAlarm(at: number, reminderOnly = false): Promise<ScheduledAlarm> {
  await ensureChannels();
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminderOnly ? 'Time to get up' : 'Good morning',
        body: "Tap I'm up to log your night.",
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { screen: '20-alarm' },
      },
      trigger: {
        date: new Date(at),
        channelId: reminderOnly ? NUDGE_CHANNEL_ID : ALARM_CHANNEL_ID,
      },
    });
    return { id, at };
  } catch {
    // A failed schedule must not lose the night — the log is already written.
    return { id: null, at };
  }
}

/** One nudge, NUDGE_LEAD_MINUTES before the usual bedtime, repeating daily. */
export async function scheduleBedtimeNudge(baselineMinutes: number): Promise<string | null> {
  await ensureChannels();
  await cancelNudge();
  const minutes = ((baselineMinutes - NUDGE_LEAD_MINUTES) % 1440 + 1440) % 1440;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your usual bedtime is close',
        body: 'Tap going to sleep when you are ready.',
        data: { screen: '10-home-night' },
      },
      trigger: {
        hour: Math.floor(minutes / 60),
        minute: minutes % 60,
        repeats: true,
        channelId: NUDGE_CHANNEL_ID,
      },
    });
    storage.set('nudge_notification_id', id);
    return id;
  } catch {
    return null;
  }
}

export async function cancelNudge() {
  const id = storage.getString('nudge_notification_id');
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    /* already gone */
  }
  storage.delete('nudge_notification_id');
}

export async function cancelAlarm(id: string | null | undefined) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    /* already fired or cancelled */
  }
}

/** Reminder mode: the user chose the honest downgrade on 53-alarm-risk. */
export function isReminderMode(): boolean {
  return storage.getBoolean(keys.reminderMode) ?? false;
}

export function setReminderMode(value: boolean) {
  storage.set(keys.reminderMode, value);
}

export function alarmMissedAt(): number | null {
  return storage.getNumber(keys.alarmMissedAt) ?? null;
}

export function markAlarmMissed(at: number) {
  storage.set(keys.alarmMissedAt, at);
}

export function clearAlarmMissed() {
  storage.delete(keys.alarmMissedAt);
}

/**
 * Show 53-alarm-risk after a detected miss, on the evening after it happened —
 * not to everyone, and not in the morning when nothing can be done about it.
 */
export function shouldWarnAboutAlarm(): boolean {
  const missed = alarmMissedAt();
  if (missed === null || isReminderMode()) return false;
  return nightKey(now()) >= nightKey(missed);
}

/** The timestamp an alarm set for `minutes` should fire, for a night in progress. */
export function alarmTimestampFor(night: string, minutes: number): number {
  return timestampForNight(night, minutes);
}
