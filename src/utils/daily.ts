import { Region, Capital, StateCapital, CAPITALS, US_STATE_CAPITALS } from '../capitals'

/**
 * Simple seeded random number generator using a string seed.
 * Uses a hash function to convert the seed to a number, then uses
 * a linear congruential generator for deterministic random numbers.
 */
export function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  let state = Math.abs(hash) || 1
  
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

/**
 * Gets today's date string in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets a formatted date string for display (e.g., "Dec 7, 2025").
 */
export function getFormattedDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Gets the daily capital for a given region and date.
 * Uses a seeded random number generator to ensure all users
 * get the same capital for the same region on the same day.
 */
export function getDailyCapital(region: Region, dateString: string): Capital | StateCapital {
  const seed = `mapitals-${dateString}-${region}`
  const random = seededRandom(seed)
  
  if (region === 'US States') {
    const index = Math.floor(random() * US_STATE_CAPITALS.length)
    return US_STATE_CAPITALS[index]
  }
  
  const capitalsForRegion = region === 'World' 
    ? CAPITALS 
    : CAPITALS.filter(c => c.region === region)
  
  const index = Math.floor(random() * capitalsForRegion.length)
  return capitalsForRegion[index]
}

/**
 * Checks if the daily puzzle for a given region has been completed today.
 */
export function isDailyCompleted(region: Region, dateString: string): boolean {
  const key = `mapitals-daily-completed-${dateString}-${region}`
  return localStorage.getItem(key) === 'true'
}

/**
 * Marks the daily puzzle for a given region as completed.
 */
export function markDailyCompleted(region: Region, dateString: string): void {
  const key = `mapitals-daily-completed-${dateString}-${region}`
  localStorage.setItem(key, 'true')
}

/**
 * Gets the daily game result for sharing.
 */
export function getDailyResult(region: Region, dateString: string): DailyResult | null {
  const key = `mapitals-daily-result-${dateString}-${region}`
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : null
}

/**
 * Saves the daily game result for sharing.
 */
export function saveDailyResult(region: Region, dateString: string, result: DailyResult): void {
  const key = `mapitals-daily-result-${dateString}-${region}`
  localStorage.setItem(key, JSON.stringify(result))
}

export interface DailyResult {
  won: boolean
  wrongGuesses: number
  guessedLetters: string[]
}

export type GameMode = 'daily' | 'practice'

/**
 * Generates a Wordle-style share text for the daily puzzle.
 */
export function generateShareText(
  region: Region,
  dateString: string,
  won: boolean,
  wrongGuesses: number,
  maxWrongGuesses: number
): string {
  const formattedDate = getFormattedDate(dateString)
  const result = won ? wrongGuesses : 'X'
  
  const squares = Array(maxWrongGuesses)
    .fill(null)
    .map((_, i) => (i < wrongGuesses ? '🟥' : '🟩'))
    .join('')
  
  return `Mapitals Daily - ${region}
${formattedDate}
${squares} ${result}/${maxWrongGuesses}

https://www.mapitals.com`
}

/**
 * Checks if all regions have been completed for a given date.
 */
export function areAllRegionsCompleted(dateString: string, regions: Region[]): boolean {
  return regions.every(region => isDailyCompleted(region, dateString))
}

/**
 * Gets all daily results for all regions for a given date.
 */
export function getAllRegionResults(dateString: string, regions: Region[]): Map<Region, DailyResult | null> {
  const results = new Map<Region, DailyResult | null>()
  for (const region of regions) {
    results.set(region, getDailyResult(region, dateString))
  }
  return results
}

/**
 * Calculates the total score from all region results.
 */
export function calculateTotalScore(results: Map<Region, DailyResult | null>, maxWrongGuesses: number): number {
  let total = 0
  for (const result of results.values()) {
    if (result && result.won) {
      total += maxWrongGuesses - result.wrongGuesses
    }
  }
  return total
}

/**
 * Generates a Wordle-style share text for all completed regions.
 */
export function generateAllRegionsShareText(
  dateString: string,
  results: Map<Region, DailyResult | null>,
  maxWrongGuesses: number
): string {
  const formattedDate = getFormattedDate(dateString)
  const totalScore = calculateTotalScore(results, maxWrongGuesses)
  const totalWins = Array.from(results.values()).filter(r => r?.won).length
  const totalRegions = results.size
  
  let shareText = `Mapitals Daily - All Regions
${formattedDate}
Score: ${totalScore} | ${totalWins}/${totalRegions} wins

`
  
  for (const [region, result] of results) {
    if (result) {
      const squares = Array(maxWrongGuesses)
        .fill(null)
        .map((_, i) => (i < result.wrongGuesses ? '🟥' : '🟩'))
        .join('')
      const resultText = result.won ? result.wrongGuesses : 'X'
      shareText += `${region}: ${squares} ${resultText}/${maxWrongGuesses}\n`
    }
  }
  
  shareText += `\nhttps://www.mapitals.com`
  return shareText
}
