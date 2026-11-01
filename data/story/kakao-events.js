/*
 * 카톡 날짜별 메시지 (게임 시각에 맞춰 자동으로 도착합니다)
 * - id: 중복 방지용 이름표 (바꾸지 마세요)
 * - day, time: 며칠째 몇 시에 도착하는지 (time은 HH:MM)
 * - room: 방 이름표 (data/kakao.js의 id). 'me'는 나와의 채팅
 * - from: 보낸 사람. 나와의 채팅은 'me'
 * - type: text / notice / poll
 * - poll이면 question과 options(라벨, 기본 표수)을 씁니다.
 * - effect: 도착할 때 한 번 적용되는 변화 (mind, rumor, courage, clue, mindIfRumorPeak)
 *   · mindIfRumorPeak: 소문이 한 번이라도 atLeast 이상이었다면 mind 대신 이 값을 씁니다.
 */
export const kakaoEvents = [
  {
    id: 'ev-d1-uniform',
    day: 1,
    time: '08:30',
    room: 'class',
    from: '하린',
    type: 'poll',
    text: '단체복 투표 (10/18 마감)',
    question: '단체복 투표 (10/18 마감)',
    options: [
      { label: '1번 후드', votes: 14 },
      { label: '2번 바람막이', votes: 11 },
    ],
  },
  {
    id: 'ev-d2-doubles',
    day: 2,
    time: '17:40',
    room: 'tabletennis',
    from: '상혁',
    type: 'notice',
    text: '복식 편성표: 상혁 · 태산',
  },
  {
    id: 'ev-d3-seongho-1',
    day: 3,
    time: '05:10',
    room: 'seongho',
    from: '성호',
    type: 'text',
    text: '1학년 선도부 성호다. 복장 점검 시간 바뀐 거 확인해라.',
  },
  {
    id: 'ev-d9-seongho-2',
    day: 9,
    time: '08:00',
    room: 'seongho',
    from: '성호',
    type: 'notice',
    text: '연습실 신청 반려. 신청서 양식 미비.',
  },
  {
    id: 'ev-d10-seongho-2b',
    day: 10,
    time: '08:20',
    room: 'seongho',
    from: '성호',
    type: 'text',
    text: '양식 고쳐서 다시 냈냐. 오늘 안에 확인한다.',
  },
  {
    id: 'ev-d12-self-log',
    day: 12,
    time: '07:30',
    room: 'me',
    from: 'me',
    type: 'text',
    text: '연습 기록: 복식 스매시 7/10 성공',
    effect: { clue: 'C16' },
  },
  {
    id: 'ev-d12-self-gift-1',
    day: 12,
    time: '07:31',
    room: 'me',
    from: 'me',
    type: 'text',
    text: '선물 링크 1: 탁구채 그립 테이프',
  },
  {
    id: 'ev-d12-self-gift-2',
    day: 12,
    time: '07:32',
    room: 'me',
    from: 'me',
    type: 'text',
    text: '선물 링크 2: 재현이가 좋아하는 밴드 앨범',
  },
  {
    id: 'ev-d12-self-gift-3',
    day: 12,
    time: '07:33',
    room: 'me',
    from: 'me',
    type: 'text',
    text: '선물 링크 3: 상혁이 말한 카페 쿠폰',
  },
  {
    id: 'ev-d14-seongho-3',
    day: 14,
    time: '21:40',
    room: 'seongho',
    from: '성호',
    type: 'text',
    text: '정정 글 올라왔다. 이제 그만 얘기하자.',
    effect: {
      rumor: -15,
      mind: 2,
      mindIfRumorPeak: { atLeast: 80, mind: -10 },
      clue: 'C06',
    },
  },
];
