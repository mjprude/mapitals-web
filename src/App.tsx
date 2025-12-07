import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { Button } from '@/components/ui/button'
import { Flag } from 'lucide-react'

import { Region, Capital, StateCapital, CAPITALS, US_STATE_CAPITALS } from './capitals'
import { useIsMobile } from './hooks/use-mobile'
import { MAX_WRONG_GUESSES, ADJUSTED_ZOOM_LEVELS } from './constants/game'
import { shuffleArray } from './utils/shuffle'
import { 
  MapController, 
  Header, 
  GameOverModal, 
  InfoModal, 
  Keyboard, 
  GameDisplay 
} from './components/game'

function App() {
  const isMobile = useIsMobile()
  const [currentCapital, setCurrentCapital] = useState<Capital | null>(null)
  const [currentStateCapital, setCurrentStateCapital] = useState<StateCapital | null>(null)
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [countryGeoJson, setCountryGeoJson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [statesGeoJson, setStatesGeoJson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [region, setRegion] = useState<Region>('World')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [shouldPan, setShouldPan] = useState(false)
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const keyboardRef = useRef<HTMLDivElement | null>(null)
  const hasGameInitializedRef = useRef(false)

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

  // Streak tracking
  const [currentStreak, setCurrentStreak] = useState(() => {
    const saved = localStorage.getItem('mapitals-current-streak')
    return saved ? parseInt(saved, 10) : 0
  })
  const [bestStreak, setBestStreak] = useState(() => {
    const saved = localStorage.getItem('mapitals-best-streak')
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

  // Save streaks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mapitals-current-streak', currentStreak.toString())
  }, [currentStreak])

  useEffect(() => {
    localStorage.setItem('mapitals-best-streak', bestStreak.toString())
  }, [bestStreak])

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

  // Initialize game on first load (only once)
  useEffect(() => {
    if (hasGameInitializedRef.current) return
    
    // Wait for shuffled lists to be ready before starting
    if (!isUSStatesMode && shuffledCapitals.length > 0) {
      startNewGame()
      hasGameInitializedRef.current = true
    } else if (isUSStatesMode && shuffledStateCapitals.length > 0) {
      startNewGame()
      hasGameInitializedRef.current = true
    }
  }, [shuffledCapitals.length, shuffledStateCapitals.length, isUSStatesMode, startNewGame])

  // Start new game when region changes (after shuffle is done)
  const prevRegionRef = useRef<Region | null>(null)
  useEffect(() => {
    if (prevRegionRef.current !== null && prevRegionRef.current !== region) {
      // Region changed, start new game after a short delay to let shuffle complete
      setTimeout(() => startNewGame(), 50)
    }
    prevRegionRef.current = region
  }, [region, startNewGame])

  // Reset showOutline when a new game starts
  useEffect(() => {
    if (!gameOver) {
      setShowOutline(false)
    }
  }, [gameOver])

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => setCountryGeoJson(data))
      .catch(err => console.error('Failed to load country borders:', err))
  }, [])

  // Load US states GeoJSON from local file
  useEffect(() => {
    fetch('/data/us-states.json')
      .then(res => res.json())
      .then(data => setStatesGeoJson(data))
      .catch(err => console.error('Failed to load US state borders:', err))
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
        // Reset streak on loss
        setCurrentStreak(0)
      }
    } else {
      const tempGuessed = new Set(newGuessedLetters)
      if (isWordCompleteWithSet(city, tempGuessed) &&
          isWordCompleteWithSet(regionName, tempGuessed)) {
        setGameOver(true)
        setWon(true)
        setScore(prev => prev + (MAX_WRONG_GUESSES - wrongGuesses))
        setGamesPlayed(prev => prev + 1)
        // Update streaks on win
        setCurrentStreak(prev => {
          const newStreak = prev + 1
          setBestStreak(best => Math.max(best, newStreak))
          return newStreak
        })
      }
    }
  }, [gameOver, guessedLetters, currentCapital, currentStateCapital, wrongGuesses, isUSStatesMode])

  const handleGiveUp = useCallback(() => {
    if (gameOver) return
    setGameOver(true)
    setWon(false)
    setGamesPlayed(prev => prev + 1)
    // Reset streak on give up
    setCurrentStreak(0)
  }, [gameOver])

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

  const currentZoom = ADJUSTED_ZOOM_LEVELS[Math.min(wrongGuesses, ADJUSTED_ZOOM_LEVELS.length - 1)]

  const mapCenter = useMemo<[number, number]>(() => {
    return isUSStatesMode
      ? (currentStateCapital ? [currentStateCapital.lat, currentStateCapital.lng] : [0, 0])
      : (currentCapital ? [currentCapital.lat, currentCapital.lng] : [0, 0])
  }, [isUSStatesMode, currentStateCapital, currentCapital])

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

  const city = isUSStatesMode ? currentStateCapital?.city : currentCapital?.city
  const regionName = isUSStatesMode ? currentStateCapital?.state : currentCapital?.country

  const fullText = isUSStatesMode
    ? (currentStateCapital ? `${currentStateCapital.city}${currentStateCapital.state}`.toLowerCase() : '')
    : (currentCapital ? `${currentCapital.city}${currentCapital.country}`.toLowerCase() : '')

  const displayCity = isUSStatesMode
    ? (currentStateCapital ? (gameOver ? currentStateCapital.city : getDisplayText(currentStateCapital.city)) : '')
    : (currentCapital ? (gameOver ? currentCapital.city : getDisplayText(currentCapital.city)) : '')

  const displayRegion = isUSStatesMode
    ? (currentStateCapital ? (gameOver ? currentStateCapital.state : getDisplayText(currentStateCapital.state)) : '')
    : (currentCapital ? (gameOver ? currentCapital.country : getDisplayText(currentCapital.country)) : '')

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex flex-col h-screen">
        <Header
          region={region}
          setRegion={setRegion}
          onOpenChange={handleOpenChange}
          score={score}
          gamesPlayed={gamesPlayed}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          isMobile={isMobile}
          onShowInfo={() => setShowInfo(true)}
        />

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
              {gameOver && showOutline && countryGeoJson && currentCapital && !isUSStatesMode && (
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
              <MapController 
                zoom={currentZoom} 
                center={mapCenter} 
                isInitial={isInitialLoad} 
                shouldPan={shouldPan} 
                setShouldPan={setShouldPan}
                gameOver={gameOver} 
                isUSStatesMode={isUSStatesMode}
                countryGeoJson={countryGeoJson}
                statesGeoJson={statesGeoJson}
                targetName={isUSStatesMode ? currentStateCapital?.state ?? null : currentCapital?.country ?? null}
                setShowOutline={setShowOutline}
              />
            </MapContainer>
          </div>

          <div className="absolute top-4 left-4 bg-slate-900/80 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-3" style={{ zIndex: 1000 }}>
            <span className="text-red-400 font-bold">
              Wrong guesses: {wrongGuesses} / {MAX_WRONG_GUESSES}
            </span>
            {!gameOver && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGiveUp}
                className="text-slate-400 hover:text-white hover:bg-slate-700 h-7 px-2 text-xs"
              >
                <Flag size={14} className="mr-1" />
                Give Up
              </Button>
            )}
          </div>

          {gameOver && city && regionName && (
            <GameOverModal
              won={won}
              city={city}
              regionName={regionName}
              wrongGuesses={wrongGuesses}
              onPlayAgain={startNewGame}
            />
          )}

          {showInfo && (
            <InfoModal onClose={() => setShowInfo(false)} />
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4" style={{ zIndex: 1000 }}>
            <div className="pointer-events-auto w-full max-w-4xl px-4 flex flex-col gap-3">
              <GameDisplay
                isUSStatesMode={isUSStatesMode}
                displayCity={displayCity}
                displayRegion={displayRegion}
              />

              <Keyboard
                ref={keyboardRef}
                guessedLetters={guessedLetters}
                gameOver={gameOver}
                fullText={fullText}
                isMobile={isMobile}
                onGuess={handleGuess}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
