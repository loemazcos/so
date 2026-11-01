/*
# Create direct message table for Instagram DMs

1. New Tables
- `dm_messages`
  - `id` (bigint identity, primary key)
  - `thread_id` (text): one of sanghyuk, donghyun, jaehyun, seongho
  - `sender` (text): 'me' for the player, 'them' for the character
  - `body` (text, 1 to 300 characters)
  - `created_at` (timestamptz)

2. Security
- Enable RLS.
- The game has no sign-in, so the anon key can read all threads.
- The anon key can only insert rows where sender = 'me'. Character replies are inserted by a server function with the service role, so the browser cannot forge them.
- No update or delete access is granted.

3. Notes
- The seed conversation lives in the app's data files. Only new messages are stored here.
*/

CREATE TABLE IF NOT EXISTS dm_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id text NOT NULL CHECK (thread_id IN ('sanghyuk', 'donghyun', 'jaehyun', 'seongho')),
  sender text NOT NULL CHECK (sender IN ('me', 'them')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 300),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dm_messages_thread_idx ON dm_messages (thread_id, created_at);

ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON dm_messages TO anon, authenticated;
GRANT SELECT, INSERT ON dm_messages TO service_role;

DROP POLICY IF EXISTS "anon_select_dm_messages" ON dm_messages;
CREATE POLICY "anon_select_dm_messages" ON dm_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_player_dm_messages" ON dm_messages;
CREATE POLICY "anon_insert_player_dm_messages" ON dm_messages FOR INSERT
  TO anon, authenticated WITH CHECK (sender = 'me');
