export type SensorStatus =
  | 'not-requested'
  | 'requesting'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'demo'

export interface GeoCoordinates {
  latitude: number
  longitude: number
  accuracy: number
}

export interface OrientationReading {
  alpha: number | null
  beta: number | null
  gamma: number | null
  heading: number | null
}
