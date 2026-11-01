/*
# Extend dm_messages with read, delivery, unsend, and typing state

1. New columns on `dm_messages`
- `status` (text): 'sent' | 'delivered' | 'read' | 'unsent'. Default 'sent'.
- `deliver_at` (integer): game minute when the message arrives. Messages are hidden until the game clock reaches it. Default 0.
- `read_at` (integer, nullable): game minute when the thread was opened after arrival. Used for read receipts on Taesan's messages and for the unread notification on their messages.
- `unsent_at` (integer, nullable): game minute when the sender's unsend took effect.
- `unsend_after_min` (smallint, nullable): minutes after arrival when the message is unsent (1..30). Null means never.
- `typing_cycles` (smallint): how many typing cycles play before the message shows (0..3).

2. Security
- No grant or policy changes. The table stays locked to the service role; the browser reads and writes only through game-api.

3. Notes
- Adding columns with defaults is non-destructive; existing rows keep their text and timestamps.
- Index on (device_id, thread_id, deliver_at) keeps per-thread loads fast.
*/

ALTER TABLE dm_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS deliver_at integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS read_at integer,
  ADD COLUMN IF NOT EXISTS unsent_at integer,
  ADD COLUMN IF NOT EXISTS unsend_after_min smallint,
  ADD COLUMN IF NOT EXISTS typing_cycles smallint NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dm_messages_status_check') THEN
    ALTER TABLE dm_messages ADD CONSTRAINT dm_messages_status_check CHECK (status IN ('sent', 'delivered', 'read', 'unsent'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dm_messages_unsend_after_check') THEN
    ALTER TABLE dm_messages ADD CONSTRAINT dm_messages_unsend_after_check CHECK (unsend_after_min IS NULL OR unsend_after_min BETWEEN 1 AND 30);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dm_messages_typing_cycles_check') THEN
    ALTER TABLE dm_messages ADD CONSTRAINT dm_messages_typing_cycles_check CHECK (typing_cycles BETWEEN 0 AND 3);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS dm_messages_device_thread_deliver_idx ON dm_messages (device_id, thread_id, deliver_at);
