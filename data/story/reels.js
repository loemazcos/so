/*
 * 릴스 목록 (영상 대신 그라데이션 배경과 자막을 씁니다)
 * - tone: 배경 그라데이션 두 색
 * - likedBy: 이 릴스에 좋아요를 누른 계정 (없으면 null)
 */
export const reels = [
  { id: 'reel01', handle: 'jaehyun.council', caption: '회의실 불 끄는 사람이 제일 늦게 나감', likes: 302, tone: ['#F3E8D2', '#B89B6A'], likedBy: null },
  { id: 'reel02', handle: 'donghyun.daily', caption: '급식실 마지막 한 조각의 무게', likes: 118, tone: ['#FFF1C1', '#E9A23B'], likedBy: null },
  { id: 'reel03', handle: 'bonego_fest_band', caption: '리허설은 세 번 끊기고 네 번째에 됐다', likes: 764, tone: ['#A7D8F0', '#2F6E9E'], likedBy: 'sanghyuk.gym' },
  { id: 'reel04', handle: 'bonego_pingpong', caption: '손목 아프다고 말하면 안 되는 분위기', likes: 209, tone: ['#FFD6C9', '#E8795A'], likedBy: null },
  { id: 'reel05', handle: 'seongho.patrol', caption: '정문 조명이 다시 켜지는 순간', likes: 96, tone: ['#1F2A3A', '#0B1220'], likedBy: null },
  { id: 'reel06', handle: 'sanghyuk.gym', caption: '자판기 앞에서 두 번째 캔', likes: 1024, tone: ['#2B3A34', '#0F1C17'], likedBy: null },
];
