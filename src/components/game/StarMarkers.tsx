import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'

export interface CompletedCapital {
  lat: number
  lng: number
  city: string
  wrongGuesses: number
}

interface StarMarkersProps {
  completedCapitals: CompletedCapital[]
}

function getStarColor(wrongGuesses: number): string {
  if (wrongGuesses === 0) return '#D4AF37'
  if (wrongGuesses <= 2) return '#22C55E'
  if (wrongGuesses <= 4) return '#F97316'
  return '#EF4444'
}

function createStarIcon(color: string): L.DivIcon {
  const isGold = color === '#D4AF37'
  const gradientId = isGold ? 'goldGradient' : ''
  const fillValue = isGold ? 'url(#goldGradient)' : color
  const svgStar = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${fillValue}" stroke="#000" stroke-width="1">
      ${isGold ? `<defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5E6A3"/>
          <stop offset="50%" style="stop-color:#D4AF37"/>
          <stop offset="100%" style="stop-color:#996515"/>
        </linearGradient>
      </defs>` : ''}
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  `
  return L.divIcon({
    html: svgStar,
    className: 'star-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

export function StarMarkers({ completedCapitals }: StarMarkersProps) {
  return (
    <>
      {completedCapitals.map((capital, index) => {
        const color = getStarColor(capital.wrongGuesses)
        const icon = createStarIcon(color)
        const guessText = capital.wrongGuesses === 0 
          ? 'Perfect! No wrong guesses' 
          : `${capital.wrongGuesses} wrong guess${capital.wrongGuesses === 1 ? '' : 'es'}`
        
        return (
          <Marker
            key={`${capital.city}-${capital.lat}-${capital.lng}-${index}`}
            position={[capital.lat, capital.lng]}
            icon={icon}
          >
            <Tooltip direction="top" offset={[0, -9]} opacity={0.9}>
              <div className="text-center">
                <div className="font-semibold">{capital.city}</div>
                <div className="text-sm">{guessText}</div>
              </div>
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}
