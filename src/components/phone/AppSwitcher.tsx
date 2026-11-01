import { useRef, useState, type PointerEvent } from 'react';
import AppGlyph from '@/components/phone/AppGlyph';
import type { AppConfig } from '@/lib/types';

const CARD_WIDTH = 240;
const CARD_GAP = 16;
const STEP = CARD_WIDTH + CARD_GAP;
const DRAG_START_PX = 8;
const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)';

type Props = {
  apps: AppConfig[];
  onResume: (app: AppConfig, rect: DOMRect) => void;
  onClose: () => void;
};

export default function AppSwitcher({ apps, onResume, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const origin = useRef<{ x: number; dragging: boolean } | null>(null);
  const draggedRef = useRef(false);
  const current = Math.min(index, Math.max(apps.length - 1, 0));

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    origin.current = { x: event.clientX, dragging: false };
    draggedRef.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = origin.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (!start.dragging) {
      if (Math.abs(dx) < DRAG_START_PX) return;
      start.dragging = true;
      draggedRef.current = true;
    }
    setDragX(dx);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = origin.current;
    origin.current = null;
    if (!start?.dragging) return;
    const dx = event.clientX - start.x;
    const shift = dx < -STEP / 3 ? 1 : dx > STEP / 3 ? -1 : 0;
    setIndex(Math.min(Math.max(current + shift, 0), apps.length - 1));
    setDragX(0);
  }

  return (
    <div
      className="phone-fade-in absolute inset-0 z-30 flex flex-col justify-center bg-black/30 backdrop-blur-[24px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {apps.length === 0 ? (
        <p className="text-center text-[15px] text-white">최근에 연 앱이 없어요</p>
      ) : (
        <div
          className="relative h-[460px] w-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {apps.map((app, position) => (
            <button
              key={app.id}
              type="button"
              onClick={(event) => {
                if (!draggedRef.current) onResume(app, event.currentTarget.getBoundingClientRect());
              }}
              className="absolute top-0 flex h-[460px] flex-col overflow-hidden rounded-[22px] bg-[var(--card)] text-left shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
              style={{
                width: CARD_WIDTH,
                left: `calc(50% - ${CARD_WIDTH / 2}px)`,
                transform: `translate3d(${(position - current) * STEP + dragX}px, 0, 0) scale(${position === current ? 1 : 0.92})`,
                transition: dragX === 0 ? `transform 450ms ${SPRING}` : 'none',
              }}
            >
              <span className="flex items-center gap-2.5 px-4 py-3 text-[var(--fg)]">
                <AppGlyph app={app} size={28} />
                <span className="text-[15px] font-semibold">{app.name}</span>
              </span>
              <span
                className="flex flex-1 items-center justify-center"
                style={{ backgroundImage: `linear-gradient(180deg, ${app.colors[0]}, ${app.colors[1]})` }}
              >
                <AppGlyph app={app} size={96} />
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 text-center text-[13px] text-white/80">좌우로 밀어 고르고, 화면을 위로 밀면 닫혀요</p>
    </div>
  );
}
