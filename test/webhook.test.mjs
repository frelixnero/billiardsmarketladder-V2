import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installMocks, resetState, state } from './mocks.mjs';

process.env.STRIPE_SECRET_KEY = 'sk_test_1';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';

installMocks();

async function webhook(headers = {}, rawBody = '{}') {
  const { default: handler } = await import('../api/webhook.ts');
  return handler(new Request('http://localhost/api/webhook', { method: 'POST', headers, body: rawBody }));
}

test.beforeEach(() => resetState());

test('missing stripe-signature returns 400', async () => {
  const res = await webhook({});
  assert.equal(res.status, 400);
});

test('invalid signature returns 400', async () => {
  state.constructEventError = new Error('invalid signature');
  const res = await webhook({ 'stripe-signature': 'bad-signature' });
  assert.equal(res.status, 400);
});

test('duplicate checkout session is skipped (idempotent)', async () => {
  state.webhookEvent = {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        amount_total: 0,
        customer_email: 'buyer@example.com',
        payment_intent: 'pi_1',
        metadata: { type: 'other' },
      },
    },
  };
  // Existing payment row → the handler must return { duplicate: true } without re-inserting.
  state.payments = [{ id: 'existing-payment' }];

  const res = await webhook({ 'stripe-signature': 'sig' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.received, true);
  assert.equal(body.duplicate, true);
});
