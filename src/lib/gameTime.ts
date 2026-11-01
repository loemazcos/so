const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatLockDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

export function isNightTime(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 19 || hour < 6;
}
