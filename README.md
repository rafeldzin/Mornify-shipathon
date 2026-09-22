# Mornify

**Sleep consistency, but with your people watching.**

Mornify does not measure sleep. There is no accelerometer, no microphone, no
sonar, no Health Connect. You tap *going to sleep*, you tap *I'm up*, and the app
records two self-reported timestamps. That is the entire data model, and it is
the point: the app can only ever show you things it actually knows.

What it sells is the **morning** — one card, shown when the alarm is dismissed,
putting last night's bedtime next to a small group of classmates or housemates.

Built for RevenueCat Shipaton 2026 by four students in Bandung.

<!-- Screenshots: store assets are in progress. -->

---

## The loop

```
evening                          morning
tap "going to sleep"      →      alarm rings
set a wake time                  tap "I'm up"
                                 ↓
                                 morning card
                                 23:42 → 06:15
                                 2nd of 8 in TPB 3A
                                 13 nights consistent
```

Two taps a day. Everything else in the app exists to make those two taps land.

## Rules the code enforces

These are not style preferences — each one is load-bearing, and the code is
built so that breaking one is visible in review.

1. **No sleep duration is ever displayed.** `23:42 → 06:15`, never "6h 33m". We
   know when two buttons were pressed. We do not know how long anyone slept, and
   the UI never claims otherwise. All clock rendering goes through one
   `formatClock` helper; there is no duration formatter in the codebase.
2. **Zero medical language.** No sleep score, no quality rating, no advice. This
   keeps us out of health-app review and away from orthosomnia — users made
   anxious by chasing a number.
3. **The streak counts consistency, not duration.** Sleeping at 01:00 every night
   keeps a streak exactly as well as sleeping at 22:00 does. See below.
4. **No charts.** History is a list. A line graph implies measurement we do not do.
5. **The app works alone.** A group improves it and is never required; the group
   step in onboarding is skippable and the skip is deliberately visible.
6. **Local-first.** The streak is computed on device and never blocks on the
   network. If Supabase is down, only the group panel degrades.
7. **The paywall fires on risk, never on a timer.** The freeze offer appears when
   a streak is genuinely minutes from breaking — not at install, not on a schedule.
8. **No judgement in the copy.** "8 minutes late" is neutral information, never
   red. A group member with no entry shows greyed as "no log", never shamed.

## How the streak works

A night counts when the reported bedtime lands within
`CONSISTENCY_TOLERANCE_MINUTES` of the user's own baseline, which is set during
onboarding and editable in settings. One constant, in
[`lib/streak.ts`](lib/streak.ts), deliberately tunable after real testing.

A night is named after the evening it started, so 00:17 on Tuesday belongs to
Monday night ([`lib/time.ts`](lib/time.ts)). Bedtimes compare on a circular
clock, so 23:50 and 00:10 are twenty minutes apart, not twenty-three hours.

A missed alarm costs the wake time and nothing else: the bedtime was written
when the alarm sheet opened, and consistency is computed from bedtime alone.

```
npm run check:streak
```

runs 25 checks over night keys, midnight wraparound, frozen nights, broken runs
and paywall timing — without waiting for a night to pass.

## Running it

Requires an EAS **development build**, not Expo Go: the app uses MMKV,
notifications with a custom channel, and RevenueCat, none of which run in Expo Go.

```bash
npm install
npx expo run:android      # or: eas build --profile development --platform android
npm start
```

Supabase and RevenueCat read their keys from the environment and fall back to
placeholders, so the core loop runs with no backend at all:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RC_ANDROID_KEY=
```

### Developer mode

The loop happens once a night, which would mean one test a day. Instead, in any
`__DEV__` build, a dashed badge in the corner opens developer mode:

- shift the clock by minutes, hours or days, or jump to 23:40 or 06:15
- write a fake night at any date, seed 5 or 13 consistent nights
- skip last night, so the morning-fix screen has something to fix
- jump directly to any screen

All of it is behind `__DEV__` and dropped from production bundles.
`npm run check:release` exports a real production bundle and greps it for
developer-mode strings rather than taking that on trust.

## Layout

```
app/            one file per screen, named by design ID
components/     ui primitives, icon placeholders, tab bar, time stepper
constants/      palettes, type scale, layout tokens
hooks/          store, theme, group, purchases
lib/            time, night log, streak, alarm, sync, housekeeping, dev
scripts/        streak and release checks
```

`10-home-night` and `23-home-dawn` are one route: the palette follows the time
of day, which is the concept rather than two screens to maintain. `52-offline`
and `61-history-empty` are likewise states of the screens they belong to, and
their route files redirect so every design ID stays reachable.

Icons are labelled dashed placeholders on purpose. The team is producing its own
set — no icon library is installed, and none should be.

## The alarm, honestly

`expo-notifications` schedules notifications, not true alarms. Mornify declares
`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `WAKE_LOCK` and
`USE_FULL_SCREEN_INTENT`, uses an importance-MAX channel that bypasses Do Not
Disturb, and shows over the lock screen. On Xiaomi, Oppo and Vivo this still may
not be enough, and the app warns about Autostart during onboarding rather than
after a failure.

When an alarm is detected as missed, the app offers the honest downgrade:
`53-alarm-risk` gives the exact settings path, or the user switches to reminder
mode and the app stops calling it an alarm. We do not fight manufacturer battery
managers.

## Deliberately not built

Sleep stage graphs (we have no sensors), a global leaderboard (moderation and
anti-cheat we cannot own), a feed or comments (a reporting surface with nobody to
staff it), profile screens (anonymous auth, nothing to show), and a dark/light
toggle (the theme follows the time of day — that is the concept).

## Licence

MIT — see [LICENSE](LICENSE).

## Team

| | |
|---|---|
| Nathan | Core loop, alarm, streak, local storage, repo |
| Rafel | Supabase, groups, RevenueCat, Play Console |
| Bryan | Design, icon assets, store assets, demo video |
| Nuha | Campus testers, QA, feedback, Devpost writeup |
