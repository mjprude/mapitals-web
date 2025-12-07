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
  if (wrongGuesses === 0) return '#FFD700'
  if (wrongGuesses <= 2) return '#22C55E'
  if (wrongGuesses <= 4) return '#F97316'
  return '#EF4444'
}

function createStarIcon(color: string): L.DivIcon {
  const svgStar = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="#000" stroke-width="1">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  `
  return L.divIcon({
    html: svgStar,
    className: 'star-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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
            <Tooltip direction="top" offset={[0, -12]} opacity={0.9}>
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
