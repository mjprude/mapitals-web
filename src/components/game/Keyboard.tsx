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
        className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 outline-none shadow-lg" 
        aria-label="Guess a letter"
      >
        <div className="flex flex-wrap justify-center gap-1.5">
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
                  ${isMobile ? 'h-10 w-10 text-base' : 'h-8 w-8 sm:h-9 sm:w-9 text-sm sm:text-base'} p-0 font-bold rounded-lg transition-all
                  ${isGuessed
                ? isCorrect
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-300 text-white shadow-md shadow-emerald-500/40'
                  : 'bg-gradient-to-b from-rose-400 to-rose-600 border-rose-300 text-white shadow-md shadow-rose-500/40'
                : 'bg-gradient-to-b from-violet-400 to-[#7751f8] border-violet-300 text-white hover:from-violet-300 hover:to-violet-500 shadow-md shadow-violet-500/30 hover:scale-105'
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
