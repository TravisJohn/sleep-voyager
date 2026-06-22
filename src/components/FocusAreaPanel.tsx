import type { CelestialObject, Star } from '../types/sky'

export interface FocusAreaEntry {
  object: CelestialObject
  onScreen: boolean
  distanceFromCenter: number
}

export function FocusAreaPanel({
  entries,
  savedObjectIds,
  onClose,
  onLearn,
  onSave,
}: {
  entries: FocusAreaEntry[]
  savedObjectIds: Set<string>
  onClose: () => void
  onLearn: (object: CelestialObject) => void
  onSave: (object: CelestialObject) => void
}) {
  return (
    <aside className="experience-panel focus-area-panel" aria-label="Focus Area sky list">
      <div className="experience-header">
        <div><small>CAPTURED SKY LIST</small><h2>Focus Area</h2></div>
        <button onClick={onClose} aria-label="Close Focus Area">×</button>
      </div>
      <p className="panel-intro">Captured from your current Sky Portal view. Sensors continue updating behind this snapshot.</p>

      {entries.length === 0 ? (
        <div className="panel-empty"><span>◎</span><h3>No curated objects nearby</h3><p>Close Focus Area, move the phone slowly, and capture another part of the sky.</p></div>
      ) : (
        <div className="focus-area-list">
          <div className="focus-list-summary"><span>{entries.length} nearby</span><small>ON-SCREEN AND NEAR-CENTRE OBJECTS</small></div>
          {entries.map(({ object, onScreen }) => {
            const saved = savedObjectIds.has(object.id)
            return (
              <article key={object.id}>
                <div className={`focus-object-symbol focus-${object.type}`}>{objectGlyph(object)}</div>
                <div className="focus-object-copy">
                  <div className="focus-object-heading">
                    <h3>{object.name}</h3>
                    <span>{object.type}</span>
                    <span className={object.source === 'calculated' ? 'focus-real-badge' : 'focus-demo-badge'}>{object.source === 'calculated' ? 'Real' : 'Demo'}</span>
                  </div>
                  <div className="focus-object-meta">
                    <span>{onScreen ? 'On screen' : 'Near view'}</span>
                    <span>{object.visibility === 'above-horizon' ? 'Above horizon' : 'Below horizon'}</span>
                    {isStar(object) && <span>Mag {object.apparentMagnitude.toFixed(2)}</span>}
                    {object.source === 'calculated' && <span>{object.altitude.toFixed(1)}° alt · {object.azimuth.toFixed(1)}° az</span>}
                  </div>
                </div>
                <div className="focus-object-actions">
                  <button className="focus-learn" onClick={() => onLearn(object)}>Learn</button>
                  <button className="focus-save" onClick={() => onSave(object)} disabled={saved}>{saved ? 'Saved' : 'Save'}</button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </aside>
  )
}

function isStar(object: CelestialObject): object is Star {
  return object.type === 'star' && 'apparentMagnitude' in object
}

function objectGlyph(object: CelestialObject) {
  if (object.type === 'sun') return '☀'
  if (object.type === 'moon') return '☾'
  if (object.type === 'planet') return '●'
  if (object.type === 'constellation') return '✧'
  return '✦'
}
