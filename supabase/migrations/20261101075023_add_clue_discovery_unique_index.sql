/*
# Prevent duplicate clue discoveries per device

1. Changed tables
- `clue_discoveries`: adds a unique index on (device_id, clue_id).

2. Security
- No change to RLS or grants. The table is only written by the game-api edge function (service role).

3. Notes
- Duplicate inserts for the same device and clue now fail at the database level, so a clue can be recorded only once.
- Uses IF NOT EXISTS so the migration is safe to re-run.
*/

CREATE UNIQUE INDEX IF NOT EXISTS clue_discoveries_device_clue_key
  ON clue_discoveries (device_id, clue_id);
