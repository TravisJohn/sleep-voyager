import { createBedtimeStory } from '../lib/bedtimeStories'
import type { CelestialObject } from '../types/sky'

export function BedtimeUniversePanel({ object, onClose }: { object: CelestialObject; onClose: () => void }) {
  const story = createBedtimeStory(object)

  return (
    <section className="bedtime-universe-panel" aria-label="Bedtime Universe preview">
      <div className="bedtime-stars" aria-hidden="true">✦ · ✧ · ✦</div>
      <button className="bedtime-back" onClick={onClose}>← Back to Sky Portal</button>
      <div className="bedtime-story-heading"><div className="story-moon">☾</div><small>DREAM VOYAGE · TEXT PREVIEW</small><h2>{story.title}</h2><p>{story.subtitle}</p></div>
      <article className="story-copy">
        {story.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <div className="story-science"><small>REAL SCIENCE ANCHOR</small><p>{story.scienceAnchor}</p></div>
      </article>
      <p className="narration-note">This is a preview. Voice narration comes later.</p>
    </section>
  )
}
