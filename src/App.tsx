import { useEffect, useMemo, useRef, useState } from 'react'
import { BedtimeUniversePanel } from './components/BedtimeUniversePanel'
import { DiscoveryCard } from './components/DiscoveryCard'
import { SavedMomentsPanel } from './components/SavedMomentsPanel'
import { TonightsSkyPanel } from './components/TonightsSkyPanel'
import { mockConstellationObjects } from './data/mockSky'
import { useSavedSkyMoments } from './hooks/useSavedSkyMoments'
import { useSkyPortalState } from './hooks/useSkyPortalState'
import {
  getRealSolarSystemObjects,
  getVisibleSkyObjects,
  projectAltAzToScreen,
  projectMockConstellationObject,
  SKY_PORTAL_FIELD_OF_VIEW,
} from './lib/astronomy'
import { buildFieldTestSnapshot, copyTextToClipboard } from './lib/fieldTest'
import type { CelestialObject, SkyPosition } from './types/sky'
import type { SensorStatus } from './types/sensors'

type Screen = 'landing' | 'permissions' | 'portal'
type SkyPortalState = ReturnType<typeof useSkyPortalState>
type ProjectedObject = CelestialObject & { position: SkyPosition }
type QualityLevel = SensorStatus

const fieldTests = [
  { id: 'camera', label: 'Camera starts successfully' },
  { id: 'location', label: 'Location is detected' },
  { id: 'motion', label: 'Motion/orientation permission works' },
  { id: 'heading', label: 'Heading changes when phone rotates left/right' },
  { id: 'tilt', label: 'Overlay moves smoothly when phone tilts up/down' },
  { id: 'align', label: 'Align Sky offset works' },
  { id: 'reset', label: 'Reset calibration works' },
  { id: 'real-objects', label: 'Real solar-system objects appear when location is available' },
  { id: 'fallback', label: 'Demo fallback appears when sensors are unavailable' },
] as const

function Brand() {
  return (
    <div className="brand" aria-label="Sleep Voyager">
      <span className="brand-mark">✦</span>
      <span>SLEEP VOYAGER</span>
    </div>
  )
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen landing-screen">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header><Brand /><button className="icon-button" aria-label="About">i</button></header>

      <section className="hero">
        <div className="eyebrow"><span /> YOUR NIGHT SKY AWAITS</div>
        <h1>Turn your room into a <em>window to the universe.</em></h1>
        <p className="hero-copy">Point your phone upward and uncover the stars, stories, and hidden wonders above you.</p>
        <button className="primary-button" onClick={onStart}>Open Sky Portal <span>→</span></button>
        <p className="button-note">No account needed · Free to explore</p>
      </section>

      <section className="portal-preview" aria-label="Sky Portal preview">
        <div className="preview-orbit" />
        <span className="preview-star star-a">✦</span>
        <span className="preview-star star-b">·</span>
        <span className="preview-star star-c">✦</span>
        <div className="constellation-line line-a" />
        <div className="constellation-line line-b" />
        <div className="preview-label"><span>✦</span><div><small>CONSTELLATION</small><strong>Cygnus</strong></div></div>
      </section>

      <section className="bedtime-card">
        <div className="moon">☾</div>
        <div><span className="coming-soon">TEXT PREVIEW</span><h2>Bedtime Universe</h2><p>Drift into a calm, science-grounded story from the Sky Portal.</p></div>
        <span className="card-arrow">↗</span>
      </section>
    </main>
  )
}

function statusLabel(status: SensorStatus) {
  const labels: Record<SensorStatus, string> = {
    'not-requested': 'WAITING',
    requesting: 'REQUESTING',
    ready: 'READY',
    denied: 'DENIED',
    unavailable: 'UNAVAILABLE',
    demo: 'DEMO',
  }
  return labels[status]
}

function permissionStatusCopy(status: SensorStatus) {
  const copy: Record<SensorStatus, string> = {
    'not-requested': 'Waiting for permission',
    requesting: 'Requesting access…',
    ready: 'Access ready',
    denied: 'Permission denied — demo mode is still available',
    unavailable: 'Unavailable on this browser or device — demo mode is still available',
    demo: 'Demo mode active',
  }
  return copy[status]
}

function PermissionScreen({
  sensors,
  onBack,
  onContinue,
}: {
  sensors: SkyPortalState
  onBack: () => void
  onContinue: () => void
}) {
  const isRequesting = [sensors.camera.status, sensors.location.status, sensors.orientation.status]
    .some((status) => status === 'requesting')

  const requestAccess = async () => {
    await sensors.requestSensors()
    onContinue()
  }

  return (
    <main className="screen permission-screen">
      <header><button className="back-button" onClick={onBack} aria-label="Go back">←</button><Brand /><span className="header-spacer" /></header>
      <section className="permission-intro">
        <div className="portal-icon"><span>✦</span><i /></div>
        <div className="eyebrow"><span /> BEFORE WE LAUNCH</div>
        <h1>Let the sky find you</h1>
        <p>Sleep Voyager uses your device to align the universe with the world around you.</p>
      </section>

      <section className="permission-list">
        <PermissionItem icon="⌾" title="Camera" copy="See stars and constellations layered over your surroundings." status={sensors.camera.status} />
        <PermissionItem icon="◇" title="Location" copy="Show the celestial objects visible from where you are." status={sensors.location.status} />
        <PermissionItem icon="↗" title="Motion & orientation" copy="Keep the star map aligned as you move your phone." status={sensors.orientation.status} />
      </section>

      <div className="permission-actions">
        <p className="request-note">We’ll ask for access when you continue.</p>
        <button className="primary-button" onClick={requestAccess} disabled={isRequesting}>
          {isRequesting ? 'Requesting access…' : 'Allow & continue'} <span>→</span>
        </button>
        <p>If a sensor is unavailable, a calm demo sky will take its place. Nothing is recorded.</p>
      </div>
    </main>
  )
}

function PermissionItem({ icon, title, copy, status }: { icon: string; title: string; copy: string; status: SensorStatus }) {
  return (
    <article>
      <div className="permission-icon">{icon}</div>
      <div><h2>{title}</h2><p>{copy}</p><p className="permission-state-copy">{permissionStatusCopy(status)}</p></div>
      <span className={`sensor-status sensor-status-${status}`}>{statusLabel(status)}</span>
    </article>
  )
}

function SkyPortal({ sensors, onExit }: { sensors: SkyPortalState; onExit: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [showAlignSky, setShowAlignSky] = useState(false)
  const [showFieldTest, setShowFieldTest] = useState(false)
  const [showTonight, setShowTonight] = useState(false)
  const [showSavedMoments, setShowSavedMoments] = useState(false)
  const [bedtimeObject, setBedtimeObject] = useState<CelestialObject | null>(null)
  const [savedObjectIds, setSavedObjectIds] = useState<Set<string>>(() => new Set())
  const [completedFieldTests, setCompletedFieldTests] = useState<Set<string>>(() => new Set())
  const [fieldTestNotes, setFieldTestNotes] = useState('')
  const { moments, saveMoment, removeMoment } = useSavedSkyMoments()
  const { reading } = sensors
  const cameraReady = sensors.camera.status === 'ready' && sensors.camera.stream !== null

  useEffect(() => {
    const video = videoRef.current
    if (!video || !sensors.camera.stream) return
    video.srcObject = sensors.camera.stream
    void video.play().catch(() => undefined)
  }, [sensors.camera.stream])

  const hasRealSky = reading.locationStatus === 'ready' && reading.coordinates !== null
  const solarSystemObjects = useMemo(
    () => hasRealSky ? getRealSolarSystemObjects(reading) : [],
    [hasRealSky, reading],
  )
  const projectedObjects = useMemo(() => {
    if (hasRealSky) {
      const visibleObjects = getVisibleSkyObjects(solarSystemObjects)
      return visibleObjects.map((object, index) => ({
        ...object,
        position: projectAltAzToScreen(object, {
          orientation: reading.orientationStatus === 'ready' ? reading.orientation : null,
          demoIndex: index,
          demoCount: visibleObjects.length,
        }),
      }))
    }

    const demoPhase = reading.observedAt.getTime() / 5000
    return mockConstellationObjects.map((object) => ({
      ...object,
      position: projectMockConstellationObject(object, demoPhase),
    }))
  }, [hasRealSky, reading, solarSystemObjects])

  const selectedObject = (hasRealSky ? solarSystemObjects : projectedObjects).find((object) => object.id === selected)
  const visibleProjectedObjects = projectedObjects.filter((object) => object.position.isVisible)
  const defaultBedtimeObject = selectedObject
    ?? solarSystemObjects.find((object) => object.id === 'moon')
    ?? projectedObjects[0]
  const objectPositions = new Map(projectedObjects.map((object) => [object.id, object.position]))
  const vega = objectPositions.get('vega')
  const deneb = objectPositions.get('deneb')
  const altair = objectPositions.get('altair')
  const constellationPath = vega && deneb && altair
    ? `M${vega.screenX} ${vega.screenY} L${altair.screenX} ${altair.screenY} M${vega.screenX} ${vega.screenY} L${deneb.screenX} ${deneb.screenY} M${deneb.screenX} ${deneb.screenY} L${altair.screenX} ${altair.screenY}`
    : ''

  const fallbackMessage = sensors.camera.status === 'denied'
    ? 'Camera access is off · Showing demo sky'
    : sensors.camera.status === 'unavailable'
      ? 'Camera is unavailable · Showing demo sky'
      : 'Camera unavailable · Showing demo sky'

  return (
    <main className="portal-screen">
      <video ref={videoRef} className={cameraReady ? 'camera-feed visible' : 'camera-feed'} playsInline muted />
      <div className="camera-fallback" aria-hidden={cameraReady}>
        <div className="fallback-glow" />
        {!cameraReady && <p>{fallbackMessage}</p>}
      </div>
      <div className="camera-tint" />

      <header className="portal-header">
        <button className="glass-button" onClick={onExit} aria-label="Close Sky Portal">×</button>
        <div className="live-pill"><span /> SKY PORTAL</div>
        <button
          className={`glass-button debug-toggle ${showDebug || showFieldTest ? 'active' : ''}`}
          onClick={() => {
            setShowDebug((visible) => !visible)
            setShowFieldTest(false)
            setShowTonight(false)
            setShowSavedMoments(false)
          }}
          aria-expanded={showDebug || showFieldTest}
        >Debug</button>
      </header>

      {showDebug && (
        <SensorDebugPanel
          reading={reading}
          objects={projectedObjects}
          onOpenFieldTest={() => {
            setShowDebug(false)
            setShowAlignSky(false)
            setShowTonight(false)
            setShowSavedMoments(false)
            setShowFieldTest(true)
          }}
        />
      )}

      <div className="orientation-hint"><span>⌃</span> POINT UP & MOVE AROUND</div>
      <div className="sky-mode-copy">
        <span>Move your phone slowly to explore the hidden sky.</span>
        {hasRealSky
          ? <span>Real sky objects are based on your current location and time.</span>
          : <span>Demo constellations are placeholders until the star catalogue is added.</span>}
        {hasRealSky && reading.orientationStatus !== 'ready' && <span>For accurate alignment, enable motion/orientation access.</span>}
      </div>
      <SensorQualityIndicator reading={reading} hasRealSky={hasRealSky} />

      <section className="sky-overlay" aria-label="Interactive sky map">
        {!hasRealSky && (
          <svg className="constellation" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d={constellationPath} />
          </svg>
        )}
        {visibleProjectedObjects.map((object) => (
          <button
            key={object.id}
            className={`sky-object ${object.source === 'calculated' ? 'real-object' : 'mock-object'} object-${object.type} ${selected === object.id ? 'selected' : ''}`}
            style={{ left: `${object.position.screenX}%`, top: `${object.position.screenY}%` }}
            onClick={() => setSelected(object.id)}
            aria-label={`View ${object.name}`}
          >
            <i style={object.source === 'mock' ? { width: object.id === 'deneb' ? 4 : 5, height: object.id === 'deneb' ? 4 : 5 } : undefined}>
              {object.source === 'calculated' ? objectSymbol(object.type) : ''}
            </i>
            <span>{object.name}<small>{object.source === 'calculated' ? 'CALCULATED' : 'DEMO'}</small></span>
          </button>
        ))}
        {!hasRealSky && <div className="constellation-name">THE SUMMER TRIANGLE<small>DEMO ASTERISM</small></div>}
        {hasRealSky && visibleProjectedObjects.length === 0 && (
          <div className="sky-empty-state">No curated objects are in this view.<small>Move slowly, or check again as the sky changes.</small></div>
        )}
      </section>

      {selectedObject ? (
        <DiscoveryCard
          object={selectedObject}
          isSaved={savedObjectIds.has(selectedObject.id)}
          onClose={() => setSelected(null)}
          onSave={() => {
            saveMoment(selectedObject)
            setSavedObjectIds((current) => new Set(current).add(selectedObject.id))
          }}
          onStartBedtime={() => {
            setBedtimeObject(selectedObject)
            setSelected(null)
          }}
        />
      ) : (
        <div className="tap-hint"><span>✦</span> Tap a sky object to explore</div>
      )}

      {showTonight && (
        <TonightsSkyPanel
          objects={solarSystemObjects}
          savedCount={moments.length}
          onClose={() => setShowTonight(false)}
          onSelect={(object) => {
            setSelected(object.id)
            setShowTonight(false)
          }}
          onOpenSaved={() => {
            setShowTonight(false)
            setShowSavedMoments(true)
          }}
        />
      )}

      {showSavedMoments && <SavedMomentsPanel moments={moments} onClose={() => setShowSavedMoments(false)} onRemove={removeMoment} />}

      {showAlignSky && (
        <aside className="align-sky-panel" aria-label="Manual sky alignment">
          <div className="align-heading"><div><small>CALIBRATION</small><h2>Align sky</h2></div><strong>{formatOffset(reading.headingOffset)}°</strong></div>
          <p>If the overlay feels misaligned, use Align Sky.</p>
          <div className="align-controls">
            <button onClick={() => sensors.adjustHeading(-5)} aria-label="Adjust sky five degrees left">← <span>5°</span></button>
            <button className="reset-align" onClick={sensors.resetHeading}>Reset</button>
            <button onClick={() => sensors.adjustHeading(5)} aria-label="Adjust sky five degrees right"><span>5°</span> →</button>
          </div>
          <small className="testing-note">For best results, test on a real phone with camera, location, and motion permissions enabled.</small>
        </aside>
      )}

      {showFieldTest && (
        <FieldTestPanel
          reading={reading}
          objects={projectedObjects}
          completedTests={completedFieldTests}
          notes={fieldTestNotes}
          onToggleTest={(id) => setCompletedFieldTests((current) => {
            const next = new Set(current)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })}
          onNotesChange={setFieldTestNotes}
          onClose={() => setShowFieldTest(false)}
        />
      )}

      <nav className="portal-nav" aria-label="Sky Portal controls">
        <button
          className={showAlignSky ? 'active' : ''}
          onClick={() => {
            setShowAlignSky((visible) => !visible)
            setShowFieldTest(false)
            setShowTonight(false)
            setShowSavedMoments(false)
          }}
          aria-expanded={showAlignSky}
        ><span>⌖</span><small>Align sky</small></button>
        <button
          className={`scan-button ${showTonight ? 'active' : ''}`}
          aria-label="Open Tonight's Sky"
          onClick={() => {
            setShowTonight((visible) => !visible)
            setShowSavedMoments(false)
            setShowAlignSky(false)
            setShowFieldTest(false)
          }}
        ><i>✦</i><small>Tonight</small></button>
        <button
          onClick={() => {
            if (!defaultBedtimeObject) return
            setShowTonight(false)
            setShowSavedMoments(false)
            setShowAlignSky(false)
            setBedtimeObject(defaultBedtimeObject)
          }}
          disabled={!defaultBedtimeObject}
        ><span>☾</span><small>Bedtime</small></button>
      </nav>

      {bedtimeObject && <BedtimeUniversePanel object={bedtimeObject} onClose={() => setBedtimeObject(null)} />}
    </main>
  )
}

function SensorQualityIndicator({ reading, hasRealSky }: { reading: SkyPortalState['reading']; hasRealSky: boolean }) {
  const items: Array<{ label: string; level: QualityLevel }> = [
    { label: 'Camera', level: sensorQuality(reading.cameraStatus) },
    { label: 'Location', level: sensorQuality(reading.locationStatus) },
    { label: 'Motion', level: sensorQuality(reading.orientationStatus) },
    { label: 'Sky calc', level: hasRealSky ? 'ready' : 'demo' },
  ]

  return (
    <div className="sensor-quality" aria-label="Sky Portal sensor quality">
      {items.map((item) => (
        <span className={`quality-${item.level}`} key={item.label}>
          <i />{item.label}<small>{qualityLabel(item.level)}</small>
        </span>
      ))}
    </div>
  )
}

function sensorQuality(status: SensorStatus): QualityLevel {
  return status
}

function qualityLabel(level: QualityLevel) {
  if (level === 'not-requested') return 'Waiting'
  if (level === 'requesting') return 'Requesting'
  if (level === 'ready') return 'Ready'
  if (level === 'demo') return 'Demo'
  if (level === 'denied') return 'Denied'
  return 'Unavailable'
}

function formatOffset(value: number) {
  return value > 0 ? `+${value}` : String(value)
}

function objectSymbol(type: 'sun' | 'moon' | 'planet' | 'star') {
  if (type === 'sun') return '☀'
  if (type === 'moon') return '☾'
  if (type === 'planet') return '●'
  return '✦'
}

function SensorDebugPanel({
  reading,
  objects = [],
  onOpenFieldTest,
}: {
  reading: SkyPortalState['reading']
  objects?: ProjectedObject[]
  onOpenFieldTest: () => void
}) {
  const number = (value: number | null | undefined, precision = 1) => value == null ? '—' : value.toFixed(precision)

  return (
    <aside className="debug-panel" aria-label="Sensor debug information">
      <div className="debug-title"><span>LIVE READINGS</span><small>{reading.isDemoMode ? 'DEMO PROJECTION' : 'SENSOR PROJECTION'}</small></div>
      <dl>
        <div><dt>Latitude</dt><dd>{number(reading.coordinates?.latitude, 4)}</dd></div>
        <div><dt>Longitude</dt><dd>{number(reading.coordinates?.longitude, 4)}</dd></div>
        <div><dt>Raw heading</dt><dd>{number(reading.rawOrientation.heading)}°</dd></div>
        <div><dt>Raw alpha</dt><dd>{number(reading.rawOrientation.alpha)}°</dd></div>
        <div><dt>Smoothed heading</dt><dd>{number(reading.smoothedOrientation.heading)}°</dd></div>
        <div><dt>Heading offset</dt><dd>{formatOffset(reading.headingOffset)}°</dd></div>
        <div><dt>Adjusted heading</dt><dd>{number(reading.orientation.heading)}°</dd></div>
        <div><dt>Beta</dt><dd>{number(reading.rawOrientation.beta)}°</dd></div>
        <div><dt>Gamma</dt><dd>{number(reading.rawOrientation.gamma)}°</dd></div>
        <div><dt>Field of view</dt><dd>{SKY_PORTAL_FIELD_OF_VIEW.horizontal}° × {SKY_PORTAL_FIELD_OF_VIEW.vertical}°</dd></div>
      </dl>
      <div className="debug-statuses">
        <span>Camera <b data-status={reading.cameraStatus}>{reading.cameraStatus}</b></span>
        <span>Location <b data-status={reading.locationStatus}>{reading.locationStatus}</b></span>
        <span>Orientation <b data-status={reading.orientationStatus}>{reading.orientationStatus}</b></span>
      </div>
      <div className="debug-objects">
        <small>PROJECTED OBJECTS</small>
        {objects.length === 0
          ? <p>No objects projected</p>
          : objects.map((object) => (
            <div key={object.id}><span>{object.name}</span><code>{object.position.screenX.toFixed(1)}, {object.position.screenY.toFixed(1)} · {object.position.isVisible ? 'on' : 'off'}</code></div>
          ))}
      </div>
      <button className="field-test-launch" onClick={onOpenFieldTest}>
        <span><small>DEVICE TOOLS</small>Field Test</span><b>Open checklist →</b>
      </button>
    </aside>
  )
}

function FieldTestPanel({
  reading,
  objects,
  completedTests,
  notes,
  onToggleTest,
  onNotesChange,
  onClose,
}: {
  reading: SkyPortalState['reading']
  objects: ProjectedObject[]
  completedTests: Set<string>
  notes: string
  onToggleTest: (id: string) => void
  onNotesChange: (notes: string) => void
  onClose: () => void
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const copySnapshot = async () => {
    try {
      await copyTextToClipboard(buildFieldTestSnapshot(reading, objects, notes))
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <aside className="field-test-panel" aria-label="Field Test Mode">
      <div className="field-test-header">
        <div><small>FIELD TEST MODE</small><h2>Phone check</h2></div>
        <div><span>{completedTests.size}/{fieldTests.length}</span><button onClick={onClose} aria-label="Close Field Test Mode">×</button></div>
      </div>
      <p>Move slowly and check each behavior as you test the real sky.</p>
      <div className="field-test-checklist">
        {fieldTests.map((test) => (
          <label key={test.id}>
            <input type="checkbox" checked={completedTests.has(test.id)} onChange={() => onToggleTest(test.id)} />
            <span>{test.label}</span>
          </label>
        ))}
      </div>
      <label className="field-test-notes">
        <span>TEST NOTES</span>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Device, browser, alignment, and anything that felt unusual…"
          rows={3}
        />
      </label>
      <button className={`copy-snapshot ${copyState}`} onClick={copySnapshot}>
        <span>{copyState === 'copied' ? 'Snapshot copied' : copyState === 'error' ? 'Copy unavailable' : 'Copy debug snapshot'}</span>
        <b>{copyState === 'copied' ? '✓' : '⧉'}</b>
      </button>
      <small className="snapshot-note">Includes device, sensor, calibration, projection, and test-note details.</small>
    </aside>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const sensors = useSkyPortalState()

  const exitPortal = () => {
    sensors.stopSensors()
    setScreen('landing')
  }

  if (screen === 'permissions') return <PermissionScreen sensors={sensors} onBack={exitPortal} onContinue={() => setScreen('portal')} />
  if (screen === 'portal') return <SkyPortal sensors={sensors} onExit={exitPortal} />
  return <Landing onStart={() => setScreen('permissions')} />
}
