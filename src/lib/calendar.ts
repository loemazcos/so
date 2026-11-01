import { callFunction } from '@/lib/gameApi';
import { calendarSeed } from '@data/calendar-seed';

export type CalendarKind = 'school' | 'festival' | 'club' | 'exam' | 'council' | 'personal';
export type CalendarStatus = 'scheduled' | 'changed' | 'cancelled';

export type CalendarEvent = {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  place: string | null;
  memo: string | null;
  kind: CalendarKind;
  status: CalendarStatus;
  status_note: string | null;
};

export type NewCalendarEvent = {
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  place: string | null;
  memo: string | null;
  kind: CalendarKind;
};

export const KIND_META: Record<CalendarKind, { label: string; dot: string }> = {
  school: { label: '학교', dot: 'bg-sky-500' },
  festival: { label: '축제', dot: 'bg-rose-500' },
  club: { label: '동아리', dot: 'bg-emerald-500' },
  exam: { label: '시험', dot: 'bg-orange-500' },
  council: { label: '학생회', dot: 'bg-yellow-400' },
  personal: { label: '개인', dot: 'bg-teal-500' },
};

export const KIND_ORDER: CalendarKind[] = ['school', 'festival', 'club', 'exam', 'council', 'personal'];

type LoadResponse = { calendarEvents?: unknown };

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const data = await callFunction<LoadResponse>('game-api', { action: 'load' });
  if (!Array.isArray(data.calendarEvents)) throw new Error('일정을 불러오지 못했어요.');
  const playerEvents = data.calendarEvents as CalendarEvent[];
  return [...(calendarSeed as CalendarEvent[]), ...playerEvents].sort(
    (a, b) => a.event_date.localeCompare(b.event_date) || (a.start_time ?? '').localeCompare(b.start_time ?? ''),
  );
}

export async function insertCalendarEvent(input: NewCalendarEvent): Promise<void> {
  await callFunction('game-api', { action: 'saveCalendarEvent', payload: input });
}

export function toDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function buildMonthCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1).getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const cells: ({ key: string; day: number } | null)[] = [];
  for (let i = 0; i < first; i += 1) cells.push(null);
  for (let day = 1; day <= days; day += 1) cells.push({ key: toDateKey(year, monthIndex, day), day });
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatEventTime(start: string | null, end: string | null) {
  if (!start) return '종일';
  const from = start.slice(0, 5);
  return end ? `${from} - ${end.slice(0, 5)}` : from;
}
