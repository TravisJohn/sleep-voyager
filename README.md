# Sleep Voyager

Initial mobile-first frontend foundation for an AR-style astronomy and bedtime exploration app.

## Included

- Landing screen and Bedtime Universe preview
- Camera, location, and orientation permission flow
- Sky Portal prototype with live rear-camera video when available
- Graceful demo-sky fallback when camera access is unavailable
- Real Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn positions
- Mock Summer Triangle fallback and tappable celestial object details
- Reusable camera, geolocation, orientation, and sky-time sensor hooks
- Sensor-driven projection with an automatic desktop demo mode
- Optional in-portal sensor debug panel
- Responsive dark cosmic styling with no paid services or secrets

## Astronomy calculations

The app uses the open-source `astronomy-engine` package. Given the current latitude, longitude, and time, it calculates topocentric equatorial coordinates and converts them to atmospheric-refraction-adjusted altitude and azimuth for:

- Sun and Moon
- Mercury, Venus, Mars, Jupiter, and Saturn

Objects with altitude above 0 degrees are treated as above the local horizon. These solar-system positions are calculated data, not mock coordinates.

The three Summer Triangle stars and their connecting lines remain visual placeholders. They appear only when location is unavailable and are clearly marked as demo content. No star catalogue is included yet.

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

The projection is intentionally simple. Heading controls horizontal placement and device beta estimates the centre altitude using fixed 80 by 70 degree field-of-view values. It does not yet calibrate camera optics, screen rotation, magnetic declination, or all device-axis differences. Without orientation data, real objects are arranged across a demo arc and are not aligned to the camera.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Camera, location, and motion access require user permission.

Physical phone testing generally requires HTTPS. Desktop `localhost` is treated as secure, but a phone opening Vite over a plain local-network IP may not receive camera or sensor permissions. Use an HTTPS-enabled local development URL or another trusted local-network setup that supports browser permissions.

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

## Scope notes

- No backend, accounts, analytics, paid APIs, audio generation, or API keys are included.
- Bedtime Universe is a preview only.
- Stars and constellations are not astronomically calculated yet.
- Camera alignment is approximate and requires orientation access.
- The permission flow continues into a demo experience if some device capabilities are unavailable.
