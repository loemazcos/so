/*
 * 카카오톡 대화방 데이터
 * - id: 방 이름표 (바꾸지 마세요)
 * - memberCount: 대화방 인원 수 (1:1 방은 2)
 * - unread: 안 읽은 메시지 수
 * - messages: 대화 내용. from은 보낸 사람 이름, 'me'는 태산입니다.
 * - type: text(일반) / notice(공지) / deleted(삭제된 메시지)
 * - 따옴표 안의 글자만 고치세요. 쉼표(,)와 중괄호({ })는 지우지 마세요.
 */
export const kakaoRooms = [
  {
    id: 'donghyun',
    name: '동현',
    memberCount: 2,
    unread: 6,
    messages: [
      { id: 'k-d01', date: '2026-10-14', time: '19:02', from: '동현', type: 'text', text: '형 병원 갔다 학교 온 거 ㄹㅇ 대박임' },
      { id: 'k-d02', date: '2026-10-14', time: '19:03', from: '동현', type: 'text', text: '얼굴 빨개서 옴 ㅋㅋㅋㅋ' },
      { id: 'k-d03', date: '2026-10-14', time: '19:05', from: '동현', type: 'text', text: '아프다면서 왜 왔냐니까 형이 누가 보고싶어서래' },
      { id: 'k-d04', date: '2026-10-14', time: '19:06', from: '동현', type: 'text', text: 'ㅋㅋㅋㅋㅋㅋ 누구겠냐' },
      { id: 'k-d05', date: '2026-10-14', time: '19:07', from: '동현', type: 'text', text: '병원은 그냥 좀 아파서 갔다는데 무슨 병원인지는 말 안 해 줌' },
      { id: 'k-d06', date: '2026-10-14', time: '20:15', from: '동현', type: 'text', text: '근데 형 생일 D-8인데 뭐 줌ㅋㅋ' },
    ],
  },
  {
    id: 'jaehyun',
    name: '재현',
    memberCount: 2,
    unread: 1,
    messages: [
      { id: 'k-j01', date: '2026-10-14', time: '12:41', from: '재현', type: 'text', text: '상혁 오늘 얼굴이 많이 빨갰다. 열이 있는 건지 모르겠다.' },
    ],
  },
  {
    id: 'seongho',
    name: '성호',
    memberCount: 2,
    unread: 1,
    messages: [
      { id: 'k-s01', date: '2026-10-14', time: '13:20', from: '성호', type: 'text', text: '상혁이 너 연락 보라던데. 봤냐.' },
    ],
  },
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
