import { useState } from 'react';
import { Camera, Flashlight } from 'lucide-react';
import { device } from '@data/device';
import NotificationItem from '@/components/phone/NotificationItem';
import PasscodePad from '@/components/phone/PasscodePad';
import { formatClock, formatLockDate } from '@/lib/gameTime';

type Props = { now: Date; onUnlock: () => void };

export default function LockScreen({ now, onUnlock }: Props) {
  const [padOpen, setPadOpen] = useState(false);
  const [stackOpen, setStackOpen] = useState(false);
  const [swipeStartY, setSwipeStartY] = useState<number | null>(null);
  const notifications = device.lockNotifications;
  const [top, ...rest] = notifications;

  function finishSwipe(clientY: number) {
    if (swipeStartY !== null && swipeStartY - clientY > 60) setPadOpen(true);
    setSwipeStartY(null);
  }

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      onPointerDown={(event) => setSwipeStartY(event.clientY)}
      onPointerUp={(event) => {
        if (!padOpen) finishSwipe(event.clientY);
      }}
      onPointerCancel={() => setSwipeStartY(null)}
    >
      <div className={`pt-[calc(env(safe-area-inset-top)+64px)] text-center ${padOpen ? 'hidden' : ''}`}>
        <p className="text-[17px] font-medium">{formatLockDate(now)}</p>
        <p className="mt-1 text-[84px] font-light leading-none tracking-[-2px] tabular-nums">{formatClock(now)}</p>
      </div>

      <div className={`mt-8 flex justify-center gap-3 px-6 ${padOpen ? 'hidden' : ''}`}>
        <div className="flex flex-1 flex-col rounded-[20px] bg-[var(--glass)] p-3.5 backdrop-blur-[24px] backdrop-saturate-[180%]">
          <p className="text-[12px] text-[var(--fg-2)]">{device.dday.title}</p>
          <p className="mt-1 text-[22px] font-bold leading-none">{device.dday.label}</p>
        </div>
        <div className="flex flex-1 flex-col rounded-[20px] bg-[var(--glass)] p-3.5 backdrop-blur-[24px] backdrop-saturate-[180%]">
          <p className="text-[12px] text-[var(--fg-2)]">{device.weather.place}</p>
          <p className="mt-1 text-[22px] font-light leading-none tabular-nums">{device.weather.temp}° · {device.weather.summary}</p>
        </div>
      </div>

      <div className={`mx-4 mt-6 flex flex-col gap-2 ${padOpen ? 'hidden' : ''}`}>
        {top ? (
          <button type="button" onClick={() => setStackOpen((open) => !open)} className="w-full text-left">
            {stackOpen ? (
              <div className="flex flex-col gap-2">
                {notifications.map((item) => (
                  <NotificationItem key={item.id} appId={item.app} title={item.title} body={item.body} time={item.time} />
                ))}
              </div>
            ) : (
              <div className="relative">
                {rest.length > 0 ? (
                  <span className="absolute inset-x-3 -bottom-1.5 h-full rounded-[20px] bg-[var(--glass)] opacity-60" />
                ) : null}
                <div className="relative">
                  <NotificationItem appId={top.app} title={top.title} body={top.body} time={top.time} />
                </div>
                <p className="mt-3 text-center text-[13px] text-[var(--fg)]">알림 {notifications.length}개 모두 보기</p>
              </div>
            )}
          </button>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col items-center gap-5 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        {padOpen ? (
          <PasscodePad onUnlock={onUnlock} onCancel={() => setPadOpen(false)} />
        ) : (
          <>
            <div className="flex w-full items-center justify-between px-10">
              <button
                type="button"
                aria-label="손전등"
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--glass)] text-[var(--fg)] backdrop-blur-[16px] transition-transform active:scale-95"
              >
                <Flashlight size={22} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="카메라"
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--glass)] text-[var(--fg)] backdrop-blur-[16px] transition-transform active:scale-95"
              >
                <Camera size={22} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
            <button type="button" onClick={() => setPadOpen(true)} className="h-11 text-[14px] text-[var(--fg)]">
              위로 밀어서 잠금 해제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
