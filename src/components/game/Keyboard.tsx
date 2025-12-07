import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'

interface KeyboardProps {
  guessedLetters: Set<string>
  gameOver: boolean
  fullText: string
  isMobile: boolean
  onGuess: (letter: string) => void
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const Keyboard = forwardRef<HTMLDivElement, KeyboardProps>(
  function Keyboard({ guessedLetters, gameOver, fullText, isMobile, onGuess }, ref) {
    return (
      <div 
        ref={ref} 
        tabIndex={-1} 
        className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 py-2 outline-none" 
        aria-label="Guess a letter"
      >
        <div className="flex flex-wrap justify-center gap-1">
          {ALPHABET.map(letter => {
            const isGuessed = guessedLetters.has(letter.toLowerCase())
            const isCorrect = fullText.includes(letter.toLowerCase())

            return (
              <Button
                key={letter}
                onClick={() => onGuess(letter)}
                disabled={isGuessed || gameOver}
                variant="outline"
                className={`
                  ${isMobile ? 'h-9 w-9 text-sm' : 'h-7 w-7 sm:h-8 sm:w-8 text-xs sm:text-sm'} p-0 font-bold
                  ${isGuessed
                ? isCorrect
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-red-600 border-red-600 text-white'
                : 'bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600'
              }
                `}
              >
                {letter}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }
)
