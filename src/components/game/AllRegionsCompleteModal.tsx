import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { MAX_WRONG_GUESSES } from '@/constants/game'
import { Share2, Check, Dumbbell, Trophy } from 'lucide-react'
import { 
  DailyResult, 
  generateAllRegionsShareText, 
  calculateTotalScore 
} from '@/utils/daily'
import { Region, REGION_ORDER } from '@/capitals'

interface AllRegionsCompleteModalProps {
  todayDate: string
  results: Map<Region, DailyResult | null>
  onTryPracticeMode: () => void
}

export function AllRegionsCompleteModal({
  todayDate,
  results,
  onTryPracticeMode,
}: AllRegionsCompleteModalProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const shareText = generateAllRegionsShareText(todayDate, results, MAX_WRONG_GUESSES)
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }, [todayDate, results])

  const totalScore = calculateTotalScore(results, MAX_WRONG_GUESSES)
  const totalWins = Array.from(results.values()).filter(r => r?.won).length
  const totalRegions = results.size

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ zIndex: 1002 }}>
      <div className="bg-gradient-to-br from-[#7751f8] to-[#4c1d95] border-2 border-violet-300/50 text-white max-w-lg w-full rounded-2xl p-6 mx-4 shadow-2xl shadow-purple-500/40">
        <div className="flex items-center justify-center mb-4">
          <Trophy size={48} className="text-amber-300 drop-shadow-lg" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center text-amber-300 drop-shadow-lg">
          All Regions Complete!
        </h2>
        <p className="text-center text-white/80 mb-4">
          You've completed all daily puzzles for today
        </p>

        <div className="bg-white/10 rounded-xl border border-white/20 p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-cyan-300">Total Score</span>
            <span className="text-2xl font-bold text-amber-300">{totalScore}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-white/70">Regions Won</span>
            <span className="text-lg font-bold text-emerald-300">{totalWins}/{totalRegions}</span>
          </div>

          <div className="space-y-2">
            {REGION_ORDER.map(region => {
              const result = results.get(region)
              if (!result) return null
              
              const squares = Array(MAX_WRONG_GUESSES)
                .fill(null)
                .map((_, i) => (i < result.wrongGuesses ? '🟥' : '🟩'))
                .join('')
              const score = result.won ? MAX_WRONG_GUESSES - result.wrongGuesses : 0
              
              return (
                <div key={region} className="flex items-center justify-between text-sm">
                  <span className="text-white/80 w-24 truncate">{region}</span>
                  <span className="font-mono">{squares}</span>
                  <span className={`w-8 text-right font-bold ${result.won ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {result.won ? `+${score}` : 'X'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            className="flex-1 bg-white/20 text-white border border-white/30 hover:bg-white/30 font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02]"
          >
            {copied ? (
              <>
                <Check size={16} className="mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Share2 size={16} className="mr-1" />
                Share
              </>
            )}
          </Button>
          <Button
            onClick={onTryPracticeMode}
            className="flex-1 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-amber-500/40 transition-all hover:scale-[1.02]"
          >
            <Dumbbell size={16} className="mr-1" />
            Try Practice Mode
          </Button>
        </div>
      </div>
    </div>
  )
}
