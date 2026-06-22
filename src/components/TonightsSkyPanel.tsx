import type { SolarSystemObject } from '../types/sky'

export function TonightsSkyPanel({
  objects,
  onClose,
  onSelect,
  onOpenSaved,
  savedCount,
}: {
  objects: SolarSystemObject[]
  onClose: () => void
  onSelect: (object: SolarSystemObject) => void
  onOpenSaved: () => void
  savedCount: number
}) {
  const visible = objects.filter((object) => object.isVisible)
  const belowHorizon = objects.filter((object) => !object.isVisible)
  const bestObject = [...visible]
    .filter((object) => object.type !== 'sun')
    .sort((left, right) => right.altitude - left.altitude)[0]

  return (
    <aside className="experience-panel tonight-panel" aria-label="Tonight's Sky">
      <PanelHeader eyebrow="YOUR LOCAL VIEW" title="Tonight’s Sky" onClose={onClose} />
      <p className="panel-intro">Calculated from your current location and time. Positions update as the sky moves.</p>

      {objects.length === 0 ? (
        <div className="panel-empty"><span>◇</span><h3>Location makes this view personal</h3><p>Enable location to see real solar-system objects. The Sky Portal remains available in demo mode.</p></div>
      ) : (
        <>
          <section className="best-object">
            <small>BEST OBJECT TO LOOK FOR</small>
            {bestObject ? (
              <button onClick={() => onSelect(bestObject)}><span>{objectGlyph(bestObject)}</span><div><strong>{bestObject.name}</strong><p>{bestObject.altitude.toFixed(0)}° above the horizon · tap to explore</p></div><b>→</b></button>
            ) : (
              <p>No Moon or planet from the curated list is above your horizon right now. Check again as the sky turns.</p>
            )}
          </section>
          <SkyObjectList title="VISIBLE NOW" objects={visible} onSelect={onSelect} />
          <SkyObjectList title="BELOW HORIZON / LATER" objects={belowHorizon} onSelect={onSelect} />
        </>
      )}

      <button className="saved-moments-link" onClick={onOpenSaved}><span>✧</span> Saved Moments <small>{savedCount}</small></button>
    </aside>
  )
}

function SkyObjectList({ title, objects, onSelect }: { title: string; objects: SolarSystemObject[]; onSelect: (object: SolarSystemObject) => void }) {
  return (
    <section className="tonight-list">
      <small>{title}</small>
      {objects.length === 0 ? <p className="list-empty">None from the curated set right now.</p> : (
        <div>{objects.map((object) => (
          <button key={object.id} onClick={() => onSelect(object)}>
            <span className={`mini-object mini-${object.type}`}>{objectGlyph(object)}</span>
            <strong>{object.name}</strong>
            <small>{object.altitude.toFixed(0)}° · {object.azimuth.toFixed(0)}° az</small>
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

function objectGlyph(object: SolarSystemObject) {
  if (object.type === 'sun') return '☀'
  if (object.type === 'moon') return '☾'
  return '●'
}
