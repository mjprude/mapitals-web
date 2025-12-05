import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info, X } from 'lucide-react'

import { Region, Capital, StateCapital, CAPITALS, US_STATE_CAPITALS } from './capitals'

const MAX_WRONG_GUESSES = 6

function MapController({ zoom, center, isInitial, shouldPan, gameOver, isUSStatesMode }: { zoom: number; center: [number, number]; isInitial: boolean; shouldPan: boolean; gameOver: boolean; isUSStatesMode: boolean }) {
  const map = useMap()
  const hasInitialized = useRef(false)
  
  // US center coordinates (roughly center of continental US)
  const US_CENTER: [number, number] = [39.8, -98.5]
  
  useEffect(() => {
    if (!hasInitialized.current || isInitial) {
      // Initial load: center on 0,0 for world, or US center for US States mode (same zoom level)
      const initialCenter = isUSStatesMode ? US_CENTER : [0, 0] as [number, number]
      map.setView(initialCenter, zoom, { animate: false })
      hasInitialized.current = true
    } else if (shouldPan && !gameOver) {
      // On wrong guess: pan to location (keep same zoom)
      map.flyTo(center, zoom, { duration: 2, easeLinearity: 0.2 })
    } else if (gameOver) {
      // On game over: pan to final location
      map.flyTo(center, zoom, { duration: 1, easeLinearity: 0.2 })
    }
  }, [zoom, center, map, isInitial, shouldPan, gameOver, isUSStatesMode])

  // Enable/disable map interactivity based on game state
  useEffect(() => {
    if (gameOver) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
      map.touchZoom.enable()
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
      map.touchZoom.disable()
    }
  }, [gameOver, map])

  return null
}

// Fisher-Yates shuffle function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function App() {
  const [currentCapital, setCurrentCapital] = useState<Capital | null>(null)
  const [currentStateCapital, setCurrentStateCapital] = useState<StateCapital | null>(null)
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [countryGeoJson, setCountryGeoJson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [region, setRegion] = useState<Region>('World')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [shouldPan, setShouldPan] = useState(false)
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false)
  const keyboardRef = useRef<HTMLDivElement | null>(null)

  const handleOpenChange = (open: boolean) => {
    setIsRegionMenuOpen(open)
    if (!open) {
      setTimeout(() => {
        keyboardRef.current?.focus()
      }, 0)
    }
  }
  
  // Shuffled lists and indices for each category to avoid repeats
  const [shuffledCapitals, setShuffledCapitals] = useState<Capital[]>([])
  const [shuffledStateCapitals, setShuffledStateCapitals] = useState<StateCapital[]>([])
  const [capitalIndex, setCapitalIndex] = useState(0)
  const [stateCapitalIndex, setStateCapitalIndex] = useState(0)
  
  // Load score and gamesPlayed from localStorage
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('mapitals-score')
    return saved ? parseInt(saved, 10) : 0
  })
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    const saved = localStorage.getItem('mapitals-games-played')
    return saved ? parseInt(saved, 10) : 0
  })

  const isUSStatesMode = region === 'US States'

  const capitalsForRegion = useMemo(() => 
    region === 'World' ? CAPITALS : CAPITALS.filter(c => c.region === region),
  [region]
  )

  // Save score to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapitals-score', score.toString())
  }, [score])

  // Save gamesPlayed to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapitals-games-played', gamesPlayed.toString())
  }, [gamesPlayed])

  // Shuffle capitals when region changes (for non-US States modes)
  useEffect(() => {
    if (!isUSStatesMode) {
      setShuffledCapitals(shuffleArray(capitalsForRegion))
      setCapitalIndex(0)
    }
  }, [region, capitalsForRegion, isUSStatesMode])

  // Shuffle state capitals when switching to US States mode
  useEffect(() => {
    if (isUSStatesMode) {
      setShuffledStateCapitals(shuffleArray(US_STATE_CAPITALS))
      setStateCapitalIndex(0)
    }
  }, [isUSStatesMode])

  const getNextCapital = useCallback(() => {
    if (shuffledCapitals.length === 0) return CAPITALS[0]
    // If we've gone through all capitals, reshuffle
    if (capitalIndex >= shuffledCapitals.length) {
      const newShuffled = shuffleArray(capitalsForRegion)
      setShuffledCapitals(newShuffled)
      setCapitalIndex(1)
      return newShuffled[0]
    }
    const capital = shuffledCapitals[capitalIndex]
    setCapitalIndex(prev => prev + 1)
    return capital
  }, [shuffledCapitals, capitalIndex, capitalsForRegion])

  const getNextStateCapital = useCallback(() => {
    if (shuffledStateCapitals.length === 0) return US_STATE_CAPITALS[0]
    // If we've gone through all state capitals, reshuffle
    if (stateCapitalIndex >= shuffledStateCapitals.length) {
      const newShuffled = shuffleArray(US_STATE_CAPITALS)
      setShuffledStateCapitals(newShuffled)
      setStateCapitalIndex(1)
      return newShuffled[0]
    }
    const stateCapital = shuffledStateCapitals[stateCapitalIndex]
    setStateCapitalIndex(prev => prev + 1)
    return stateCapital
  }, [shuffledStateCapitals, stateCapitalIndex])

  const startNewGame = useCallback(() => {
    if (isUSStatesMode) {
      setCurrentStateCapital(getNextStateCapital())
      setCurrentCapital(null)
    } else {
      setCurrentCapital(getNextCapital())
      setCurrentStateCapital(null)
    }
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setGameOver(false)
    setWon(false)
    setIsInitialLoad(true)
    setShouldPan(false)
    setTimeout(() => setIsInitialLoad(false), 100)
  }, [getNextCapital, getNextStateCapital, isUSStatesMode])

  // Initialize game on first load
  useEffect(() => {
    // Wait for shuffled lists to be ready before starting
    if (!isUSStatesMode && shuffledCapitals.length > 0) {
      startNewGame()
    } else if (isUSStatesMode && shuffledStateCapitals.length > 0) {
      startNewGame()
    }
  }, [shuffledCapitals.length, shuffledStateCapitals.length])

  // Start new game when region changes (after shuffle is done)
  const prevRegionRef = useRef<Region | null>(null)
  useEffect(() => {
    if (prevRegionRef.current !== null && prevRegionRef.current !== region) {
      // Region changed, start new game after a short delay to let shuffle complete
      setTimeout(() => startNewGame(), 50)
    }
    prevRegionRef.current = region
  }, [region, startNewGame])

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => setCountryGeoJson(data))
      .catch(err => console.error('Failed to load country borders:', err))
  }, [])

  const getDisplayText = (text: string) => {
    return text.split('').map(char => {
      if (char === ' ' || char === '.' || char === '-' || char === "'" || char === ',') return char
      if (guessedLetters.has(char.toLowerCase())) return char
      return '_'
    }).join('')
  }

  const isWordCompleteWithSet = (text: string, letterSet: Set<string>) => {
    return text.split('').every(char => {
      if (char === ' ' || char === '.' || char === '-' || char === "'" || char === ',') return true
      return letterSet.has(char.toLowerCase())
    })
  }

  const handleGuess = useCallback((letter: string) => {
    if (gameOver || guessedLetters.has(letter.toLowerCase())) return
    
    const newGuessedLetters = new Set(guessedLetters)
    newGuessedLetters.add(letter.toLowerCase())
    setGuessedLetters(newGuessedLetters)

    const city = isUSStatesMode ? currentStateCapital?.city : currentCapital?.city
    const regionName = isUSStatesMode ? currentStateCapital?.state : currentCapital?.country

    if (!city || !regionName) return

    const fullText = `${city}${regionName}`.toLowerCase()
    if (!fullText.includes(letter.toLowerCase())) {
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)
      setShouldPan(true)
      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setGameOver(true)
        setGamesPlayed(prev => prev + 1)
      }
    } else {
      const tempGuessed = new Set(newGuessedLetters)
      if (isWordCompleteWithSet(city, tempGuessed) && 
          isWordCompleteWithSet(regionName, tempGuessed)) {
        setGameOver(true)
        setWon(true)
        setScore(prev => prev + (MAX_WRONG_GUESSES - wrongGuesses))
        setGamesPlayed(prev => prev + 1)
      }
    }
  }, [gameOver, guessedLetters, currentCapital, currentStateCapital, wrongGuesses, isUSStatesMode])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses while the region dropdown is open
      if (isRegionMenuOpen) return
      
      const el = document.activeElement as HTMLElement | null
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const raw = e.key
      if (raw.length !== 1) return // Ignore multi-character keys like 'Enter', 'ArrowLeft', etc.

      const key = raw.toUpperCase()
      if (key >= 'A' && key <= 'Z') {
        e.preventDefault()
        handleGuess(key)
      }
    }

    if (!gameOver) {
      window.addEventListener('keydown', onKeyDown)
    }

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameOver, handleGuess, isRegionMenuOpen])

  // Keep zoom constant - first two levels are the same so first wrong guess only pans
  const ADJUSTED_ZOOM_LEVELS = [2, 2, 3, 3.5, 4, 5, 6]
  const currentZoom = ADJUSTED_ZOOM_LEVELS[Math.min(wrongGuesses, ADJUSTED_ZOOM_LEVELS.length - 1)]
  
  const mapCenter: [number, number] = isUSStatesMode
    ? (currentStateCapital ? [currentStateCapital.lat, currentStateCapital.lng] : [0, 0])
    : (currentCapital ? [currentCapital.lat, currentCapital.lng] : [0, 0])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const tileUrl = gameOver
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

  const getCountryStyle = () => ({
    fillColor: '#ff6b6b',
    weight: 3,
    opacity: 1,
    color: '#ff6b6b',
    fillOpacity: 0.2
  })

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex flex-col h-screen">
        <header className="bg-slate-800/90 p-3 shadow-lg z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-emerald-400">Mapitals</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(true)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 p-2"
              >
                <Info size={20} />
              </Button>
              <Select 
                value={region} 
                onValueChange={(value) => setRegion(value as Region)}
                onOpenChange={handleOpenChange}
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
              <span className="text-sm">Score: <span className="text-emerald-400 font-bold">{score}</span></span>
              <span className="text-sm">Games: <span className="text-emerald-400 font-bold">{gamesPlayed}</span></span>
            </div>
          </div>
        </header>

        <main className="flex-1 relative">
          <div className="absolute inset-0">
            <MapContainer
              center={[0, 0]}
              zoom={2}
              className="h-full w-full"
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              zoomSnap={0.5}
            >
              <TileLayer
                key={gameOver ? 'political' : 'satellite'}
                url={tileUrl}
              />
              {gameOver && countryGeoJson && currentCapital && !isUSStatesMode && (
                <GeoJSON 
                  key={currentCapital.country}
                  data={countryGeoJson}
                  style={getCountryStyle}
                  filter={(feature) => {
                    const countryName = feature.properties?.ADMIN || feature.properties?.name
                    return countryName?.toLowerCase() === currentCapital.country.toLowerCase()
                  }}
                />
              )}
              <MapController zoom={currentZoom} center={mapCenter} isInitial={isInitialLoad} shouldPan={shouldPan} gameOver={gameOver} isUSStatesMode={isUSStatesMode} />
            </MapContainer>
          </div>
            
          <div className="absolute top-4 left-4 bg-slate-900/80 px-4 py-2 rounded-lg backdrop-blur-sm" style={{ zIndex: 1000 }}>
            <span className="text-red-400 font-bold">
              Wrong guesses: {wrongGuesses} / {MAX_WRONG_GUESSES}
            </span>
          </div>

          {gameOver && (
            <div className="absolute inset-x-0 top-16 flex justify-center" style={{ zIndex: 1001 }}>
              <div className="bg-slate-800/95 border border-slate-600 text-white max-w-md rounded-xl p-6 backdrop-blur-sm mx-4">
                <h2 className={`text-2xl font-bold mb-4 ${won ? "text-emerald-400" : "text-red-400"}`}>
                  {won ? "Congratulations!" : "Game Over!"}
                </h2>
                <p className="text-xl mb-2">
                  The answer was: <span className="font-bold text-emerald-400">{isUSStatesMode ? currentStateCapital?.city : currentCapital?.city}</span>, <span className="font-bold text-amber-400">{isUSStatesMode ? currentStateCapital?.state : currentCapital?.country}</span>
                </p>
                {won && (
                  <p className="text-lg mb-4">
                    Points earned: <span className="text-emerald-400 font-bold">+{MAX_WRONG_GUESSES - wrongGuesses}</span>
                  </p>
                )}
                <Button 
                  onClick={startNewGame}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}

          {showInfo && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 1002 }}>
              <div className="bg-slate-800/95 border border-slate-600 text-white max-w-lg rounded-xl p-6 backdrop-blur-sm mx-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(false)}
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
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4" style={{ zIndex: 1000 }}>
            <div className="pointer-events-auto w-full max-w-4xl px-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 flex-1">
                  <p className="text-emerald-400 text-sm font-semibold mb-1">{isUSStatesMode ? 'State Capital' : 'Capital City'}</p>
                  <p className="text-xl sm:text-2xl font-mono tracking-widest text-white">
                    {isUSStatesMode 
                      ? (currentStateCapital ? (gameOver ? currentStateCapital.city : getDisplayText(currentStateCapital.city)) : '')
                      : (currentCapital ? (gameOver ? currentCapital.city : getDisplayText(currentCapital.city)) : '')}
                  </p>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 flex-1">
                  <p className="text-amber-400 text-sm font-semibold mb-1">{isUSStatesMode ? 'State' : 'Country'}</p>
                  <p className="text-xl sm:text-2xl font-mono tracking-widest text-white">
                    {isUSStatesMode
                      ? (currentStateCapital ? (gameOver ? currentStateCapital.state : getDisplayText(currentStateCapital.state)) : '')
                      : (currentCapital ? (gameOver ? currentCapital.country : getDisplayText(currentCapital.country)) : '')}
                  </p>
                </div>
              </div>

              <div ref={keyboardRef} tabIndex={-1} className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 py-2 outline-none" aria-label="Guess a letter">
                <div className="flex flex-wrap justify-center gap-1">
                  {alphabet.map(letter => {
                    const isGuessed = guessedLetters.has(letter.toLowerCase())
                    const fullText = isUSStatesMode
                      ? (currentStateCapital ? `${currentStateCapital.city}${currentStateCapital.state}`.toLowerCase() : '')
                      : (currentCapital ? `${currentCapital.city}${currentCapital.country}`.toLowerCase() : '')
                    const isCorrect = fullText.includes(letter.toLowerCase())
                    
                    return (
                      <Button
                        key={letter}
                        onClick={() => handleGuess(letter)}
                        disabled={isGuessed || gameOver}
                        variant="outline"
                        className={`
                          h-7 w-7 sm:h-8 sm:w-8 p-0 font-bold text-xs sm:text-sm
                          ${isGuessed 
                        ? isCorrect 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'bg-red-600 border-red-600 text-white'
                        : 'bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600'
                      }
                        `}
                      >
                        {letter}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
