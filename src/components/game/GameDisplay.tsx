interface GameDisplayProps {
  isUSStatesMode: boolean
  displayCity: string
  displayRegion: string
}

export function GameDisplay({
  isUSStatesMode,
  displayCity,
  displayRegion,
}: GameDisplayProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 flex-1">
        <p className="text-emerald-400 text-sm font-semibold mb-1">
          {isUSStatesMode ? 'State Capital' : 'Capital City'}
        </p>
        <p className="text-xl sm:text-2xl font-mono tracking-widest text-white">
          {displayCity}
        </p>
      </div>
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 flex-1">
        <p className="text-amber-400 text-sm font-semibold mb-1">
          {isUSStatesMode ? 'State' : 'Country'}
        </p>
        <p className="text-xl sm:text-2xl font-mono tracking-widest text-white">
          {displayRegion}
        </p>
      </div>
    </div>
  )
}
