import { describe, it, expect } from 'vitest'
import { seededRandom, getDailyCapital, generateShareText, generateAllRegionsShareText, DailyResult } from './daily'
import type { Region } from '../capitals'

describe('seededRandom', () => {
  it('returns the same sequence of numbers for the same seed', () => {
    const seed = 'test-seed-123'
    
    // Create two generators with the same seed
    const random1 = seededRandom(seed)
    const random2 = seededRandom(seed)
    
    // Generate several numbers from each and verify they match
    for (let i = 0; i < 10; i++) {
      expect(random1()).toBe(random2())
    }
  })

  it('returns different sequences for different seeds', () => {
    const random1 = seededRandom('seed-a')
    const random2 = seededRandom('seed-b')
    
    // At least one of the first few numbers should differ
    const results1 = Array.from({ length: 5 }, () => random1())
    const results2 = Array.from({ length: 5 }, () => random2())
    
    expect(results1).not.toEqual(results2)
  })

  it('returns numbers between 0 and 1', () => {
    const random = seededRandom('bounds-test')
    
    for (let i = 0; i < 100; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})

describe('getDailyCapital', () => {
  it('returns the same capital for the same region and date', () => {
    const region = 'World'
    const dateString = '2025-12-08'
    
    const capital1 = getDailyCapital(region, dateString)
    const capital2 = getDailyCapital(region, dateString)
    
    expect(capital1).toEqual(capital2)
  })

  it('returns different capitals for different dates', () => {
    const region = 'World'
    
    const capital1 = getDailyCapital(region, '2025-12-08')
    const capital2 = getDailyCapital(region, '2025-12-09')
    
    // While theoretically they could be the same by chance,
    // with 195 capitals the probability is very low
    expect(capital1).not.toEqual(capital2)
  })

  it('returns different capitals for different regions on the same date', () => {
    const dateString = '2025-12-08'
    
    const worldCapital = getDailyCapital('World', dateString)
    const europeCapital = getDailyCapital('Europe', dateString)
    
    // These should be different (though could theoretically match)
    expect(worldCapital).not.toEqual(europeCapital)
  })
})

describe('generateShareText', () => {
  it('shows correct squares when won with 0 wrong guesses', () => {
    const shareText = generateShareText('World', '2025-12-08', true, 0, 6)
    expect(shareText).toContain('🟩🟩🟩🟩🟩🟩 0/6')
  })

  it('shows correct squares when won with some wrong guesses', () => {
    const shareText = generateShareText('World', '2025-12-08', true, 3, 6)
    expect(shareText).toContain('🟥🟥🟥🟩🟩🟩 3/6')
  })

  it('shows all red squares when lost (gave up) with few wrong guesses', () => {
    const shareText = generateShareText('World', '2025-12-08', false, 2, 6)
    expect(shareText).toContain('🟥🟥🟥🟥🟥🟥 X/6')
  })

  it('shows all red squares when lost (gave up) with no wrong guesses', () => {
    const shareText = generateShareText('World', '2025-12-08', false, 0, 6)
    expect(shareText).toContain('🟥🟥🟥🟥🟥🟥 X/6')
  })

  it('shows all red squares when lost at max wrong guesses', () => {
    const shareText = generateShareText('Europe', '2025-12-08', false, 6, 6)
    expect(shareText).toContain('🟥🟥🟥🟥🟥🟥 X/6')
  })

  it('includes region name in share text', () => {
    const shareText = generateShareText('Asia', '2025-12-08', true, 2, 6)
    expect(shareText).toContain('Mapitals Daily - Asia')
  })

  it('includes URL in share text', () => {
    const shareText = generateShareText('World', '2025-12-08', true, 2, 6)
    expect(shareText).toContain('https://www.mapitals.com')
  })
})

describe('generateAllRegionsShareText', () => {
  it('shows correct squares for mixed wins and losses', () => {
    const results = new Map<Region, DailyResult | null>([
      ['World', { won: true, wrongGuesses: 2, guessedLetters: [] }],
      ['Europe', { won: false, wrongGuesses: 3, guessedLetters: [] }],
      ['Asia', { won: true, wrongGuesses: 0, guessedLetters: [] }]
    ])
    
    const shareText = generateAllRegionsShareText('2025-12-08', results, 6)
    expect(shareText).toContain('World: 🟥🟥🟩🟩🟩🟩 2/6')
    expect(shareText).toContain('Europe: 🟥🟥🟥🟥🟥🟥 X/6')
    expect(shareText).toContain('Asia: 🟩🟩🟩🟩🟩🟩 0/6')
  })

  it('shows all red squares for all losses', () => {
    const results = new Map<Region, DailyResult | null>([
      ['World', { won: false, wrongGuesses: 1, guessedLetters: [] }],
      ['Europe', { won: false, wrongGuesses: 5, guessedLetters: [] }]
    ])
    
    const shareText = generateAllRegionsShareText('2025-12-08', results, 6)
    expect(shareText).toContain('World: 🟥🟥🟥🟥🟥🟥 X/6')
    expect(shareText).toContain('Europe: 🟥🟥🟥🟥🟥🟥 X/6')
  })

  it('includes total score and wins', () => {
    const results = new Map<Region, DailyResult | null>([
      ['World', { won: true, wrongGuesses: 2, guessedLetters: [] }],
      ['Europe', { won: false, wrongGuesses: 3, guessedLetters: [] }]
    ])
    
    const shareText = generateAllRegionsShareText('2025-12-08', results, 6)
    expect(shareText).toContain('1/2 wins')
  })

  it('includes URL in share text', () => {
    const results = new Map<Region, DailyResult | null>([
      ['World', { won: true, wrongGuesses: 2, guessedLetters: [] }]
    ])
    
    const shareText = generateAllRegionsShareText('2025-12-08', results, 6)
    expect(shareText).toContain('https://www.mapitals.com')
  })
})
