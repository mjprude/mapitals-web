export const MAX_WRONG_GUESSES = 6

export const US_CENTER: [number, number] = [39.8, -98.5]

export const ADJUSTED_ZOOM_LEVELS = [2, 2, 3, 3.5, 4, 5, 6]

export const TIMED_MODE_DURATIONS = {
  '1min': 60,
  '2min': 120,
  '5min': 300,
} as const

export type TimedModeDuration = keyof typeof TIMED_MODE_DURATIONS
