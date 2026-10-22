# Performance tests

These tests implement the Home page load target (p95 at or below 3 seconds)
and the 30,000 concurrent user target. The page test measures an Expo **web**
export. It does not measure startup or screen rendering on an iOS or Android
device.

## Home page load

`frontend/performance/page-load.spec.js` starts a fresh Chromium browser context
for each run. It measures from navigation start to the loaded Home content reaching
the DOM, after both `/wpArticles` and `/wpUpdates` return HTTP 200. It fails on a
Home error or if the nearest-rank p95 exceeds 3,000 ms. The defaults are 20 cold
loads at a 390 x 844 viewport. Results are written to
`frontend/performance/results/page-load.json`.

Install the frontend dependencies and Playwright's Chromium browser:

```powershell
cd frontend
npm ci
npx playwright install chromium
```

Build a production web export with a reachable staging API. Replace the example
host below with your actual backend URL; `your-staging-backend.example` is only
a placeholder. Expo embeds this URL at build time, so rebuild when it changes:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL = 'https://your-staging-backend.example'
npx expo export --platform web --clear
npx expo serve
```

In a second terminal, from `frontend/`:

```powershell
$env:PAGE_URL = 'http://localhost:8081'
npm run test:perf:page
```

Use the same network, geographic location, and hosting setup for comparable
runs. The app's default production API URL is still a placeholder, so set
`EXPO_PUBLIC_API_BASE_URL` before exporting. On a machine with Microsoft Edge
installed, `PERF_BROWSER_CHANNEL=msedge` uses it instead of downloading
Playwright's Chromium. `PAGE_LOAD_RUNS`, `PAGE_LOAD_P95_MS`, and
`PAGE_READY_TIMEOUT_MS` can be changed with environment variables. Set
`PERF_BUILD_ID` to include the deployed build identifier in the result file.

For a quick check that the browser test works without an API, set
`PERF_MOCK_API=1`. That mode replaces the two API responses inside Playwright;
its timing is **not** evidence that the deployed app meets the 3-second target.

## Volunteer calendar load

`frontend/performance/calendar-load.spec.js` measures from selecting the
Volunteer tab through completion of the month-page API requests and the next
browser paint after the loaded calendar renders. The calendar currently requests
10 pages in parallel (and requests additional pages if page 10 is full). The
test requires at least 10 successful HTTP 200 responses per run and records
each response duration. Results are written to
`frontend/performance/results/calendar-load.json`.

```powershell
cd frontend
$env:PAGE_URL = 'http://localhost:8081'
npm run test:perf:calendar
```

The default is five runs with a 3,000 ms p95 target. Use a web export configured
for the backend you want to measure. To exercise the browser flow with synthetic
API responses, set `CALENDAR_PERF_MOCK_API=1`; this measures the UI and mock
delay, not backend or upstream performance. Set `CALENDAR_PERF_MOCK_DELAY_MS`,
`CALENDAR_LOAD_RUNS`, or `CALENDAR_LOAD_P95_MS` to adjust the mock delay, sample
count, or target.

## Concurrent users

`backend/performance/home-load.js` uses k6 to simulate active users repeatedly
opening Home. Each virtual user requests `/wpArticles` and `/wpUpdates` in
parallel, validates their JSON shapes, then waits about 30 seconds with jitter.
The test ramps to the requested user count, holds it, and ramps down. Defaults
are 10 users, a 30-second ramp, a 1-minute hold, and a 30-second ramp down.

The script checks that at least the target number of distinct VUs started an
iteration, fewer than 1% of HTTP requests and Home journeys fail, and API
request p95 stays below 3,000 ms. Confirm that the k6 summary's `vus max`
also reached the target during the hold stage.
The error and API latency limits are explicit test assumptions; adjust them if
the project's service requirements specify different limits. A sleeping VU
represents an active session, not a request continuously in flight.

Install the [k6 CLI](https://grafana.com/docs/k6/latest/set-up/install-k6/).
Point `BASE_URL` at the backend, not the Expo web URL. For a small local check,
run these in separate terminals from `backend/`:

```powershell
# Terminal 1: controlled WordPress fixture
node performance/mock-wordpress.js
```

```powershell
# Terminal 2: backend connected to that fixture
$env:WP_API_BASE_URL = 'http://localhost:3101/wp-json/wp/v2'
npm start
```

```powershell
# Terminal 3: short load-test smoke run
k6 run -e BASE_URL=http://localhost:3000 -e TARGET_VUS=10 -e RAMP_DURATION=5s -e HOLD_DURATION=15s -e RAMP_DOWN_DURATION=5s -e THINK_SECONDS=1 performance/home-load.js
```

For the 30,000-user run, use a production-like staging deployment and a
controlled upstream that can support the planned traffic. Configure
`WP_API_BASE_URL` on the staging backend when using a controlled WordPress
service. Size or distribute the k6 generators so they can create 30,000 VUs;
otherwise the generator can be the limit instead of the app.

```powershell
$env:BASE_URL = 'https://your-staging-backend.example'
$env:TARGET_VUS = '30000'
$env:ALLOW_HIGH_LOAD = '1'
$env:RAMP_DURATION = '10m'
$env:HOLD_DURATION = '30m'
$env:RAMP_DOWN_DURATION = '5m'
npm run test:perf:users
```

The `ALLOW_HIGH_LOAD` setting prevents an accidental run above 100 VUs.
Record the k6 summary, backend metrics, deployment size, upstream setup, and
the exact load profile with the observed result. The local fixture is useful
for checking the script and backend route behavior; it is not a 30,000-user
system result.
