import type { CelestialObject, Constellation, Star } from '../types/sky'

export function TonightsSkyPanel({
  objects,
  constellations,
  onClose,
  onSelect,
  onOpenSaved,
  savedCount,
}: {
  objects: CelestialObject[]
  constellations: Constellation[]
  onClose: () => void
  onSelect: (object: CelestialObject) => void
  onOpenSaved: () => void
  savedCount: number
}) {
  const visibleSolarSystem = objects.filter((object) => object.type !== 'star' && object.isVisible)
  const visibleStars = objects
    .filter(isStar)
    .filter((star) => star.isVisible)
    .sort((left, right) => left.apparentMagnitude - right.apparentMagnitude)
  const belowHorizonSolarSystem = objects.filter((object) => object.type !== 'star' && !object.isVisible)
  const suggestedConstellation = [...constellations]
    .filter((constellation) => constellation.isVisible)
    .sort((left, right) => right.altitude - left.altitude)[0]
  const bestObject = [...visibleSolarSystem, ...visibleStars]
    .filter((object) => object.type !== 'sun')
    .sort((left, right) => viewingScore(left) - viewingScore(right))[0]

  return (
    <aside className="experience-panel tonight-panel" aria-label="Tonight's Sky">
      <PanelHeader eyebrow="YOUR LOCAL VIEW" title="Tonight’s Sky" onClose={onClose} />
      <p className="panel-intro">Calculated from your current location and time. Stars use local catalogue data and update as the sky moves.</p>

      {objects.length === 0 ? (
        <div className="panel-empty"><span>◇</span><h3>Location makes this view personal</h3><p>Enable location to see real solar-system objects, bright stars, and constellation suggestions. The Sky Portal remains available in demo mode.</p></div>
      ) : (
        <>
          <section className="best-object">
            <small>BEST THING TO LOOK FOR</small>
            {bestObject ? (
              <button onClick={() => onSelect(bestObject)}><span>{objectGlyph(bestObject)}</span><div><strong>{bestObject.name}</strong><p>{bestObject.altitude.toFixed(0)}° above the horizon · tap to explore</p></div><b>→</b></button>
            ) : (
              <p>No Moon, planet, or curated bright star is above your horizon right now.</p>
            )}
          </section>

          <section className="suggested-constellation">
            <small>BEGINNER CONSTELLATION TO FIND</small>
            {suggestedConstellation ? (
              <button onClick={() => onSelect(suggestedConstellation)}>
                <span>✧</span><div><strong>{suggestedConstellation.name}</strong><p>{suggestedConstellation.description}</p></div><b>›</b>
              </button>
            ) : <p className="list-empty">None from the beginner set has enough member stars above the horizon right now.</p>}
          </section>

          <SkyObjectList title="VISIBLE SOLAR SYSTEM" objects={visibleSolarSystem} onSelect={onSelect} />
          <SkyObjectList title="VISIBLE BRIGHT STARS" objects={visibleStars} onSelect={onSelect} />
          <SkyObjectList title="SOLAR SYSTEM BELOW HORIZON" objects={belowHorizonSolarSystem} onSelect={onSelect} />
        </>
      )}

      <button className="saved-moments-link" onClick={onOpenSaved}><span>✧</span> Saved Moments <small>{savedCount}</small></button>
    </aside>
  )
}

function SkyObjectList({ title, objects, onSelect }: { title: string; objects: CelestialObject[]; onSelect: (object: CelestialObject) => void }) {
  return (
    <section className="tonight-list">
      <small>{title}</small>
      {objects.length === 0 ? <p className="list-empty">None from the curated set right now.</p> : (
        <div>{objects.map((object) => (
          <button key={object.id} onClick={() => onSelect(object)}>
            <span className={`mini-object mini-${object.type}`}>{objectGlyph(object)}</span>
            <strong>{object.name}</strong>
            <small>{object.altitude.toFixed(0)}° · {object.azimuth.toFixed(0)}° az{isStar(object) ? ` · mag ${object.apparentMagnitude.toFixed(1)}` : ''}</small>
            <b>›</b>
          </button>
        ))}</div>
      )}
    </section>
  )
}

function PanelHeader({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return <div className="experience-header"><div><small>{eyebrow}</small><h2>{title}</h2></div><button onClick={onClose} aria-label={`Close ${title}`}>×</button></div>
}

function objectGlyph(object: CelestialObject) {
  if (object.type === 'sun') return '☀'
  if (object.type === 'moon') return '☾'
  if (object.type === 'planet') return '●'
  if (object.type === 'constellation') return '✧'
  return '✦'
}

function isStar(object: CelestialObject): object is Star {
  return object.type === 'star' && 'apparentMagnitude' in object
}

function viewingScore(object: CelestialObject) {
  if (object.type === 'moon') return -20 - object.altitude / 10
  if (object.type === 'planet') return -10 - object.altitude / 10
  if (isStar(object)) return object.apparentMagnitude - object.altitude / 100
  return 100
}
