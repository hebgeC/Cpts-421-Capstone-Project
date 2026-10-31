# TRM App

This repository contains two runnable apps:

- `backend` (Node/Express API)
- `frontend` (Expo React Native app)

## Prerequisites

- Node.js and npm installed

## Install Dependencies

From the project root (`TRM_app`):

```bash
npm install
```

If you need to install dependencies inside each app separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Run Both Backend and Frontend Together

From `TRM_app`:

```bash
npm start
```

This starts both:

- Backend: `node server.js` (inside `backend`)
- Frontend: `expo start` (inside `frontend`)

## Run Backend Only

Option 1 (from root):

```bash
npm run backend
```

Option 2 (from backend folder):

```bash
cd backend
npm start
```

## Run Frontend Only

Option 1 (from root):

```bash
npm run frontend
```

Option 2 (from frontend folder):

```bash
cd frontend
npm start
```

## Run Both Test Suites

From `TRM_app`, run:

```bash
npm test
```

This runs the backend and frontend tests concurrently, labels their output, and
returns a nonzero exit code if either suite fails. Both suites run to completion.
Install dependencies in both `backend` and `frontend` before running tests.

For both suites with coverage reports:

```bash
npm run test:coverage
```

Reports are generated in `backend/coverage` and `frontend/coverage`.

## Performance tests

### One-time performance-test setup

Install the backend and frontend dependencies, Playwright's Chromium browser,
and k6:

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
Push-Location frontend
npx playwright install chromium
Pop-Location
winget install k6 --source winget
```

Open a new terminal after installing k6 if `k6` is not yet recognized. The
[official k6 installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/)
lists other installation options.

The browser performance tests use an Expo web export. For local runs, start the
backend with the controlled WordPress fixture so `/wpArticles` and `/wpUpdates`
return predictable responses. The calendar test also needs a valid
`VOLUNTEERHUB_API_KEY` in `backend/.env` because it calls the live VolunteerHub
service through the backend.

### Start the local performance-test services

Use separate PowerShell terminals from the repository root.

**Terminal 1: start the WordPress fixture**

```powershell
cd backend
node performance/mock-wordpress.js
```

**Terminal 2: start the backend connected to the fixture**

```powershell
cd backend
$env:WP_API_BASE_URL = 'http://localhost:3101/wp-json/wp/v2'
npm start
```

**Terminal 3: build and serve the web app**

```powershell
cd frontend
$env:EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000'
npx expo export --platform web --clear
npx expo serve
```

The Expo server normally serves the export at `http://localhost:8081`. Keep
these three terminals running while you run the tests below in another terminal.

### Measure Home page load time

From the repository root:

```powershell
cd frontend
$env:PAGE_URL = 'http://localhost:8081'
npm run test:perf:page
```

This runs 20 cold browser loads and checks that p95 is at most 3 seconds. The
test records its result in
`frontend/performance/results/page-load.json`.

### Deprecated: Measure Volunteer calendar load time

This legacy performance test measures the former Volunteer shift calendar. The
current Volunteer screen links to VolunteerHub and group opportunities, so this
test does not measure the current screen. Its test file and npm script remain as
deprecated artifacts and are not part of current performance verification.

From the repository root:

```powershell
cd frontend
$env:PAGE_URL = 'http://localhost:8081'
npm run test:perf:calendar
```

This runs five samples. Each sample starts timing when the Volunteer tab is
selected and ends after the month API requests complete and the loaded calendar
renders. It requires 10 or more successful month-page responses and checks for
a p95 of at most 3 seconds. VolunteerHub requests are live unless
`CALENDAR_PERF_MOCK_API=1` is set. Results are written to
`frontend/performance/results/calendar-load.json`.

### Measure concurrent Home users

For a short local smoke run, keep the WordPress fixture and backend running,
open another terminal in `backend/`, and run:

```powershell
cd backend
k6 run -e BASE_URL=http://localhost:3000 -e TARGET_VUS=10 -e RAMP_DURATION=5s -e HOLD_DURATION=15s -e RAMP_DOWN_DURATION=5s -e THINK_SECONDS=1 performance/home-load.js
```

This test sends the Home API requests directly to the backend. A 30,000-user
test should target a suitably provisioned staging environment, with enough load
generator capacity. To configure that run in PowerShell:

```powershell
cd backend
$env:BASE_URL = 'https://your-staging-backend.example'
$env:TARGET_VUS = '30000'
$env:ALLOW_HIGH_LOAD = '1'
$env:RAMP_DURATION = '10m'
$env:HOLD_DURATION = '30m'
$env:RAMP_DOWN_DURATION = '5m'
npm run test:perf:users
```

Replace the example staging URL before running. Runs above 100 users require
`ALLOW_HIGH_LOAD=1`. A local run can be limited by the computer running k6 and
the backend, so reaching 30,000 users locally does not establish that the
deployed service supports that load. Check that k6's `vus max` reaches the target
and that all thresholds pass. Results for browser performance runs are saved
under `frontend/performance/results/`.

See [`PERFORMANCE_TESTING.md`](PERFORMANCE_TESTING.md) for configuration
options, thresholds, mock modes, and additional details.

## Notes

- Backend default port is `3000` (as logged by the server).
- For Expo, use the terminal QR code or on-screen options to launch on a device/emulator.

---

# Tacoma Rescue Mission Unified Mobile App

## Project summary

### One-sentence description of the project

The Tacoma Rescue Mission Unified Mobile App brings TRM stories, program information, events, giving resources, and VolunteerHub shifts into one mobile-friendly experience for community members and volunteers.

### Additional information about the project

This project provides a single place to explore Tacoma Rescue Mission's work and take action. The Expo/React Native frontend presents content from `trm.org` in native mobile screens, while the Node/Express backend acts as a small integration layer for the WordPress and VolunteerHub APIs.

Users can browse client stories and organizational updates, learn about TRM programs, view upcoming and past events, save useful resources on their device, follow donation and support links, and find available volunteer shifts on a monthly calendar. Keeping third-party requests in the backend also provides one place to normalize API responses and keep credentials, such as the VolunteerHub API key, off mobile devices.

The repository also contains an optional WordPress authentication plugin in `wordpress-plugin/`. Its purpose and deployment instructions are documented in `wordpress-plugin/README.md`; the current app navigation does not yet expose that authentication flow.

## Installation

### Prerequisites

- Git.
- Node.js 20 LTS or newer and npm.
- Expo Go on a physical iOS or Android device, or an Android/iOS emulator.
- Android Studio and an Android SDK for local Android emulation.
- For local iOS builds: macOS, Xcode, Ruby 2.6.10 or newer, Bundler, and CocoaPods. iOS Simulator builds are not available on Windows or Linux.
- A VolunteerHub API key from the organization's VolunteerHub administrator to populate the volunteer calendar.
- Internet access to retrieve live content from the TRM WordPress, Events Calendar, and VolunteerHub services.

### Add-ons

- **Expo and React Native:** provide the cross-platform mobile runtime and development server.
- **React Navigation:** supplies the bottom-tab and stack-based navigation used throughout the app.
- **React Native WebView:** opens donation, support, careers, and other external web experiences without leaving the app.
- **Expo SecureStore:** persists saved resources on native devices; the web build uses browser `localStorage`.
- **React Native Render HTML:** renders WordPress article and page content in native detail screens.
- **Express, Axios, CORS, and dotenv:** power the backend API proxy, outbound service requests, development access, and environment configuration.
- **TRM WordPress REST API and The Events Calendar API:** provide stories, updates, program pages, and public events from `trm.org`.
- **VolunteerHub API:** supplies volunteer shift availability and detail data. It requires `VOLUNTEERHUB_API_KEY` in `backend/.env`.
- **TRM WordPress authentication plugin:** provides an optional, administrator-protected authentication bridge. See `wordpress-plugin/README.md` before installing or enabling it.

### Installation Steps

Run the following commands from the directory that contains this README:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Create the backend environment file on macOS or Linux:

```bash
cp backend/.env.example backend/.env
```

Or create it in PowerShell on Windows:

```powershell
Copy-Item backend/.env.example backend/.env
```

Open `backend/.env` and supply the credentials needed by the integrations you plan to use:

```dotenv
VOLUNTEERHUB_API_KEY=your-volunteerhub-api-key
WP_SITE_URL=https://www.trm.org
WP_ADMIN_USERNAME=your-wordpress-admin-username
WP_ADMIN_APP_PASSWORD=your-wordpress-application-password
JWT_SECRET=your-long-random-secret
```

`VOLUNTEERHUB_API_KEY` is required by the volunteer shift routes. The WordPress administrator values and `JWT_SECRET` are intended for the optional authentication integration and are not needed to read the public WordPress content used by the current app. Never commit `backend/.env`.

To install the native iOS Ruby and CocoaPods dependencies, run the required Bundler setup on macOS:

```bash
cd frontend
bundle install
cd ios
bundle exec pod install
cd ../..
```

Start both applications from the project root:

```bash
npm start
```

For the clearest Expo QR code and logs, run the services in separate terminals:

```bash
# Terminal 1, from the project root
npm run backend
```

```bash
# Terminal 2, from the project root
npm run frontend
```

On macOS or Linux with Bash and `tmux` installed, `npm run dev` opens the backend and Expo server in side-by-side `tmux` panes. This helper is not compatible with a standard Windows PowerShell session.

After Expo starts, scan the QR code with Expo Go or press the terminal shortcut for an installed emulator. The physical device and development computer must be able to reach each other on the same local network so the app can connect to the backend on port `3000`.

## Functionality

1. **Start on Home.** Browse the featured client story, recent organizational updates, and additional stories loaded from the TRM WordPress API.
2. **Explore TRM.** Open the Explore tab to search articles and updates or browse About, What We Do, Get Involved, and Contact resources. Native pages display WordPress content, while resources such as Donate and Careers open their external sites.
3. **Review events.** Use the Events tab to search and switch between upcoming and past public TRM events. Selecting an event opens its full listing on `trm.org`.
4. **Find a volunteer shift.** Use the Volunteer tab to move between months or choose a month and year. Dates with available shifts are marked; select a date and then a shift to view its time, location, description, availability, and VolunteerHub sign-up link.
5. **Save resources.** Tap the bookmark icon on an article or supported resource. Saved items remain available from the Saved tab and can be reopened or removed later.
6. **Use quick links.** Open the Information tab for donation, in-kind giving, About TRM, and help/contact links in the in-app browser.

The backend listens on port `3000` by default and exposes the frontend-facing routes under `/events`, `/volunteerShiftEvent`, `/wpUpdates`, `/wpArticles`, `/wpResources`, `/siteMap`, and `/wpPage/:slug`.

## Known Problems

- **The `npm run dev` helper is platform-specific.** The root script calls `dev.sh`, which requires Bash and `tmux`; it will not run in ordinary Windows PowerShell. Use `npm start`, or run `npm run backend` and `npm run frontend` in separate terminals.
- **Device end-to-end coverage is limited.** The automated suites cover backend routes and frontend components, and the performance tests cover the Expo web build and backend API load. They do not measure native iOS or Android startup and rendering; live third-party integrations still require valid credentials and should be checked when those integrations change.
