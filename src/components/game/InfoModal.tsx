import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface InfoModalProps {
  onClose: () => void
}

export function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 1002 }}>
      <div className="bg-slate-800/95 border border-slate-600 text-white max-w-lg rounded-xl p-6 backdrop-blur-sm mx-4 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-slate-700 p-1"
        >
          <X size={20} />
        </Button>
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">How to Play</h2>
        <div className="space-y-3 text-slate-300">
          <p>Guess the capital city and country by selecting letters. The map starts zoomed out showing the whole world.</p>
          <p>Each wrong guess zooms the map closer to the location. After 6 wrong guesses, the game ends and the answer is revealed.</p>
          <p>You can type letters on your keyboard or click the letter buttons. Use the region dropdown to filter capitals by continent.</p>
          <p>Score points by guessing correctly with fewer wrong attempts!</p>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-600 text-xs text-slate-500">
          <p>Map data: OpenStreetMap contributors, Esri/ArcGIS</p>
          <p>Country borders: Natural Earth via GitHub datasets</p>
          <p className="mt-2">Mapitals - A geography guessing game</p>
        </div>
      </div>
    </div>
  )
}
