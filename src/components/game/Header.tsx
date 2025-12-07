import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info } from 'lucide-react'
import { Region } from '@/capitals'

interface HeaderProps {
  region: Region
  setRegion: (region: Region) => void
  onOpenChange: (open: boolean) => void
  score: number
  gamesPlayed: number
  currentStreak: number
  bestStreak: number
  isMobile: boolean
  onShowInfo: () => void
}

export function Header({
  region,
  setRegion,
  onOpenChange,
  score,
  gamesPlayed,
  currentStreak,
  bestStreak,
  isMobile,
  onShowInfo,
}: HeaderProps) {
  return (
    <header className="bg-slate-800/90 p-3 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-400">Mapitals</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowInfo}
            className="text-slate-300 hover:text-white hover:bg-slate-700 p-2"
          >
            <Info size={20} />
          </Button>
          <Select
            value={region}
            onValueChange={(value) => setRegion(value as Region)}
            onOpenChange={onOpenChange}
          >
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600" style={{ zIndex: 9999 }}>
              <SelectItem value="World" className="text-white hover:bg-slate-700">World</SelectItem>
              <SelectItem value="Americas" className="text-white hover:bg-slate-700">Americas</SelectItem>
              <SelectItem value="Europe" className="text-white hover:bg-slate-700">Europe</SelectItem>
              <SelectItem value="Asia" className="text-white hover:bg-slate-700">Asia</SelectItem>
              <SelectItem value="Africa" className="text-white hover:bg-slate-700">Africa</SelectItem>
              <SelectItem value="Oceania" className="text-white hover:bg-slate-700">Oceania</SelectItem>
              <SelectItem value="US States" className="text-white hover:bg-slate-700">US States</SelectItem>
            </SelectContent>
          </Select>
          <div className={isMobile ? "flex flex-col items-center text-xs" : "flex items-baseline gap-1 text-sm"}>
            <span className="whitespace-nowrap">{isMobile ? "Score" : "Score:"}</span>
            <span className="text-emerald-400 font-bold">{score}</span>
          </div>
          {!isMobile && (
            <div className="flex items-baseline gap-1 text-sm">
              <span className="whitespace-nowrap">Games:</span>
              <span className="text-emerald-400 font-bold">{gamesPlayed}</span>
            </div>
          )}
          <div className={isMobile ? "flex flex-col items-center text-xs" : "flex items-baseline gap-1 text-sm"}>
            <span className="whitespace-nowrap">{isMobile ? "Streak" : "Streak:"}</span>
            <span className="text-amber-400 font-bold">{currentStreak}</span>
            {!isMobile && bestStreak > 0 && <span className="text-slate-400 text-xs ml-1">(best: {bestStreak})</span>}
          </div>
        </div>
      </div>
    </header>
  )
}
