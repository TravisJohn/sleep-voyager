# Sleep Voyager Project Log

## Project Identity

Sleep Voyager is a mobile-first AR-style astronomy and bedtime exploration app.

Core idea:
Users open their phone camera and point it at the sky, ceiling, bedroom, wall, or window. The app overlays celestial bodies based on the user’s location, time, and device orientation, creating the feeling of a “Sky Portal.”

Emotional hook:
“Turn your room into a window to the universe.”

The app is intentionally anti-doomscrolling: instead of scrolling in bed, users can explore the real sky above them and later drift into calm cosmic bedtime stories.

## Local Project Path

D:\WEB PROJECTS\Sleep Voyager

## GitHub Repository

https://github.com/TravisJohn/sleep-voyager

## Deployment

The app is deployed on Vercel.

Main deployment source:
main branch

## Current Tech Stack

- Vite
- React
- TypeScript
- CSS
- astronomy-engine
- localStorage for saved moments/preferences
- Vercel deployment
- Cloudflare Tunnel used for HTTPS mobile testing during development

## Core Working Systems

The following systems have been implemented and tested:

- Landing page
- Permission flow
- Camera stream
- Camera fallback/demo mode
- Geolocation
- Device orientation / motion
- Orientation smoothing
- Manual heading calibration via Align Sky
- Sensor quality indicators
- Debug panel
- Field Test mode
- Field Test snapshot export
- Real solar-system calculations
- Sky Portal AR-style overlay
- Discovery cards
- Tonight’s Sky
- Saved Sky Moments
- Text-only Bedtime Universe preview
- Vercel deployment

## Confirmed Mobile Test

A real phone test passed 9/9 for the earlier MVP:

- Sky Portal opens
- Camera permission works
- Location permission works
- Motion/orientation works
- Phone movement affects overlay
- Align Sky works
- Real solar-system objects appear
- Demo fallback works
- Field Test tools work

## Important Mobile Testing Notes

For local mobile testing, use production preview plus Cloudflare Tunnel:

Terminal 1:

npm run build
npm run preview -- --host 0.0.0.0 --port 4173

Terminal 2:

npx cloudflared tunnel --url http://localhost:4173

Open the generated HTTPS trycloudflare URL on a phone.

Use:
- Safari on iOS
- Chrome on Android

Avoid:
- Google app browser
- Facebook/Messenger in-app browser
- plain local HTTP for full sensor testing

Reason:
Camera, geolocation, and motion/orientation APIs often require HTTPS / secure context on mobile browsers.

## Git Branches and Releases

Known branches:

- main
  Stable deployed branch.

- sky-portal-polish
  Added polished MVP release candidate features.

- phase-1-bright-stars-constellations
  Added real bright stars and beginner constellations.
  This was merged into main.

- sky-detail-control
  Added Sky Detail and Focus Area.
  Status: implemented and locally tested. Confirm whether it has been merged to main and deployed to Vercel.

Known commits:

- 3d98027
  Working mobile Sky Portal prototype

- 431bc2b
  Polish Sleep Voyager MVP release candidate

- daec84c
  Phase 1 bright stars and beginner constellations merged to main

Suggested tags:
- v0.1.0 = first working deployed mobile Sky Portal MVP
- v0.2.0 = stars, constellations, Sky Detail, and Focus Area

## Astronomy Features

### Real Calculated Objects

The app calculates real position/visibility for:

- Sun
- Moon
- Mercury
- Venus
- Mars
- Jupiter
- Saturn

Calculations use:
- current time
- user latitude
- user longitude
- astronomy-engine

### Bright Star Catalogue

Phase 1 added around 30 curated bright stars, including:

- Sirius
- Canopus
- Alpha Centauri
- Arcturus
- Vega
- Capella
- Rigel
- Procyon
- Betelgeuse
- Achernar
- Hadar
- Altair
- Acrux
- Aldebaran
- Spica
- Antares
- Fomalhaut
- Deneb
- Mimosa
- Regulus
- Shaula
- Adhara
- Gacrux
- Bellatrix
- Miaplacidus
- Alnitak
- Sadr
- Imai
- Albireo
- Sheliak

### Beginner Constellations

Phase 1 added:

- Orion
- Crux / Southern Cross
- Scorpius
- Canis Major
- Centaurus
- Carina
- Lyra
- Cygnus

Constellation lines render only when both endpoint stars are available/projected.

## Sky Detail Control

Sky Detail was added to reduce overlay clutter.

Levels:

1. Calm
   Sun, Moon, and visible planets only.

2. Simple
   Solar-system objects plus the brightest few stars.

3. Guided
   Default level. Solar-system objects, important bright stars, and beginner constellation lines when not too dense.

4. Explorer
   Most curated stars plus constellation lines and more labels.

5. Full
   Richest current overlay with all curated stars and beginner constellation linework.

Preference is persisted in localStorage.

## Focus Area

Focus Area was added as an alternative to zoom.

Purpose:
When the overlay is dense, users can inspect the current part of the sky in a clean list view.

Behavior:
- Captures up to 18 on-screen or nearby objects
- Sensors continue running
- Sorts by:
  1. on-screen first
  2. distance from center
  3. importance / apparent magnitude
- Learn opens DiscoveryCard
- Save stores a Sky Moment

## Real vs Mocked

Real:
- Sun, Moon, planets
- curated bright stars
- beginner constellation linework
- current location/time-based positioning

Mocked / limited:
- Summer Triangle fallback when location is unavailable
- no full star catalogue yet
- no deep-space objects yet
- no black holes yet
- no real audio narration yet
- no backend
- no AI API integration
- no user accounts
- no full rise/set planning yet

## Product Direction

Sleep Voyager should feel like:

- bedroom planetarium
- calm science companion
- AR sky portal
- bedtime cosmic journey
- anti-doomscrolling ritual

The product should not feel like:
- an engineering dashboard
- a cluttered astronomy database
- a noisy social app
- a fake science app

Important product rule:
AI can explain, simplify, narrate, and personalize later, but it should not invent astronomy facts.

## Future Roadmap

Recommended next phases:

### Phase 2 — Deep Space Objects

Add curated educational objects:
- Orion Nebula
- Andromeda Galaxy
- Pleiades
- Magellanic Clouds
- Omega Centauri
- Eta Carinae Nebula
- Tarantula Nebula

Some should be sky-positioned where possible.

### Phase 3 — Black Holes and Voyage Destinations

Add black holes as “Voyage Destinations,” not necessarily visible sky overlays.

Examples:
- Sagittarius A*
- M87*
- Cygnus X-1
- Gaia BH1

Important:
Black holes should be presented as educational/interstellar journey objects, not as visible camera stars.

### Phase 4 — Bedtime Universe Voice

Add narrated bedtime journeys.

Important:
- No API keys in frontend
- Use backend only for AI or voice APIs
- Keep stories scientifically honest
- Clearly label fictional spaceship travel as dream/voyage mode

### Phase 5 — Expo / Native Mobile App

Consider migrating to Expo/React Native when:
- web MVP is stable
- sensor/camera UX needs native reliability
- App Store / Play Store release becomes a goal

## Tomorrow Startup Checklist

When resuming in a fresh ChatGPT or Codex session:

1. Open project:
   D:\WEB PROJECTS\Sleep Voyager

2. Check branch:
   git status

3. Confirm latest branch:
   git branch

4. If continuing Sky Detail:
   git checkout sky-detail-control

5. If Sky Detail is already merged:
   git checkout main
   git pull origin main

6. Run:
   npm install
   npm run lint
   npm run build

7. For local mobile test:
   npm run preview -- --host 0.0.0.0 --port 4173
   npx cloudflared tunnel --url http://localhost:4173

8. Test on phone:
   - Sky Portal
   - camera/location/motion
   - Sky Detail 1, 3, 5
   - Focus Area
   - Learn
   - Save
   - Tonight’s Sky
   - Bedtime Universe
   - Debug / Field Test

## Recommended Next Immediate Task

If Sky Detail and Focus Area have not been merged:

1. Commit sky-detail-control
2. Push sky-detail-control
3. Merge into main
4. Push main
5. Wait for Vercel redeploy
6. Test live Vercel URL on phone
7. Tag v0.2.0

Commands:

git checkout sky-detail-control
git status
git add .
git commit -m "Add Sky Detail and Focus Area controls"
git push -u origin sky-detail-control

git checkout main
git pull origin main
git merge sky-detail-control
git push origin main

git tag v0.2.0
git push origin v0.2.0

## Fresh ChatGPT Prompt for Tomorrow

Use this prompt in a new ChatGPT session:

“I am building Sleep Voyager, a Vite + React + TypeScript mobile-first AR-style astronomy app. The local path is D:\WEB PROJECTS\Sleep Voyager and the GitHub repo is https://github.com/TravisJohn/sleep-voyager. Please read PROJECT_LOG.md first and act as the orchestrator/architect while I use Codex as executor. Help me continue from the current state, preserve the working mobile Sky Portal, and guide the next implementation safely.”

End of log.
