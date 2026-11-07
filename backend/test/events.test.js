import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { isolateExternalServices, wp, volunteer } from './helpers.js';

isolateExternalServices();
const eventsPath = '/wp-json/tribe/events/v1/events';

test('GET /events forwards defaults and maps the complete event contract', async () => {
  wp().get(eventsPath).query({ page: 1, per_page: 20 }).reply(200, {
    events: [{
      id: 7, title: '<b>Care &amp; Hope</b>', description: '<p>Come&nbsp;help</p>',
      url: 'https://www.trm.org/event/', image: { url: 'https://www.trm.org/event.jpg' },
      start_date: '2026-01-01', end_date: '2026-01-02', all_day: true,
      venue: { venue: 'Mission', address: '1 Main', city: 'Tacoma', state: 'WA', zip: '98402' },
      cost: '$10',
    }], total: 25, total_pages: 2,
  });
  const res = await request(app).get('/events').expect(200);
  assert.deepEqual(res.body, {
    events: [{ id: 7, title: 'Care & Hope', description: 'Come help',
      url: 'https://www.trm.org/event/', image: 'https://www.trm.org/event.jpg',
      startDate: '2026-01-01', endDate: '2026-01-02', allDay: true,
      venue: 'Mission', address: '1 Main, Tacoma, WA, 98402', cost: '$10' }],
    total: 25, totalPages: 2,
  });
});

test('GET /events forwards pagination and date filters', async () => {
  const query = { page: '3', per_page: '5', start_date: '2026-01-01', end_date: '2026-02-01' };
  wp().get(eventsPath).query(query).reply(200, { events: [], total: 0, total_pages: 0 });
  const res = await request(app).get('/events').query(query).expect(200);
  assert.deepEqual(res.body, { events: [], total: 0, totalPages: 0 });
});

test('GET /events supplies defaults for missing optional event fields', async () => {
  wp().get(eventsPath).query({ page: 1, per_page: 20 }).reply(200, { events: [{ id: 1 }] });
  const res = await request(app).get('/events').expect(200);
  assert.deepEqual(res.body.events, [{ id: 1, title: '', description: '', image: null,
    allDay: false, venue: '', address: '', cost: null }]);
});

test('GET /events filters absent address components and handles empty values', async () => {
  wp().get(eventsPath).query(true).reply(200, { events: [{
    id: 1, venue: { venue: '', address: '', city: 'Tacoma', state: null },
    image: { url: '' }, cost: '', all_day: 0,
  }] });
  const res = await request(app).get('/events').expect(200);
  assert.equal(res.body.events[0].address, 'Tacoma');
  assert.equal(res.body.events[0].venue, '');
  assert.equal(res.body.events[0].image, null);
  assert.equal(res.body.events[0].cost, null);
  assert.equal(res.body.events[0].allDay, false);
});

for (const events of [undefined, null]) {
  test(`GET /events treats ${events} event list as empty`, async () => {
    wp().get(eventsPath).query(true).reply(200, { events, total: 0, total_pages: 1 });
    const res = await request(app).get('/events').expect(200);
    assert.deepEqual(res.body, { events: [], total: 0, totalPages: 1 });
  });
}

const earliest = '2026-01-01T09:00:00';
const latest = '2026-01-02T17:30:00';
const timePath = `${encodeURIComponent(earliest)}/${encodeURIComponent(latest)}`;
const volunteerCases = [
  { name: 'list', route: '/volunteerShiftEvent', path: '/api/v1/events',
    query: { query: 'Version', page: '1', pageSize: '20', earliestVersion: '0' } },
  { name: 'event ID', route: '/volunteerShiftEvent/shift-42', path: '/api/v1/events/shift-42' },
  { name: 'time range', route: `/volunteerShiftEvent/${timePath}`, path: '/api/v1/events',
    query: { query: 'Time', pageSize: '50', earliestTime: earliest, latestTime: latest } },
  { name: 'paged time range', route: `/volunteerShiftEvent/3/${timePath}`, path: '/api/v1/events',
    query: { query: 'Time', page: '3', pageSize: '50', earliestTime: earliest, latestTime: latest } },
];

for (const scenario of volunteerCases) {
  function upstream() {
    const scope = volunteer().get(scenario.path);
    return scenario.query ? scope.query(scenario.query) : scope;
  }
  test(`VolunteerHub ${scenario.name} sends authorization and forwards the response`, async () => {
    process.env.VOLUNTEERHUB_API_KEY = 'test-volunteer-key';
    const payload = { events: [{ id: 'shift-42', title: 'Serve dinner' }], nextPage: 4 };
    upstream().reply(200, payload);
    const res = await request(app).get(scenario.route).expect(200);
    assert.deepEqual(res.body, payload);
  });
  test(`VolunteerHub ${scenario.name} rejects a missing API key before making a request`, async () => {
    const res = await request(app).get(scenario.route).expect(500);
    assert.deepEqual(res.body, { error: 'Failed to fetch events' });
    assert.equal(console.error.mock.calls[0].arguments[0], 'Missing VOLUNTEERHUB_API_KEY');
  });
  test(`VolunteerHub ${scenario.name} handles an upstream HTTP failure`, async () => {
    process.env.VOLUNTEERHUB_API_KEY = 'test-volunteer-key';
    upstream().reply(401, { privateError: 'Do not expose upstream details' });
    const res = await request(app).get(scenario.route).expect(500);
    assert.deepEqual(res.body, { error: 'Failed to fetch events' });
    assert.equal(console.error.mock.callCount(), 1);
  });
  test(`VolunteerHub ${scenario.name} handles a connection failure`, async () => {
    process.env.VOLUNTEERHUB_API_KEY = 'test-volunteer-key';
    upstream().replyWithError('Connection reset');
    const res = await request(app).get(scenario.route).expect(500);
    assert.deepEqual(res.body, { error: 'Failed to fetch events' });
  });
}

for (const failure of ['http', 'network', 'invalid payload']) {
  test(`GET /events handles ${failure} failures`, async () => {
    const scope = wp().get(eventsPath).query(true);
    if (failure === 'network') scope.replyWithError('Connection reset');
    else if (failure === 'http') scope.reply(503, { message: 'Private upstream error' });
    else scope.reply(200, { events: {} });
    const res = await request(app).get('/events').expect(500);
    assert.deepEqual(res.body, { error: 'Failed to fetch events' });
  });
}
