import type { CelestialObjectType, VisibilityStatus } from './sky'

export interface SavedSkyMoment {
  id: string
  title: string
  objectName: string
  objectType: CelestialObjectType
  timestamp: string
  visibility: VisibilityStatus
  altitude?: number
  azimuth?: number
}

export interface BedtimeStory {
  title: string
  subtitle: string
  paragraphs: string[]
  scienceAnchor: string
}
