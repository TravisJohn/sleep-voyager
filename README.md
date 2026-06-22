# Sleep Voyager

Sleep Voyager is a mobile-first AR-style astronomy and bedtime exploration MVP. Point a phone at the sky, ceiling, bedroom, or window and turn the camera view into a calm portal to nearby celestial objects.

> Turn your room into a window to the universe.

## Current MVP — Phase 1 bright stars and constellations

- Polished landing, permission, and Sky Portal experience
- Camera, location, and orientation permission flow
- Live rear-camera portal with heading calibration and smoothed motion
- Graceful demo-sky fallback when camera access is unavailable
- Real Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn positions
- 30 locally curated bright stars with real location-and-time positions, magnitude, descriptions, and science notes
- Eight beginner constellations with linework drawn between projected catalogue stars: Orion, Crux, Scorpius, Canis Major, Centaurus, Carina, Lyra, and Cygnus
- Tappable discovery cards with real/demo status, science, fun facts, saving, and bedtime entry
- Tonight’s Sky view with visible solar-system objects, visible bright stars, a beginner constellation suggestion, and a simple best target
- Text-only, local-template Bedtime Universe dream voyages
- Saved Sky Moments stored locally on the device
- Mock Summer Triangle fallback when location is unavailable
- Reusable camera, geolocation, orientation, and sky-time sensor hooks
- Hidden Debug and 9-step Field Test tools
- Responsive dark cosmic styling with no paid services or secrets

## Real vs mocked

**Real:** `astronomy-engine` calculates topocentric altitude, azimuth, and above/below-horizon status for the Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn using the current time and location. The app also converts local J2000 right ascension and declination for 30 curated bright stars into real altitude and azimuth. Beginner constellation lines connect those projected star positions only when both endpoint stars are present and on screen. Tonight’s Sky, discovery cards, Saved Moments, and Bedtime Universe use these same calculated records.

**Limited or mocked:** Vega, Deneb, Altair, and Summer Triangle lines remain visual demo placeholders only when location is unavailable; their fallback screen positions are not astronomy calculations. When location exists but orientation does not, calculated objects use a small fallback arc and are not camera-aligned, while real constellation linework stays hidden. Bedtime Universe stories are local text templates: their science anchors use curated facts, while spaceship travel is explicitly labelled as dream-voyage fiction. The catalogue is intentionally small and does not yet include deep-space objects, complete constellation boundaries, or rise/set scheduling.

## Astronomy calculations

The app uses the open-source `astronomy-engine` package. Given the current latitude, longitude, and time, it calculates topocentric equatorial coordinates and converts them to atmospheric-refraction-adjusted altitude and azimuth for:

- Sun and Moon
- Mercury, Venus, Mars, Jupiter, and Saturn
- 30 curated naked-eye stars, with strong Southern Hemisphere coverage

Star catalogue coordinates are stored locally as J2000 right ascension in sidereal hours and declination in degrees. Astronomy Engine precesses each catalogue vector to the observation date, then converts it to local horizontal coordinates. Objects with altitude above 0 degrees are treated as above the local horizon. The existing projection maps azimuth relative to phone heading onto the fixed horizontal field of view and maps altitude relative to phone tilt onto the vertical field of view.

Constellation definitions contain only star IDs and line segments. A segment is drawn only when both required stars exist in the catalogue and both project into the current screen view. No invented constellation points are used.

## Sensor architecture

`useSkyPortalState` combines four focused hooks:

- `useCameraStream` manages the rear-camera stream and lifecycle.
- `useGeolocation` watches the current coordinates after permission is granted.
- `useDeviceOrientation` handles standard events and iOS permission requests.
- `useSkyTime` provides a regularly updated observation time.

The combined state exposes one typed `SkyPortalReading` to the portal. Missing or denied sensors never block entry: the camera uses a cosmic fallback, missing location activates the mock constellation, and missing orientation arranges calculated objects in a simple demo layout.

Initial **Waiting for permission** states are expected before **Allow & continue** is tapped. Real camera, location, and motion availability is confirmed only after the browser permission request runs. A denied or unavailable sensor still continues into the appropriate demo fallback.

Raw orientation readings are retained for debugging. The projected sky uses a lightweight low-pass smoothed reading to reduce jitter. Align Sky adds a manual heading offset in 5-degree steps; the offset is stored in local storage and can be reset from the calibration panel.

## Current projection limits

The projection is intentionally simple. Heading controls horizontal placement and device beta estimates the centre altitude using fixed 80 by 70 degree field-of-view values. It does not yet calibrate camera optics, screen rotation, magnetic declination, or all device-axis differences. Without orientation data, a limited set of real objects is arranged across a fallback arc and is not aligned to the camera; real constellation lines are not drawn in that state.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Camera, location, and motion access require user permission.

Physical phone testing generally requires HTTPS. Desktop `localhost` is treated as secure, but a phone opening Vite over a plain local-network IP may not receive camera or sensor permissions. Use an HTTPS-enabled local development URL or another trusted local-network setup that supports browser permissions.

## Mobile release-candidate preview

Build and start the fixed-port preview server:

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

In a second terminal, create the HTTPS Cloudflare tunnel:

```bash
npx cloudflared tunnel --url http://localhost:4173
```

Open the generated `https://...trycloudflare.com` URL in **Safari on iOS** or **Chrome on Android**. Allow camera, precise location, and motion/orientation when prompted. Keep both terminal processes running during the test.

## Field Testing

For layout-only testing on a phone connected to the same network:

```bash
npm run dev -- --host
```

Open the network URL printed by Vite. Plain HTTP over a LAN is usually not a secure browser context, so camera and motion APIs may still be blocked.

For full physical-device testing, expose the Vite server through an HTTPS-capable local proxy or development tunnel, or use a trusted local certificate. Open that secure URL on the phone and explicitly allow camera, precise location, and motion/orientation access.

### Localtunnel

Start Vite in one terminal. The configured server listens on port 5173 and accepts localtunnel hostnames:

```bash
npm run dev
```

Start localtunnel in a second terminal:

```bash
npx localtunnel --port 5173
```

Open the generated `https://...loca.lt` address and continue through localtunnel's warning page if it appears.

If the tunnel warning is followed by a white page:

- Check the phone browser console and network requests when remote debugging is available.
- Confirm the Vite terminal is still running without errors.
- Confirm localtunnel points to port 5173.
- Restart both Vite and localtunnel after configuration changes.

In Sky Portal, tap **Debug**, then **Field Test**. Work through the in-app checklist while rotating and tilting the phone slowly. Test the camera, location, motion permission, heading response, tilt smoothing, Align Sky adjustment and reset, calculated solar-system objects, and demo fallbacks.

Use **Copy debug snapshot** to place a plain-text report on the clipboard. The report includes the device/browser environment, sensor states, coordinates, raw and smoothed orientation, calibration offset, field of view, projected object coordinates, visibility, and the notes entered in Field Test Mode. Paste it into an issue, test log, or message without needing a backend.

Recommended notes to capture:

- Phone model, operating-system version, browser, and portrait/landscape orientation.
- Whether the compass direction appears correct, reversed, or offset by a repeatable number of degrees.
- Whether tilt movement feels smooth, delayed, too sensitive, or inverted.
- Which calculated objects appeared and whether their rough direction matched another sky reference.
- Permission prompts, blocked sensors, fallback behavior, and any reload-specific differences.

### iOS Safari checklist

- Confirm the motion/orientation prompt appears after tapping **Allow & continue**.
- Verify the rear camera, location, and heading readings become Ready.
- Rotate and tilt the phone slowly in portrait orientation and check object movement.
- Use **Align sky** to compare a known compass direction, then reload and confirm the offset persists.

### Android Chrome checklist

- Confirm camera and location site permissions are enabled.
- Verify heading, beta, and gamma update in Debug while moving the phone.
- Check that slow turns move objects smoothly across the screen without large jumps.
- Test Align Sky adjustment, reset, page reload, and camera fallback behavior.

### Browser orientation limitations

- Device orientation axes and compass conventions vary across browsers and hardware.
- Magnetic interference indoors can make heading readings inaccurate.
- iOS requires motion access to be requested from a user gesture.
- Some Android devices expose orientation without a reliable absolute compass heading.
- Screen rotation, camera optics, magnetic declination, and per-device sensor rates are not calibrated yet.

## Checks

```bash
npm run lint
npm run build
npm run preview
```

## Known limitations

- No backend, accounts, analytics, paid APIs, audio generation, or API keys are included.
- Bedtime Universe is local text only; there is no voice narration yet.
- Saved Moments are local to one browser/device and are not synchronized.
- The 30-star catalogue and eight beginner patterns are curated rather than exhaustive.
- Constellation line segments are learning aids, not official boundaries or complete artwork.
- Camera alignment is approximate and requires orientation access.
- Tonight’s Sky reports current horizon status but does not calculate rise/set times yet.
- Browser compass conventions, magnetic interference, camera optics, and device axes vary.
- The permission flow continues into a demo experience if some device capabilities are unavailable.

## Roadmap

- Expand to a larger star catalogue after validating mobile overlay density and performance.
- Add selected deep-space objects such as clusters, nebulae, and galaxies.
- Add black holes as clearly framed voyage destinations rather than visible sky markers.
- Evaluate Expo/native delivery for more consistent sensors and AR behavior.
- Add voice narration through a secure backend.
- Generate personalized Bedtime Universe stories through a secure backend only; never place AI API keys in the client.
