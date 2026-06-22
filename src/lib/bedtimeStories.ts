import type { BedtimeStory } from '../types/experience'
import type { CelestialObject } from '../types/sky'

export function createBedtimeStory(object: CelestialObject): BedtimeStory {
  const place = object.visibility === 'above-horizon'
    ? `${object.name} is above your horizon now, even if a wall or ceiling hides it.`
    : `${object.name} rests below your horizon for now, continuing its path beyond view.`

  return {
    title: `The quiet voyage to ${object.name}`,
    subtitle: `A dream voyage inspired by real ${scienceFamily(object.type)} science`,
    paragraphs: [
      `Tonight, your room becomes the launch deck. Beyond the window, beyond the ceiling, ${object.name} waits quietly in the sky. The lights of your imaginary ship soften, and the voyage begins with one slow breath.`,
      `In dream-voyage mode, distance feels as light as a blanket. Your fictional ship glides through a sea of deep blue and silver, carrying no hurry at all. This part is imagination — not a real travel time or mission plan.`,
      `${place} ${object.description}`,
      `As the ship turns gently home, one true detail travels with you: ${object.funFact} The stars remain where they are, and your room becomes peaceful again.`,
    ],
    scienceAnchor: object.scienceNote,
  }
}

function scienceFamily(type: CelestialObject['type']) {
  if (type === 'star') return 'stellar'
  if (type === 'constellation') return 'sky-pattern'
  return 'solar-system'
}
