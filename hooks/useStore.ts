import { MMKV } from 'react-native-mmkv';
import { useState } from 'react';

export const storage = new MMKV();

export function useSleepState() {
  const [sleepAt, setSleepAt] = useState<number | null>(() => {
    const val = storage.getNumber('sleep_at');
    return val !== undefined && !isNaN(val) ? val : null;
  });
  
  const [alarmTime, setAlarmTime] = useState<number | null>(() => {
    const val = storage.getNumber('alarm_time');
    return val !== undefined && !isNaN(val) ? val : null;
  });

  const [wakeAt, setWakeAt] = useState<number | null>(() => {
    const val = storage.getNumber('wake_at');
    return val !== undefined && !isNaN(val) ? val : null;
  });

  const [streak, setStreak] = useState<number>(() => {
    const val = storage.getNumber('streak');
    return val !== undefined && !isNaN(val) ? val : 0;
  });

  const [freezesLeft, setFreezesLeft] = useState<number>(() => {
    const val = storage.getNumber('freezes_left');
    return val !== undefined && !isNaN(val) ? val : 0;
  });

  const saveSleepAt = (timestamp: number) => {
    storage.set('sleep_at', timestamp);
    setSleepAt(timestamp);
  };

  const saveAlarmTime = (timestamp: number) => {
    storage.set('alarm_time', timestamp);
    setAlarmTime(timestamp);
  };

  const saveWakeAtAndIncrementStreak = (timestamp: number) => {
    storage.set('wake_at', timestamp);
    setWakeAt(timestamp);
    const newStreak = streak + 1;
    storage.set('streak', newStreak);
    setStreak(newStreak);
  };

  const addFreezes = (amount: number) => {
    const newAmount = freezesLeft + amount;
    storage.set('freezes_left', newAmount);
    setFreezesLeft(newAmount);
    return newAmount;
  };
  
  const useFreeze = () => {
    if (freezesLeft > 0) {
      const newAmount = freezesLeft - 1;
      storage.set('freezes_left', newAmount);
      setFreezesLeft(newAmount);
      return true;
    }
    return false;
  };

  const clearSleepState = () => {
    storage.delete('sleep_at');
    storage.delete('alarm_time');
    storage.delete('wake_at');
    setSleepAt(null);
    setAlarmTime(null);
    setWakeAt(null);
  };

  return { 
    sleepAt, 
    saveSleepAt, 
    alarmTime, 
    saveAlarmTime, 
    wakeAt, 
    streak, 
    freezesLeft,
    addFreezes,
    useFreeze,
    saveWakeAtAndIncrementStreak, 
    clearSleepState 
  };
}
