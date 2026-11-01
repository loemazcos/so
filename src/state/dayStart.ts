import { schedule } from '@data/story/schedule';
import { clockOf, type Notice } from '@/state/timeline';

export function onDayStart(day: number, at: number): Notice[] {
  return schedule
    .filter((entry: { day: number }) => entry.day === day)
    .map((entry: { id: string; appId: string; title: string; body: string }) => ({
      id: `schedule-${day}-${entry.id}`,
      appId: entry.appId,
      title: entry.title,
      body: entry.body,
      time: clockOf(at),
      arriveAt: at,
    }));
}
