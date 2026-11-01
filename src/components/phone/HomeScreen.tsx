import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { apps, dockIds } from '@data/apps.config';
import { device } from '@data/device';
import AppIcon from '@/components/phone/AppIcon';
import HomeWidgets from '@/components/phone/HomeWidgets';
import type { AppConfig } from '@/lib/types';

const PAGE_SIZE = 16;
const TOP_OFFSET = 'calc(env(safe-area-inset-top) + 96px)';
const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const SWIPE_ACTIVATE_PX = 8;
const SWIPE_COMMIT_RATIO = 0.2;

const dockApps = dockIds.flatMap((id) => apps.filter((app) => app.id === id));
const gridApps = apps.filter((app) => !dockIds.includes(app.id));
const gridPages: AppConfig[][] = [];
for (let i = 0; i < gridApps.length; i += PAGE_SIZE) gridPages.push(gridApps.slice(i, i + PAGE_SIZE));
const PAGE_COUNT = gridPages.length + 1;
const badges: Record<string, number> = device.badges;

type Props = {
  now: Date;
  page: number;
  onPageChange: (page: number) => void;
  editing: boolean;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onOpenApp: (app: AppConfig, rect: DOMRect) => void;
};

type Swipe = { x: number; y: number; active: boolean; dx: number };

export default function HomeScreen({
  now,
  page,
  onPageChange,
  editing,
  onStartEditing,
  onStopEditing,
  onOpenApp,
}: Props) {
  const [dragX, setDragX] = useState(0);
  const swipe = useRef<Swipe | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    swipe.current = { x: event.clientX, y: event.clientY, active: false, dx: 0 };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const origin = swipe.current;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (!origin.active) {
      if (Math.abs(dx) < SWIPE_ACTIVATE_PX || Math.abs(dx) < Math.abs(dy)) return;
      origin.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const atEdge = (page === 0 && dx > 0) || (page === PAGE_COUNT - 1 && dx < 0);
    const offset = atEdge ? dx * 0.3 : dx;
    origin.dx = offset;
    setDragX(offset);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const origin = swipe.current;
    swipe.current = null;
    if (!origin?.active) return;
    const threshold = event.currentTarget.clientWidth * SWIPE_COMMIT_RATIO;
    let next = page;
    if (origin.dx < -threshold) next = Math.min(page + 1, PAGE_COUNT - 1);
    else if (origin.dx > threshold) next = Math.max(page - 1, 0);
    setDragX(0);
    onPageChange(next);
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!editing) return;
    if ((event.target as HTMLElement).closest('button')) return;
    onStopEditing();
  }

  const trackOffset = `calc(${-(page * 100) / PAGE_COUNT}% + ${dragX}px)`;
  const pageWidth = { width: `${100 / PAGE_COUNT}%` };

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      <div
        className="flex h-full"
        style={{
          width: `${PAGE_COUNT * 100}%`,
          transform: `translate3d(${trackOffset}, 0, 0)`,
          transition: dragX === 0 ? `transform 450ms ${SPRING}` : 'none',
        }}
      >
        <section className="h-full shrink-0 px-5" style={{ ...pageWidth, paddingTop: TOP_OFFSET }}>
          <HomeWidgets now={now} />
        </section>
        {gridPages.map((group, index) => (
          <section key={index} className="h-full shrink-0 px-6" style={{ ...pageWidth, paddingTop: TOP_OFFSET }}>
            <div className="grid grid-cols-4 justify-items-center gap-y-6">
              {group.map((app) => (
                <AppIcon
                  key={app.id}
                  app={app}
                  badge={badges[app.id]}
                  wiggle={editing}
                  onOpen={onOpenApp}
                  onLongPress={onStartEditing}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {editing ? (
        <button
          type="button"
          onClick={onStopEditing}
          className="absolute right-5 top-[calc(env(safe-area-inset-top)+56px)] rounded-full bg-[var(--card)] px-4 py-1.5 text-[15px] font-semibold text-[var(--accent)] shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform active:scale-95"
        >
          완료
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-[150px] flex justify-center gap-2">
        {Array.from({ length: PAGE_COUNT }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              index === page ? 'bg-[var(--fg)]' : 'bg-[var(--fg-2)]'
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-x-3 bottom-7 flex h-[96px] items-center justify-around rounded-[30px] bg-[var(--glass)] shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-[24px] backdrop-saturate-[180%]">
        {dockApps.map((app) => (
          <AppIcon
            key={app.id}
            app={app}
            badge={badges[app.id]}
            wiggle={editing}
            showLabel={false}
            onOpen={onOpenApp}
            onLongPress={onStartEditing}
          />
        ))}
      </div>
    </div>
  );
}
