/*
 * 초보자용 수정 방법
 * - 계정 이름, 학교 이름, 앱 이름은 이 파일에서만 바꾸면 게임 전체에 반영됩니다.
 * - name: 폰 화면에 보이는 앱 이름
 * - icon: 아이콘 그림 (camera, message, phone, sms, school, graduation, bag, shirt, bike, tag,
 *         wallet, music, play, note, calendar, clock, compass, footprints, map, settings, cloud, calc, aperture 중 하나)
 * - colors: 아이콘 배경 색 두 개 (위쪽, 아래쪽)
 * - ink: 아이콘 그림 색 (#ffffff 또는 #1c1c1e)
 * - dockIds: 맨 아래 독에 올라가는 앱 id (최대 4개)
 * - 따옴표와 쉼표는 지우지 마세요.
 */
export const account = {
  playerName: '태산',
  mainId: 'taesan.k',
  subId: 'xclovts',
};

export const schoolName = '보넥고등학교';

export const dockIds = ['phone', 'message', 'kakao', 'insta'];

export const apps = [
  { id: 'insta', name: '인스타', icon: 'camera', colors: ['#FBC17D', '#E0457B'], ink: '#ffffff' },
  { id: 'kakao', name: '카톡', icon: 'message', colors: ['#FFE58A', '#F5C100'], ink: '#1c1c1e' },
  { id: 'phone', name: '전화', icon: 'phone', colors: ['#7EE19A', '#27B255'], ink: '#ffffff' },
  { id: 'message', name: '메시지', icon: 'sms', colors: ['#8FD0FF', '#2F8FF0'], ink: '#ffffff' },
  { id: 'neis', name: '나이스 플러스', icon: 'graduation', colors: ['#B5EAD7', '#2E9E7A'], ink: '#ffffff' },
  { id: 'shopA', name: '옷장일기', icon: 'bag', colors: ['#5B5B63', '#2C2C30'], ink: '#ffffff' },
  { id: 'shopB', name: '라운지룸', icon: 'shirt', colors: ['#F9C6D2', '#E06A8A'], ink: '#ffffff' },
  { id: 'delivery', name: '한걸음배달', icon: 'bike', colors: ['#FFB68A', '#F0662C'], ink: '#ffffff' },
  { id: 'market', name: '알뜰장터', icon: 'tag', colors: ['#FFD9A0', '#F59E0B'], ink: '#1c1c1e' },
  { id: 'remit', name: '쏘머니', icon: 'wallet', colors: ['#9BEBCB', '#17A67A'], ink: '#ffffff' },
  { id: 'music', name: '뮤직', icon: 'music', colors: ['#FF9BAD', '#E63956'], ink: '#ffffff' },
  { id: 'video', name: '영상', icon: 'play', colors: ['#FFA6A6', '#E03E3E'], ink: '#ffffff' },
  { id: 'memo', name: '메모', icon: 'note', colors: ['#FFF4A8', '#F2C230'], ink: '#1c1c1e' },
  { id: 'clueBook', name: '단서 도감', icon: 'school', colors: ['#D4E4F7', '#5B7FA6'], ink: '#ffffff' },
  { id: 'calendar', name: '캘린더', icon: 'calendar', colors: ['#FFFFFF', '#E4E4EA'], ink: '#e5484d' },
  { id: 'clock', name: '시계', icon: 'clock', colors: ['#3A3A3F', '#111114'], ink: '#ffffff' },
  { id: 'browser', name: '브라우저', icon: 'compass', colors: ['#A6DCFF', '#1E88E5'], ink: '#ffffff' },
  { id: 'health', name: '건강', icon: 'footprints', colors: ['#C1F5B0', '#34C759'], ink: '#1c1c1e' },
  { id: 'map', name: '지도', icon: 'map', colors: ['#C7EBB6', '#4CAF50'], ink: '#1c1c1e' },
  { id: 'settings', name: '설정', icon: 'settings', colors: ['#D6D8DE', '#8E8E93'], ink: '#1c1c1e' },
  { id: 'weather', name: '날씨', icon: 'cloud', colors: ['#9FD4FF', '#3A7BD5'], ink: '#ffffff' },
  { id: 'calc', name: '계산기', icon: 'calc', colors: ['#505057', '#2C2C30'], ink: '#ffffff' },
  { id: 'camera', name: '카메라', icon: 'aperture', colors: ['#E4E5EA', '#A9ABB3'], ink: '#1c1c1e' },
];
