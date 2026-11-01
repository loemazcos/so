/*
# Create calendar events table and seed May schedule

1. New Tables
- `calendar_events`
  - `id` (uuid, primary key)
  - `title` (text, required)
  - `event_date` (date, required)
  - `start_time` / `end_time` (time, optional; empty means all day)
  - `place` (text, optional)
  - `memo` (text, optional)
  - `kind` (text): school, festival, club, exam, council, personal
  - `status` (text): scheduled, changed, or cancelled
  - `status_note` (text, optional): shown when an event was changed or cancelled
  - `created_at` (timestamptz)

2. Seed data
- Inserts the May schedule (festival week, exams, club fair, rehearsals) only when the table is empty, so re-running is safe.

3. Security
- Enable RLS.
- No sign-in exists, so anon and authenticated roles can read and add events.
- Edits and deletes are not granted.
*/

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  place text,
  memo text,
  kind text NOT NULL CHECK (kind IN ('school', 'festival', 'club', 'exam', 'council', 'personal')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'changed', 'cancelled')),
  status_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON calendar_events (event_date);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON calendar_events TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_calendar_events" ON calendar_events;
CREATE POLICY "anon_select_calendar_events" ON calendar_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_calendar_events" ON calendar_events;
CREATE POLICY "anon_insert_calendar_events" ON calendar_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

INSERT INTO calendar_events (title, event_date, start_time, end_time, place, memo, kind, status, status_note)
SELECT v.title, v.event_date, v.start_time, v.end_time, v.place, v.memo, v.kind, v.status, v.status_note
FROM (VALUES
  ('부스 신청 마감', DATE '2026-05-10', NULL::time, NULL::time, '학생지원실', '축제 부스 신청 접수 마감일입니다.', 'school', 'scheduled', NULL),
  ('동아리 박람회', DATE '2026-05-22', TIME '13:00', TIME '16:00', '강당 앞', '우천으로 취소되었습니다. 축제 날 부스로 대체합니다.', 'club', 'cancelled', '우천으로 취소. 5/29 축제 부스로 대체'),
  ('중간고사 1교시 (국어)', DATE '2026-05-26', TIME '09:00', TIME '10:00', '1학년 3반 교실', NULL, 'exam', 'scheduled', NULL),
  ('학생회 회의', DATE '2026-05-27', TIME '16:00', TIME '17:00', '학생회실', '부스 배치와 체육관 신청 건을 정리합니다.', 'council', 'changed', '14:00에서 16:00으로 변경'),
  ('탁구부 체육관 사용', DATE '2026-05-28', TIME '15:30', TIME '17:00', '체육관', NULL, 'club', 'scheduled', NULL),
  ('축제 밴드 리허설', DATE '2026-05-28', TIME '18:00', TIME '19:30', '강당 무대', '세팅 18:00, 1회차 연주, 후렴 정리 순서.', 'festival', 'scheduled', NULL),
  ('정문 조명 점검', DATE '2026-05-28', TIME '19:00', NULL::time, '학교 정문', '밝기가 이상한 곳은 사진으로 기록합니다.', 'council', 'scheduled', NULL),
  ('축제 리허설 집합', DATE '2026-05-29', TIME '14:30', TIME '15:00', '강당 앞', '악기 세팅은 13:40까지 끝내 주세요.', 'festival', 'changed', '15:00에서 14:30으로 변경'),
  ('축제 공연', DATE '2026-05-29', TIME '15:00', TIME '17:00', '강당 앞 무대', '개회, 1학년 3반 댄스, 축제 밴드, 탁구부 시범 경기 순서입니다.', 'festival', 'scheduled', NULL),
  ('상혁 생일', DATE '2026-05-30', NULL::time, NULL::time, NULL, NULL, 'personal', 'scheduled', NULL),
  ('기말고사 1교시 (수학)', DATE '2026-06-03', TIME '09:00', TIME '10:00', '1학년 3반 교실', NULL, 'exam', 'scheduled', NULL)
) AS v (title, event_date, start_time, end_time, place, memo, kind, status, status_note)
WHERE NOT EXISTS (SELECT 1 FROM calendar_events);
