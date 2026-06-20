-- Feedback / refund-request submissions from players and supporters.
CREATE TABLE feedback (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  player     TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX feedback_created_at_idx ON feedback (created_at DESC);
