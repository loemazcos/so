/*
 * 카카오톡 대화방 데이터 (그룹방과 나와의 채팅만)
 * - 1:1 대화는 인스타 DM에 있습니다 (data/instagram.js의 personalHistory).
 * - id: 방 이름표 (바꾸지 마세요)
 * - memberCount: 대화방 인원 수
 * - unread: 안 읽은 메시지 수
 * - messages: 대화 내용. from은 보낸 사람 이름, 'me'는 태산입니다.
 * - type: text(일반) / notice(공지) / deleted(삭제된 메시지)
 * - 따옴표 안의 글자만 고치세요. 쉼표(,)와 중괄호({ })는 지우지 마세요.
 */
export const kakaoRooms = [
  {
    id: 'class',
    name: '1학년 3반',
    memberCount: 28,
    unread: 0,
    messages: [
      { id: 'k-c01', date: '2026-10-14', time: '08:10', from: '하린', type: 'notice', text: '10/28 축제 단체복 투표 링크 올립니다. 18일까지!' },
      { id: 'k-c02', date: '2026-10-14', time: '08:25', from: '민재', type: 'text', text: '1번 후드 아니면 안 입는다' },
      { id: 'k-c03', date: '2026-10-14', time: '08:26', from: '유나', type: 'text', text: '2번 바람막이가 무조건 이득임' },
    ],
  },
  {
    id: 'tabletennis',
    name: '탁구부 단톡',
    memberCount: 6,
    unread: 0,
    messages: [
      { id: 'k-t01', date: '2026-10-14', time: '17:30', from: '상혁', type: 'text', text: '내일 복식 조 발표한다' },
      { id: 'k-t02', date: '2026-10-14', time: '17:31', from: '동현', type: 'text', text: '저 형이랑 다시 하면 안 됨? 지난번 졌잖아요' },
      { id: 'k-t03', date: '2026-10-14', time: '17:33', from: '성호', type: 'text', text: '그건 너 실력' },
    ],
  },
  {
    id: 'band',
    name: '보넥 밴드',
    memberCount: 5,
    unread: 0,
    messages: [
      { id: 'k-b01', date: '2026-10-13', time: '22:10', from: '재현', type: 'text', text: '오디션 공지는 일요일에 올린다. 보컬 지원자는 연습 영상 준비' },
      { id: 'k-b02', date: '2026-10-13', time: '22:12', from: '유나', type: 'text', text: '태산아 지원해' },
    ],
  },
  {
    id: 'me',
    name: '나와의 채팅',
    memberCount: 1,
    unread: 0,
    messages: [],
  },
];
