import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeEntities } from '../utils/textUtils.js';

for (const value of [undefined, null, '', false, 0]) {
  test(`decodeEntities returns empty text for ${String(value)}`, () => {
    assert.equal(decodeEntities(value), '');
  });
}

const cases = [
  ['plain text', 'Hello world', 'Hello world'],
  ['HTML tags', '<p>Hello <strong>world</strong></p>', 'Hello world'],
  ['HTML attributes', '<a href="/story" title="Story">Read</a>', 'Read'],
  ['single quotes', '&#8216;Hello&#8217;', "'Hello'"],
  ['double quotes', '&#8220;Hello&#8221;', '"Hello"'],
  ['en dash', 'A&#8211;B', 'A–B'],
  ['em dash', 'A&#8212;B', 'A—B'],
  ['numeric ampersand', 'A &#038; B', 'A & B'],
  ['named ampersand', 'A &amp; B', 'A & B'],
  ['nonbreaking spaces', 'A&nbsp;&nbsp;B', 'A B'],
  ['repeated whitespace', '  A\n\t  B  ', 'A B'],
  ['only tags and whitespace', ' <p> </p> ', ''],
  ['unrecognized entities', '&copy; &#9999;', '&copy; &#9999;'],
  ['Unicode', 'Café ❤️', 'Café ❤️'],
  ['combined cleanup', ' <p>&#8220;Care&nbsp; &amp;  Hope&#8221;</p> ', '"Care & Hope"'],
];
for (const [name, input, expected] of cases) {
  test(`decodeEntities handles ${name}`, () => assert.equal(decodeEntities(input), expected));
}
