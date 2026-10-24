import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installMocks, resetState, state, jsonRequest } from './mocks.mjs';

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';

installMocks();

async function feedback(method, payload, headers = {}) {
  const { default: handler } = await import('../api/feedback.ts');
  return handler(jsonRequest(method, payload, headers));
}

test.beforeEach(() => resetState());

test('POST with empty message returns 400', async () => {
  const res = await feedback('POST', { type: 'Complaint', message: '' });
  assert.equal(res.status, 400);
});

test('POST with a message stores feedback and returns 201', async () => {
  state.feedbackRows = [{ id: 42 }];
  const res = await feedback('POST', { type: 'Suggestion', name: 'Joe', message: 'Great event' });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.id, 42);
});

test('GET without FEEDBACK_ADMIN_TOKEN configured returns 503', async () => {
  delete process.env.FEEDBACK_ADMIN_TOKEN;
  const res = await feedback('GET', undefined);
  assert.equal(res.status, 503);
});

test('GET with wrong admin token returns 401', async () => {
  process.env.FEEDBACK_ADMIN_TOKEN = 'correct-token';
  const res = await feedback('GET', undefined, { 'x-admin-token': 'wrong-token' });
  assert.equal(res.status, 401);
});
