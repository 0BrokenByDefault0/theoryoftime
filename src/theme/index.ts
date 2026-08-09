/**
 * The design system.
 *
 * The look is "deep space observatory": a near-black indigo ground, luminous
 * gradient accents, and glass surfaces that let the background bleed through.
 * Musical information is dense, so colour does real work here — every stage of
 * the curriculum owns a hue, and that hue follows the learner through cards,
 * progress rings, keyboard highlights and lesson headers.
 */

import { Platform, TextStyle } from 'react-native';

export const palette = {
  // Ground
  void: '#05060D',
  abyss: '#0A0C18',
  deep: '#101427',
  slate: '#181D33',
  steel: '#232942',
  smoke: '#333B57',

  // Text
  white: '#FFFFFF',
  bright: '#F2F4FF',
  muted: '#A6ADCB',
  dim: '#6E769A',
  faint: '#454C6B',

  // Accents
  violet: '#8B5CF6',
  indigo: '#6366F1',
  fuchsia: '#D946EF',
  pink: '#EC4899',
  rose: '#FB7185',
  amber: '#F59E0B',
  gold: '#FCD34D',
  lime: '#A3E635',
  emerald: '#10B981',
  teal: '#14B8A6',
  cyan: '#22D3EE',
  sky: '#38BDF8',
  blue: '#3B82F6',
  coral: '#FF7A59',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#F43F5E',
} as const;

export const colors = {
  background: palette.void,
  backgroundElevated: palette.abyss,
  surface: 'rgba(255,255,255,0.045)',
  surfaceStrong: 'rgba(255,255,255,0.08)',
  surfacePressed: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: palette.bright,
  textMuted: palette.muted,
  textDim: palette.dim,
  textFaint: palette.faint,
  accent: palette.violet,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
} as const;

export type Gradient = readonly [string, string, ...string[]];

export const gradients = {
  aurora: ['#6366F1', '#8B5CF6', '#D946EF'] as Gradient,
  dusk: ['#4338CA', '#7C3AED', '#DB2777'] as Gradient,
  ember: ['#F59E0B', '#FB7185', '#D946EF'] as Gradient,
  ocean: ['#0EA5E9', '#3B82F6', '#6366F1'] as Gradient,
  mint: ['#10B981', '#14B8A6', '#22D3EE'] as Gradient,
  sunrise: ['#FCD34D', '#FB923C', '#F43F5E'] as Gradient,
  violet: ['#7C3AED', '#A855F7'] as Gradient,
  midnight: ['#0F172A', '#1E1B4B', '#312E81'] as Gradient,
  ghost: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'] as Gradient,
  fade: ['rgba(5,6,13,0)', 'rgba(5,6,13,0.92)'] as Gradient,
  gold: ['#FCD34D', '#F59E0B'] as Gradient,
} as const;

export type GradientName = keyof typeof gradients;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

/**
 * Typography. iOS gets SF Pro's rounded variant for headings, which reads as
 * friendly without being childish — the right register for a learning app.
 */
const displayFamily = Platform.select({
  ios: 'SF Pro Rounded',
  default: 'sans-serif-medium',
});

const monoFamily = Platform.select({
  ios: 'Menlo',
  default: 'monospace',
});

export const type = {
  hero: {
    fontFamily: displayFamily,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.1,
    color: colors.text,
  } as TextStyle,
  title: {
    fontFamily: displayFamily,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: colors.text,
  } as TextStyle,
  heading: {
    fontFamily: displayFamily,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.text,
  } as TextStyle,
  subheading: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: colors.text,
  } as TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '400',
    color: colors.textMuted,
  } as TextStyle,
  bodyStrong: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600',
    color: colors.text,
  } as TextStyle,
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textMuted,
  } as TextStyle,
  caption: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.textDim,
  } as TextStyle,
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textDim,
  } as TextStyle,
  mono: {
    fontFamily: monoFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  } as TextStyle,
  numeral: {
    fontFamily: displayFamily,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.text,
  } as TextStyle,
} as const;

/** Soft coloured glow used under primary actions and active cards. */
export function glow(color: string, intensity = 0.5) {
  return {
    shadowColor: color,
    shadowOpacity: intensity,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  };
}

export const shadow = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hard: {
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
} as const;

/** Motion constants. Everything animates on the same two curves. */
export const motion = {
  quick: 160,
  base: 260,
  slow: 420,
  spring: { damping: 18, stiffness: 180, mass: 0.9 },
  bouncy: { damping: 12, stiffness: 220, mass: 0.8 },
} as const;

/** Difficulty tiers, used across the curriculum, drills, and the library. */
export type Tier = 'foundation' | 'developing' | 'proficient' | 'advanced' | 'expert';

export const TIERS: Record<Tier, { label: string; color: string; gradient: Gradient; short: string }> = {
  foundation: { label: 'Foundation', short: 'I', color: palette.emerald, gradient: gradients.mint },
  developing: { label: 'Developing', short: 'II', color: palette.cyan, gradient: gradients.ocean },
  proficient: { label: 'Proficient', short: 'III', color: palette.violet, gradient: gradients.aurora },
  advanced: { label: 'Advanced', short: 'IV', color: palette.fuchsia, gradient: gradients.dusk },
  expert: { label: 'Expert', short: 'V', color: palette.amber, gradient: gradients.sunrise },
};

export const TIER_ORDER: Tier[] = ['foundation', 'developing', 'proficient', 'advanced', 'expert'];

/** Consistent colour for a chord's tension level, 0–10. */
export function tensionColor(tension: number): string {
  const stops = [palette.emerald, palette.teal, palette.cyan, palette.violet, palette.fuchsia, palette.rose];
  const index = Math.min(stops.length - 1, Math.floor((tension / 10) * stops.length));
  return stops[index];
}

/** Scale-degree colour, so a degree keeps its identity everywhere in the app. */
export const DEGREE_COLORS = [
  palette.gold, // 1 — tonic
  palette.sky, // 2
  palette.emerald, // 3
  palette.teal, // 4
  palette.coral, // 5 — dominant
  palette.violet, // 6
  palette.fuchsia, // 7
] as const;

export function degreeColor(degree: number): string {
  return DEGREE_COLORS[(degree - 1) % 7];
}

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };
