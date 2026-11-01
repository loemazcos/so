/*
 * 초보자용 수정 방법
 * - 폰의 기본값(시작 시각, 배터리, 비밀번호, 잠금화면 알림, 위젯 값)을 여기서 바꿉니다.
 * - 따옴표 안의 글자만 고치세요. 쉼표(,)와 중괄호({ })는 지우지 마세요.
 * - 시각은 24시간제입니다. 예: 오후 9시 47분 = hour: 21, minute: 47
 */
export const device = {
  gameStart: { year: 2026, month: 10, day: 14, hour: 21, minute: 47 },
  battery: 62,
  passcode: '1022',
  passcodeHint: '선배 생일',
  passcodeHintAfter: 3,
  maxPasscodeTries: 5,
  lockoutSeconds: 60,
  dday: { label: 'D-8', title: '비공개 일정' },
  steps: 3412,
  badges: { insta: 1, kakao: 8, remit: 1 },
  lockNotifications: [
    { id: 'n1', app: 'remit', title: '송금', time: '21:41', body: '상혁님이 1원을 보냈어요 · 2시간 13분 후 만료' },
    { id: 'n2', app: 'kakao', title: '동현', time: '20:15', body: '근데 형 생일 D-8인데 뭐 줌ㅋㅋ' },
    { id: 'n3', app: 'kakao', title: '동현', time: '19:02', body: '형 병원 갔다 학교 온 거 ㄹㅇ 대박임' },
    { id: 'n4', app: 'kakao', title: '성호', time: '13:20', body: '상혁이 너 연락 보라던데. 봤냐.' },
    { id: 'n5', app: 'kakao', title: '재현', time: '12:41', body: '상혁 오늘 얼굴이 많이 빨갰다. 열이 있는 건지 모르겠다.' },
  ],
};
