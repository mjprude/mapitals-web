import { describe, expect, it } from 'vitest'
import { matchesTargetName, normalizeMapName } from '@/utils/mapNameMatching'

describe('MapController name matching', () => {
  it('normalizes accents and punctuation', () => {
    expect(normalizeMapName('São Tomé and Principe')).toBe('sao tome and principe')
    expect(normalizeMapName('Timor-Leste')).toBe('timor leste')
  })

  it('matches known GeoJSON country aliases', () => {
    expect(matchesTargetName('United Republic of Tanzania', 'Tanzania', false)).toBe(true)
    expect(matchesTargetName('The Bahamas', 'Bahamas', false)).toBe(true)
    expect(matchesTargetName('Czechia', 'Czech Republic', false)).toBe(true)
    expect(matchesTargetName('East Timor', 'Timor-Leste', false)).toBe(true)
  })

  it('does not over-match in US states mode', () => {
    expect(matchesTargetName('New York', 'York', true)).toBe(false)
  })
})
