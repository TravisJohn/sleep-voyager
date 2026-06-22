import type { CelestialObject, Constellation, Star } from '../types/sky'

export function DiscoveryCard({
  object,
  isSaved,
  onClose,
  onSave,
  onStartBedtime,
}: {
  object: CelestialObject
  isSaved: boolean
  onClose: () => void
  onSave: () => void
  onStartBedtime: () => void
}) {
  return (
    <article className="object-card discovery-card">
      <button className="card-close" onClick={onClose} aria-label="Close object details">×</button>
      <div className="object-heading">
        <div className={`object-orb object-orb-${object.type}`}>{objectGlyph(object.type)}</div>
        <div>
          <div className="discovery-badges">
            <span>{object.type}</span>
            <span className={object.source === 'calculated' ? 'real-badge' : 'demo-badge'}>{object.source === 'calculated' ? 'Real sky' : 'Demo'}</span>
          </div>
          <h2>{object.name}</h2>
          {isCatalogueStar(object) && object.commonName && <p className="object-alias">Also known as {object.commonName}</p>}
        </div>
      </div>

      <div className="coordinate-row">
        {object.source === 'calculated' && <div><small>ALTITUDE</small><strong>{object.altitude.toFixed(1)}°</strong></div>}
        {object.source === 'calculated' && <div><small>AZIMUTH</small><strong>{object.azimuth.toFixed(1)}°</strong></div>}
        {hasMagnitude(object) && <div><small>MAGNITUDE</small><strong>{object.apparentMagnitude.toFixed(2)}</strong></div>}
        {isCatalogueStar(object) && <div><small>CONSTELLATION</small><strong>{object.constellationName}</strong></div>}
        <div><small>VISIBILITY</small><strong>{object.visibility === 'above-horizon' ? 'Above horizon' : 'Below horizon'}</strong></div>
      </div>

      <p>{object.description}</p>
      <div className="discovery-detail"><small>FUN FACT</small><p>{object.funFact}</p></div>
      {isConstellation(object) && <div className="discovery-detail story-detail"><small>STORY NOTE</small><p>{object.mythology}</p></div>}
      <div className="discovery-detail science-detail"><small>SCIENCE NOTE</small><p>{object.scienceNote}</p></div>

      <div className="discovery-actions">
        <button className="bedtime-action" onClick={onStartBedtime}><span>☾</span><div><small>TEXT PREVIEW</small>Start Bedtime Universe</div></button>
        <button className={`save-action ${isSaved ? 'saved' : ''}`} onClick={onSave} disabled={isSaved}>{isSaved ? 'Saved ✓' : 'Save Sky Moment'}</button>
      </div>
    </article>
  )
}

function objectGlyph(type: CelestialObject['type']) {
  if (type === 'sun') return '☀'
  if (type === 'moon') return '☾'
  if (type === 'planet') return '●'
  if (type === 'constellation') return '✧'
  return '✦'
}

function isCatalogueStar(object: CelestialObject): object is Star {
  return object.type === 'star' && 'apparentMagnitude' in object && 'constellationName' in object
}

function hasMagnitude(object: CelestialObject): object is CelestialObject & { apparentMagnitude: number } {
  return object.type === 'star' && 'apparentMagnitude' in object
}

function isConstellation(object: CelestialObject): object is Constellation {
  return object.type === 'constellation' && 'mythology' in object
}
