import type { SavedSkyMoment } from '../types/experience'

export function SavedMomentsPanel({ moments, onClose, onRemove }: { moments: SavedSkyMoment[]; onClose: () => void; onRemove: (id: string) => void }) {
  return (
    <aside className="experience-panel saved-panel" aria-label="Saved Sky Moments">
      <div className="experience-header"><div><small>YOUR PRIVATE COLLECTION</small><h2>Saved Moments</h2></div><button onClick={onClose} aria-label="Close Saved Moments">×</button></div>
      <p className="panel-intro">Small pieces of sky, stored only on this device.</p>
      {moments.length === 0 ? (
        <div className="panel-empty"><span>✧</span><h3>No moments saved yet</h3><p>Tap a celestial object, then choose Save Sky Moment.</p></div>
      ) : (
        <div className="saved-list">{moments.map((moment) => (
          <article key={moment.id}>
            <div className="saved-symbol">{savedGlyph(moment.objectType)}</div>
            <div><small>{new Date(moment.timestamp).toLocaleString()}</small><h3>{moment.title}</h3><p>{moment.objectName} · {moment.visibility === 'above-horizon' ? 'above horizon' : 'below horizon'}{moment.altitude === undefined ? '' : ` · ${moment.altitude.toFixed(1)}° alt`}</p></div>
            <button onClick={() => onRemove(moment.id)} aria-label={`Remove ${moment.title}`}>×</button>
          </article>
        ))}</div>
      )}
    </aside>
  )
}

function savedGlyph(type: SavedSkyMoment['objectType']) {
  if (type === 'moon') return '☾'
  if (type === 'sun') return '☀'
  if (type === 'planet') return '●'
  if (type === 'constellation') return '✧'
  return '✦'
}
