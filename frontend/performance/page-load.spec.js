const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

function positiveInteger(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

const pageUrl = process.env.PAGE_URL || 'http://localhost:8081';
const runs = positiveInteger('PAGE_LOAD_RUNS', 20);
const limitMs = positiveInteger('PAGE_LOAD_P95_MS', 3000);
const readyTimeoutMs = positiveInteger('PAGE_READY_TIMEOUT_MS', 10000);
const mockApi = process.env.PERF_MOCK_API === '1';

test('Home screen becomes usable within the page-load target', async ({ browser }) => {
  test.setTimeout(runs * (2 * readyTimeoutMs + 5000));
  const samples = [];
  const startedAt = new Date().toISOString();

  try {
    for (let run = 1; run <= runs; run += 1) {
      // A new context clears HTTP cache and browser storage for every sample.
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const apiResponses = [];
      const apiFailures = [];

      try {
        if (mockApi) {
          await page.route('**/wpArticles', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify({ articles: [{ id: 1, title: 'Performance fixture', date: '2026-01-01' }] }),
          }));
          await page.route('**/wpUpdates', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: '[]',
          }));
        }

        page.on('response', response => {
          const pathname = new URL(response.url()).pathname;
          if (pathname === '/wpArticles' || pathname === '/wpUpdates') {
            apiResponses.push({ pathname, url: response.url(), status: response.status() });
          }
        });
        page.on('requestfailed', request => {
          const pathname = new URL(request.url()).pathname;
          if (pathname === '/wpArticles' || pathname === '/wpUpdates') {
            apiFailures.push({ url: request.url(), reason: request.failure()?.errorText });
          }
        });

        // Record in the browser when the loaded Home content reaches the DOM.
        // This excludes Playwright's polling and transport delay from the timing.
        await page.addInitScript(() => {
          window.__trmHomeReadyMs = null;
          const observer = new MutationObserver(() => {
            if (window.__trmHomeReadyMs !== null) return;
            if (!document.querySelector('[data-testid="home-ready"]')) return;
            requestAnimationFrame(() => {
              window.__trmHomeReadyMs = performance.now();
              observer.disconnect();
            });
          });
          const start = () => {
            observer.observe(document.documentElement, { childList: true, subtree: true });
          };
          if (document.documentElement) start();
          else document.addEventListener('DOMContentLoaded', start, { once: true });
        });

        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: readyTimeoutMs });
        await page.waitForFunction(
          () => typeof window.__trmHomeReadyMs === 'number' || document.querySelector('[data-testid="home-error"]'),
          null,
          { timeout: readyTimeoutMs },
        );

        const error = page.locator('[data-testid="home-error"]');
        if (await error.count()) {
          throw new Error(
            `Home failed to load: ${await error.textContent()}. ` +
            `API responses: ${JSON.stringify(apiResponses)}. ` +
            `Network failures: ${JSON.stringify(apiFailures)}`,
          );
        }
        for (const pathname of ['/wpArticles', '/wpUpdates']) {
          const response = apiResponses.find(item => item.pathname === pathname);
          if (!response || response.status !== 200) {
            throw new Error(`${pathname} did not return HTTP 200`);
          }
        }

        const durationMs = await page.evaluate(() => window.__trmHomeReadyMs);
        samples.push({ run, durationMs: Math.round(durationMs), apiResponses });
      } catch (error) {
        samples.push({ run, error: error.message });
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
      metric: 'Cold Home load: navigation start to loaded Home content',
      startedAt,
      pageUrl,
      browserVersion: browser.version(),
      browserChannel: process.env.PERF_BROWSER_CHANNEL || 'playwright-chromium',
      viewport: { width: 390, height: 844 },
      buildId: process.env.PERF_BUILD_ID || null,
      mockedApi: mockApi,
      targetP95Ms: limitMs,
      plannedRuns: runs,
      completedRuns: durations.length,
      p95Ms,
      pass: durations.length === runs && p95Ms <= limitMs,
      samples,
    };
    const resultDir = path.join(__dirname, 'results');
    fs.mkdirSync(resultDir, { recursive: true });
    fs.writeFileSync(path.join(resultDir, 'page-load.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  }

  const durations = samples.map(sample => sample.durationMs).sort((a, b) => a - b);
  const p95Ms = durations[Math.ceil(0.95 * durations.length) - 1];
  expect(p95Ms, `Home load p95: ${p95Ms} ms across ${runs} runs`).toBeLessThanOrEqual(limitMs);
});
