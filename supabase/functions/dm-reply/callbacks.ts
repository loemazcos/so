// 상혁이 AI 없이 보내는 고정 메시지입니다. 각 메시지는 한 번만 나갑니다.
// text: 대화방에 그대로 나오는 문장
// mindDelta: 도착했을 때 상혁 마음에 더하는 값(없으면 0)
export const callbacks = {
  erasedThrice: { text: '쓰다 지웠냐.', mindDelta: 2 },
  dndNight: { text: '…방해금지냐.', mindDelta: 0 },
};
