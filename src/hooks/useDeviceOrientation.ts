import { useCallback, useEffect, useRef, useState } from 'react'
import type { OrientationReading, SensorStatus } from '../types/sensors'

interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

interface DeviceOrientationEventWithCompass extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

const emptyReading: OrientationReading = { alpha: null, beta: null, gamma: null, heading: null }
const smoothingFactor = 0.18

export function useDeviceOrientation() {
  const listeningRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const smoothedRef = useRef<OrientationReading>(emptyReading)
  const [reading, setReading] = useState<OrientationReading>(emptyReading)
  const [smoothedReading, setSmoothedReading] = useState<OrientationReading>(emptyReading)
  const [status, setStatus] = useState<SensorStatus>('not-requested')
  const [error, setError] = useState<string | null>(null)

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const compassEvent = event as DeviceOrientationEventWithCompass
    const hasReading = event.alpha !== null || event.beta !== null || event.gamma !== null
    if (!hasReading) return

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    const nextReading = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      heading: compassEvent.webkitCompassHeading ?? event.alpha,
    }
    const nextSmoothedReading = smoothOrientation(smoothedRef.current, nextReading, smoothingFactor)
    smoothedRef.current = nextSmoothedReading
    setReading(nextReading)
    setSmoothedReading(nextSmoothedReading)
    setStatus('ready')
    setError(null)
  }, [])

  const beginListening = useCallback(() => {
    if (listeningRef.current) return
    window.addEventListener('deviceorientation', handleOrientation, true)
    listeningRef.current = true
    timeoutRef.current = window.setTimeout(() => {
      setStatus((current) => current === 'ready' ? current : 'unavailable')
      setError('Motion data is not available on this device.')
    }, 1500)
  }, [handleOrientation])

  const start = useCallback(async () => {
    if (!('DeviceOrientationEvent' in window)) {
      setStatus('unavailable')
      setError('This browser does not provide motion orientation.')
      return false
    }

    setStatus('requesting')
    setError(null)
    const orientationApi = DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission
    try {
      if (orientationApi.requestPermission) {
        const permission = await orientationApi.requestPermission()
        if (permission !== 'granted') {
          setStatus('denied')
          setError('Motion access was not allowed.')
          return false
        }
      }
      beginListening()
      return true
    } catch {
      setStatus('unavailable')
      setError('Motion orientation could not be started.')
      return false
    }
  }, [beginListening])

  const stop = useCallback(() => {
    if (listeningRef.current) window.removeEventListener('deviceorientation', handleOrientation, true)
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    listeningRef.current = false
    timeoutRef.current = null
    setReading(emptyReading)
    setSmoothedReading(emptyReading)
    smoothedRef.current = emptyReading
    setStatus('not-requested')
  }, [handleOrientation])

  useEffect(() => () => {
    if (listeningRef.current) window.removeEventListener('deviceorientation', handleOrientation, true)
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
  }, [handleOrientation])

  return { reading, smoothedReading, status, error, start, stop }
}

function smoothOrientation(
  previous: OrientationReading,
  next: OrientationReading,
  factor: number,
): OrientationReading {
  return {
    alpha: smoothAngle(previous.alpha, next.alpha, factor),
    heading: smoothAngle(previous.heading, next.heading, factor),
    beta: smoothValue(previous.beta, next.beta, factor),
    gamma: smoothValue(previous.gamma, next.gamma, factor),
  }
}

function smoothValue(previous: number | null, next: number | null, factor: number) {
  if (next === null) return previous
  if (previous === null) return next
  return previous + (next - previous) * factor
}

function smoothAngle(previous: number | null, next: number | null, factor: number) {
  if (next === null) return previous
  if (previous === null) return next
  const shortestDelta = ((next - previous + 540) % 360) - 180
  return (previous + shortestDelta * factor + 360) % 360
}
