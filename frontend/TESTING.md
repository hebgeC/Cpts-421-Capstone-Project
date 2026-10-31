# Frontend tests

The suite covers the nine screens registered in `App.js`, their main interactions,
and navigation between screens. Login is intentionally excluded because the app
does not use that screen. The disconnected authentication/logout components are
also excluded from the coverage report.

## Tools

- **Jest 29** runs tests, assertions, mocks, watch mode, and coverage.
- **jest-expo 54** provides the test environment and Expo/native module mocks for
  this project's Expo SDK 54.
- **React Native Testing Library 13** renders screens, queries visible content
  and accessibility labels, fires presses/search/scroll/refresh events, and waits
  for async UI changes.
- **react-test-renderer 19.1.0** is the renderer required by Testing Library 13.
  Its version is pinned to match the app's React version; upgrade them together.
- **Real React Navigation navigators** in `App.test.js` test tab switching, stack
  routes, route parameters, and back navigation. Individual screen tests use
  navigation spies to check destinations precisely.

No backend, credentials, emulator, device, or running Metro server is required.

## Coverage by screen

| Screen | Suite | Tests | Behaviors covered |
| --- | --- | ---: | --- |
| Home | `__tests__/HomeScreen.test.js` | 3 | Featured/recent stories and updates; opening each resource; See all; empty stories; ignoring untitled updates; failed fetch and Retry recovery. |
| Explore | `__tests__/ExploreScreen.test.js` | 8 | Opening articles; saving/removing bookmarks; Articles/Updates category filters and clearing a category; internal-page and external-link destinations and bookmarks; scroll pagination with deduplication; failed next-page fetch with retry; failed initial load and Retry; empty resources/category; ignoring stale responses after changing categories. |
| Events | `__tests__/EventsScreen.test.js` | 9 | Initial loading; upcoming/past events and formatted times, price, location and description; opening event/source links; case-insensitive title/venue search and no matches; real day/month picker selections and cancellation; returning to List; empty list and pull-to-refresh; network/HTTP errors and Retry; ignoring stale requests after switching filters. |
| Volunteer | `__tests__/VolunteerScreen.test.js` | 5 | Displays the three volunteer options; opens each option's configured destination; uses the selected WordPress image URLs. |
| Saved / Bookmarks | `__tests__/BookmarksScreen.test.js` | 6 | Empty collection; restoring articles/pages/external resources; routing each resource type; removing a resource and persisting the result; malformed/non-array saved data; storage read failure. |
| Information (file: `ProfileScreen.jsx`) | `__tests__/InformationScreen.test.js` | 4 | Donation Portal, In-Kind Giving, About TRM, and Help & Support each open WebView with the correct title and URL. |
| Article | `__tests__/ArticleScreen.test.js` | 6 | Loading full HTML content; saving/removing; opening the source and going back; supplied HTML avoids a fetch; update category and author; excerpt fallback for network/HTTP errors; missing id/title/source; storage write failure leaves saving usable for the current session. |
| Page Detail | `__tests__/PageDetailScreen.test.js` | 5 | Page content and modified date; saving/removing; emergency shelter phone shortcut; source link and back; HTML web links route to WebView, telephone/email links use the OS; network/HTTP failure and Retry; non-emergency pages omit the phone shortcut. |
| WebView | `__tests__/WebViewScreen.test.js` | 2 | Route title and URL passed to native WebView; loading indicator; back navigation; missing route parameters. |

**Deprecated Volunteer calendar coverage:** Older tests for shift loading,
date selection, shift details, availability, and volunteer calendar month
navigation describe a former version of the Volunteer screen. They are no longer
present in `VolunteerScreen.test.js`; its current tests cover the volunteer
signup and group opportunity cards. Historical traceability entries for the old
calendar behavior are marked DEPRECATED in `TEST_TRACEABILITY.md`.

Additional integration coverage:

- `__tests__/App.test.js` (4 tests) exercises the actual app/navigation/providers:
  1. Home → Article → save → back → Saved → reopen → remove.
  2. Explore → category → PageDetail → save → back → external WebView → back.
  3. Events, Volunteer, and Information tabs; Information → WebView → back.
  4. Save an article, unmount/remount the app, and restore it from storage.
- `__tests__/DatePickers.test.js` (5 tests) covers day/month picker confirmation,
  month/year navigation and rollover, Today, missing initial date, reopening with
  a new value, Cancel, and hardware dismissal.

**Historical verification:** 60 passing tests in 11 suites were recorded before
the Volunteer calendar was removed. This count includes deprecated calendar
coverage and does not describe the current suite.

## Run the tests

Open a terminal in `TRM_app/frontend` (the directory containing this file).
From the workspace root shown in Codex:

```powershell
cd .\TRM_app\frontend
npm ci
npm test
```

If dependencies are already installed, just run `npm test`.

```powershell
# Run one screen's tests
npm test -- EventsScreen

# Run only flows through the real app navigator
npm test -- --runTestsByPath __tests__/App.test.js

# Automatically rerun tests while editing
npm run test:watch

# Run all tests and generate a coverage report
npm run test:coverage
```

Open `coverage/lcov-report/index.html` for the browsable coverage report.
Generated coverage and temporary run logs/results are ignored by Git.
`npm test` runs sequentially to keep local execution predictable on Windows.

## Test fixtures and boundaries

`test/setup.js` resets mocks for each test, freezes Date to October 8, 2026
before module-level calendar constants are evaluated, and leaves UI timers real.
`test/helpers.js` supplies representative resource data and URL-based fetch
responses. `fetch` and Axios never reach real services. SecureStore is an
in-memory mock; bookmark tests exercise the real saved-resource provider and
verify writes and restoration. Linking is a spy so tests never open a browser
or place a telephone call.

Native WebView and icons are lightweight mocks, and safe-area/native platform
APIs use their test mocks. Screen components, event date pickers, HTML rendering,
and saved-resource state run as real code. Back and date buttons gained
accessibility labels so tests can select the intended controls reliably.

These are JavaScript component/integration tests, not device end-to-end or
visual tests. WebView tests verify the URL/loading/back contract, not the
contents, cookies, redirects, or submissions on the remote website. Volunteer
option tests verify navigation without registering a real volunteer. Device
checks are still needed for native rendering, touch/keyboard behavior, external
OS actions, and the remote signup experience.

The app currently emits SafeAreaView deprecation warnings, and its HTML renderer
may emit performance warnings during rapid rerenders. Warnings are left visible;
they do not cause test failures.
