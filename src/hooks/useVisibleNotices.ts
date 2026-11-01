import { device } from '@data/device';
import { remitBody } from '@/lib/remit';
import { useGameState } from '@/state/GameState';

export type ListNotice = { id: string; appId: string; title: string; body: string; time: string };

export function useVisibleNotices(): ListNotice[] {
  const { run } = useGameState();
  const dynamic = run.notices
    .filter((notice) => notice.arriveAt <= run.t && !notice.queued)
    .map((notice) => ({ id: notice.id, appId: notice.appId, title: notice.title, body: notice.body, time: notice.time }))
    .reverse();
  if (run.notificationsCleared) return dynamic;
  const fixed = device.lockNotifications.map((item) => ({
    id: item.id,
    appId: item.app,
    title: item.title,
    body: item.id === 'n1' ? remitBody(run) : item.body,
    time: item.time,
  }));
  return [...dynamic, ...fixed];
}
