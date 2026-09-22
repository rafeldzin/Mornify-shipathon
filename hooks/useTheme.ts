import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  palettes,
  DAWN_START_HOUR,
  NIGHT_START_HOUR,
  type Palette,
  type ThemeName,
} from '../constants/tokens';
import { now, MINUTE } from '../lib/time';

export function themeForTime(timestamp: number): ThemeName {
  const hour = new Date(timestamp).getHours();
  return hour >= DAWN_START_HOUR && hour < NIGHT_START_HOUR ? 'dawn' : 'night';
}

/**
 * The palette follows the time of day, not a user setting. 10-home-night and
 * 23-home-dawn are the same screen — this hook is what makes them different.
 */
export function useTheme(force?: ThemeName): { name: ThemeName; palette: Palette } {
  const [name, setName] = useState<ThemeName>(() => force ?? themeForTime(now()));

  useEffect(() => {
    if (force) {
      setName(force);
      return;
    }
    const tick = () => setName(themeForTime(now()));
    tick();
    const timer = setInterval(tick, MINUTE);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [force]);

  return { name, palette: palettes[name] };
}
