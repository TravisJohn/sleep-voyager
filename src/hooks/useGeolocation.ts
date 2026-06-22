import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeoCoordinates, SensorStatus } from '../types/sensors'

export function useGeolocation() {
  const watchIdRef = useRef<number | null>(null)
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null)
  const [status, setStatus] = useState<SensorStatus>('not-requested')
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    setCoordinates(null)
    setStatus('not-requested')
  }, [])

  const start = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      setError('This browser does not provide location access.')
      return null
    }
    if (watchIdRef.current !== null && coordinates) return coordinates

    setStatus('requesting')
    setError(null)
    return new Promise<GeoCoordinates | null>((resolve) => {
      let settled = false
      watchIdRef.current = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const next = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }
          setCoordinates(next)
          setStatus('ready')
          if (!settled) {
            settled = true
            resolve(next)
          }
        },
        (reason) => {
          const denied = reason.code === reason.PERMISSION_DENIED
          setStatus(denied ? 'denied' : 'unavailable')
          setError(denied ? 'Location access was not allowed.' : 'Your location could not be determined.')
          if (!settled) {
            settled = true
            resolve(null)
          }
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
      )
    })
  }, [coordinates])

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  return { coordinates, status, error, start, stop }
}
