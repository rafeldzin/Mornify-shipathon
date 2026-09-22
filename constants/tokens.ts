/**
 * Design tokens — docs/DESIGN.md.
 * Two palettes, selected by time of day. Never by user preference.
 */

export const palettes = {
  night: {
    bg: '#0B1120',
    surface: '#151E32',
    border: '#253150',
    text: '#E6E8EF',
    muted: '#8B94AD',
    accent: '#6C7BFF',
    /** 12-sleeping only — the darkest screen in the app */
    deep: '#070C16',
    flame: '#E4572E',
    onAccent: '#FFFFFF',
  },
  dawn: {
    bg: '#FFF8F0',
    surface: '#FFFFFF',
    border: '#F0E4D4',
    text: '#1A1614',
    muted: '#7A6E63',
    accent: '#F59332',
    deep: '#FFF8F0',
    flame: '#E4572E',
    onAccent: '#FFFFFF',
  },
} as const;

export type ThemeName = keyof typeof palettes;
export type Palette = (typeof palettes)[ThemeName];

/** Dawn palette runs from 05:00 to 17:59. Night the rest of the day. */
export const DAWN_START_HOUR = 5;
export const NIGHT_START_HOUR = 18;

/**
 * Type scale. Two text weights only (400, 600); numerals are 300.
 * All clock values render through <Clock/> so they stay tabular.
 */
export const type = {
  timeHero: { fontSize: 54, fontWeight: '300' as const, letterSpacing: -1.9 },
  timeLarge: { fontSize: 34, fontWeight: '300' as const, letterSpacing: -1 },
  timeInline: { fontSize: 19, fontWeight: '400' as const },
  headingL: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  headingM: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 12.5, fontWeight: '400' as const, lineHeight: 19 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 17 },
  kicker: {
    fontSize: 10.5,
    fontWeight: '400' as const,
    letterSpacing: 0.63,
    textTransform: 'uppercase' as const,
  },
};

export const layout = {
  screenPadH: 18,
  screenPadV: 14,
  buttonHeight: 46,
  buttonRadius: 23,
  cardRadius: 14,
  cardPadV: 13,
  cardPadH: 15,
  sheetRadius: 20,
  avatar: 26,
  tabBar: 52,
  scrim: 'rgba(11, 17, 32, 0.55)',
};
