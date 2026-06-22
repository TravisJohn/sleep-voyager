import { useCallback, useState } from 'react'
import type { CelestialObject } from '../types/sky'
import type { SavedSkyMoment } from '../types/experience'

const storageKey = 'sleep-voyager-saved-moments'
const maximumMoments = 20

export function useSavedSkyMoments() {
  const [moments, setMoments] = useState<SavedSkyMoment[]>(readMoments)

  const saveMoment = useCallback((object: CelestialObject) => {
    const timestamp = new Date().toISOString()
    const moment: SavedSkyMoment = {
      id: `${Date.now()}-${object.id}`,
      title: `A quiet moment with ${object.name}`,
      objectName: object.name,
      objectType: object.type,
      timestamp,
      visibility: object.visibility,
      altitude: object.source === 'calculated' ? object.altitude : undefined,
      azimuth: object.source === 'calculated' ? object.azimuth : undefined,
    }

    setMoments((current) => {
      const next = [moment, ...current].slice(0, maximumMoments)
      persistMoments(next)
      return next
    })
    return moment
  }, [])

  const removeMoment = useCallback((id: string) => {
    setMoments((current) => {
      const next = current.filter((moment) => moment.id !== id)
      persistMoments(next)
      return next
    })
  }, [])

  return { moments, saveMoment, removeMoment }
}

function readMoments(): SavedSkyMoment[] {
  try {
    const value = window.localStorage.getItem(storageKey)
    if (!value) return []
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedMoment).slice(0, maximumMoments)
  } catch {
    return []
  }
}

function persistMoments(moments: SavedSkyMoment[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(moments))
  } catch {
    // Saving remains available for the current session when storage is blocked.
  }
}

function isSavedMoment(value: unknown): value is SavedSkyMoment {
  if (!value || typeof value !== 'object') return false
  const moment = value as Partial<SavedSkyMoment>
  return typeof moment.id === 'string'
    && typeof moment.title === 'string'
    && typeof moment.objectName === 'string'
    && typeof moment.timestamp === 'string'
}
