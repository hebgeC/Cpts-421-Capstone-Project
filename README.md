# Tacoma Rescue Mission mobile app

## Capstone reports

- [Sprint 1](sprint%201.pdf)
- [Sprint 2](Sprint2.pdf)
- [Sprint 3](Sprint%203.pdf)
- [Sprint 4](Sprint%204.pdf)
- [Sprint 5](Sprint%205.pdf)

The active Expo/React Native app reads public stories, updates, pages, and events directly from `trm.org`. The public API mapping lives in `frontend/src/services/wordpress.js` and `frontend/src/services/events.js`; the Explore site map lives in `frontend/src/services/siteMap.js`.

## What the app does

The bottom navigation has five tabs:

- **Home** shows a featured article, the latest TRM update, and Contact Us and Need Help links.
- **Explore** opens a paginated article list and guided sections for What We Do, Get Involved, and About. WordPress pages open in native detail screens; external destinations such as Careers open in an in-app browser.
- **Events** shows upcoming and recent past events. Search matches event titles and venues, and List, Month, and Day controls filter by date. Event cards open their listings on `trm.org` in the device browser.
- **Volunteer** offers links for new and returning volunteers, group volunteering, and court-ordered community service. These destinations open in the in-app browser; the former shift calendar is no longer in the tab.
- **Donate** offers Donate Here and Donation Portal links, both opened in the in-app browser. The portal is for signing in to an existing donation account.

Articles and WordPress pages render their content in the app and offer links to the full pages on `trm.org`.

## Start the app

Install Node.js 24 LTS (24.3 or newer), then run from this directory:

```powershell
npm install
npm --prefix frontend install
npm start
```

Expo prints a QR code for Expo Go. Install the SDK 58 version of [Expo Go](https://expo.dev/go) on your phone and scan the code. Press `a` for an Android emulator or `w` for the web build.

The checked-in `frontend/ios` and `frontend/android` projects contain native files from an earlier SDK. Regenerate or migrate them before using `expo run:ios`, `expo run:android`, or EAS Build.

The active app requires internet access to `https://www.trm.org`. It does not need a local backend or API credentials. To use a WordPress fixture or staging service, set `EXPO_PUBLIC_WP_API_BASE_URL` to its `/wp-json/wp/v2` URL. Set `EXPO_PUBLIC_EVENTS_API_URL` to the full Events Calendar endpoint when needed.

## Tests

```powershell
npm --prefix frontend test -- --watch=false
```

`npm test` also runs the legacy backend suite. The old browser and load test setup is described in [PERFORMANCE_TESTING.md](PERFORMANCE_TESTING.md); those scenarios target the legacy API and need updating before they can measure the direct API app.

To run both suites from the repository root, install the backend dependencies first with `npm --prefix backend install`, then run `npm test`. The frontend tests use mocked network calls and do not need a running backend or API credentials. See [frontend/TESTING.md](frontend/TESTING.md) for test details.

## Legacy backend

`backend/` remains in the repository for older app builds that call the deployed Render API. The current screens do not call it. For legacy development, install its dependencies with `npm --prefix backend install`, then start it with `npm run backend` or run it alongside Expo with `npm run start:legacy`. Keep the deployed service running while installed builds that reference it remain supported.

The old VolunteerHub shift calendar (`frontend/src/components/CalendarView.js`) uses credentialed routes on that backend, but the active Volunteer tab opens VolunteerHub directly. Never put `VOLUNTEERHUB_API_KEY` or WordPress administrator credentials in Expo environment variables or frontend code. If the credentialed calendar or WordPress account authentication returns, it will need a protected server integration.

## Inactive features

The Saved tab and save actions are disconnected from the active app. Their implementation remains in `frontend/src/screens/BookmarksScreen.js` and `frontend/src/context/SavedResourcesContext.js`, with dedicated tests in `frontend/__tests__/BookmarksScreen.test.js`. Existing saved items are left in local device storage for a possible future restoration.

`frontend/src/screens/LoginScreen.js` and the optional authentication integration in `wordpress-plugin/` are also outside the active navigation. See [wordpress-plugin/README.md](wordpress-plugin/README.md) for the plugin's separate setup instructions.
