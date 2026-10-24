import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installMocks, resetState, state, jsonRequest } from './mocks.mjs';

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
process.env.OPERATOR_EMAILS = 'osiraogene@gmail.com';

installMocks();

async function action(body, authHeader) {
  const { default: handler } = await import('../api/admin-action.ts');
  const headers = authHeader ? { Authorization: authHeader } : {};
  return handler(jsonRequest('POST', body, headers));
}

test.beforeEach(() => resetState());

test('missing Bearer token returns 401', async () => {
  const res = await action({ action: 'save_bars', params: { bars: ['A'] } }, undefined);
  assert.equal(res.status, 401);
});

test('invalid token returns 401', async () => {
  state.auth = { data: { user: null }, error: new Error('invalid token') };
  const res = await action({ action: 'save_bars', params: { bars: ['A'] } }, 'Bearer bad');
  assert.equal(res.status, 401);
});

test('non-owner role returns 403', async () => {
  state.auth = {
    data: { user: { email: 'helper@example.com', user_metadata: { role: 'helper' } } },
    error: null,
  };
  const res = await action({ action: 'save_bars', params: { bars: ['A'] } }, 'Bearer tok');
  assert.equal(res.status, 403);
});

test('owner save_bars succeeds', async () => {
  state.auth = {
    data: { user: { email: 'osiraogene@gmail.com', user_metadata: { role: 'owner' } } },
    error: null,
  };
  const res = await action({ action: 'save_bars', params: { bars: ['Bar One', 'Bar Two'] } }, 'Bearer tok');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.deepEqual(body.bars, ['Bar One', 'Bar Two']);
});
