import { Camera } from 'lucide-react';
import NotificationItem from '@/components/phone/NotificationItem';
import { formatClock, formatLockDate } from '@/lib/gameTime';
import { useVisibleNotices } from '@/hooks/useVisibleNotices';
import { useGameState } from '@/state/GameState';
import { clearNotifications } from '@/state/runState';

type Props = {
  progress: number;
  dragging: boolean;
  now: Date;
  onClose: () => void;
  onCapture?: () => void;
};

export default function NotificationCenter({ progress, dragging, now, onClose, onCapture }: Props) {
  const items = useVisibleNotices();
  const { update } = useGameState();
  const hidden = progress === 0 && !dragging;

  return (
    <div className={`absolute inset-0 z-40 ${hidden ? 'invisible' : ''}`}>
      <div className="absolute inset-0 bg-black/30" style={{ opacity: progress }} onClick={onClose} />
      <section
        className="absolute inset-x-0 top-0 flex h-[86%] flex-col rounded-b-[28px] bg-[var(--glass)] px-4 pb-6 pt-[calc(env(safe-area-inset-top)+12px)] shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-[24px] backdrop-saturate-[180%]"
        style={{
          transform: `translate3d(0, ${(progress - 1) * 100}%, 0)`,
          transition: dragging ? 'none' : 'transform 450ms var(--spring)',
        }}
      >
        <div className="flex items-end justify-between px-1 pt-6">
          <div>
            <p className="text-[13px] text-[var(--fg-2)]">{formatLockDate(now)}</p>
            <p className="text-[28px] font-bold tabular-nums">{formatClock(now)}</p>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={() => update(clearNotifications)}
              className="h-9 rounded-full px-3 text-[14px] text-[var(--accent)]"
            >
              모두 지우기
            </button>
          ) : null}
        </div>
        {onCapture ? (
          <button
            type="button"
            onClick={onCapture}
            className="mt-3 flex items-center justify-center gap-2 rounded-[18px] bg-[var(--card)] py-3 text-[14px] font-semibold transition-transform active:scale-[0.98]"
          >
            <Camera size={18} strokeWidth={1.8} aria-hidden="true" />
            스크린샷
          </button>
        ) : null}
        <ul className="mt-5 flex flex-1 flex-col gap-2 overflow-y-auto">
          {items.length === 0 ? (
            <li className="py-10 text-center text-[15px] text-[var(--fg-2)]">새로운 알림이 없어요</li>
          ) : (
            items.map((item) => (
              <li key={item.id}>
                <NotificationItem appId={item.appId} title={item.title} body={item.body} time={item.time} />
              </li>
            ))
          )}
        </ul>
        <span className="mx-auto mt-3 h-1 w-9 rounded-full bg-[var(--fg-2)]" />
      </section>
    </div>
  );
}
