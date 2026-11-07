# Frontend tests

Run the component and navigation tests from `frontend/`:

```powershell
npm test
```

For one suite, run `npm test -- EventsScreen`. For coverage, run `npm run test:coverage` and open `coverage/lcov-report/index.html`.

The tests use Jest, jest-expo, and React Native Testing Library. `test/setup.js` mocks native modules and network calls, so no backend, credentials, emulator, or running Metro server is required. `App.test.js` exercises the real tab and stack navigation; screen tests use navigation spies.

The active suites cover Home, Explore, Events, Volunteer, Donate, Information, Article, Page Detail, WebView, date pickers, and the direct WordPress and Events Calendar service mapping. They verify that the active app has no Saved tab or save controls and does not read or write bookmark storage.

`BookmarksScreen.test.js` still tests the disconnected bookmark screen and storage provider. Those files remain available if the feature is restored later. Login and the older VolunteerHub calendar are also outside the active navigation.

These are component and navigation tests. They do not verify native device layout, live remote content, or the contents of external web pages.
