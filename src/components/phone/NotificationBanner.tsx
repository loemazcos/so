import { useEffect, useRef, useState, type PointerEvent } from 'react';
import NotificationItem from '@/components/phone/NotificationItem';

const SHOW_MS = 4500;
const EXIT_MS = 300;
const SWIPE_UP_PX = 16;

type Props = { appId: string; title: string; body: string; time: string; onDismiss: () => void };

export default function NotificationBanner({ appId, title, body, time, onDismiss }: Props) {
  const [shown, setShown] = useState(false);
  const startY = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const enter = window.requestAnimationFrame(() => setShown(true));
    hideTimer.current = window.setTimeout(() => close(), SHOW_MS);
    return () => {
      window.cancelAnimationFrame(enter);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    };
    // close is stable within this mount; the effect runs once per banner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setShown(false);
    exitTimer.current = window.setTimeout(onDismiss, EXIT_MS);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    startY.current = event.clientY;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startY.current !== null && startY.current - event.clientY > SWIPE_UP_PX) close();
    startY.current = null;
  }

  return (
    <div
      role="status"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (startY.current = null)}
      className={`absolute inset-x-3 top-[calc(env(safe-area-inset-top)+8px)] z-[61] touch-none transition-[transform,opacity] duration-300 ease-out ${
        shown ? 'translate-y-0 opacity-100' : '-translate-y-[160%] opacity-0'
      }`}
    >
      <NotificationItem appId={appId} title={title} body={body} time={time} />
    </div>
  );
}
