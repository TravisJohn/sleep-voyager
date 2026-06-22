import { useEffect, useState } from 'react'

export function useSkyTime(updateIntervalMs = 1000) {
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), updateIntervalMs)
    return () => window.clearInterval(intervalId)
  }, [updateIntervalMs])

  return currentTime
}
