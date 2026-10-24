import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installMocks, resetState, state, captured, jsonRequest } from './mocks.mjs';

process.env.STRIPE_SECRET_KEY = 'sk_test_1';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';

installMocks();

async function checkout(payload) {
  const { default: handler } = await import('../api/create-checkout.ts');
  return handler(jsonRequest('POST', payload));
}

test.beforeEach(() => resetState());

test('registration: 1 format charges $125', async () => {
  const res = await checkout({ productKey: 'registration', quantity: 1, metadata: { formatsCount: 1 } });
  assert.equal(res.status, 200);
  const line = captured.sessions[0].line_items[0];
  assert.equal(line.price_data.unit_amount, 12500);
  assert.match(line.price_data.product_data.name, /1 Format/);
});

test('registration: 2 formats charges $200', async () => {
  const res = await checkout({ productKey: 'registration', quantity: 1, metadata: { formatsCount: 2 } });
  assert.equal(res.status, 200);
  assert.equal(captured.sessions[0].line_items[0].price_data.unit_amount, 20000);
});

test('registration: 3 formats charges $250', async () => {
  const res = await checkout({ productKey: 'registration', quantity: 1, metadata: { formatsCount: 3 } });
  assert.equal(res.status, 200);
  assert.equal(captured.sessions[0].line_items[0].price_data.unit_amount, 25000);
});

test('weekly dues: 2 formats charges $60 ($30 each)', async () => {
  const res = await checkout({ productKey: 'weeklyDues', quantity: 1, metadata: { formatsCount: 2 } });
  assert.equal(res.status, 200);
  assert.equal(captured.sessions[0].line_items[0].price_data.unit_amount, 6000);
});

test('team entry respects operator-configured teamPerPerson ($125)', async () => {
  state.settings = { teamPerPerson: 125 };
  const res = await checkout({ productKey: 'teamReg', quantity: 1, metadata: {} });
  assert.equal(res.status, 200);
  assert.equal(captured.sessions[0].line_items[0].price_data.unit_amount, 12500);
});

test('missing productKey returns 400', async () => {
  const res = await checkout({ quantity: 1, metadata: {} });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /productKey/i);
});

test('individual share without playerName returns 400', async () => {
  const res = await checkout({ productKey: 'individual-share', metadata: {} });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /playerName/i);
});

test('market lock blocks share purchases with 403', async () => {
  state.settings = { marketLocked: true };
  const res = await checkout({ productKey: 'individual-share', metadata: { playerName: 'Marcus P.' } });
  assert.equal(res.status, 403);
});
