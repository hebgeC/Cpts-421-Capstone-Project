import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const baseUrl = (__ENV.BASE_URL || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(baseUrl)) {
  throw new Error('Set BASE_URL to the staging backend URL, including http:// or https://');
}

const targetVus = Number(__ENV.TARGET_VUS || 10);
const thinkSeconds = Number(__ENV.THINK_SECONDS || 30);
const maxApiP95Ms = Number(__ENV.MAX_API_P95_MS || 3000);
if (!Number.isInteger(targetVus) || targetVus < 1) throw new Error('TARGET_VUS must be a positive integer');
if (!Number.isFinite(thinkSeconds) || thinkSeconds < 0) throw new Error('THINK_SECONDS must be nonnegative');
if (!Number.isFinite(maxApiP95Ms) || maxApiP95Ms <= 0) throw new Error('MAX_API_P95_MS must be positive');
if (targetVus > 100 && __ENV.ALLOW_HIGH_LOAD !== '1') {
  throw new Error('Set ALLOW_HIGH_LOAD=1 to run more than 100 virtual users');
}

const journeyFailed = new Rate('home_journey_failed');
const vusStarted = new Counter('vus_started');
let hasStarted = false;

export const options = {
  scenarios: {
    home: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: __ENV.RAMP_DURATION || '30s', target: targetVus },
        { duration: __ENV.HOLD_DURATION || '1m', target: targetVus },
        { duration: __ENV.RAMP_DOWN_DURATION || '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    vus_started: [`count>=${targetVus}`],
    http_req_failed: ['rate<0.01'],
    home_journey_failed: ['rate<0.01'],
    http_req_duration: [`p(95)<${maxApiP95Ms}`],
  },
};

function validJson(response, predicate) {
  if (response.status !== 200) return false;
  try {
    return predicate(response.json());
  } catch (_) {
    return false;
  }
}

export default function () {
  if (!hasStarted) {
    vusStarted.add(1);
    hasStarted = true;
  }

  // HomeScreen issues these requests in parallel on entry.
  const [articles, updates] = http.batch([
    ['GET', `${baseUrl}/wpArticles`, null, { tags: { endpoint: 'articles' } }],
    ['GET', `${baseUrl}/wpUpdates`, null, { tags: { endpoint: 'updates' } }],
  ]);

  const validArticles = validJson(articles, body => Array.isArray(body.articles));
  const validUpdates = validJson(updates, body => Array.isArray(body));
  check(null, {
    'Home APIs return usable data': () => validArticles && validUpdates,
  });
  journeyFailed.add(!(validArticles && validUpdates));

  // A virtual user remains active between visits; jitter avoids synchronized bursts.
  sleep(thinkSeconds * (0.5 + Math.random()));
}
