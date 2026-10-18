import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCloakerHtml, CLASSROOM_FAVICON_DATA_URI } from './cloaker.ts';

test('generateCloakerHtml generates valid document structure', () => {
  const html = generateCloakerHtml({
    title: 'Home - clases',
    targetUrl: 'https://d3roguffc3an1t.cloudfront.net/',
    appName: 'Cloud App',
  });

  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('<title>Home - clases</title>'));
  assert.ok(html.includes('src="https://d3roguffc3an1t.cloudfront.net/"'));
  assert.ok(html.includes('id="cloak-frame"'));
  assert.ok(html.includes('overflow: hidden;'));
  assert.ok(html.includes('margin: 0;'));
  assert.ok(html.includes('Cargando Cloud App...'));
});

test('generateCloakerHtml uses Classroom favicon and escapes unsafe characters', () => {
  const unsafeUrl = 'https://example.com/test?a=1&b=2<script>alert(1)</script>';
  const html = generateCloakerHtml({
    targetUrl: unsafeUrl,
    appName: 'Test "App"',
  });

  assert.ok(html.includes(CLASSROOM_FAVICON_DATA_URI));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});
