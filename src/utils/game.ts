/**
 * Masks unrevealed letters with underscores.
 * Shows punctuation and spaces always.
 */
export function getDisplayText(text: string, guessedLetters: Set<string>): string {
  return text.split('').map(char => {
    if (char === ' ' || char === '.' || char === '-' || char === "'" || char === ',') return char
    if (guessedLetters.has(char.toLowerCase())) return char
    return '_'
  }).join('')
}

/**
 * Checks if all letters in a word exist in the guessed letters Set.
 */
export function isWordCompleteWithSet(text: string, letterSet: Set<string>): boolean {
  return text.split('').every(char => {
    if (char === ' ' || char === '.' || char === '-' || char === "'" || char === ',') return true
    return letterSet.has(char.toLowerCase())
  })
}

/**
 * Calculates the score for a won game.
 * Score is based on efficiency: MAX_WRONG_GUESSES - wrongGuesses
 */
export function calculateScore(wrongGuesses: number, maxWrongGuesses: number): number {
  return maxWrongGuesses - wrongGuesses
}

/**
 * Checks if a letter is in the full text (city + country/state).
 */
export function isLetterInText(letter: string, fullText: string): boolean {
  return fullText.toLowerCase().includes(letter.toLowerCase())
}
