import { describe, it, expect } from 'vitest'
import { shuffleArray } from './shuffle'

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input)
    expect(result).toHaveLength(input.length)
  })

  it('should contain all the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input)
    expect(result.sort()).toEqual(input.sort())
  })

  it('should not modify the original array', () => {
    const input = [1, 2, 3, 4, 5]
    const originalCopy = [...input]
    shuffleArray(input)
    expect(input).toEqual(originalCopy)
  })

  it('should return a new array instance', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input)
    expect(result).not.toBe(input)
  })

  it('should handle empty arrays', () => {
    const input: number[] = []
    const result = shuffleArray(input)
    expect(result).toEqual([])
  })

  it('should handle single element arrays', () => {
    const input = [42]
    const result = shuffleArray(input)
    expect(result).toEqual([42])
  })

  it('should work with string arrays', () => {
    const input = ['a', 'b', 'c', 'd']
    const result = shuffleArray(input)
    expect(result).toHaveLength(input.length)
    expect(result.sort()).toEqual(input.sort())
  })

  it('should work with object arrays', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = shuffleArray(input)
    expect(result).toHaveLength(input.length)
    expect(result.map(o => o.id).sort()).toEqual([1, 2, 3])
  })

  it('should produce different orderings over multiple shuffles (statistical test)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const results = new Set<string>()
    
    for (let i = 0; i < 100; i++) {
      results.add(shuffleArray(input).join(','))
    }
    
    expect(results.size).toBeGreaterThan(1)
  })
})
