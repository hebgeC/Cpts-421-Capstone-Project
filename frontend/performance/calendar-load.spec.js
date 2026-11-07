const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

function positiveInteger(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
  return value;
}

const pageUrl = process.env.PAGE_URL || 'http://localhost:8081';
const runs = positiveInteger('CALENDAR_LOAD_RUNS', 5);
const limitMs = positiveInteger('CALENDAR_LOAD_P95_MS', 3000);
const readyTimeoutMs = positiveInteger('PAGE_READY_TIMEOUT_MS', 30000);
const mockApi = process.env.CALENDAR_PERF_MOCK_API === '1';
const mockDelayMs = positiveInteger('CALENDAR_PERF_MOCK_DELAY_MS', 25);

test('Volunteer calendar becomes usable after its month API calls complete', async ({ browser }) => {
  test.setTimeout(runs * (readyTimeoutMs + 10000));
  const samples = [];
  const startedAt = new Date().toISOString();

  try {
    for (let run = 1; run <= runs; run += 1) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const apiResponses = [];
      const apiFailures = [];
      const requestStartedAt = new Map();

      try {
        if (mockApi) {
          await page.route('**/volunteerShiftEvent/**', async route => {
            await new Promise(resolve => setTimeout(resolve, mockDelayMs));
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: { 'access-control-allow-origin': '*' },
              body: '[]',
            });
          });
        }

        page.on('request', request => {
          if (new URL(request.url()).pathname.includes('/volunteerShiftEvent/')) {
            requestStartedAt.set(request, Date.now());
          }
        });
        page.on('response', response => {
          const url = new URL(response.url());
          if (url.pathname.includes('/volunteerShiftEvent/')) {
            const request = response.request();
            const startedAtMs = requestStartedAt.get(request);
            apiResponses.push({
              pathname: url.pathname,
              status: response.status(),
              durationMs: startedAtMs === undefined ? null : Date.now() - startedAtMs,
            });
          }
        });
        page.on('requestfailed', request => {
          if (new URL(request.url()).pathname.includes('/volunteerShiftEvent/')) {
            apiFailures.push({ url: request.url(), reason: request.failure()?.errorText });
          }
        });

        await page.addInitScript(() => {
          window.__calendarStartAt = null;
          window.__calendarReadyAt = null;
          const observe = () => {
            const observer = new MutationObserver(() => {
              if (window.__calendarReadyAt !== null || !window.__calendarStartAt) return;
              if (!document.querySelector('[data-testid="calendar-ready"]')) return;
              requestAnimationFrame(() => {
                window.__calendarReadyAt = performance.now();
                observer.disconnect();
              });
            });
            observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
          };
          if (document.documentElement) observe();
          else document.addEventListener('DOMContentLoaded', observe, { once: true });
        });

        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: readyTimeoutMs });
        const volunteerTab = page.getByText('Volunteer', { exact: true }).last();
        await expect(volunteerTab).toBeVisible({ timeout: readyTimeoutMs });
        await page.evaluate(() => { window.__calendarStartAt = performance.now(); });
        await volunteerTab.click();
        await page.waitForFunction(
          () => typeof window.__calendarReadyAt === 'number',
          null,
          { timeout: readyTimeoutMs },
        );

        const apiFailuresSummary = apiFailures;
        const failedResponses = apiResponses.filter(response => response.status !== 200);
        if (apiFailuresSummary.length || failedResponses.length) {
          throw new Error(`Calendar API failures: ${JSON.stringify({ apiFailuresSummary, failedResponses })}`);
        }
        if (apiResponses.length < 10) {
          throw new Error(`Expected at least 10 month-page API responses, got ${apiResponses.length}`);
        }

        const durationMs = await page.evaluate(() => Math.round(window.__calendarReadyAt - window.__calendarStartAt));
        samples.push({ run, durationMs, apiRequestCount: apiResponses.length, apiResponses });
      } catch (error) {
        samples.push({ run, error: error.message, apiRequestCount: apiResponses.length, apiResponses, apiFailures });
        throw error;
      } finally {
        await context.close();
      }
    }
  } finally {
    const durations = samples.filter(sample => sample.durationMs !== undefined)
      .map(sample => sample.durationMs).sort((a, b) => a - b);
    const p95Ms = durations.length ? durations[Math.ceil(0.95 * durations.length) - 1] : null;
    const result = {
      metric: 'Volunteer calendar load: tab selection through month API completion and rendered calendar',
      startedAt,
      pageUrl,
      browserVersion: browser.version(),
      viewport: { width: 390, height: 844 },
      mockedApi: mockApi,
      mockDelayMs: mockApi ? mockDelayMs : null,
      targetP95Ms: limitMs,
      plannedRuns: runs,
      completedRuns: durations.length,
      p95Ms,
      pass: durations.length === runs && p95Ms <= limitMs,
      samples,
    };
    const resultDir = path.join(__dirname, 'results');
    fs.mkdirSync(resultDir, { recursive: true });
    fs.writeFileSync(path.join(resultDir, 'calendar-load.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  }

  const durations = samples.map(sample => sample.durationMs).sort((a, b) => a - b);
  const p95Ms = durations[Math.ceil(0.95 * durations.length) - 1];
  expect(p95Ms, `Volunteer calendar load p95: ${p95Ms} ms across ${runs} runs`).toBeLessThanOrEqual(limitMs);
});
