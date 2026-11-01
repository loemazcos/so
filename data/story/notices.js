/*
 * 시간이 되면 자동으로 뜨는 알림 문구
 * - recess: 쉬는 시간이 시작될 때 (10분 동안 폰을 쓸 수 있어요)
 * - dismissal: 16시 하교
 * - tipPost: 밤 22시 41분, 소문 계정의 새 글 알림
 */
export const notices = {
  recess: { appId: 'clock', title: '쉬는 시간', body: '10분 동안 폰을 쓸 수 있어요.' },
  dismissal: { appId: 'clock', title: '하교', body: '16시. 이제 폰을 자유롭게 볼 수 있어요.' },
  tipPost: {
    appId: 'insta',
    title: 'bonego_tip_line',
    body: '[제보] 어젯밤 체육관 불 켜져 있었다는 제보 3건. 귀신이라는 의견 vs 탁구부라는 의견 (현재 탁구부 우세)',
  },
};
