# Simple Calculator App

A lightweight, installable Progressive Web App (PWA) that provides a simple, fast, and accessible calculator experience. Designed mobile-first with large touch-friendly buttons, keyboard support, and offline availability.

## Features

- ✅ Mobile-first responsive design optimized for portrait and landscape
- ✅ Offline functionality with Service Worker (app shell + assets cached)
- ✅ Installable PWA manifest for app-like experience (homescreen icon, full-screen)
- ✅ Tailwind CSS for clean, consistent styling
- ✅ Basic calculator operations: addition, subtraction, multiplication, division
- ✅ Decimal support, percent, clear (C), all-clear (AC), and parentheses
- ✅ Keyboard input support and common shortcuts (Enter = =, Backspace = delete)
- ✅ Calculation history & memory (persistent while app is open; optional persistence)
- ✅ High-contrast accessible UI and dark mode toggle
- ✅ Deployed to GitHub Pages (see /docs)

## How to Use

- Tap numeric and operator buttons to construct an expression.
- Use the "=" button or press Enter to evaluate.
- Press Backspace (or the ⌫ button) to remove the last character.
- Use "AC" to clear the entire entry, "C" to clear the current number.
- Use the memory/history panel to review recent calculations (persists during session).
- Toggle dark mode from the app header to switch themes for low-light use.
- Install the app from the browser install prompt to run it like a native app.

## Files

- `index.html` - Main HTML file containing the calculator UI and manifest link
- `style.css` - CSS styles (Tailwind + small custom overrides)
- `script.js` - Calculator logic: parsing, evaluation, history, keyboard handling
- `manifest.json` - PWA manifest (icons, name, display, start_url)
- `service-worker.js` - Offline functionality and asset caching

Notes:
- The service worker caches the app shell and static assets to allow offline calculation and fast start-up.
- The calculator logic runs fully in the client; no network calls are required for calculations.

## Deployment

This app is intended to be deployed to GitHub Pages. The repository may include a `/docs` folder with the production build for Pages:

- Place the production-ready files into `/docs` (or configure GitHub Pages to use `main` branch / root).
- The site URL will show the hosted calculator and supports PWA install flow.

Quick checklist for deployment:
1. Ensure `manifest.json` contains correct `start_url` (relative to repo root or docs folder).
2. Include the icons referenced in the manifest in the repository.
3. Ensure `service-worker.js` is registered from the root or from the same scope where you want offline support.

## Local Development

To run this app locally:

1. Clone the repository:
   git clone <repo-url>
2. Open `index.html` in a modern web browser, or run a local static server:
   python -m http.server 8000
3. Visit http://localhost:8000 (or the configured port) to test.

For a better PWA test (service worker, install prompt), serve over localhost or HTTPS. Using a simple static server is recommended rather than file://.

## PWA Features

- Installable as a native-like app (via browser install prompt or Add to Home Screen)
- Works offline using service worker caching (app shell + static assets)
- Responsive and touch-friendly layout for phones and tablets
- Fast loading and snappy UI thanks to Tailwind CSS and cached assets
- Safe progressive enhancement: calculator still works if JS is unavailable (basic fallback UI)

## Accessibility & UX Notes

- Large tap targets and high-contrast color scheme for readability.
- Keyboard support for power users and desktop usage.
- ARIA labels and semantic HTML used where appropriate for screen readers.
- Dark mode for comfortable night-time use.

## Customization

To adapt the calculator:
- Update `style.css` (Tailwind utilities + custom rules) to tune colors, spacing, and button shapes.
- Extend `script.js` for additional operations (sqrt, exponent, trig) or persistent history via localStorage.
- Modify `manifest.json` to change app name, theme color, and icons.

## Troubleshooting

- If the install prompt doesn't appear, ensure the app is served over HTTPS or localhost, has a valid manifest, and a registered service worker.
- Clear site data or unregister service worker if you observe stale cached files during development.

## Contributing

Contributions are welcome — pull requests, bug reports, and feature suggestions. Please follow standard GitHub workflow and include brief descriptions for changes.

Enjoy the Simple Calculator App!