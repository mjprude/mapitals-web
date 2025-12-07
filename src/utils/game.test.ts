import { describe, it, expect } from 'vitest'
import { 
  getDisplayText, 
  isWordCompleteWithSet, 
  calculateScore, 
  isLetterInText 
} from './game'

describe('getDisplayText', () => {
  it('should mask all letters when no letters are guessed', () => {
    const guessedLetters = new Set<string>()
    expect(getDisplayText('Paris', guessedLetters)).toBe('_____')
  })

  it('should reveal guessed letters', () => {
    const guessedLetters = new Set(['p', 'a'])
    expect(getDisplayText('Paris', guessedLetters)).toBe('Pa___')
  })

  it('should reveal all letters when all are guessed', () => {
    const guessedLetters = new Set(['p', 'a', 'r', 'i', 's'])
    expect(getDisplayText('Paris', guessedLetters)).toBe('Paris')
  })

  it('should preserve spaces', () => {
    const guessedLetters = new Set<string>()
    expect(getDisplayText('New York', guessedLetters)).toBe('___ ____')
  })

  it('should preserve periods', () => {
    const guessedLetters = new Set<string>()
    expect(getDisplayText('Washington D.C.', guessedLetters)).toBe('__________ _._.') 
  })

  it('should preserve hyphens', () => {
    const guessedLetters = new Set<string>()
    expect(getDisplayText('Port-au-Prince', guessedLetters)).toBe('____-__-______')
  })

  it('should preserve apostrophes', () => {
    const guessedLetters = new Set<string>()
    expect(getDisplayText("N'Djamena", guessedLetters)).toBe("_'_______")
  })

  it('should preserve commas', () => {
    const guessedLetters = new Set<string>()
    expect(getDisplayText('City, Country', guessedLetters)).toBe('____, _______')
  })

  it('should handle case insensitivity', () => {
    const guessedLetters = new Set(['p'])
    expect(getDisplayText('Paris', guessedLetters)).toBe('P____')
  })

  it('should handle empty string', () => {
    const guessedLetters = new Set(['a'])
    expect(getDisplayText('', guessedLetters)).toBe('')
  })

  it('should handle string with only punctuation', () => {
    const guessedLetters = new Set<string>()
    expect(getDisplayText('- . ,', guessedLetters)).toBe('- . ,')
  })
})

describe('isWordCompleteWithSet', () => {
  it('should return false when no letters are guessed', () => {
    const letterSet = new Set<string>()
    expect(isWordCompleteWithSet('Paris', letterSet)).toBe(false)
  })

  it('should return false when some letters are missing', () => {
    const letterSet = new Set(['p', 'a', 'r'])
    expect(isWordCompleteWithSet('Paris', letterSet)).toBe(false)
  })

  it('should return true when all letters are guessed', () => {
    const letterSet = new Set(['p', 'a', 'r', 'i', 's'])
    expect(isWordCompleteWithSet('Paris', letterSet)).toBe(true)
  })

  it('should ignore spaces when checking completion', () => {
    const letterSet = new Set(['n', 'e', 'w', 'y', 'o', 'r', 'k'])
    expect(isWordCompleteWithSet('New York', letterSet)).toBe(true)
  })

  it('should ignore periods when checking completion', () => {
    const letterSet = new Set(['w', 'a', 's', 'h', 'i', 'n', 'g', 't', 'o', 'd', 'c'])
    expect(isWordCompleteWithSet('Washington D.C.', letterSet)).toBe(true)
  })

  it('should ignore hyphens when checking completion', () => {
    const letterSet = new Set(['p', 'o', 'r', 't', 'a', 'u', 'i', 'n', 'c', 'e'])
    expect(isWordCompleteWithSet('Port-au-Prince', letterSet)).toBe(true)
  })

  it('should ignore apostrophes when checking completion', () => {
    const letterSet = new Set(['n', 'd', 'j', 'a', 'm', 'e'])
    expect(isWordCompleteWithSet("N'Djamena", letterSet)).toBe(true)
  })

  it('should ignore commas when checking completion', () => {
    const letterSet = new Set(['c', 'i', 't', 'y', 'o', 'u', 'n', 'r'])
    expect(isWordCompleteWithSet('City, Country', letterSet)).toBe(true)
  })

  it('should handle case insensitivity', () => {
    const letterSet = new Set(['p', 'a', 'r', 'i', 's'])
    expect(isWordCompleteWithSet('PARIS', letterSet)).toBe(true)
  })

  it('should return true for empty string', () => {
    const letterSet = new Set<string>()
    expect(isWordCompleteWithSet('', letterSet)).toBe(true)
  })

  it('should return true for string with only punctuation', () => {
    const letterSet = new Set<string>()
    expect(isWordCompleteWithSet('- . ,', letterSet)).toBe(true)
  })
})

describe('calculateScore', () => {
  it('should return max score when no wrong guesses', () => {
    expect(calculateScore(0, 6)).toBe(6)
  })

  it('should return correct score with some wrong guesses', () => {
    expect(calculateScore(3, 6)).toBe(3)
  })

  it('should return 0 when wrong guesses equals max', () => {
    expect(calculateScore(6, 6)).toBe(0)
  })

  it('should handle different max wrong guesses values', () => {
    expect(calculateScore(2, 10)).toBe(8)
  })
})

describe('isLetterInText', () => {
  it('should return true when letter is in text', () => {
    expect(isLetterInText('p', 'Paris')).toBe(true)
  })

  it('should return false when letter is not in text', () => {
    expect(isLetterInText('z', 'Paris')).toBe(false)
  })

  it('should be case insensitive for letter', () => {
    expect(isLetterInText('P', 'paris')).toBe(true)
  })

  it('should be case insensitive for text', () => {
    expect(isLetterInText('p', 'PARIS')).toBe(true)
  })

  it('should handle empty text', () => {
    expect(isLetterInText('a', '')).toBe(false)
  })

  it('should find letters in multi-word text', () => {
    expect(isLetterInText('y', 'New York')).toBe(true)
  })
})
