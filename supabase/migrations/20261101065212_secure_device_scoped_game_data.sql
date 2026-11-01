/*
# Scope game data to each device and lock down public access

1. Purge and new columns
- Test rows in `dm_messages` and `calendar_events` are deleted once (this also removes the shared May calendar seed). The deletion only runs while the `device_id` column is still missing, so re-running this migration never erases player data.
- `dm_messages` and `calendar_events` get `device_id text NOT NULL`, with indexes for lookups by device.
- `clue_discoveries` keeps its existing `device_id` column unchanged.

2. New table
- `rate_limits` (device_id, window_start, count): counts requests. The `device_id` column holds scoped keys such as a per-minute key, a per-day key, or a global key.
- `consume_rate_limit(key, window, limit)`: atomically adds one to a counter and returns false once the limit is reached.

3. Security
- Row level security stays enabled on `dm_messages`, `calendar_events`, `clue_discoveries`, and `rate_limits`.
- All anon and authenticated policies on `dm_messages`, `calendar_events`, and `clue_discoveries` are removed.
- anon and authenticated lose every table privilege on `dm_messages`, `calendar_events`, and `clue_discoveries`.
- Only the server role (service_role) can read or write these tables. The browser reaches them only through the game-api and dm-reply edge functions.
- `consume_rate_limit` can be executed only by service_role.

4. Notes
- Edge functions that use the service role bypass row level security, so they must filter every query by device_id themselves.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'dm_messages' AND column_name = 'device_id'
  ) THEN
    DELETE FROM dm_messages;
    ALTER TABLE dm_messages ADD COLUMN device_id text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'calendar_events' AND column_name = 'device_id'
  ) THEN
    DELETE FROM calendar_events;
    ALTER TABLE calendar_events ADD COLUMN device_id text NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS dm_messages_device_thread_idx ON dm_messages (device_id, thread_id, created_at);
CREATE INDEX IF NOT EXISTS calendar_events_device_date_idx ON calendar_events (device_id, event_date);

DROP POLICY IF EXISTS "anon_select_dm_messages" ON dm_messages;
DROP POLICY IF EXISTS "anon_insert_player_dm_messages" ON dm_messages;
DROP POLICY IF EXISTS "anon_select_calendar_events" ON calendar_events;
DROP POLICY IF EXISTS "anon_insert_calendar_events" ON calendar_events;
DROP POLICY IF EXISTS "anon_select_clue_discoveries" ON clue_discoveries;
DROP POLICY IF EXISTS "anon_insert_clue_discoveries" ON clue_discoveries;

REVOKE ALL ON dm_messages, calendar_events, clue_discoveries FROM anon, authenticated;

GRANT SELECT, INSERT ON dm_messages TO service_role;
GRANT SELECT, INSERT ON calendar_events TO service_role;

CREATE TABLE IF NOT EXISTS rate_limits (
  device_id text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (device_id, window_start)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON rate_limits FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON rate_limits TO service_role;

CREATE OR REPLACE FUNCTION consume_rate_limit(p_key text, p_window timestamptz, p_limit integer)
RETURNS boolean
LANGUAGE sql
SET search_path = public
AS $$
  WITH bumped AS (
    INSERT INTO rate_limits AS r (device_id, window_start, count)
    VALUES (p_key, p_window, 1)
    ON CONFLICT (device_id, window_start)
    DO UPDATE SET count = r.count + 1 WHERE r.count < p_limit
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM bumped);
$$;

REVOKE EXECUTE ON FUNCTION consume_rate_limit(text, timestamptz, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(text, timestamptz, integer) TO service_role;
