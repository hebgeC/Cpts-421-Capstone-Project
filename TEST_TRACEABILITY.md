# Test traceability

The Saved tab and bookmark actions are now dormant. The SR-01 result below is
historical; current App tests verify that saving is disconnected while the
bookmark implementation retains its own tests.

Observed results below are from the automated frontend and backend suites run on
2026-10-19. Frontend API responses and device storage are mocked; backend tests
use controlled upstream fixtures. These results verify app and API behavior in
the test environment, not live third-party services.

**DEPRECATED Volunteer calendar scenarios:** The Volunteer screen was redesigned
to show links for new volunteers, returning volunteers, and group volunteering.
The former shift-calendar UI and its tests are no longer part of the current
frontend suite. Entries marked DEPRECATED below are historical results from the
former UI and do not describe current Volunteer screen coverage.

| Requirement IDs and scenario | Test mapping | Expected outcome | Observed outcome |
| --- | --- | --- | --- |
| UM-05 / FR-08 — Launch without logging in | Frontend: `frontend/__tests__/App.test.js` — “App launches without logging in and exposes primary navigation on android/ios” | Home opens directly, no login screen is required, and primary tabs are reachable. | PASS on simulated Android and iOS platform settings. The Home screen and tabs appeared without the login screen. |
| DEPRECATED — UM-08 / FR-06 — Tap Sign Up on a shift | Former frontend calendar test: `frontend/__tests__/VolunteerScreen.test.js` — “Volunteer loads shifts, opens details, excludes deleted registrations from slot counts, and signs up” | Former shift details showed availability and Sign Up opened that shift’s VolunteerHub URL. | Historical PASS from the former calendar UI; this test has been removed and does not describe current coverage. |
| UM-10/11/13 / FR-02 - Former Information links | Frontend: `frontend/__tests__/ExploreScreen.test.js` - guided paths and existing page destinations; `frontend/__tests__/DonationScreen.test.js` - donation destinations | In-Kind Giving and About Us are available through Explore; donation links remain on Donate. | PASS. The Information tab and its duplicate links were removed. |
| UM-12 / FR-02 - Explore layout and Back | Frontend: `frontend/__tests__/ExploreScreen.test.js` - guided paths and section navigation; `frontend/__tests__/App.test.js` - program and giving page return flow | Explore displays Articles, What We Do, Get Involved, and About; Back returns to Explore from sections and pages. | PASS. Guided paths and return navigation passed. |
| DM-01/02/05 / FR-05 - Donate tab | Frontend: `frontend/__tests__/DonationScreen.test.js`; `frontend/__tests__/App.test.js` - Donate tab form flow | Giving destinations are reachable from Donate. | PASS. Donation form and portal routes passed. |
| EM-01 / FR-06 — Load the Events tab | Frontend: `frontend/__tests__/EventsScreen.test.js` — “Events shows upcoming and past events, details, price and external links”; app tab navigation test | Events tab loads and renders the available event state. | PASS. The tab loaded; the fixture event data rendered. Empty-state rendering is also covered below. |
| EM-02/03 / FR-06 — Check upcoming/past sections and empty results | Frontend: `frontend/__tests__/EventsScreen.test.js` — “Events shows upcoming and past events…” and “Events handles an empty list and refreshes it”; backend: `backend/test/events.test.js` — empty upstream list cases | Upcoming and past sections are separated; an empty upcoming result shows the empty message; empty API data maps to an empty list. | PASS. Upcoming/past items and the empty-state message rendered; backend returned an empty event list for empty upstream data. |
| EM-04/05 / FR-06 — Check dates, times, venue, and address | Frontend: `frontend/__tests__/EventsScreen.test.js` — “Events shows upcoming and past events, details, price and external links”; backend: `backend/test/events.test.js` — “GET /events forwards defaults and maps the complete event contract” | Event date/time, venue, and address are displayed from the event data and preserved by the API mapping. | PASS. The expected formatted date/time, venue, and address appeared; backend mapping passed. |
| EM-06/07 / FR-06 — Check descriptions and cost | Frontend: `frontend/__tests__/EventsScreen.test.js` — event details test; backend: `backend/test/events.test.js` — complete event contract mapping | Event description and cost are displayed and preserved by the API mapping. | PASS. Description and `$10` cost appeared; backend mapping passed. |
| EM-08 / FR-06 — Tap an event card | Frontend: `frontend/__tests__/EventsScreen.test.js` — event details test | Selecting an event opens its event URL. | PASS. The event URL was passed to the system link handler. |
| DEPRECATED — EM-09 / FR-06 — Open shift details and Sign Up | Former frontend `VolunteerScreen.test.js` shift details/sign-up test | Selecting a shift showed its details; Sign Up opened the corresponding VolunteerHub page. | Historical PASS from the former calendar UI; this test has been removed and does not describe current coverage. |
| EM-11/12 / FR-06 — Simulate a failed request; pull to refresh | Frontend: `frontend/__tests__/EventsScreen.test.js` — “Events recovers from a failed request when the user pulls to refresh”; backend: `backend/test/events.test.js` — HTTP/network/invalid-payload failures | Failed event loading shows an error; pull-to-refresh retries and renders recovered data. Backend failures return a stable error response. | PASS. Refresh recovered the event list; backend error cases passed. |
| DEPRECATED — EM-13 / FR-07 — Navigate between months in volunteer calendar | Former frontend `VolunteerScreen.test.js` month navigation and picker tests; backend: `backend/test/events.test.js` — VolunteerHub time-range forwarding | Former Volunteer calendar supported month navigation and requested matching date ranges. | Historical PASS for the former UI; backend route forwarding tests remain separate API coverage. The frontend calendar test has been removed. |
| DEPRECATED — EM-15 / FR-07 — Select a date in volunteer calendar | Former frontend `VolunteerScreen.test.js` — “Volunteer selects another day and toggles it off” | Former calendar date selection filtered shifts and toggling cleared the selection. | Historical PASS from the former calendar UI; this test has been removed and does not describe current coverage. |
| EM-16 / FR-06 — Use All/Month/Day filters and keyword search | Frontend: `frontend/__tests__/EventsScreen.test.js` — “Events combines All, Month and Day filters with keyword search” | Month and day selections combine with keyword search; All restores unfiltered date results while search remains usable. | PASS. October, October 15, and All results matched the active keyword. |
| CT-01 / FR-08 - Browse stories, latest update, and page details | Frontend: `frontend/__tests__/HomeScreen.test.js`, `frontend/__tests__/ExploreScreen.test.js`, `frontend/__tests__/PageDetailScreen.test.js`; backend: `backend/test/wordpress.test.js` | Home shows the latest update; Explore opens an article-only list and the three site sections; selecting a page opens its details. | PASS. Home content, article pagination, Explore sections, and page details passed. |
| SR-01 / FR-09 — Save, restart, reopen, and remove a resource | Frontend: `frontend/__tests__/App.test.js` — “Bookmarks survive unmount and remount of the app” | A saved resource persists after app remount, can be reopened, and can then be removed. | PASS using the SecureStore test mock. The resource restored, reopened, and the Saved empty state appeared after removal. |
| NF-02/04 / Usability — Review navigation and launch on each device | Frontend: `frontend/__tests__/App.test.js` — Android/iOS platform-parameterized launch and navigation smoke test | App starts and primary navigation works on iOS and Android; device layout and usability are acceptable. | PASS for simulated Android and iOS platform settings. Physical-device launch, visual layout, and usability have not been run by this automated suite. |

## Verification run

- Frontend: `npm test` - 12 suites passed, 61 tests passed (2026-11-04).
- Backend: `npm test` — 128 tests passed.
- The initial simultaneous frontend/backend invocation reported a backend Events
  worker failure. The Events file passed alone, and the complete backend suite
  passed on a separate rerun.
