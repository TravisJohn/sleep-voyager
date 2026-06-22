import type { Body } from 'astronomy-engine'
import type { GeoCoordinates, OrientationReading, SensorStatus } from './sensors'

export type CelestialObjectType = 'sun' | 'moon' | 'planet' | 'star' | 'constellation'
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
  source: 'calculated'
  commonName?: string
  rightAscension: number
  declination: number
  apparentMagnitude: number
  constellationAbbreviation: string
  constellationName: string
}

export interface DemoStar extends CelestialObject {
  type: 'star'
  source: 'mock'
  apparentMagnitude: number
  mockScreenPosition: { x: number; y: number }
}

export interface Planet extends SolarSystemObject {
  type: 'planet'
}

export interface Constellation extends CelestialObject {
  id: string
  name: string
  type: 'constellation'
  source: 'calculated'
  hemisphereRelevance: string
  starIds: string[]
  lines: Array<[string, string]>
  mythology: string
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
