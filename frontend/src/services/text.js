// WordPress supplies rendered titles and excerpts as HTML-encoded strings.
export function decodeEntities(value) {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Some WordPress headings join emphasized text directly to the next word.
// Keep the page's markup and add only the missing visual word boundary.
export function normalizePageHtml(value) {
  if (!value) return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/(<h[1-6]\b[^>]*>)([\s\S]*?)(<\/h[1-6]>)/gi, (_, open, content, close) =>
      `${open}${content.replace(/<\/(?:em|strong|b|i|span)>(?=[A-Za-z0-9])/gi, '$& ')}${close}`);
}
