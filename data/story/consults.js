/*
 * 상담 표 (S1~S7)
 * - no: 회차 번호, day: 게임 날짜, time: 상담 제안이 열리는 시각 (HH:MM)
 * - donghyun / jaehyun: 각 방에서 상담을 받았을 때 적용되는 값
 *   · courage, mind, rumor: 수치 변화 (표에 없으면 0)
 *   · line: 상대가 카톡으로 보내는 한 줄
 *   · clue: 해금되는 단서 번호
 *   · unlock: 상태에 기록할 조건 이름
 * - 두 방 중 하나만 고를 수 있고, 고르면 그 회차는 다른 쪽이 닫힙니다.
 */
export const consults = [
  {
    no: 1,
    day: 2,
    time: '21:00',
    donghyun: { courage: 6, rumor: 3, line: '형이 나 볼 때마다 현활부터 물어봄' },
    jaehyun: { mind: 3, rumor: 5, line: '상혁 요즘 폰을 하루에 백 번 봄', clue: 'C13' },
  },
  {
    no: 2,
    day: 5,
    time: '21:00',
    donghyun: { courage: 6, line: '무서운 건 형이 아니라 연애 자체지? 그건 누구나 무서움' },
    jaehyun: { mind: 3, rumor: 5, line: '상혁이 네 최다 재생곡을 나한테 물어본 적 있음' },
  },
  {
    no: 3,
    day: 8,
    time: '21:00',
    donghyun: { courage: 8, line: '전화 오면 받을지 말지는 배터리 보고 정해' },
    jaehyun: { mind: 4, rumor: 8, line: '그 지워진 메시지 3건, 내가 대신 보내 달라던 거였음', clue: 'C13' },
  },
  {
    no: 4,
    day: 11,
    time: '21:00',
    donghyun: { courage: 10, line: '싫으면 싫다 좋으면 좋다는 형 말버릇임. 겁먹지 마' },
    jaehyun: { mind: 5, rumor: 10, line: '상혁이 병원 얘기는 안 하지만 걱정은 많이 했음' },
  },
  {
    no: 5,
    day: 13,
    time: '21:00',
    donghyun: { courage: 10, unlock: 'sanghyukDmOpen' },
    jaehyun: { mind: 4, rumor: 5, line: '먼저 연락하면 형이 놀랄 걸' },
  },
  {
    no: 6,
    day: 14,
    time: '21:00',
    donghyun: { courage: 8, unlock: 'replyUnlocked' },
    jaehyun: { mind: 4, rumor: 8, line: '단체복 얘기 들었냐. 1번 쪽 분위기가 좀 이상해', clue: 'C11' },
  },
  {
    no: 7,
    day: 15,
    time: '14:00',
    donghyun: { courage: 8, line: '무대 전에 긴장 풀리는 법 알려 줄까?' },
    jaehyun: { mind: 4, rumor: 5, line: '무대 순서 보내 줄게. 상혁 형은 세 번째야', clue: 'C12' },
  },
];
