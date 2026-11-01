/*
 * 소문 제보하기 수치표
 * - 하루에 한 번만 누를 수 있습니다 (게임 날짜 기준).
 * - cost: 제보 한 번에 쓰는 게임 시간(분)과 배터리(%)
 * - delta: 소문 수치 변화
 * - backfire: 정정 요청이 역효과를 낼 확률과 그때의 변화, 대전이 남기는 댓글
 * - followUp: 제보 후 다음 쉬는 시간에 카톡으로 도착하는 메시지
 */
export const tipline = {
  cost: { minutes: 2, battery: 1 },
  choices: [
    {
      id: 'correct',
      label: '정정 요청 보내기',
      delta: -4,
      backfire: { chance: 0.2, delta: 3, note: '정정 요청이 들어왔습니다. 확인 중입니다.' },
    },
    {
      id: 'reveal',
      label: '재밌는 걸 제보한다',
      delta: 6,
      followUp: { title: '동현', text: '야 제보 너냐ㅋㅋ' },
    },
    {
      id: 'watch',
      label: '그냥 구경만',
      delta: 0,
    },
  ],
};
