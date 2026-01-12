import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RegionSelector } from './RegionSelector'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Info, Settings, Calendar, Dumbbell, Menu } from 'lucide-react'
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
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleResetConfirm = () => {
    onResetHistory()
    setShowResetDialog(false)
  }

  // Mobile menu modal content
  const MobileMenuContent = () => (
    <div className="flex flex-col gap-6">
      {/* Game Mode Toggle */}
      <div className="flex flex-col gap-2">
        <span className="text-slate-300 text-sm font-medium">Game Mode</span>
        <div className="flex bg-slate-700 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGameMode('daily')
              setShowMobileMenu(false)
            }}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              gameMode === 'daily'
                ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                : 'text-white/80 hover:text-white hover:bg-slate-600'
            }`}
          >
            <Calendar size={16} className="mr-2" />
            Daily
            {dailyCompleted && gameMode === 'daily' && (
              <span className="ml-1 text-xs text-emerald-200">(done)</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGameMode('practice')
              setShowMobileMenu(false)
            }}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              gameMode === 'practice'
                ? 'bg-amber-500 text-white hover:bg-amber-500'
                : 'text-white/80 hover:text-white hover:bg-slate-600'
            }`}
          >
            <Dumbbell size={16} className="mr-2" />
            Practice
          </Button>
        </div>
      </div>

      {/* Region Selector */}
      <div className="flex flex-col gap-2">
        <span className="text-slate-300 text-sm font-medium">Region</span>
        <RegionSelector
          region={region}
          setRegion={setRegion}
          variant="menu"
          onSelect={() => setShowMobileMenu(false)}
        />
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2">
        <span className="text-slate-300 text-sm font-medium">Stats</span>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-amber-300 font-bold text-lg">{score}</div>
            <div className="text-slate-400 text-xs">Score</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-white font-bold text-lg">{gamesPlayed}</div>
            <div className="text-slate-400 text-xs">Games</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-pink-300 font-bold text-lg">{currentStreak}</div>
            <div className="text-slate-400 text-xs">Streak</div>
          </div>
        </div>
        {bestStreak > 0 && (
          <div className="text-slate-400 text-xs text-center">Best streak: {bestStreak}</div>
        )}
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-2">
        <span className="text-slate-300 text-sm font-medium">Settings</span>
        <div className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
          <span className="text-white">Show guessed capitals on map</span>
          <Switch
            checked={showStars}
            onCheckedChange={setShowStars}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            onShowInfo()
            setShowMobileMenu(false)
          }}
          className="w-full justify-start text-white hover:bg-slate-700"
        >
          <Info size={18} className="mr-2" />
          How to Play
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setShowResetDialog(true)
            setShowMobileMenu(false)
          }}
          className="w-full justify-start text-red-400 hover:bg-slate-700 hover:text-red-400"
        >
          Reset History
        </Button>
      </div>
    </div>
  )

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

      {/* Mobile Menu Modal */}
      <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-sm rounded-xl" style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Mapitals</DialogTitle>
          </DialogHeader>
          <MobileMenuContent />
        </DialogContent>
      </Dialog>

      <header className="bg-gradient-to-r from-[#7751f8] via-[#8b5cf6] to-[#06b6d4] p-3 shadow-lg z-50">
        <div className="container mx-auto flex justify-between items-center">
          {isMobile ? (
          /* Mobile: Menu button, logo, and region selector on the left */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowMobileMenu(true)}
                className="text-white hover:bg-white/20 flex items-center gap-2 px-2"
              >
                <Menu size={20} />
                <img src="/favicon.svg" alt="Mapitals logo" className="w-6 h-6" />
              </Button>
              <RegionSelector
                region={region}
                setRegion={setRegion}
                onOpenChange={onOpenChange}
                variant="header-compact"
              />
            </div>
          ): (
            /* Desktop: Full header */
            <>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src="/favicon.svg" alt="Mapitals logo" className="w-8 h-8" />
                  <h1 className="text-2xl font-bold text-white">Mapitals</h1>
                </div>
                <div className="flex bg-white/20 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGameMode('daily')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      gameMode === 'daily'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                        : 'text-white/80 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <Calendar size={16} className="mr-1" />
                    Daily
                    {dailyCompleted && gameMode === 'daily' && (
                      <span className="ml-1 text-xs text-emerald-200">(done)</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGameMode('practice')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      gameMode === 'practice'
                        ? 'bg-amber-500 text-white hover:bg-amber-500'
                        : 'text-white/80 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <Dumbbell size={16} className="mr-1" />
                    Practice
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white hover:bg-purple-700/50 p-2"
                      aria-label="Settings"
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
                  className="text-white/80 hover:text-white hover:bg-purple-700/50 p-2"
                  aria-label="How to play"
                >
                  <Info size={20} />
                </Button>
                <RegionSelector
                  region={region}
                  setRegion={setRegion}
                  onOpenChange={onOpenChange}
                  variant="header"
                />
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded-full">
                    <span className="text-white/90">Score: </span>
                    <span className="text-amber-300 font-bold">{score}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded-full">
                    <span className="text-white/90">Games: </span>
                    <span className="text-amber-300 font-bold">{gamesPlayed}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded-full">
                    <span className="text-white/90">Streak: </span>
                    <span className="text-pink-300 font-bold">{currentStreak}</span>
                    {bestStreak > 0 && <span className="text-white/60 text-xs ml-1">(best: {bestStreak})</span>}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  )
}
