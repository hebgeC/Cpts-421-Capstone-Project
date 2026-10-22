import { createServer } from 'node:http';

const port = Number(process.env.MOCK_WP_PORT || 3101);
const delayMs = Number(process.env.MOCK_WP_DELAY_MS || 25);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid MOCK_WP_PORT');
if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error('Invalid MOCK_WP_DELAY_MS');

const post = {
  id: 1,
  title: { rendered: 'Performance fixture' },
  excerpt: { rendered: '<p>Performance fixture</p>' },
  content: { rendered: '<p>Performance fixture</p>' },
  date: '2026-01-01T00:00:00',
  link: 'https://example.invalid/story',
};

createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname !== '/wp-json/wp/v2/posts') {
    response.writeHead(404).end();
    return;
  }

  const body = url.searchParams.get('categories') === '1' ? [post] : [];
  setTimeout(() => {
    response.writeHead(200, {
      'content-type': 'application/json',
      'x-wp-totalpages': '1',
    });
    response.end(JSON.stringify(body));
  }, delayMs);
}).listen(port, () => console.log(`Mock WordPress listening on port ${port}`));
