import { palettes } from './tokens';

/**
 * Flat aliases kept for the group and freeze screens written before the token
 * set existed. New code should use useTheme() or palettes directly — this is a
 * view onto the same values, not a second source of truth.
 */
export const theme = {
  nightBg: palettes.night.bg,
  nightSurface: palettes.night.surface,
  nightBorder: palettes.night.border,
  nightText: palettes.night.text,
  nightMuted: palettes.night.muted,
  nightAccent: palettes.night.accent,
  sleepingBg: palettes.night.deep,
  dawnBg: palettes.dawn.bg,
  dawnSurface: palettes.dawn.surface,
  dawnBorder: palettes.dawn.border,
  dawnText: palettes.dawn.text,
  dawnMuted: palettes.dawn.muted,
  dawnAccent: palettes.dawn.accent,
  streakFlame: palettes.night.flame,
};
