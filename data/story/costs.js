/*
 * 행동별 게임 시간(분)과 배터리(%) 소모 표
 * - minutes: 게임 시계가 흐르는 시간
 * - battery: 배터리가 줄어드는 양
 */
export const costs = {
  appOpen: { minutes: 1, battery: 0.5 },
  dmOpen: { minutes: 1, battery: 0.2 },
  dmSend: { minutes: 1, battery: 0.2 },
  kakaoRoom: { minutes: 2, battery: 0.3 },
  memoRead: { minutes: 1, battery: 0.1 },
  feedPage: { minutes: 5, battery: 2 },
  reelBatch: { minutes: 10, battery: 5 },
};
