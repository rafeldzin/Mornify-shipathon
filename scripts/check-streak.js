// Sanity checks for the pure streak and time logic, run outside React Native.
//   npm run check:streak
// The night loop only happens once a day, so this is how the consistency rules
// get exercised without waiting for a night to pass.
const { execFileSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
execFileSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'),
   'lib/time.ts', 'lib/streak.ts', 'scripts/globals.d.ts',
   '--outDir', '.check', '--module', 'commonjs', '--target', 'es2019',
   '--esModuleInterop', '--skipLibCheck'],
  { cwd: root, stdio: 'inherit' }
);

const Module = require('module');
const origLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === 'react-native-mmkv') {
    return {
      MMKV: class {
        getNumber() { return undefined; }
        getString() { return undefined; }
        getBoolean() { return undefined; }
        set() {}
        delete() {}
      },
    };
  }
  return origLoad.call(this, request, ...args);
};
global.__DEV__ = false;

const time = require(path.join(root, '.check/time'));
const streak = require(path.join(root, '.check/streak'));

let failures = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : ` — got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`}`);
}

// ---- night keys -------------------------------------------------------------
const mondayEvening = new Date(2026, 8, 21, 23, 42).getTime(); // Mon 21 Sep 23:42
const tuesdayEarly = new Date(2026, 8, 22, 0, 17).getTime();   // Tue 22 Sep 00:17
const tuesdayMorning = new Date(2026, 8, 22, 6, 15).getTime();
check('23:42 Mon belongs to Monday night', time.nightKey(mondayEvening), '2026-09-21');
check('00:17 Tue belongs to Monday night', time.nightKey(tuesdayEarly), '2026-09-21');
check('06:15 Tue still Monday night', time.nightKey(tuesdayMorning), '2026-09-21');
check('13:00 Tue is Tuesday night', time.nightKey(new Date(2026, 8, 22, 13, 0).getTime()), '2026-09-22');
check('shiftNight back one', time.shiftNight('2026-09-01', -1), '2026-08-31');
check('shiftNight across month', time.shiftNight('2026-08-31', 1), '2026-09-01');

// ---- circular minute maths --------------------------------------------------
check('23:50 vs 00:10 is 20 minutes', time.minuteDistance(23 * 60 + 50, 10), 20);
check('23:42 vs 23:30 is 12 minutes', time.minuteDistance(23 * 60 + 42, 23 * 60 + 30), 12);
check('delta is signed late', time.minuteDelta(23 * 60 + 38, 23 * 60 + 30), 8);
check('delta is signed early', time.minuteDelta(23 * 60 + 20, 23 * 60 + 30), -10);
check('delta wraps past midnight', time.minuteDelta(15, 23 * 60 + 30), 45);

// window closes at baseline + tolerance, on the right calendar day
const closes = time.timestampForNight('2026-09-21', 23 * 60 + 30 + 60);
check('window closes 00:30 on the 22nd', new Date(closes).toISOString().slice(0, 16),
  new Date(2026, 8, 22, 0, 30).toISOString().slice(0, 16));

// ---- streak -----------------------------------------------------------------
const baseline = 23 * 60 + 30; // 23:30
const log = (night, hour, minute, extra = {}) => ({
  night,
  sleepAt: hour === null ? null : new Date(
    Number(night.slice(0, 4)),
    Number(night.slice(5, 7)) - 1,
    Number(night.slice(8, 10)) + (hour < 12 ? 1 : 0),
    hour,
    minute
  ).getTime(),
  wakeAt: null,
  source: 'tap',
  frozen: false,
  loggedAt: 0,
  createdAt: 0,
  syncedAt: null,
  ...extra,
});

const nowTs = new Date(2026, 8, 22, 9, 0).getTime(); // Tuesday morning, Monday night just ended

check('three consistent nights in a row', streak.computeStreak([
  log('2026-09-21', 23, 42),
  log('2026-09-20', 23, 12),
  log('2026-09-19', 0, 5),
], baseline, nowTs).current, 3);

check('a night outside tolerance stops the count', streak.computeStreak([
  log('2026-09-21', 23, 42),
  log('2026-09-20', 1, 40), // 2h10m after baseline
  log('2026-09-19', 23, 20),
], baseline, nowTs).current, 1);

check('a missing night stops the count', streak.computeStreak([
  log('2026-09-21', 23, 42),
  log('2026-09-19', 23, 20),
], baseline, nowTs).current, 1);

check('a frozen night keeps the run alive', streak.computeStreak([
  log('2026-09-21', 23, 42),
  log('2026-09-20', null, null, { frozen: true, source: null }),
  log('2026-09-19', 23, 20),
], baseline, nowTs).current, 3);

check('stale logs mean no current streak', streak.computeStreak([
  log('2026-09-17', 23, 42),
  log('2026-09-16', 23, 20),
], baseline, nowTs).current, 0);

check('longest survives a broken run', streak.computeStreak([
  log('2026-09-21', 23, 42),
  log('2026-09-19', 23, 20),
  log('2026-09-18', 23, 25),
  log('2026-09-17', 23, 35),
], baseline, nowTs).longest, 3);

// 01:00 every night is just as consistent as 23:00 every night (rule 3)
const lateBaseline = 60;
check('a 01:00 sleeper keeps a streak', streak.computeStreak([
  log('2026-09-21', 1, 5),
  log('2026-09-20', 0, 50),
  log('2026-09-19', 1, 10),
], lateBaseline, nowTs).current, 3);

// tonight unlogged at 21:00 does not break yesterday's run
const tonight9pm = new Date(2026, 8, 22, 21, 0).getTime();
check('unlogged tonight does not break the streak', streak.computeStreak([
  log('2026-09-21', 23, 42),
  log('2026-09-20', 23, 12),
], baseline, tonight9pm).current, 2);

// ---- risk -------------------------------------------------------------------
const logs = [log('2026-09-21', 23, 42), log('2026-09-20', 23, 12)];
const at0020 = new Date(2026, 8, 23, 0, 20).getTime(); // 10 min before window shuts
check('paywall fires inside the last 15 minutes',
  streak.streakRisk(logs, baseline, at0020, 2).atRisk, true);
check('minutes left is honest', streak.streakRisk(logs, baseline, at0020, 2).minutesLeft, 10);

const at2200 = new Date(2026, 8, 22, 22, 0).getTime();
check('paywall does not fire early in the evening',
  streak.streakRisk(logs, baseline, at2200, 2).atRisk, false);

check('paywall does not fire without a streak',
  streak.streakRisk(logs, baseline, at0020, 0).atRisk, false);

const loggedTonight = [log('2026-09-22', 23, 30), ...logs];
check('paywall does not fire once tonight is logged',
  streak.streakRisk(loggedTonight, baseline, at0020, 2).atRisk, false);

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
