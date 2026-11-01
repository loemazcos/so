/*
# Create game_state table for per-device run progress

1. New Tables
- `game_state`
  - `device_id` (text, primary key): the browser's random device id
  - `run` (jsonb, not null, default '{}'): the whole in-progress run (clock, battery, clues, flags)
  - `codex` (jsonb, not null, default '[]'): ending codex entries (reserved for later steps)
  - `updated_at` (timestamptz): last save time

2. Security
- Row level security is enabled and no policies are created.
- anon and authenticated receive no privileges. Only the service role (edge function) reads or writes.
- Existing data: none (new table).

3. Notes
- The game-api edge function is the only path to this table.
*/

CREATE TABLE IF NOT EXISTS game_state (
  device_id text PRIMARY KEY,
  run jsonb NOT NULL DEFAULT '{}'::jsonb,
  codex jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON game_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON game_state TO service_role;
