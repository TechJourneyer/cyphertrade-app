/**
 * Design tokens — single source of truth for the CypherTrade design system.
 * Tailwind extends these via CSS custom properties defined in globals.css.
 */

export const colors = {
  // Semantic roles
  background:   'hsl(222 47% 5%)',
  surface:      'hsl(222 47% 8%)',
  surfaceRaised:'hsl(222 47% 12%)',
  border:       'hsl(217 33% 17%)',

  primary:      'hsl(239 84% 67%)',   // indigo-500
  primaryHover: 'hsl(239 84% 60%)',

  muted:        'hsl(215 20% 55%)',   // slate-400 — secondary text
  subtle:       'hsl(215 20% 40%)',   // slate-500 — tertiary text

  success:      'hsl(160 84% 39%)',   // emerald-500
  danger:       'hsl(0 72% 51%)',     // rose-600
  warning:      'hsl(38 92% 50%)',    // amber-500
  info:         'hsl(199 89% 48%)',   // sky-500

  // Trading-specific
  bullish:      'hsl(160 84% 39%)',   // green for gains
  bearish:      'hsl(0 72% 51%)',     // red for losses
  neutral:      'hsl(215 20% 55%)',   // grey for flat
} as const

export const spacing = {
  // 4-point grid
  px:   '1px',
  0.5:  '2px',
  1:    '4px',
  1.5:  '6px',
  2:    '8px',
  2.5:  '10px',
  3:    '12px',
  3.5:  '14px',
  4:    '16px',
  5:    '20px',
  6:    '24px',
  8:    '32px',
  10:   '40px',
  12:   '48px',
  14:   '56px',
  16:   '64px',
} as const

export const typography = {
  // Sizes — strict scale
  '2xs':  '0.625rem',   // 10px
  xs:     '0.75rem',    // 12px
  sm:     '0.875rem',   // 14px
  base:   '1rem',       // 16px
  lg:     '1.125rem',   // 18px
  xl:     '1.25rem',    // 20px
  '2xl':  '1.5rem',     // 24px
  '3xl':  '1.875rem',   // 30px

  // Weights
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,

  // Tracking
  tight:    '-0.025em',
  normal_:  '0em',
  wide:     '0.025em',
  wider:    '0.05em',
  widest:   '0.1em',
} as const

export const radius = {
  sm:  '0.25rem',
  md:  '0.375rem',
  DEFAULT: '0.5rem',
  lg:  '0.75rem',
  xl:  '1rem',
  full: '9999px',
} as const

export const shadows = {
  sm:  '0 1px 2px 0 rgb(0 0 0 / 0.5)',
  md:  '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  lg:  '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  xl:  '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  glow: '0 0 20px 0 hsl(239 84% 67% / 0.3)',      // primary glow
} as const

export const zIndex = {
  sidebar:  40,
  topbar:   50,
  modal:    60,
  toast:    70,
} as const
