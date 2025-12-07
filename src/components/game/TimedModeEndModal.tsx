import { Button } from '@/components/ui/button'
import { GripHorizontal, Trophy, Target, Clock } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TimedModeDuration } from '@/constants/game'

const DURATION_LABELS: Record<TimedModeDuration, string> = {
  '1min': '1 Minute',
  '2min': '2 Minutes',
  '5min': '5 Minutes',
}

interface TimedModeEndModalProps {
  capitalsGuessed: number
  sessionScore: number
  bestCapitals: number
  bestScore: number
  duration: TimedModeDuration
  onPlayAgain: () => void
  onExitTimedMode: () => void
}

export function TimedModeEndModal({
  capitalsGuessed,
  sessionScore,
  bestCapitals,
  bestScore,
  duration,
  onPlayAgain,
  onExitTimedMode,
}: TimedModeEndModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  const isNewBestScore = sessionScore > bestScore || (bestScore === 0 && sessionScore > 0)
  const isNewBestCapitals = capitalsGuessed > bestCapitals || (bestCapitals === 0 && capitalsGuessed > 0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      e.preventDefault()
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
    }
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <div className="absolute inset-x-0 top-16 flex justify-center" style={{ zIndex: 1001 }}>
      <div 
        ref={modalRef}
        className="bg-slate-800/70 border border-slate-600 text-white max-w-md rounded-xl p-6 backdrop-blur-sm mx-4 select-none"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="drag-handle flex items-center justify-center mb-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-300">
          <GripHorizontal size={20} />
        </div>
        
        <div className="flex flex-col items-center justify-center gap-1 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-400" size={28} />
            <h2 className="text-2xl font-bold text-amber-400">Time's Up!</h2>
          </div>
          <span className="text-sm text-slate-400">{DURATION_LABELS[duration]} Mode</span>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="text-emerald-400" size={20} />
                <span className="text-slate-300">Capitals Guessed</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">{capitalsGuessed}</span>
            </div>
            {isNewBestCapitals && capitalsGuessed > 0 && (
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <Trophy size={12} /> New Best!
              </div>
            )}
            {!isNewBestCapitals && bestCapitals > 0 && (
              <div className="text-xs text-slate-400">Best: {bestCapitals}</div>
            )}
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-400" size={20} />
                <span className="text-slate-300">Points Earned</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">{sessionScore}</span>
            </div>
            {isNewBestScore && sessionScore > 0 && (
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <Trophy size={12} /> New Best!
              </div>
            )}
            {!isNewBestScore && bestScore > 0 && (
              <div className="text-xs text-slate-400">Best: {bestScore}</div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onPlayAgain}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Play Again
          </Button>
          <Button
            onClick={onExitTimedMode}
            variant="outline"
            className="flex-1 border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Exit Timed Mode
          </Button>
        </div>
      </div>
    </div>
  )
}
