/*
 * 단서 목록 (24개)
 * - id: 단서 번호. 게임 상태(run.clues)와 서버 기록에 같은 값이 쓰입니다.
 * - app: 단서가 나오는 앱 이름 (표시용)
 * - day: 등장일 (1 = 10/14)
 * - core: 핵심 단서 여부 (도감에서 강조 표시에 씁니다)
 * - 문장은 초안입니다. 확정 전에는 바꿔도 게임 규칙에는 영향이 없습니다.
 */
export const clues = [
  { id: 'C01', app: '인스타', day: 1, title: '첫 메시지', text: '상혁이 처음 보낸 DM. 답장을 하든 안 하든, 이 대화가 모든 것의 시작이다.', core: false },
  { id: 'C02', app: '인스타', day: 2, title: '새벽 스토리', text: '상혁의 스토리. 새벽 체육관 바닥에 찍힌 운동화 자국과 텅 빈 벤치.', core: false },
  { id: 'C03', app: '인스타', day: 3, title: '좋아요 한 장', text: '상혁이 누른 좋아요 목록에 한 사람의 사진만 여러 번 있다.', core: false },
  { id: 'C04', app: '인스타', day: 4, title: '부계정', text: '인스타 보조 계정 xclovts. 상혁이 팔로우한 계정은 하나뿐이다.', core: true },
  { id: 'C05', app: '인스타', day: 6, title: '친한 친구 목록', text: '상혁의 친한 친구 목록에 이름이 하나도 없다. 목록은 비어 있지만 편집 기록은 남아 있다.', core: false },
  { id: 'C06', app: '대전', day: 14, title: '정정 글', text: '대전 계정의 정정 글. 소문의 출처가 한 번 바뀌었다는 흔적이 남아 있다.', core: false },
  { id: 'C07', app: '대전', day: 11, title: '제보 답장', text: '대전 계정이 제보자에게 보낸 답장. 익명이지만 말투가 익숙하다.', core: false },
  { id: 'C08', app: '인스타', day: 8, title: '학생회 댓글', text: '학생회 계정 댓글. 체육관 뒷문 점검 일정이 적혀 있다.', core: false },
  { id: 'C09', app: '카톡', day: 10, title: '동현의 한마디', text: '동현이 보낸 짧은 메시지. 이번 주에는 혼자 있지 말라는 말.', core: false },
  { id: 'C10', app: '카톡', day: 4, title: '사진 한 장', text: '단톡에 올라왔다가 금방 사라진 사진. 체육관 출입문 앞이 찍혀 있다.', core: false },
  { id: 'C11', app: '카톡', day: 5, title: '읽음 기록', text: '반 단톡 링크를 상혁이 이틀 전에 이미 열어 본 기록.', core: false },
  { id: 'C12', app: '카톡', day: 2, title: '복식 편성표', text: '탁구부 단톡의 복식 편성표. 태산의 이름 옆에 빈칸이 있다.', core: false },
  { id: 'C13', app: '카톡', day: 8, title: '삭제된 메시지', text: '재현의 대화방. 04:07, 04:09, 04:12에 보낸 메시지가 모두 지워져 있다.', core: true },
  { id: 'C14', app: '뮤직', day: 5, title: '새벽 네 시의 박수', text: '가장 많이 재생된 곡. 상혁의 스토리 배경음과 같은 곡이다.', core: false },
  { id: 'C15', app: '영상', day: 9, title: '5.29 조회수', text: '영상 앱에 저장된 영상 하나. 조회 기록이 5.29에 몰려 있다.', core: false },
  { id: 'C16', app: '카톡', day: 12, title: '연습 기록', text: '나와의 채팅에 남은 연습 기록. 손목 각도와 날짜가 적혀 있다.', core: false },
  { id: 'C17', app: '메모', day: 1, title: '선배 생일', text: '메모 앱에 적힌 날짜 하나. 옆에는 이름 대신 "선배"라고만 쓰여 있다.', core: true },
  { id: 'C18', app: '알뜰장터', day: 7, title: '삭제된 판매글', text: '알뜰장터에 올라왔다가 삭제된 판매글. 판매자는 체육관 근처 가게 이름이다.', core: false },
  { id: 'C19', app: '쏘머니', day: 1, title: '송금 기록', text: '쏘머니 송금 내역. 받는 쪽 이름이 잘려 있다.', core: true },
  { id: 'C20', app: '브라우저', day: 6, title: '검색 기록', text: '브라우저에 남은 검색어. 같은 단어가 여덟 번 검색되어 있다.', core: false },
  { id: 'C21', app: '학교종이', day: 10, title: '공지 문구', text: '학교 공지 알림. 체육관 점검 공지가 빠진 날이 하루 있다.', core: true },
  { id: 'C22', app: '시계', day: 8, title: '05:30 알람', text: '시계 앱의 05:30 알람. 매일 같은 시각에 울리도록 맞춰져 있다.', core: false },
  { id: 'C23', app: '전화', day: 3, title: '부재중 통화', text: '새벽에 걸려 왔다가 받지 않은 부재중 기록 하나.', core: false },
  { id: 'C24', app: '건강', day: 2, title: '새벽 걸음', text: '건강 앱에 찍힌 새벽 걸음 수. 체육관 근처를 여러 번 돈 기록이다.', core: false },
];
