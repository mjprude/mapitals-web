import { forwardRef, useEffect } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  GeoJSON: () => null,
}))

vi.mock('./utils/daily', async () => {
  const actual = await vi.importActual<typeof import('./utils/daily')>('./utils/daily')
  return {
    ...actual,
    areAllRegionsCompleted: vi.fn(() => false),
  }
})

vi.mock('./components/game', () => ({
  Header: ({ region }: { region: string }) => <div data-testid="region-label">{region}</div>,
  GameDisplay: () => null,
  StarMarkers: () => null,
  InfoModal: () => null,
  AllRegionsCompleteModal: () => <div>All regions complete</div>,
  Keyboard: forwardRef<HTMLButtonElement, { onGuess: (letter: string) => void; fullText: string }>(
    ({ onGuess, fullText }, ref) => (
      <button
        ref={ref}
        data-testid="complete-answer"
        data-full-text={fullText}
        onClick={() => {
          const letters = new Set(
            fullText
              .toLowerCase()
              .split('')
              .filter(char => ![' ', '.', '-', "'", ','].includes(char))
          )
          letters.forEach(letter => onGuess(letter))
        }}
      >
        Complete Answer
      </button>
    )
  ),
  MapController: ({
    gameOver,
    setShowOutline,
  }: {
    gameOver: boolean
    setShowOutline: (show: boolean) => void
  }) => {
    useEffect(() => {
      if (gameOver) {
        setShowOutline(true)
      }
    }, [gameOver, setShowOutline])
    return null
  },
  StarCelebration: ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    useEffect(() => {
      onAnimationComplete()
    }, [onAnimationComplete])
    return null
  },
  GameOverModal: ({ onPlayAgain }: { onPlayAgain: () => void }) => (
    <div data-testid="game-over-modal">
      <button onClick={onPlayAgain}>Next Region</button>
    </div>
  ),
}))

describe('App daily region advancement', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ features: [] }) })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hides game over modal immediately when continuing to the next region', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('complete-answer').getAttribute('data-full-text')).toBeTruthy()
    })
    fireEvent.click(screen.getByRole('button', { name: /give up/i }))
    expect(await screen.findByTestId('game-over-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next region/i }))

    expect(screen.queryByTestId('game-over-modal')).not.toBeInTheDocument()
  })
})
