import { useEffect, useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from './Icon';
import { Clock } from './ui';
import { formatMinutes } from '../lib/time';
import type { Palette } from '../constants/tokens';

export const STEP_MINUTES = 15;

const HOLD_DELAY = 400;
const HOLD_INTERVAL = 110;

/**
 * Minus / time / plus in 15-minute steps, long-press to repeat. Used by
 * 03-bedtime and 11-alarm-set — the same control, so it behaves the same at
 * 23:40 as it does half asleep.
 */
export function TimeStepper({
  minutes,
  onChange,
  palette,
}: {
  minutes: number;
  onChange: (next: number) => void;
  palette: Palette;
}) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const value = useRef(minutes);
  value.current = minutes;

  const stop = () => {
    if (delay.current) clearTimeout(delay.current);
    if (timer.current) clearInterval(timer.current);
    delay.current = null;
    timer.current = null;
  };

  useEffect(() => stop, []);

  const step = (direction: 1 | -1) => {
    const next = (((value.current + direction * STEP_MINUTES) % 1440) + 1440) % 1440;
    value.current = next;
    onChange(next);
  };

  const holdStart = (direction: 1 | -1) => {
    stop();
    delay.current = setTimeout(() => {
      timer.current = setInterval(() => step(direction), HOLD_INTERVAL);
    }, HOLD_DELAY);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <TouchableOpacity
        accessibilityLabel="Earlier"
        onPress={() => step(-1)}
        onPressIn={() => holdStart(-1)}
        onPressOut={stop}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Icon name="minus" size={20} color={palette.text} />
      </TouchableOpacity>

      <Clock value={formatMinutes(minutes)} palette={palette} size="hero" />

      <TouchableOpacity
        accessibilityLabel="Later"
        onPress={() => step(1)}
        onPressIn={() => holdStart(1)}
        onPressOut={stop}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Icon name="plus" size={20} color={palette.text} />
      </TouchableOpacity>
    </View>
  );
}
