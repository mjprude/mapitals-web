import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { Button } from '@/components/ui/button'
import { Flag } from 'lucide-react'

import { Region, Capital, StateCapital, CAPITALS, US_STATE_CAPITALS, REGION_ORDER } from './capitals'
import { useIsMobile } from './hooks/use-mobile'
import { MAX_WRONG_GUESSES, ADJUSTED_ZOOM_LEVELS } from './constants/game'
import { shuffleArray } from './utils/shuffle'
import { 
  GameMode,
  getTodayDateString,
  getDailyCapital,
  isDailyCompleted,
  markDailyCompleted,
  saveDailyResult,
  getDailyResult,
  areAllRegionsCompleted,
  getAllRegionResults,
  DailyResult
} from './utils/daily'
import { 
  MapController, 
  Header, 
  GameOverModal, 
  AllRegionsCompleteModal,
  InfoModal, 
  Keyboard, 
  GameDisplay,
  StarMarkers,
  CompletedCapital,
  StarCelebration
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
  const [showInfo, setShowInfo] = useState(() => {
    const hasSeenInfo = localStorage.getItem('mapitals-has-seen-info')
    return hasSeenInfo !== 'true'
  })
  const [shouldPan, setShouldPan] = useState(false)
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const keyboardRef = useRef<HTMLDivElement | null>(null)
  const hasGameInitializedRef = useRef(false)
  
  // Game mode: 'daily' (default) or 'practice'
  const [gameMode, setGameMode] = useState<GameMode>('daily')
  const [todayDate] = useState(() => getTodayDateString())
  const [dailyCompleted, setDailyCompleted] = useState(() => isDailyCompleted(region, getTodayDateString()))
  const [showAllRegionsComplete, setShowAllRegionsComplete] = useState(false)
  const [showStarCelebration, setShowStarCelebration] = useState(false)
  const [celebrationWrongGuesses, setCelebrationWrongGuesses] = useState(0)
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [pendingWinCelebration, setPendingWinCelebration] = useState(false)
  const [pendingLossModal, setPendingLossModal] = useState(false)
  const [pendingCompletedCapital, setPendingCompletedCapital] = useState<CompletedCapital | null>(null)
  const [allRegionResults, setAllRegionResults] = useState<Map<Region, DailyResult | null>>(new Map())
  const [completedCapitals, setCompletedCapitals] = useState<CompletedCapital[]>(() => {
    const saved = localStorage.getItem('mapitals-completed-capitals')
    return saved ? JSON.parse(saved) : []
  })
  const [showStars, setShowStars] = useState(() => {
    const saved = localStorage.getItem('mapitals-show-stars')
    return saved !== null ? saved === 'true' : true
  })
  const [showRegionHint, setShowRegionHint] = useState(() => {
    const saved = localStorage.getItem('mapitals-show-region-hint')
    return saved !== null ? saved === 'true' : false
  })

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

  // Load score and gamesPlayed from localStorage (mode-specific)
  const [dailyScore, setDailyScore] = useState(() => {
    const saved = localStorage.getItem('mapitals-daily-score')
    return saved ? parseInt(saved, 10) : 0
  })
  const [dailyGamesPlayed, setDailyGamesPlayed] = useState(() => {
    const saved = localStorage.getItem('mapitals-daily-games-played')
    return saved ? parseInt(saved, 10) : 0
  })
  const [practiceScore, setPracticeScore] = useState(() => {
    const saved = localStorage.getItem('mapitals-practice-score')
    return saved ? parseInt(saved, 10) : 0
  })
  const [practiceGamesPlayed, setPracticeGamesPlayed] = useState(() => {
    const saved = localStorage.getItem('mapitals-practice-games-played')
    return saved ? parseInt(saved, 10) : 0
  })

  // Current mode's score and games played
  const score = gameMode === 'daily' ? dailyScore : practiceScore
  const gamesPlayed = gameMode === 'daily' ? dailyGamesPlayed : practiceGamesPlayed
  const setScore = gameMode === 'daily' ? setDailyScore : setPracticeScore
  const setGamesPlayed = gameMode === 'daily' ? setDailyGamesPlayed : setPracticeGamesPlayed

  // Streak tracking (mode-specific)
  const [dailyCurrentStreak, setDailyCurrentStreak] = useState(() => {
    const saved = localStorage.getItem('mapitals-daily-current-streak')
    return saved ? parseInt(saved, 10) : 0
  })
  const [dailyBestStreak, setDailyBestStreak] = useState(() => {
    const saved = localStorage.getItem('mapitals-daily-best-streak')
    return saved ? parseInt(saved, 10) : 0
  })
  const [practiceCurrentStreak, setPracticeCurrentStreak] = useState(() => {
    const saved = localStorage.getItem('mapitals-practice-current-streak')
    return saved ? parseInt(saved, 10) : 0
  })
  const [practiceBestStreak, setPracticeBestStreak] = useState(() => {
    const saved = localStorage.getItem('mapitals-practice-best-streak')
    return saved ? parseInt(saved, 10) : 0
  })

  // Current mode's streaks
  const currentStreak = gameMode === 'daily' ? dailyCurrentStreak : practiceCurrentStreak
  const bestStreak = gameMode === 'daily' ? dailyBestStreak : practiceBestStreak
  const setCurrentStreak = gameMode === 'daily' ? setDailyCurrentStreak : setPracticeCurrentStreak
  const setBestStreak = gameMode === 'daily' ? setDailyBestStreak : setPracticeBestStreak

  const isUSStatesMode = region === 'US States'

  const capitalsForRegion = useMemo(() =>
    region === 'World' ? CAPITALS : CAPITALS.filter(c => c.region === region),
  [region]
  )

  // Save daily scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mapitals-daily-score', dailyScore.toString())
  }, [dailyScore])

  useEffect(() => {
    localStorage.setItem('mapitals-daily-games-played', dailyGamesPlayed.toString())
  }, [dailyGamesPlayed])

  // Save practice scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mapitals-practice-score', practiceScore.toString())
  }, [practiceScore])

  useEffect(() => {
    localStorage.setItem('mapitals-practice-games-played', practiceGamesPlayed.toString())
  }, [practiceGamesPlayed])

  // Save daily streaks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mapitals-daily-current-streak', dailyCurrentStreak.toString())
  }, [dailyCurrentStreak])

  useEffect(() => {
    localStorage.setItem('mapitals-daily-best-streak', dailyBestStreak.toString())
  }, [dailyBestStreak])

  // Save practice streaks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mapitals-practice-current-streak', practiceCurrentStreak.toString())
  }, [practiceCurrentStreak])

  useEffect(() => {
    localStorage.setItem('mapitals-practice-best-streak', practiceBestStreak.toString())
  }, [practiceBestStreak])

  // Save completed capitals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mapitals-completed-capitals', JSON.stringify(completedCapitals))
  }, [completedCapitals])

  // Save showStars to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapitals-show-stars', showStars.toString())
  }, [showStars])

  // Save showRegionHint to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapitals-show-region-hint', showRegionHint.toString())
  }, [showRegionHint])

  // Update dailyCompleted when region changes
  useEffect(() => {
    setDailyCompleted(isDailyCompleted(region, todayDate))
  }, [region, todayDate])

  const resetHistory = useCallback(() => {
    setCompletedCapitals([])
    // Reset both modes' stats
    setDailyScore(0)
    setDailyGamesPlayed(0)
    setDailyCurrentStreak(0)
    setDailyBestStreak(0)
    setPracticeScore(0)
    setPracticeGamesPlayed(0)
    setPracticeCurrentStreak(0)
    setPracticeBestStreak(0)
  }, [])

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
    // In daily mode, use the deterministic daily capital
    if (gameMode === 'daily') {
      const dailyCapital = getDailyCapital(region, todayDate)
      if (isUSStatesMode) {
        setCurrentStateCapital(dailyCapital as StateCapital)
        setCurrentCapital(null)
      } else {
        setCurrentCapital(dailyCapital as Capital)
        setCurrentStateCapital(null)
      }
      // Check if already completed and restore state if so
      const savedResult = getDailyResult(region, todayDate)
      if (savedResult) {
        setGuessedLetters(new Set(savedResult.guessedLetters))
        setWrongGuesses(savedResult.wrongGuesses)
        setGameOver(true)
        setWon(savedResult.won)
        setDailyCompleted(true)
      } else {
        setGuessedLetters(new Set())
        setWrongGuesses(0)
        setGameOver(false)
        setWon(false)
      }
    } else {
      // Practice mode: use shuffled capitals
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
    }
    setIsInitialLoad(true)
    setShouldPan(false)
    setTimeout(() => setIsInitialLoad(false), 100)
  }, [getNextCapital, getNextStateCapital, isUSStatesMode, gameMode, region, todayDate])

  // Handler for game over primary action (Next Region in daily mode, Play Again in practice mode)
  const handleGameOverPrimaryAction = useCallback(() => {
    if (gameMode === 'daily') {
      // Check if all regions are now complete
      if (areAllRegionsCompleted(todayDate, REGION_ORDER)) {
        const results = getAllRegionResults(todayDate, REGION_ORDER)
        setAllRegionResults(results)
        setShowAllRegionsComplete(true)
      } else {
        // In daily mode, cycle to the next region
        const index = REGION_ORDER.indexOf(region)
        const nextRegion = REGION_ORDER[(index + 1) % REGION_ORDER.length]
        setRegion(nextRegion) // The useEffect on region will call startNewGame
      }
    } else {
      // In practice mode, just start a new game in the same region
      startNewGame()
    }
  }, [gameMode, region, startNewGame, todayDate])

  // Handler for switching to practice mode from the all regions complete modal
  const handleTryPracticeMode = useCallback(() => {
    setShowAllRegionsComplete(false)
    setGameMode('practice')
  }, [])

  // Handler for when the star celebration animation completes
  const handleStarCelebrationComplete = useCallback(() => {
    setShowStarCelebration(false)
    // Add the completed capital to the map now that the animation is done
    if (pendingCompletedCapital) {
      setCompletedCapitals(prev => [...prev, pendingCompletedCapital])
      setPendingCompletedCapital(null)
    }
    setShowGameOverModal(true)
  }, [pendingCompletedCapital])

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

  // Start new game when game mode changes
  const prevGameModeRef = useRef<GameMode | null>(null)
  useEffect(() => {
    if (prevGameModeRef.current !== null && prevGameModeRef.current !== gameMode) {
      // Mode changed, start new game
      startNewGame()
    }
    prevGameModeRef.current = gameMode
  }, [gameMode, startNewGame])

  // Reset showOutline and other states when a new game starts
  useEffect(() => {
    if (!gameOver) {
      setShowOutline(false)
      setShowGameOverModal(false)
      setPendingWinCelebration(false)
      setPendingLossModal(false)
      setPendingCompletedCapital(null)
    }
  }, [gameOver])

  // When zoom completes (showOutline becomes true) and we have a pending win celebration,
  // start the star animation
  useEffect(() => {
    if (showOutline && pendingWinCelebration && won) {
      setPendingWinCelebration(false)
      setShowStarCelebration(true)
    }
  }, [showOutline, pendingWinCelebration, won])

  // When zoom completes (showOutline becomes true) and we have a pending loss modal,
  // show the game over modal
  useEffect(() => {
    if (showOutline && pendingLossModal && !won) {
      setPendingLossModal(false)
      setShowGameOverModal(true)
    }
  }, [showOutline, pendingLossModal, won])

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
        // Trigger the map zoom first, then show modal after zoom completes
        setPendingLossModal(true)
        setGameOver(true)
        setGamesPlayed(prev => prev + 1)
        // Reset streak on loss
        setCurrentStreak(0)
        // Save daily result if in daily mode
        if (gameMode === 'daily') {
          saveDailyResult(region, todayDate, {
            won: false,
            wrongGuesses: newWrongGuesses,
            guessedLetters: Array.from(newGuessedLetters)
          })
          markDailyCompleted(region, todayDate)
          setDailyCompleted(true)
        }
      }
    } else {
      const tempGuessed = new Set(newGuessedLetters)
      if (isWordCompleteWithSet(city, tempGuessed) &&
              isWordCompleteWithSet(regionName, tempGuessed)) {
        // First trigger the map zoom, then star animation, then modal
        setCelebrationWrongGuesses(wrongGuesses)
        setPendingWinCelebration(true)
        setGameOver(true) // This triggers the map zoom
        setWon(true)
        setScore(prev => prev + (MAX_WRONG_GUESSES - wrongGuesses))
        setGamesPlayed(prev => prev + 1)
        // Update streaks on win
        setCurrentStreak(prev => {
          const newStreak = prev + 1
          setBestStreak(best => Math.max(best, newStreak))
          return newStreak
        })
        // Store pending completed capital - will be added after star animation completes
        const lat = isUSStatesMode ? currentStateCapital?.lat : currentCapital?.lat
        const lng = isUSStatesMode ? currentStateCapital?.lng : currentCapital?.lng
        if (lat !== undefined && lng !== undefined) {
          setPendingCompletedCapital({
            lat,
            lng,
            city,
            wrongGuesses
          })
        }
        // Save daily result if in daily mode
        if (gameMode === 'daily') {
          saveDailyResult(region, todayDate, {
            won: true,
            wrongGuesses,
            guessedLetters: Array.from(newGuessedLetters)
          })
          markDailyCompleted(region, todayDate)
          setDailyCompleted(true)
        }
      }
    }
  }, [gameOver, guessedLetters, currentCapital, currentStateCapital, wrongGuesses, isUSStatesMode, gameMode, region, todayDate, setScore, setGamesPlayed, setCurrentStreak, setBestStreak])

  const handleGiveUp = useCallback(() => {
    if (gameOver) return
    // Trigger the map zoom first, then show modal after zoom completes
    setPendingLossModal(true)
    setGameOver(true)
    setWon(false)
    setGamesPlayed(prev => prev + 1)
    // Reset streak on give up
    setCurrentStreak(0)
    // Save daily result if in daily mode
    if (gameMode === 'daily') {
      saveDailyResult(region, todayDate, {
        won: false,
        wrongGuesses,
        guessedLetters: Array.from(guessedLetters)
      })
      markDailyCompleted(region, todayDate)
      setDailyCompleted(true)
    }
  }, [gameOver, gameMode, region, todayDate, wrongGuesses, guessedLetters, setGamesPlayed, setCurrentStreak])

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
    ? (currentStateCapital ? (gameOver || showRegionHint ? currentStateCapital.state : getDisplayText(currentStateCapital.state)) : '')
    : (currentCapital ? (gameOver || showRegionHint ? currentCapital.country : getDisplayText(currentCapital.country)) : '')

  return (
    <div className="min-h-screen-safe bg-slate-900 text-white">
      <div className="flex flex-col h-screen-safe">
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
          showStars={showStars}
          setShowStars={setShowStars}
          showRegionHint={showRegionHint}
          setShowRegionHint={setShowRegionHint}
          onResetHistory={resetHistory}
          gameMode={gameMode}
          setGameMode={setGameMode}
          dailyCompleted={dailyCompleted}
        />

        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-[#7751f8]">
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
              {showStars && <StarMarkers completedCapitals={completedCapitals} />}
            </MapContainer>
          </div>

          <div className={`${isMobile ? 'fixed top-2' : 'absolute top-4'} right-4 bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-2 rounded-xl backdrop-blur-sm flex items-center gap-2 shadow-lg shadow-rose-500/30`} style={{ zIndex: 1000 }}>
            <span className="text-white font-bold">
              {wrongGuesses} / {MAX_WRONG_GUESSES}
            </span>
            {!gameOver && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGiveUp}
                className="text-white/80 hover:text-white hover:bg-white/20 h-7 px-2 text-xs rounded-lg"
              >
                <Flag size={14} className="mr-1" />
                Give Up
              </Button>
            )}
          </div>

          {showStarCelebration && (
            <StarCelebration
              wrongGuesses={celebrationWrongGuesses}
              onAnimationComplete={handleStarCelebrationComplete}
            />
          )}

          {showGameOverModal && city && regionName && (
            <GameOverModal
              won={won}
              city={city}
              regionName={regionName}
              wrongGuesses={wrongGuesses}
              onPlayAgain={handleGameOverPrimaryAction}
              isUSStatesMode={isUSStatesMode}
              gameMode={gameMode}
              region={region}
              todayDate={todayDate}
              fadeIn={won}
            />
          )}

          {showAllRegionsComplete && (
            <AllRegionsCompleteModal
              todayDate={todayDate}
              results={allRegionResults}
              onTryPracticeMode={handleTryPracticeMode}
            />
          )}

          {showInfo && (
            <InfoModal onClose={() => {
              localStorage.setItem('mapitals-has-seen-info', 'true')
              setShowInfo(false)
            }} />
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-4" style={{ zIndex: 1000 }}>
            <div className="pointer-events-auto w-full flex flex-col gap-3">
              <GameDisplay
                isUSStatesMode={isUSStatesMode}
                displayCity={displayCity}
                displayRegion={displayRegion}
              />
            </div>

            <div className={`pointer-events-auto w-full ${isMobile ? 'pb-6' : 'max-w-4xl px-4'} mt-3`}>
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
