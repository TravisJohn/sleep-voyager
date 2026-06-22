import {
  Equator,
  EquatorFromVector,
  Horizon,
  Observer,
  RotateVector,
  Rotation_EQJ_EQD,
  Spherical,
  VectorFromSphere,
} from 'astronomy-engine'
import { brightStars } from '../../data/brightStars'
import { beginnerConstellations } from '../../data/constellations'
import { realSolarSystemObjects } from '../../data/solarSystemObjects'
import type { CelestialObject, Constellation, DemoStar, SkyPortalReading, SkyPosition, SolarSystemObject, Star, VisibilityStatus } from '../../types/sky'
import type { GeoCoordinates, OrientationReading } from '../../types/sensors'

export interface ProjectionOptions {
  orientation: OrientationReading | null
  demoIndex?: number
  demoCount?: number
}

export const SKY_PORTAL_FIELD_OF_VIEW = {
  horizontal: 80,
  vertical: 70,
} as const

export function calculateObjectAltAz(
  astronomyBody: SolarSystemObject['astronomyBody'],
  coordinates: GeoCoordinates,
  observedAt: Date,
) {
  const observer = new Observer(coordinates.latitude, coordinates.longitude, 0)
  const equatorial = Equator(astronomyBody, observedAt, observer, true, true)
  const horizontal = Horizon(observedAt, observer, equatorial.ra, equatorial.dec, 'normal')

  return {
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth,
  }
}

/**
 * Converts catalogue J2000 equatorial coordinates to local horizontal coordinates.
 * RA is supplied in sidereal hours and declination in degrees. The catalogue vector
 * is precessed to the observation date before Astronomy Engine applies local sidereal
 * time and optional atmospheric refraction in its Horizon conversion.
 */
export function calculateRaDecAltAz(
  rightAscension: number,
  declination: number,
  coordinates: GeoCoordinates,
  observedAt: Date,
) {
  const observer = new Observer(coordinates.latitude, coordinates.longitude, 0)
  const j2000Vector = VectorFromSphere(new Spherical(declination, rightAscension * 15, 1), observedAt)
  const ofDateVector = RotateVector(Rotation_EQJ_EQD(observedAt), j2000Vector)
  const equatorialOfDate = EquatorFromVector(ofDateVector)
  const horizontal = Horizon(observedAt, observer, equatorialOfDate.ra, equatorialOfDate.dec, 'normal')

  return {
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth,
  }
}

export function getVisibilityStatus(altitude: number): VisibilityStatus {
  return altitude > 0 ? 'above-horizon' : 'below-horizon'
}

export function getRealSolarSystemObjects(reading: SkyPortalReading): SolarSystemObject[] {
  if (!reading.coordinates) return []

  return realSolarSystemObjects.map((definition) => {
    const { altitude, azimuth } = calculateObjectAltAz(
      definition.astronomyBody,
      reading.coordinates!,
      reading.observedAt,
    )
    const visibility = getVisibilityStatus(altitude)
    const isVisible = visibility === 'above-horizon'

    return {
      ...definition,
      source: 'calculated' as const,
      altitude,
      azimuth,
      visibility,
      isVisible,
    }
  })
}

export function getRealBrightStars(reading: SkyPortalReading): Star[] {
  if (!reading.coordinates) return []

  return brightStars.map((definition) => {
    const { altitude, azimuth } = calculateRaDecAltAz(
      definition.rightAscension,
      definition.declination,
      reading.coordinates!,
      reading.observedAt,
    )
    const visibility = getVisibilityStatus(altitude)

    return {
      ...definition,
      source: 'calculated' as const,
      altitude,
      azimuth,
      visibility,
      isVisible: visibility === 'above-horizon',
    }
  })
}

export function getRealBeginnerConstellations(stars: Star[]): Constellation[] {
  const starsById = new Map(stars.map((star) => [star.id, star]))

  return beginnerConstellations.flatMap((definition) => {
    const members = definition.starIds.flatMap((id) => {
      const star = starsById.get(id)
      return star ? [star] : []
    })
    if (members.length < 2) return []

    const aboveHorizon = members.filter((star) => star.isVisible)
    const positionMembers = aboveHorizon.length > 0 ? aboveHorizon : members
    const altitude = positionMembers.reduce((sum, star) => sum + star.altitude, 0) / positionMembers.length
    const azimuth = circularMeanDegrees(positionMembers.map((star) => star.azimuth))
    const isVisible = aboveHorizon.length >= Math.min(2, members.length)

    return [{
      ...definition,
      source: 'calculated' as const,
      altitude,
      azimuth,
      visibility: isVisible ? 'above-horizon' as const : 'below-horizon' as const,
      isVisible,
    }]
  })
}

export function getVisibleSkyObjects<T extends CelestialObject>(objects: T[]): T[] {
  return objects.filter((object) => object.isVisible)
}

/**
 * Projects horizontal coordinates into a deliberately simple camera view.
 * Heading controls horizontal offset; beta estimates camera elevation.
 * TODO: Calibrate device/camera axes and use real camera field-of-view values.
 */
export function projectAltAzToScreen(
  object: CelestialObject,
  { orientation, demoIndex = 0, demoCount = 1 }: ProjectionOptions,
): SkyPosition {
  if (!orientation || orientation.heading === null) {
    const spacing = demoCount > 1 ? 68 / (demoCount - 1) : 0
    return {
      altitude: object.altitude,
      azimuth: object.azimuth,
      screenX: demoCount > 1 ? 16 + demoIndex * spacing : 50,
      screenY: 43 + Math.sin(demoIndex * 1.7) * 11,
      isVisible: object.isVisible,
    }
  }

  const horizontalFieldOfView = SKY_PORTAL_FIELD_OF_VIEW.horizontal
  const verticalFieldOfView = SKY_PORTAL_FIELD_OF_VIEW.vertical
  const headingDelta = wrapDegrees(object.azimuth - orientation.heading)
  const viewAltitude = clamp(90 - Math.abs(orientation.beta ?? 90), 0, 90)
  const screenX = 50 + (headingDelta / horizontalFieldOfView) * 100
  const screenY = 50 - ((object.altitude - viewAltitude) / verticalFieldOfView) * 100

  return {
    altitude: object.altitude,
    azimuth: object.azimuth,
    screenX,
    screenY,
    isVisible: object.isVisible && screenX >= 3 && screenX <= 97 && screenY >= 4 && screenY <= 94,
  }
}

export function projectMockConstellationObject(object: DemoStar, demoPhase: number): SkyPosition {
  return {
    altitude: object.altitude,
    azimuth: object.azimuth,
    screenX: object.mockScreenPosition.x + Math.sin(demoPhase + object.azimuth) * 1.2,
    screenY: object.mockScreenPosition.y + Math.cos(demoPhase + object.altitude) * 0.7,
    isVisible: true,
  }
}

function wrapDegrees(value: number) {
  return ((value + 540) % 360) - 180
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function circularMeanDegrees(values: number[]) {
  const radians = values.map((value) => value * Math.PI / 180)
  const x = radians.reduce((sum, value) => sum + Math.cos(value), 0)
  const y = radians.reduce((sum, value) => sum + Math.sin(value), 0)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}
