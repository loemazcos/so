/*
 * 초보자용 수정 방법
 * - 기본 일정(학교 행사, 생일 등)을 여기서 고칩니다. 모든 기기에 같은 일정이 보입니다.
 * - 따옴표 안의 글자만 고치세요. 쉼표(,)와 중괄호({ })는 지우지 마세요.
 * - 시각은 24시간제입니다. 종일 일정은 start_time, end_time을 null로 둡니다.
 * - kind: school, festival, club, exam, council, personal 중 하나
 * - status: scheduled, changed, cancelled 중 하나
 */
export const calendarSeed = [
  { id: 'seed-01', title: '탁구부 복식 조 발표', event_date: '2026-10-15', start_time: '16:30', end_time: '17:30', place: '탁구장', memo: null, kind: 'club', status: 'scheduled', status_note: null },
  { id: 'seed-02', title: '동현 생일', event_date: '2026-10-20', start_time: null, end_time: null, place: null, memo: null, kind: 'personal', status: 'scheduled', status_note: null },
  { id: 'seed-03', title: '단체복 투표 마감', event_date: '2026-10-18', start_time: null, end_time: null, place: null, memo: '1번 후드 / 2번 바람막이', kind: 'school', status: 'scheduled', status_note: null },
  { id: 'seed-04', title: '보컬 오디션 공지', event_date: '2026-10-18', start_time: null, end_time: null, place: null, memo: '재현이 공지를 올려요', kind: 'festival', status: 'scheduled', status_note: null },
  { id: 'seed-05', title: '정문 조명 점검', event_date: '2026-10-21', start_time: '19:00', end_time: null, place: '학교 정문', memo: '밝기가 이상한 곳은 사진으로 기록', kind: 'council', status: 'scheduled', status_note: null },
  { id: 'seed-06', title: '상혁 생일', event_date: '2026-10-22', start_time: null, end_time: null, place: null, memo: null, kind: 'personal', status: 'scheduled', status_note: null },
  { id: 'seed-07', title: '단체복 수령', event_date: '2026-10-27', start_time: null, end_time: null, place: null, memo: null, kind: 'school', status: 'scheduled', status_note: null },
  { id: 'seed-08', title: '축제 리허설 집합', event_date: '2026-10-28', start_time: '13:30', end_time: '14:30', place: '강당 앞', memo: null, kind: 'festival', status: 'changed', status_note: '14:00에서 13:30으로 변경' },
  { id: 'seed-09', title: '보넥 축제 공연', event_date: '2026-10-28', start_time: '15:00', end_time: '17:00', place: '강당 앞 무대', memo: '개회, 1학년 3반 댄스, 축제 밴드, 탁구부 시범 경기 순서', kind: 'festival', status: 'scheduled', status_note: null },
];
