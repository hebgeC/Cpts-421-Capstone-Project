import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';

const SITE_URL = 'https://www.trm.org/';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildWordPressDocument(bodyHtml) {
  // WordPress page content can include third-party scripts. The app only needs
  // the document markup; scripts were not run by the previous native renderer.
  const content = String(bodyHtml ?? '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="${SITE_URL}">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { padding: 20px; color: ${colors.ink}; font: 16px/1.55 -apple-system, BlinkMacSystemFont, system-ui, sans-serif; overflow-wrap: anywhere; }
    main { max-width: 720px; margin: 0 auto; padding-bottom: 30px; }
    h1, h2, h3, h4 { line-height: 1.25; margin: 1.15em 0 .45em; color: ${colors.ink}; }
    h1 { font-size: 26px; margin-top: 0; }
    h2 { font-size: 22px; }
    h3 { font-size: 18px; }
    h4 { font-size: 16px; }
    p, ul, ol, figure, blockquote { margin: 0 0 1em; }
    ul, ol { padding-left: 1.5em; }
    li { margin-bottom: .35em; }
    a { color: ${colors.primary}; text-decoration: underline; }
    img, video, iframe { max-width: 100%; height: auto; }
    img { display: block; }
    figure { max-width: 100%; }
    figcaption { color: ${colors.muted}; font-size: 13px; margin-top: 6px; }
    blockquote { border-left: 4px solid ${colors.accent}; padding: 4px 0 4px 16px; }
    .has-text-align-center { text-align: center; }
    .wp-block-columns { display: flex; flex-wrap: wrap; gap: 16px; margin: 14px 0; }
    .wp-block-column { flex: 1 1 100%; min-width: 0; }
    .wp-block-group { margin: 14px 0; }
    .has-beige-background-color, .has-background { background: ${colors.background}; border-radius: 14px; padding: 16px; }
    .wp-block-table { overflow-x: auto; margin: 12px 0 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid ${colors.border}; padding: 12px; text-align: left; vertical-align: top; }
    .wp-block-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }
    .wp-block-button__link, .app-button { display: inline-block; background: ${colors.primary}; color: #fff; padding: 11px 16px; border-radius: 10px; font-weight: 700; text-decoration: none; }
    .app-updated { color: ${colors.muted}; font-size: 13px; margin-bottom: 20px; }
    .app-hero { display: block; width: calc(100% + 40px); max-width: none; height: 220px; object-fit: cover; margin: -20px -20px 20px; }
    .app-hero-fallback { display: flex; align-items: center; justify-content: center; height: 220px; margin: -20px -20px 20px; background: ${colors.primarySoft}; color: ${colors.primary}; font-size: 64px; }
    .app-meta { color: ${colors.muted}; font-size: 13px; margin: 0 0 8px; }
    .app-author { font-weight: 700; margin-bottom: 20px; }
    .app-footer { margin-top: 30px; }
    @media (min-width: 640px) { .wp-block-column { flex: 1 1 0; } }
  </style>
</head>
<body><main>${content}</main></body>
</html>`;
}

export default function WordPressWebView({ bodyHtml, onLinkPress }) {
  const document = useMemo(() => buildWordPressDocument(bodyHtml), [bodyHtml]);

  if (Platform.OS === 'web') {
    return <iframe title="Page content" srcDoc={document} style={{ flex: 1, width: '100%', border: 0 }} />;
  }

  return (
    <WebView
      testID="wordpress-webview"
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      originWhitelist={['*']}
      source={{ html: document, baseUrl: SITE_URL }}
      javaScriptEnabled={false}
      onShouldStartLoadWithRequest={(request) => {
        if (!request.url || request.navigationType !== 'click'
          || request.url.startsWith('about:blank#') || request.url.startsWith(`${SITE_URL}#`)) return true;
        onLinkPress?.(request.url);
        return false;
      }}
      onOpenWindow={({ nativeEvent }) => onLinkPress?.(nativeEvent.targetUrl)}
    />
  );
}
