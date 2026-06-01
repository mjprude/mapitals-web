import { describe, expect, it } from 'vitest'
import { getFallbackGameOverZoom } from './mapZoom'

describe('getFallbackGameOverZoom', () => {
  it('ensures a minimum zoom for game-over fallback paths', () => {
    expect(getFallbackGameOverZoom(2)).toBe(5)
    expect(getFallbackGameOverZoom(4.5)).toBe(5)
    expect(getFallbackGameOverZoom(6)).toBe(6)
  })
})
