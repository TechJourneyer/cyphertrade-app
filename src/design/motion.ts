/**
 * Motion/animation presets — import and use these constants rather than
 * hardcoding durations and easing values across components.
 */

export const duration = {
  instant: 0,
  fast:    100,
  normal:  200,
  slow:    300,
  slower:  500,
} as const

export const easing = {
  out:     'cubic-bezier(0.16, 1, 0.3, 1)',   // snappy exit
  in:      'cubic-bezier(0.7, 0, 0.84, 0)',   // smooth enter
  inOut:   'cubic-bezier(0.45, 0, 0.55, 1)',  // smooth both
  spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)', // slight overshoot
} as const

/** Tailwind transition class pairs for common patterns */
export const transition = {
  base:     'transition-all duration-200 ease-out',
  colors:   'transition-colors duration-150 ease-out',
  opacity:  'transition-opacity duration-200 ease-out',
  shadow:   'transition-shadow duration-200 ease-out',
  sidebar:  'transition-all duration-300 ease-out',
} as const

/**
 * CSS animation class names (defined in globals.css / tailwind.config.ts)
 * Use these to avoid magic strings in components.
 */
export const animation = {
  fadeIn:   'animate-fade-in',
  slideUp:  'animate-slide-up',
  slideLeft:'animate-slide-left',
  shimmer:  'shimmer',
  pulse:    'animate-pulse',
} as const
