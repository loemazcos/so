/*
 * 상혁 DM의 답장 선택지와 엔딩 문구
 * - choices: 대화 아래에 나오는 선택지 (id는 바꾸지 마세요)
 * - ending: "네? 왜요ㅋㅋ"를 고르면 나오는 흰 카드
 */
export const sanghyukChoices = [
  { id: 'why', label: '네? 왜요ㅋㅋ' },
  { id: 'read', label: '…읽었어요' },
  { id: 'leave', label: '답하지 않고 나가기' },
];

export const sanghyukEnding = {
  codex: 'A-0',
  title: 'A-0 직진',
  codexNote: '도감 1/10 열림',
  lines: [
    { from: 'me', text: '네? 왜요ㅋㅋ' },
    { from: 'them', text: '…읽었네.' },
    { from: 'them', text: '아 진짜 다행이다' },
  ],
  closing: '7일 만이 아니라 3초 만에 온 답장에, 상혁은 휴대폰을 쥔 채 한참 웃었다.',
};
