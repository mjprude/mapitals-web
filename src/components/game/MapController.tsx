import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { US_CENTER } from '@/constants/game'

export interface MapControllerProps {
  zoom: number
  center: [number, number]
  isInitial: boolean
  shouldPan: boolean
  setShouldPan: (value: boolean) => void
  gameOver: boolean
  isUSStatesMode: boolean
  countryGeoJson: GeoJSON.FeatureCollection | null
  statesGeoJson: GeoJSON.FeatureCollection | null
  targetName: string | null
  setShowOutline: (value: boolean) => void
}

export function MapController({ 
  zoom, 
  center, 
  isInitial, 
  shouldPan, 
  setShouldPan, 
  gameOver, 
  isUSStatesMode, 
  countryGeoJson, 
  statesGeoJson, 
  targetName, 
  setShowOutline 
}: MapControllerProps) {
  const map = useMap()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current || isInitial) {
      const initialCenter = isUSStatesMode ? US_CENTER : [0, 0] as [number, number]
      map.setView(initialCenter, zoom, { animate: false })
      hasInitialized.current = true
    } else if (shouldPan && !gameOver) {
      map.flyTo(center, zoom, { duration: 2, easeLinearity: 0.2 })
      setShouldPan(false)
    } else if (gameOver && targetName) {
      setShowOutline(false)
      const geoJson = isUSStatesMode ? statesGeoJson : countryGeoJson
      if (geoJson) {
        const feature = geoJson.features.find(f => {
          if (isUSStatesMode) {
            const stateName = f.properties?.NAME || f.properties?.name
            return stateName?.toLowerCase() === targetName.toLowerCase()
          } else {
            const countryName = f.properties?.ADMIN || f.properties?.name
            return countryName?.toLowerCase() === targetName.toLowerCase()
          }
        })
        
        if (feature) {
          const geoJsonLayer = L.geoJSON(feature)
          const bounds = geoJsonLayer.getBounds()
          const boundsZoom = map.getBoundsZoom(bounds)
          const targetZoom = Math.min(boundsZoom, 10)
          map.once('moveend', () => setShowOutline(true))
          map.flyTo(center, targetZoom, { duration: 1.5, easeLinearity: 0.2 })
        } else {
          map.once('moveend', () => setShowOutline(true))
          map.flyTo(center, zoom, { duration: 1, easeLinearity: 0.2 })
        }
      } else {
        map.once('moveend', () => setShowOutline(true))
        map.flyTo(center, zoom, { duration: 1, easeLinearity: 0.2 })
      }
    }
  }, [zoom, center, map, isInitial, shouldPan, setShouldPan, gameOver, isUSStatesMode, countryGeoJson, statesGeoJson, targetName, setShowOutline])

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
