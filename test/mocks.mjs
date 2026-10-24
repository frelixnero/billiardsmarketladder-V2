// Shared test mocks for the serverless functions.
// Each test file runs in its own process, so these registrations are isolated per file.
import { mock } from 'node:test';

// Mutable state the fakes read from — tests configure this before invoking a handler.
export const state = {
  settings: {},        // app_state.settings
  players: [],         // players table rows
  payments: [],        // payments table rows (webhook idempotency)
  feedbackRows: [],    // feedback table rows
  auth: { data: { user: null }, error: new Error('no session') },
  constructEventError: null,
  webhookEvent: null,
};

// Captured Stripe checkout session.create() arguments for pricing assertions.
export const captured = { sessions: [] };

export function installMocks() {
  mock.module('stripe', {
    exports: {
      default: class FakeStripe {
        constructor(secret) {
          this.secret = secret;
        }
        checkout = {
          sessions: {
            create: async (opts) => {
              captured.sessions.push(opts);
              return { url: 'https://checkout.test/session', id: 'cs_test_123' };
            },
          },
        };
        webhooks = {
          constructEvent(raw, sig, secret) {
            if (state.constructEventError) throw state.constructEventError;
            return state.webhookEvent;
          },
        };
      },
    },
  });

  mock.module('@supabase/supabase-js', {
    exports: {
      createClient: (url, key) => {
        const builder = (rows) => {
          const b = {
            select() { return b; },
            eq() { return b; },
            order() { return b; },
            limit() { return b; },
            insert() { return b; },
            update() { return b; },
            single() { return Promise.resolve({ data: rows[0] || null, error: null }); },
            maybeSingle() { return Promise.resolve({ data: rows[0] || null, error: null }); },
            then(resolve, reject) { return Promise.resolve({ data: rows, error: null }).then(resolve, reject); },
          };
          return b;
        };
        return {
          auth: { getUser: async () => state.auth },
          from(table) {
            if (table === 'app_state') return builder([{ settings: state.settings }]);
            if (table === 'players') return builder(state.players);
            if (table === 'payments') return builder(state.payments);
            if (table === 'feedback') return builder(state.feedbackRows);
            return builder([]);
          },
        };
      },
    },
  });
}

export function resetState() {
  state.settings = {};
  state.players = [];
  state.payments = [];
  state.feedbackRows = [];
  state.auth = { data: { user: null }, error: new Error('no session') };
  state.constructEventError = null;
  state.webhookEvent = null;
  captured.sessions.length = 0;
}

// Build a Request object for a JSON handler.
export function jsonRequest(method, payload, extraHeaders = {}) {
  return new Request('http://localhost/api', {
    method,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}
