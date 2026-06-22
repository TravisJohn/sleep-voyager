import { Body } from 'astronomy-engine'
import type { CelestialObjectType } from '../types/sky'

export interface SolarSystemObjectDefinition {
  id: string
  name: string
  type: Exclude<CelestialObjectType, 'star'>
  astronomyBody: Body
  description: string
  funFact: string
  scienceNote: string
}

export const realSolarSystemObjects: SolarSystemObjectDefinition[] = [
  {
    id: 'sun',
    name: 'Sun',
    type: 'sun',
    astronomyBody: Body.Sun,
    description: 'Our nearest star, a vast sphere of plasma that powers nearly every ecosystem on Earth.',
    funFact: 'Light from the Sun takes about eight minutes to reach Earth.',
    scienceNote: 'Never look directly at the Sun through a camera, telescope, or binoculars without a certified solar filter.',
  },
  {
    id: 'moon',
    name: 'Moon',
    type: 'moon',
    astronomyBody: Body.Moon,
    description: 'Earth’s natural satellite shapes our tides and keeps watch over the changing night sky.',
    funFact: 'The Moon moves about 3.8 centimetres farther from Earth each year.',
    scienceNote: 'Its displayed altitude and azimuth are topocentric, accounting for your position on Earth.',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    astronomyBody: Body.Mercury,
    description: 'The smallest planet and the closest to the Sun, usually glimpsed low in twilight.',
    funFact: 'A solar day on Mercury lasts about 176 Earth days.',
    scienceNote: 'Mercury never appears far from the Sun in Earth’s sky.',
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    astronomyBody: Body.Venus,
    description: 'A cloud-covered world that often becomes the brightest planet in our sky.',
    funFact: 'Venus rotates backwards compared with most planets.',
    scienceNote: 'Its brilliant clouds hide a surface hot enough to melt lead.',
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    astronomyBody: Body.Mars,
    description: 'A cold desert world whose iron-rich surface gives it a familiar rust-red glow.',
    funFact: 'Mars has the largest known volcano in the solar system: Olympus Mons.',
    scienceNote: 'Its brightness changes greatly as Earth and Mars move around the Sun.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    astronomyBody: Body.Jupiter,
    description: 'The solar system’s largest planet, wrapped in bands of cloud and powerful storms.',
    funFact: 'Jupiter’s Great Red Spot is a storm larger than Earth.',
    scienceNote: 'Even binoculars can reveal its four large Galilean moons under good conditions.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    astronomyBody: Body.Saturn,
    description: 'A pale gas giant encircled by an immense system of ice-rich rings.',
    funFact: 'Saturn is less dense than water on average.',
    scienceNote: 'Its ring angle changes over time as Earth and Saturn orbit the Sun.',
  },
]
