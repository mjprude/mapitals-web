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
    expect(matchesTargetName('Cabo Verde', 'Cape Verde', false)).toBe(true)
    expect(matchesTargetName('Czechia', 'Czech Republic', false)).toBe(true)
    expect(matchesTargetName('Federated States of Micronesia', 'Micronesia', false)).toBe(true)
    expect(matchesTargetName('Republic of Serbia', 'Serbia', false)).toBe(true)
    expect(matchesTargetName('East Timor', 'Timor-Leste', false)).toBe(true)
    expect(matchesTargetName('United States of America', 'United States', false)).toBe(true)
    expect(matchesTargetName('Vatican', 'Vatican City', false)).toBe(true)
  })

  it('does not over-match in US states mode', () => {
    expect(matchesTargetName('New York', 'York', true)).toBe(false)
  })
})
