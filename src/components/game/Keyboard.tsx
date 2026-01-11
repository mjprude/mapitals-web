import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'

interface KeyboardProps {
  guessedLetters: Set<string>
  gameOver: boolean
  fullText: string
  isMobile: boolean
  onGuess: (letter: string) => void
}

const KEYBOARD_ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  'ZXCVBNM'.split('')
]

export const Keyboard = forwardRef<HTMLDivElement, KeyboardProps>(
  function Keyboard({ guessedLetters, gameOver, fullText, isMobile, onGuess }, ref) {
    const renderKey = (letter: string) => {
      const isGuessed = guessedLetters.has(letter.toLowerCase())
      const isCorrect = fullText.includes(letter.toLowerCase())

      return (
        <Button
          key={letter}
          onClick={() => onGuess(letter)}
          disabled={isGuessed || gameOver}
          variant="outline"
          className={`
            ${isMobile ? 'h-11 flex-1 text-base rounded-md' : 'h-8 w-8 sm:h-9 sm:w-9 text-sm sm:text-base rounded-lg'} p-0 font-bold transition-all
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
    }

    // Render spacer elements for rows 2 and 3 to simulate native keyboard layout
    // Row 2: 9 keys + 2 half-key spacers = 10 units (same as row 1)
    // Row 3: 7 keys + 2 x 1.5-key spacers = 10 units (same as row 1)
    const renderSpacer = (widthMultiplier: number) => (
      <div className={`flex-[${widthMultiplier}]`} style={{ flex: widthMultiplier }} />
    )

    return (
      <div 
        ref={ref} 
        tabIndex={-1} 
        className={`bg-white/10 backdrop-blur-sm outline-none shadow-lg w-full ${isMobile ? 'rounded-none px-2 py-2' : 'rounded-xl px-3 py-3'}`}
        aria-label="Guess a letter"
      >
        <div className="flex flex-col items-center gap-1.5 w-full">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 w-full">
              {isMobile && rowIndex === 1 && renderSpacer(0.5)}
              {isMobile && rowIndex === 2 && renderSpacer(1.5)}
              {row.map(renderKey)}
              {isMobile && rowIndex === 1 && renderSpacer(0.5)}
              {isMobile && rowIndex === 2 && renderSpacer(1.5)}
            </div>
          ))}
        </div>
      </div>
    )
  }
)
