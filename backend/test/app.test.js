import { test } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import request from 'supertest';
import app from '../app.js';
import { isolateExternalServices } from './helpers.js';

isolateExternalServices();
// Express suppresses expected JSON-parser error logging in its test environment.
app.set('env', 'test');

test('GET /siteMap returns complete navigation with valid category references', async () => {
  const res = await request(app).get('/siteMap').expect(200).expect('Content-Type', /json/);
  const { categories, items } = res.body;
  assert.deepEqual(categories.map(category => category.key), ['about', 'what-we-do', 'get-involved', 'contact']);
  assert.equal(items.length, 27);
  assert.equal(new Set(items.map(item => item.key)).size, items.length);
  for (const category of categories) {
    for (const field of ['title', 'icon', 'bg', 'color', 'description']) assert.ok(category[field]);
  }
  for (const item of items) {
    assert.ok(categories.some(category => category.key === item.category));
    assert.ok(item.title);
    assert.ok(item.icon);
    assert.ok(['page', 'external'].includes(item.type));
    if (item.type === 'page') assert.ok(item.slug);
    else assert.equal(new URL(item.url).protocol, 'https:');
  }
  assert.deepEqual(items.filter(item => item.type === 'external').map(item => item.key), ['donate', 'careers']);
});

test('CORS permits cross-origin requests', async () => {
  await request(app).get('/siteMap').set('Origin', 'https://mobile.example')
    .expect(200).expect('Access-Control-Allow-Origin', '*');
});

test('CORS responds to browser preflight requests', async () => {
  await request(app).options('/events').set('Origin', 'https://mobile.example')
    .set('Access-Control-Request-Method', 'GET').expect(204)
    .expect('Access-Control-Allow-Origin', '*').expect('Access-Control-Allow-Methods', /GET/);
});

test('Unknown routes return 404', async () => {
  await request(app).get('/does-not-exist').expect(404);
});

test('Unsupported HTTP methods return 404', async () => {
  await request(app).post('/siteMap').send({}).expect(404);
});

test('Malformed JSON is rejected by the Express JSON middleware', async () => {
  await request(app).post('/siteMap').set('Content-Type', 'application/json').send('{broken').expect(400);
});

test('Unmocked external HTTP calls are blocked', async () => {
  await assert.rejects(axios.get('https://unmocked.example/test', { proxy: false }),
    /Disallowed net connect/);
});
