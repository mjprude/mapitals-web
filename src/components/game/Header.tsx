import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Info, Settings, Calendar, Dumbbell } from 'lucide-react'
import { Region } from '@/capitals'
import { GameMode } from '@/utils/daily'

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
  showStars: boolean
  setShowStars: (show: boolean) => void
  onResetHistory: () => void
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void
  dailyCompleted: boolean
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
  showStars,
  setShowStars,
  onResetHistory,
  gameMode,
  setGameMode,
  dailyCompleted,
}: HeaderProps) {
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleResetConfirm = () => {
    onResetHistory()
    setShowResetDialog(false)
  }

  return (
    <>
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset History</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to reset all your history? This will clear your score, games played, streaks, and all completed capitals. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <header className="bg-slate-800/90 p-3 shadow-lg z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-emerald-400">Mapitals</h1>
            <div className="flex bg-slate-700 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGameMode('daily')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  gameMode === 'daily'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <Calendar size={16} className="mr-1" />
                {!isMobile && 'Daily'}
                {dailyCompleted && gameMode === 'daily' && (
                  <span className="ml-1 text-xs text-emerald-300">(done)</span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGameMode('practice')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  gameMode === 'practice'
                    ? 'bg-amber-600 text-white hover:bg-amber-600'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <Dumbbell size={16} className="mr-1" />
                {!isMobile && 'Practice'}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-700 p-2"
                >
                  <Settings size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-600 text-white" style={{ zIndex: 9999 }}>
                <DropdownMenuLabel className="text-slate-300">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-600" />
                <DropdownMenuItem
                  className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>Show Correct Guesses</span>
                    <Switch
                      checked={showStars}
                      onCheckedChange={setShowStars}
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-600" />
                <DropdownMenuItem
                  className="text-red-400 hover:bg-slate-700 focus:bg-slate-700 focus:text-red-400 cursor-pointer"
                  onSelect={() => setShowResetDialog(true)}
                >
                Reset History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    </>
  )
}
