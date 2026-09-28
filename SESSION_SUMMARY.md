# Session Summary — trm.org Site Map Integration & Deployment Prep

## Summary of changes

### 1. Site-map coverage (backend + frontend)

- `backend/config/siteMap.js` (new) — the full trm.org site map: About, What We Do's 11 program pages, Get Involved's sub-pages, Contact, plus external links (Donate, Careers) — all slugs verified live against trm.org.
- `backend/controllers/wpController.js` / `wpRoutes.js` — added `GET /siteMap` and generic `GET /wpPage/:slug` (replaces the old hardcoded single Shelter page).
- `backend/controllers/eventController.js` / `eventRoutes.js` — replaced HTML-scraping (`/trmEvent`) with a clean `GET /events` backed by trm.org's Tribe Events REST API.
- `frontend/src/screens/PageDetailScreen.jsx` (new, replaces deleted `ShelterScreen.jsx`) — generic native page renderer for any WP page by slug.
- `frontend/src/screens/ExploreScreen.js` — now a full site-map hub (Articles, Updates, About, What We Do, Get Involved, Contact cards).
- `frontend/src/screens/EventsScreen.js` — same UI, now backed by the clean JSON endpoint instead of scraped HTML.
- `frontend/src/screens/ProfileScreen.jsx` — fixed "Donation Portal" to point at `support.trm.org` (was wrongly pointing at `/inkind/`); added a separate "In-Kind Giving" link.

### 2. Environment/tooling fixes (pre-existing, unrelated to the feature work, but blocking)

- Root and `backend/` had `node_modules` accidentally committed to git (no `.gitignore` covering them) — added proper `.gitignore` entries and `git rm --cached` to untrack (files still on disk, nothing committed to history yet).
- `frontend/node_modules` was internally corrupted (files existed on disk but Metro's bundler couldn't resolve them) — fixed with a clean `rm -rf node_modules && npm install`.
- Added `dev.sh` + `npm run dev` at the repo root — runs backend and Expo side-by-side in one terminal window via `tmux` panes, since piping through `concurrently` (the old `npm start`) breaks Expo's QR code rendering.

### 3. Connectivity bugs (found during testing on a physical device)

- `frontend/src/utils/api.js` was hardcoding `localhost:3000`, which only works in a simulator — on a real phone, "localhost" means the phone itself. Fixed to detect Expo's actual LAN host dynamically (via the new `expo-constants` dependency).
- `frontend/src/components/CalendarView.js` had its own duplicate copy of that same bug (affecting the Volunteer tab) — fixed the same way.
- `frontend/src/screens/ProfileScreen.jsx` was showing a hardcoded fake name/email regardless of who logged in — now reads the real captured `displayName` from `AuthContext`.

### 4. Deployment prep (not yet executed)

- `backend/server.js` now binds to `process.env.PORT` (Railway requirement); `backend/package.json` split into `start` (production) / `dev` (nodemon); added `"type": "module"`.
- `frontend/eas.json` (new) + `publish:ios` npm script for one-command App Store builds, once Apple/Expo credentials are set up.
- Flagged (not fixed): the git `origin` remote has a GitHub personal access token embedded in plaintext — worth revoking/rotating.

## What's functioning right now

| Area | Status |
|---|---|
| Home (featured story, updates) | ✅ working |
| Explore hub (About/What We Do/Get Involved/Contact + Articles/Updates) | ✅ working |
| Events tab | ✅ working, now via clean JSON |
| Article/Page detail screens | ✅ working |
| Profile (real name, fixed donation/in-kind links) | ✅ working |
| Bookmarks/Saved | ✅ unaffected, working as before |
| Volunteer tab (shift calendar) | ❌ blocked — see below |
| Donate / Careers / In-Kind / VolunteerHub sign-in | ✅ opens correctly (external WebView/deep-link) |
| Production backend on Railway | ⏳ not deployed yet — CLI installed, not logged in |
| App Store build/submit | ⏳ config ready, not run — needs one-time `eas login` + Apple credential setup |

## How to start the app

```
npm run dev
```
from the repo root. This opens one terminal window split into two tmux panes: backend (`nodemon`) on the left, `npx expo start` on the right with a real QR code. Scan it with Expo Go (same Wi-Fi network as your Mac). `Ctrl-b` then arrow keys to switch panes; `Ctrl-b d` to detach without killing it.

## The VolunteerHub API key issue

The Volunteer tab's calendar (`CalendarView.js`) fetches shift data through `backend/controllers/eventController.js`, which requires `VOLUNTEERHUB_API_KEY` in `backend/.env`. That key isn't set, so every request throws `Missing VOLUNTEERHUB_API_KEY` before it ever reaches VolunteerHub — that's the error visible in the `npm run dev` terminal.

The key itself is issued on **VolunteerHub/Bloomerang's side** (an admin-level API credential from your organization's VolunteerHub account settings) — it's not something generated from this codebase, so whoever administers TRM's VolunteerHub account needs to produce it.

Once you have it: add `VOLUNTEERHUB_API_KEY=<the key>` to `backend/.env`, then **manually restart** the backend pane (`nodemon` only watches `.js`/`.json` files, not `.env`, so it won't pick up the change on its own — `Ctrl-C` then rerun, or type `rs` in that pane). After that, the calendar should populate with real shifts, tapping a day shows shift cards, and tapping a shift opens details with a working "Sign Up" link out to VolunteerHub.
