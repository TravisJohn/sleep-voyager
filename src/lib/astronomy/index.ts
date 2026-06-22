import { Equator, Horizon, Observer } from 'astronomy-engine'
import { realSolarSystemObjects } from '../../data/solarSystemObjects'
import type { CelestialObject, SkyPortalReading, SkyPosition, SolarSystemObject, Star } from '../../types/sky'
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

export function getRealSolarSystemObjects(reading: SkyPortalReading): SolarSystemObject[] {
  if (!reading.coordinates) return []

  return realSolarSystemObjects.map((definition) => {
    const { altitude, azimuth } = calculateObjectAltAz(
      definition.astronomyBody,
      reading.coordinates!,
      reading.observedAt,
    )
    const isVisible = altitude > 0

    return {
      ...definition,
      source: 'calculated' as const,
      altitude,
      azimuth,
      visibility: isVisible ? 'above-horizon' as const : 'below-horizon' as const,
      isVisible,
    }
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

export function projectMockConstellationObject(object: Star, demoPhase: number): SkyPosition {
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
