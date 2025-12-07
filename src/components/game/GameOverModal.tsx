import { Button } from '@/components/ui/button'
import { MAX_WRONG_GUESSES } from '@/constants/game'

interface GameOverModalProps {
  won: boolean
  city: string
  regionName: string
  wrongGuesses: number
  onPlayAgain: () => void
}

export function GameOverModal({
  won,
  city,
  regionName,
  wrongGuesses,
  onPlayAgain,
}: GameOverModalProps) {
  return (
    <div className="absolute inset-x-0 top-16 flex justify-center" style={{ zIndex: 1001 }}>
      <div className="bg-slate-800/95 border border-slate-600 text-white max-w-md rounded-xl p-6 backdrop-blur-sm mx-4">
        <h2 className={`text-2xl font-bold mb-4 ${won ? "text-emerald-400" : "text-red-400"}`}>
          {won ? "Congratulations!" : "Game Over!"}
        </h2>
        <p className="text-xl mb-2">
          The answer was: <span className="font-bold text-emerald-400">{city}</span>, <span className="font-bold text-amber-400">{regionName}</span>
        </p>
        {won && (
          <p className="text-lg mb-4">
            Points earned: <span className="text-emerald-400 font-bold">+{MAX_WRONG_GUESSES - wrongGuesses}</span>
          </p>
        )}
        <Button
          onClick={onPlayAgain}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
        >
          Play Again
        </Button>
      </div>
    </div>
  )
}
