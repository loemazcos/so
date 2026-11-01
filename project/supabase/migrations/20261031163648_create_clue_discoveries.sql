/*
# Create clue discoveries table

1. New Tables
- `clue_discoveries`
  - `id` (bigint identity, primary key)
  - `device_id` (text, not null): random id stored on the player's device
  - `clue_id` (text, not null): clue code such as C15
  - `discovered_at` (timestamptz, default now())

2. Security
- Enable RLS on `clue_discoveries`.
- The game has no sign-in, so the anon key reads and writes rows.
- Each device only reads its own rows because the app filters by device_id.
- Each device_id + clue_id pair is unique, so a clue is recorded once.

3. Notes
- Access is scoped by device_id in the app, not by the database, because there are no user accounts.
*/

CREATE TABLE IF NOT EXISTS clue_discoveries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  device_id text NOT NULL,
  clue_id text NOT NULL,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, clue_id)
);

ALTER TABLE clue_discoveries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON clue_discoveries TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_clue_discoveries" ON clue_discoveries;
CREATE POLICY "anon_select_clue_discoveries" ON clue_discoveries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_clue_discoveries" ON clue_discoveries;
CREATE POLICY "anon_insert_clue_discoveries" ON clue_discoveries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
