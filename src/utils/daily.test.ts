import { describe, it, expect } from 'vitest'
import { seededRandom, getDailyCapital } from './daily'

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
