import { kakaoRooms as roomData } from '@data/kakao';

export type KakaoMessageType = 'text' | 'notice' | 'poll' | 'schedule' | 'file' | 'deleted';

export type PollOption = { label: string; votes: number };

export type KakaoMessage = {
  id: string;
  date: string;
  time: string;
  from: string;
  type: KakaoMessageType;
  text?: string;
  title?: string;
  when?: string;
  where?: string;
  lines?: string[];
  size?: string;
  question?: string;
  options?: PollOption[];
};

export type KakaoRoom = {
  id: string;
  name: string;
  memberCount: number;
  unread: number;
  messages: KakaoMessage[];
};

export const kakaoRooms = roomData as KakaoRoom[];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDayLabel(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 ${weekday}요일`;
}

export function previewOf(message: KakaoMessage | undefined) {
  if (!message) return '대화를 시작해 보세요';
  if (message.type === 'deleted') return '삭제된 메시지입니다.';
  if (message.type === 'poll') return `[투표] ${message.question}`;
  if (message.type === 'schedule') return `[일정] ${message.title}`;
  if (message.type === 'file') return `[파일] ${message.text}`;
  const body = message.type === 'notice' ? `[공지] ${message.text}` : message.text ?? '';
  return `${message.from === 'me' ? '나' : message.from}: ${body}`;
}
