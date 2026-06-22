import type { Body } from 'astronomy-engine'
import type { GeoCoordinates, OrientationReading, SensorStatus } from './sensors'

export type CelestialObjectType = 'sun' | 'moon' | 'planet' | 'star'
export type VisibilityStatus = 'above-horizon' | 'below-horizon'

export interface SkyPosition {
  altitude: number
  azimuth: number
  screenX: number
  screenY: number
  isVisible: boolean
}

export interface CelestialObject {
  id: string
  name: string
  type: CelestialObjectType
  source: 'calculated' | 'mock'
  altitude: number
  azimuth: number
  visibility: VisibilityStatus
  isVisible: boolean
  description: string
  funFact: string
  scienceNote: string
}

export interface SolarSystemObject extends CelestialObject {
  type: 'sun' | 'moon' | 'planet'
  source: 'calculated'
  astronomyBody: Body
}

export interface Star extends CelestialObject {
  type: 'star'
  source: 'mock'
  magnitude: number
  distanceLightYears: number
  spectralClass: string
  mockScreenPosition: { x: number; y: number }
}

export interface Planet extends SolarSystemObject {
  type: 'planet'
}

export interface Constellation {
  id: string
  name: string
  starIds: string[]
  lines: Array<[string, string]>
  mythology?: string
}

export interface SkyPortalReading {
  observedAt: Date
  coordinates: GeoCoordinates | null
  rawOrientation: OrientationReading
  smoothedOrientation: OrientationReading
  orientation: OrientationReading
  headingOffset: number
  cameraStatus: SensorStatus
  locationStatus: SensorStatus
  orientationStatus: SensorStatus
  isDemoMode: boolean
}
