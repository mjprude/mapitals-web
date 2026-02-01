import { describe, it, expect } from 'vitest'
import { CAPITALS, US_STATE_CAPITALS, Capital, StateCapital, Region } from './capitals'

describe('CAPITALS data', () => {
  it('should have a non-empty array of capitals', () => {
    expect(CAPITALS.length).toBeGreaterThan(0)
  })

  it('should have valid structure for each capital', () => {
    CAPITALS.forEach((capital: Capital) => {
      expect(capital).toHaveProperty('city')
      expect(capital).toHaveProperty('country')
      expect(capital).toHaveProperty('lat')
      expect(capital).toHaveProperty('lng')
      expect(capital).toHaveProperty('region')
    })
  })

  it('should have non-empty city names', () => {
    CAPITALS.forEach((capital: Capital) => {
      expect(capital.city.length).toBeGreaterThan(0)
    })
  })

  it('should have non-empty country names', () => {
    CAPITALS.forEach((capital: Capital) => {
      expect(capital.country.length).toBeGreaterThan(0)
    })
  })

  it('should have valid latitude values (-90 to 90)', () => {
    CAPITALS.forEach((capital: Capital) => {
      expect(capital.lat).toBeGreaterThanOrEqual(-90)
      expect(capital.lat).toBeLessThanOrEqual(90)
    })
  })

  it('should have valid longitude values (-180 to 180)', () => {
    CAPITALS.forEach((capital: Capital) => {
      expect(capital.lng).toBeGreaterThanOrEqual(-180)
      expect(capital.lng).toBeLessThanOrEqual(180)
    })
  })

  it('should have valid region values', () => {
    const validRegions: Exclude<Region, 'World' | 'US States'>[] = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']
    CAPITALS.forEach((capital: Capital) => {
      expect(validRegions).toContain(capital.region)
    })
  })

  it('should have unique city-country combinations', () => {
    const combinations = CAPITALS.map(c => `${c.city}-${c.country}`)
    const uniqueCombinations = new Set(combinations)
    expect(uniqueCombinations.size).toBe(combinations.length)
  })

  it('should have capitals from all regions', () => {
    const regions = new Set(CAPITALS.map(c => c.region))
    expect(regions.has('Americas')).toBe(true)
    expect(regions.has('Europe')).toBe(true)
    expect(regions.has('Asia')).toBe(true)
    expect(regions.has('Africa')).toBe(true)
    expect(regions.has('Oceania')).toBe(true)
  })

  it('should include well-known capitals', () => {
    const cities = CAPITALS.map(c => c.city)
    expect(cities).toContain('Paris')
    expect(cities).toContain('London')
    expect(cities).toContain('Tokyo')
    expect(cities).toContain('Berlin')
  })

  it('should correctly classify Oceania countries', () => {
    const oceaniaCountries = CAPITALS.filter(c => c.region === 'Oceania')
    const oceaniaCountryNames = oceaniaCountries.map(c => c.country)
    
    // Verify known Oceania countries are in the Oceania region
    expect(oceaniaCountryNames).toContain('Australia')
    expect(oceaniaCountryNames).toContain('New Zealand')
    expect(oceaniaCountryNames).toContain('Papua New Guinea')
    expect(oceaniaCountryNames).toContain('Fiji')
    expect(oceaniaCountryNames).toContain('Timor-Leste')
  })

  it('should not have Oceania countries in Asia region', () => {
    const asiaCountries = CAPITALS.filter(c => c.region === 'Asia')
    const asiaCountryNames = asiaCountries.map(c => c.country)
    
    // Verify Oceania countries are not in Asia
    expect(asiaCountryNames).not.toContain('Timor-Leste')
    expect(asiaCountryNames).not.toContain('Australia')
    expect(asiaCountryNames).not.toContain('New Zealand')
    expect(asiaCountryNames).not.toContain('Papua New Guinea')
    expect(asiaCountryNames).not.toContain('Fiji')
  })
})

describe('US_STATE_CAPITALS data', () => {
  it('should have exactly 50 state capitals', () => {
    expect(US_STATE_CAPITALS.length).toBe(50)
  })

  it('should have valid structure for each state capital', () => {
    US_STATE_CAPITALS.forEach((capital: StateCapital) => {
      expect(capital).toHaveProperty('city')
      expect(capital).toHaveProperty('state')
      expect(capital).toHaveProperty('lat')
      expect(capital).toHaveProperty('lng')
    })
  })

  it('should have non-empty city names', () => {
    US_STATE_CAPITALS.forEach((capital: StateCapital) => {
      expect(capital.city.length).toBeGreaterThan(0)
    })
  })

  it('should have non-empty state names', () => {
    US_STATE_CAPITALS.forEach((capital: StateCapital) => {
      expect(capital.state.length).toBeGreaterThan(0)
    })
  })

  it('should have valid latitude values for US (roughly 24 to 72)', () => {
    US_STATE_CAPITALS.forEach((capital: StateCapital) => {
      expect(capital.lat).toBeGreaterThanOrEqual(18)
      expect(capital.lat).toBeLessThanOrEqual(72)
    })
  })

  it('should have valid longitude values for US (roughly -180 to -65)', () => {
    US_STATE_CAPITALS.forEach((capital: StateCapital) => {
      expect(capital.lng).toBeGreaterThanOrEqual(-180)
      expect(capital.lng).toBeLessThanOrEqual(-65)
    })
  })

  it('should have unique state names', () => {
    const states = US_STATE_CAPITALS.map(c => c.state)
    const uniqueStates = new Set(states)
    expect(uniqueStates.size).toBe(states.length)
  })

  it('should include well-known state capitals', () => {
    const cities = US_STATE_CAPITALS.map(c => c.city)
    expect(cities).toContain('Sacramento')
    expect(cities).toContain('Austin')
    expect(cities).toContain('Albany')
    expect(cities).toContain('Tallahassee')
  })

  it('should include all major states', () => {
    const states = US_STATE_CAPITALS.map(c => c.state)
    expect(states).toContain('California')
    expect(states).toContain('Texas')
    expect(states).toContain('New York')
    expect(states).toContain('Florida')
    expect(states).toContain('Alaska')
    expect(states).toContain('Hawaii')
  })
})
