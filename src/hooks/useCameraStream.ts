import { useCallback, useEffect, useRef, useState } from 'react'
import type { SensorStatus } from '../types/sensors'

export function useCameraStream() {
  const streamRef = useRef<MediaStream | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState<SensorStatus>('not-requested')
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async () => {
    if (!navigator.mediaDevices) {
      setStatus('unavailable')
      setError('This browser does not provide camera access.')
      return null
    }
    if (streamRef.current) return streamRef.current

    setStatus('requesting')
    setError(null)
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = nextStream
      setStream(nextStream)
      setStatus('ready')
      return nextStream
    } catch (reason) {
      const denied = reason instanceof DOMException && reason.name === 'NotAllowedError'
      setStatus(denied ? 'denied' : 'unavailable')
      setError(denied ? 'Camera access was not allowed.' : 'No usable camera was found.')
      return null
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
    setStatus('not-requested')
  }, [])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  return { stream, status, error, start, stop }
}
