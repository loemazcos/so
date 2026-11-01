import { useRef, type PointerEvent } from 'react';
import AppGlyph from '@/components/phone/AppGlyph';
import type { AppConfig } from '@/lib/types';

const LONG_PRESS_MS = 450;
const MOVE_TOLERANCE_PX = 10;

type Props = {
  app: AppConfig;
  badge?: number;
  wiggle: boolean;
  showLabel?: boolean;
  onOpen: (app: AppConfig, rect: DOMRect) => void;
  onLongPress: () => void;
};

export default function AppIcon({ app, badge, wiggle, showLabel = true, onOpen, onLongPress }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const start = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  function cancelPress() {
    window.clearTimeout(timer.current);
    start.current = null;
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    start.current = { x: event.clientX, y: event.clientY };
    suppressClick.current = false;
    timer.current = window.setTimeout(() => {
      suppressClick.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const origin = start.current;
    if (!origin) return;
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > MOVE_TOLERANCE_PX) {
      suppressClick.current = true;
      cancelPress();
    }
  }

  function handleClick() {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (wiggle) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) onOpen(app, rect);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={app.name}
      className="flex w-[76px] flex-col items-center gap-1.5 outline-none transition-transform duration-150 ease-out active:scale-[0.92]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span className={`relative ${wiggle ? 'phone-wiggle' : ''}`}>
        <AppGlyph app={app} />
        {badge ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3B30] px-1.5 text-[12px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </span>
      {showLabel ? (
        <span className="w-full truncate text-center text-[12px] leading-[1.2] text-[var(--fg)]">{app.name}</span>
      ) : null}
    </button>
  );
}
