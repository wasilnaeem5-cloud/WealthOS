import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isLocalHostname,
  getSiteUrl,
  getAuthCallbackUrl,
  getRequestOrigin,
  sanitizeRedirectPath,
} from '../url';

test('isLocalHostname detects local environments correctly', () => {
  assert.equal(isLocalHostname('localhost'), true);
  assert.equal(isLocalHostname('127.0.0.1'), true);
  assert.equal(isLocalHostname('0.0.0.0'), true);
  assert.equal(isLocalHostname('sub.localhost'), true);
  assert.equal(isLocalHostname('wealthos.com'), false);
  assert.equal(isLocalHostname('wealthos.vercel.app'), false);
});

test('sanitizeRedirectPath permits safe internal relative paths', () => {
  assert.equal(sanitizeRedirectPath('/dashboard'), '/dashboard');
  assert.equal(sanitizeRedirectPath('/onboarding'), '/onboarding');
  assert.equal(sanitizeRedirectPath('/settings?tab=profile'), '/settings?tab=profile');
});

test('sanitizeRedirectPath blocks protocol-relative open redirects', () => {
  assert.equal(sanitizeRedirectPath('//evil.com'), '/dashboard');
  assert.equal(sanitizeRedirectPath('//evil.com/path'), '/dashboard');
});

test('sanitizeRedirectPath blocks absolute external URLs and unsafe schemes', () => {
  assert.equal(sanitizeRedirectPath('https://evil.com'), '/dashboard');
  assert.equal(sanitizeRedirectPath('http://evil.com'), '/dashboard');
  assert.equal(sanitizeRedirectPath('javascript:alert(1)'), '/dashboard');
  assert.equal(sanitizeRedirectPath('data:text/html,evil'), '/dashboard');
  assert.equal(sanitizeRedirectPath(null), '/dashboard');
  assert.equal(sanitizeRedirectPath(undefined), '/dashboard');
  assert.equal(sanitizeRedirectPath(''), '/dashboard');
  assert.equal(sanitizeRedirectPath('invalid-path'), '/dashboard');
});

test('getRequestOrigin resolves reverse-proxy headers accurately', () => {
  const reqWithForwarded = new Request('http://localhost:3000/auth/callback', {
    headers: {
      'x-forwarded-host': 'wealthos.vercel.app',
      'x-forwarded-proto': 'https',
    },
  });
  assert.equal(getRequestOrigin(reqWithForwarded), 'https://wealthos.vercel.app');

  const reqWithMultipleHosts = new Request('http://localhost:3000/auth/callback', {
    headers: {
      'x-forwarded-host': 'wealthos.com, proxy.cloudflare.com',
      'x-forwarded-proto': 'https',
    },
  });
  assert.equal(getRequestOrigin(reqWithMultipleHosts), 'https://wealthos.com');
});

test('getSiteUrl returns a valid normalized URL', () => {
  const siteUrl = getSiteUrl();
  assert.ok(siteUrl.startsWith('http://') || siteUrl.startsWith('https://'));
  assert.ok(!siteUrl.endsWith('/'));
});

test('getAuthCallbackUrl formats properly', () => {
  const callbackUrl = getAuthCallbackUrl();
  assert.ok(callbackUrl.endsWith('/auth/callback'));
  assert.ok(!callbackUrl.includes('//auth/callback'));

  const recoveryUrl = getAuthCallbackUrl('/reset-password');
  assert.ok(recoveryUrl.includes('/auth/callback?next=%2Freset-password'));

  // Open redirect attempts in nextPath are rejected
  const unsafeUrl = getAuthCallbackUrl('https://evil.com');
  assert.ok(unsafeUrl.endsWith('/auth/callback'));
  assert.ok(!unsafeUrl.includes('evil.com'));
});

