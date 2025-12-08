/// <reference types="vitest-axe/extend-expect" />

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Header } from './components/game/Header'
import { Keyboard } from './components/game/Keyboard'
import { GameOverModal } from './components/game/GameOverModal'
import { GameDisplay } from './components/game/GameDisplay'

describe('Accessibility Tests', () => {
  describe('Header component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Header
          region="World"
          setRegion={() => {}}
          onOpenChange={() => {}}
          score={100}
          gamesPlayed={10}
          currentStreak={5}
          bestStreak={10}
          isMobile={false}
          onShowInfo={() => {}}
          showStars={true}
          setShowStars={() => {}}
          onResetHistory={() => {}}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Keyboard
          guessedLetters={new Set(['a', 'e'])}
          gameOver={false}
          fullText="paris france"
          isMobile={false}
          onGuess={() => {}}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations when game is over', async () => {
      const { container } = render(
        <Keyboard
          guessedLetters={new Set(['a', 'e', 'i', 'o', 'u'])}
          gameOver={true}
          fullText="paris france"
          isMobile={false}
          onGuess={() => {}}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('GameOverModal component', () => {
    it('should have no accessibility violations when won', async () => {
      const { container } = render(
        <GameOverModal
          won={true}
          city="Paris"
          regionName="France"
          wrongGuesses={2}
          onPlayAgain={() => {}}
          isUSStatesMode={false}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations when lost', async () => {
      const { container } = render(
        <GameOverModal
          won={false}
          city="Tokyo"
          regionName="Japan"
          wrongGuesses={6}
          onPlayAgain={() => {}}
          isUSStatesMode={false}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('GameDisplay component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <GameDisplay
          displayCity="P_r_s"
          displayRegion="Fr_nc_"
          isUSStatesMode={false}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in US States mode', async () => {
      const { container } = render(
        <GameDisplay
          displayCity="S_cr_m_nt_"
          displayRegion="C_l_f_rn__"
          isUSStatesMode={true}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

})
