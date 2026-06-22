import { SKY_PORTAL_FIELD_OF_VIEW } from './astronomy'
import type { CelestialObject, SkyPortalReading, SkyPosition } from '../types/sky'

export type SnapshotObject = CelestialObject & { position: SkyPosition }

export function buildFieldTestSnapshot(
  reading: SkyPortalReading,
  objects: SnapshotObject[],
  notes: string,
) {
  const coordinates = reading.coordinates
  const lines = [
    'SLEEP VOYAGER FIELD TEST SNAPSHOT',
    `Timestamp: ${new Date().toISOString()}`,
    `User agent: ${navigator.userAgent}`,
    `Screen size: ${window.screen.width} x ${window.screen.height} px (DPR ${window.devicePixelRatio})`,
    `Viewport size: ${window.innerWidth} x ${window.innerHeight} px`,
    '',
    'SENSOR STATUS',
    `Camera: ${reading.cameraStatus}`,
    `Location: ${reading.locationStatus}`,
    `Orientation: ${reading.orientationStatus}`,
    `Portal mode: ${reading.isDemoMode ? 'demo' : 'live'}`,
    `Latitude: ${formatNumber(coordinates?.latitude, 6)}`,
    `Longitude: ${formatNumber(coordinates?.longitude, 6)}`,
    '',
    'ORIENTATION',
    `Raw heading: ${formatDegrees(reading.rawOrientation.heading)}`,
    `Raw alpha: ${formatDegrees(reading.rawOrientation.alpha)}`,
    `Smoothed heading: ${formatDegrees(reading.smoothedOrientation.heading)}`,
    `Heading offset: ${formatDegrees(reading.headingOffset)}`,
    `Adjusted heading: ${formatDegrees(reading.orientation.heading)}`,
    `Beta: ${formatDegrees(reading.rawOrientation.beta)}`,
    `Gamma: ${formatDegrees(reading.rawOrientation.gamma)}`,
    `Field of view: ${SKY_PORTAL_FIELD_OF_VIEW.horizontal}° horizontal x ${SKY_PORTAL_FIELD_OF_VIEW.vertical}° vertical`,
    '',
    `PROJECTED OBJECTS (${objects.length})`,
    ...formatObjects(objects),
    '',
    'TEST NOTES',
    notes.trim() || 'None',
  ]

  return lines.join('\n')
}

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()
  const copied = document.execCommand('copy')
  textArea.remove()
  if (!copied) throw new Error('Clipboard access is unavailable.')
}

function formatObjects(objects: SnapshotObject[]) {
  if (objects.length === 0) return ['None']

  return objects.map((object) => [
    `- ${object.name} [${object.source}]`,
    `alt ${object.altitude.toFixed(2)}°`,
    `az ${object.azimuth.toFixed(2)}°`,
    `x ${object.position.screenX.toFixed(2)}`,
    `y ${object.position.screenY.toFixed(2)}`,
    `horizon ${object.visibility}`,
    `screen ${object.position.isVisible ? 'visible' : 'off-screen'}`,
  ].join(' | '))
}

function formatDegrees(value: number | null | undefined) {
  return value == null ? 'unavailable' : `${value.toFixed(2)}°`
}

function formatNumber(value: number | null | undefined, precision: number) {
  return value == null ? 'unavailable' : value.toFixed(precision)
}
