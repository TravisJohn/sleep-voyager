import { useCallback, useMemo, useState } from 'react'
import { useCameraStream } from './useCameraStream'
import { useDeviceOrientation } from './useDeviceOrientation'
import { useGeolocation } from './useGeolocation'
import { useSkyTime } from './useSkyTime'
import type { SkyPortalReading } from '../types/sky'

const headingOffsetStorageKey = 'sleep-voyager-heading-offset'

export function useSkyPortalState() {
  const camera = useCameraStream()
  const location = useGeolocation()
  const orientation = useDeviceOrientation()
  const currentTime = useSkyTime()
  const [headingOffset, setHeadingOffset] = useState(readStoredHeadingOffset)

  const requestSensors = useCallback(async () => {
    await Promise.allSettled([camera.start(), location.start(), orientation.start()])
  }, [camera, location, orientation])

  const stopSensors = useCallback(() => {
    camera.stop()
    location.stop()
    orientation.stop()
  }, [camera, location, orientation])

  const adjustedOrientation = useMemo(() => ({
    ...orientation.smoothedReading,
    heading: orientation.smoothedReading.heading === null
      ? null
      : normalizeHeading(orientation.smoothedReading.heading + headingOffset),
  }), [headingOffset, orientation.smoothedReading])

  const adjustHeading = useCallback((degrees: number) => {
    setHeadingOffset((current) => {
      const next = normalizeOffset(current + degrees)
      storeHeadingOffset(next)
      return next
    })
  }, [])

  const resetHeading = useCallback(() => {
    setHeadingOffset(0)
    storeHeadingOffset(0)
  }, [])

  const reading: SkyPortalReading = useMemo(() => ({
    observedAt: currentTime,
    coordinates: location.coordinates,
    rawOrientation: orientation.reading,
    smoothedOrientation: orientation.smoothedReading,
    orientation: adjustedOrientation,
    headingOffset,
    cameraStatus: camera.status,
    locationStatus: location.status,
    orientationStatus: orientation.status,
    isDemoMode: orientation.status !== 'ready' || location.status !== 'ready',
  }), [adjustedOrientation, camera.status, currentTime, headingOffset, location.coordinates, location.status, orientation.reading, orientation.smoothedReading, orientation.status])

  return {
    camera,
    location,
    orientation,
    reading,
    adjustHeading,
    resetHeading,
    requestSensors,
    stopSensors,
  }
}

function readStoredHeadingOffset() {
  try {
    const stored = window.localStorage.getItem(headingOffsetStorageKey)
    const value = stored === null ? 0 : Number(stored)
    return Number.isFinite(value) ? normalizeOffset(value) : 0
  } catch {
    return 0
  }
}

function storeHeadingOffset(value: number) {
  try {
    window.localStorage.setItem(headingOffsetStorageKey, String(value))
  } catch {
    // Calibration remains in React state when storage is unavailable.
  }
}

function normalizeHeading(value: number) {
  return ((value % 360) + 360) % 360
}

function normalizeOffset(value: number) {
  return ((value + 540) % 360) - 180
}
