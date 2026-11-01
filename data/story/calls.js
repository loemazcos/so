/*
 * 전화 데이터 (초안)
 * - time: 게임 시간 "HH:MM". day일차의 그 시각에 울려요.
 * - kind: 'missed' 는 울리지 않고 부재중 알림만 쌓여요. 'live' 는 받을 수 있어요.
 * - steps: 자막 한 줄씩 진행돼요. who '상혁' 은 상대 대사, '나' 는 내 선택 뒤 대사예요.
 *   type 'choose' 는 선택지를 고르는 줄이에요. 선택 효과는 mind / courage 로 적어요.
 * - 대사와 선택지 문장은 초안이에요. 확정 대사를 주면 그대로 바꿔요.
 * - D11 통화는 대사와 시각을 받은 뒤 추가해요.
 */
export const calls = [
  { id: 'd3-missed', day: 3, time: '12:20', kind: 'missed', count: 9 },
  {
    id: 'd8-call',
    day: 8,
    time: '20:40',
    kind: 'live',
    caller: '상혁',
    steps: [
      { type: 'say', who: '상혁', text: '...받았네.' },
      { type: 'say', who: '상혁', text: '너 요즘 왜 나 피해?' },
      {
        type: 'choose',
        options: [
          { label: '피한 거 아니야.', mind: 3, courage: 2, reply: '피한 거 아니야.' },
          { label: '그냥 바빴어.', mind: 0, courage: 0, reply: '그냥 바빴어.' },
          { label: '...미안.', mind: -2, courage: 1, reply: '...미안.' },
        ],
      },
      { type: 'say', who: '상혁', text: '그래. 알았어.' },
    ],
  },
  {
    id: 'd15-call',
    day: 15,
    time: '21:14',
    kind: 'live',
    caller: '상혁',
    steps: [
      { type: 'say', who: '상혁', text: '지금 받을 수 있어?' },
      {
        type: 'choose',
        options: [
          { label: '응, 받을 수 있어.', mind: 2, courage: 3, reply: '응, 받을 수 있어.' },
          { label: '지금은 좀 어려워.', mind: -2, courage: 0, reply: '지금은 좀 어려워.' },
        ],
      },
      { type: 'say', who: '상혁', text: '그럼... 다음에 얘기하자.' },
    ],
  },
];
