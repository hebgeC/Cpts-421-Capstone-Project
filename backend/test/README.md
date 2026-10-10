# Backend tests

Run commands from `backend/`:

```sh
npm ci
npm test
npm run test:coverage
```

The suite uses Node's built-in `node:test` runner and strict assertions.
Supertest exercises the exported Express app, including routing and middleware.
Nock supplies WordPress and VolunteerHub responses and blocks unmocked external
HTTP requests. Only loopback connections to the test app are allowed. No running
backend, real API key, `.env` file, or internet connection is needed to run tests
after dependencies are installed.

`textUtils.test.js` contains utility unit tests. `events.test.js` and
`wordpress.test.js` test controller behavior through HTTP requests, including
request parameters, headers, response mapping, defaults, pagination, malformed
upstream responses, and HTTP/network failures. `app.test.js` covers navigation,
CORS, middleware, unknown routes, and the network guard. Tests run sequentially
within each file; Node isolates separate files in separate processes. Shared hooks
restore mocks and environment variables, clean interceptors, and fail if expected
upstream requests were not made.

Coverage uses c8 to measure V8 execution and include **all production JavaScript**
in `app.js`, `server.js`, `config/`, `controllers/`, `routes/`, and `utils/`,
including files never imported by tests. Tests and dependencies are excluded.
The command fails if any overall line, statement, branch, or function coverage
falls below 80%. Reports are written to `backend/coverage/`:

- `index.html`: browsable coverage report.
- `lcov.info`: coverage data for editor and CI integrations.

The initial suite has 127 passing tests, with 98.25% line/statement coverage,
98.90% branch coverage, and 94.73% function coverage. Controllers, routes,
configuration, text utilities, and the app are fully covered by this execution
measure. `server.js` startup is included in the totals but is untested. Coverage
does not establish that every possible input or live service behavior is correct;
these tests verify the current backend contracts against controlled responses.

Use a Node version supported by the installed dev dependencies (currently Node
20.19+, 22.12+, or 23+). npm used the backend's installed Node 25.9.0 for
verification (the system Node version is 25.4.0).
