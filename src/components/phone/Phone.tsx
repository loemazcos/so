import { useRef, useState, type PointerEvent } from 'react';
import { apps } from '@data/apps.config';
import AppSwitcher from '@/components/phone/AppSwitcher';
import AppWindow from '@/components/phone/AppWindow';
import ControlCenter from '@/components/phone/ControlCenter';
import HomeScreen from '@/components/phone/HomeScreen';
import LockScreen from '@/components/phone/LockScreen';
import NotificationCenter from '@/components/phone/NotificationCenter';
import Spotlight from '@/components/phone/Spotlight';
import StatusBar from '@/components/phone/StatusBar';
import Wallpaper from '@/components/phone/Wallpaper';
import { useGameClock } from '@/hooks/useGameClock';
import { isNightTime } from '@/lib/gameTime';
import type { AppConfig, Rect } from '@/lib/types';

type SheetKind = 'nc' | 'cc' | 'spot';
type GestureKind = SheetKind | 'close' | 'home';
type Gesture = {
  x: number;
  y: number;
  zone: 'top' | 'bottom' | 'mid' | 'sheet';
  side: 'nc' | 'cc';
  kind: GestureKind | null;
};
type Drag = { kind: GestureKind; p: number };
type OpenState = { app: AppConfig; origin: Rect; closing: boolean };

const SWIPE_COMMIT_PX = 90;
const SWIPE_SHORT_PX = 60;
const ACTIVATE_PX = 8;
const DEFAULT_TRAVEL_PX = 844;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function resolveKind(zone: Gesture['zone'], dy: number, side: 'nc' | 'cc'): GestureKind | null {
  if (zone === 'top' && dy > 0) return side;
  if (zone === 'mid' && dy > 0) return 'spot';
  if (zone === 'bottom' && dy < 0) return 'home';
  if (zone === 'sheet' && dy < 0) return 'close';
  return null;
}

export default function Phone() {
  const now = useGameClock();
  const screenRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const [locked, setLocked] = useState(true);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [openState, setOpenState] = useState<OpenState | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  const dark = isNightTime(now);
  const recentApps = recentIds.flatMap((id) => apps.filter((app) => app.id === id));

  function toScreenRect(target: DOMRect): Rect {
    const screen = screenRef.current?.getBoundingClientRect();
    return {
      left: target.left - (screen?.left ?? 0),
      top: target.top - (screen?.top ?? 0),
      width: target.width,
      height: target.height,
    };
  }

  function openApp(app: AppConfig, target: DOMRect) {
    setEditing(false);
    setSwitcherOpen(false);
    setOpenState({ app, origin: toScreenRect(target), closing: false });
    setRecentIds((ids) => [app.id, ...ids.filter((id) => id !== app.id)].slice(0, 10));
  }

  function closeApp() {
    setOpenState((state) => (state ? { ...state, closing: true } : state));
  }

  function openFromSpotlight(app: AppConfig, target: DOMRect) {
    setSheet(null);
    openApp(app, target);
  }

  function progressOf(kind: SheetKind): number {
    const travel = screenRef.current?.clientHeight || DEFAULT_TRAVEL_PX;
    const isOpen = sheet === kind;
    if (drag?.kind === kind && !isOpen) return clamp01(drag.p / travel);
    if (drag?.kind === 'close' && isOpen) return clamp01(1 - drag.p / travel);
    return isOpen ? 1 : 0;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (locked) return;
    const screen = screenRef.current?.getBoundingClientRect();
    if (!screen) return;
    const y = event.clientY - screen.top;
    const x = event.clientX - screen.left;
    let zone: Gesture['zone'] | null = null;
    if (sheet) zone = 'sheet';
    else if (y < 32) zone = 'top';
    else if (y > screen.height - 28) zone = 'bottom';
    else if (!openState && !switcherOpen) zone = 'mid';
    if (!zone) {
      gesture.current = null;
      return;
    }
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      zone,
      side: x < screen.width / 2 ? 'nc' : 'cc',
      kind: null,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.kind) {
      if (Math.hypot(dx, dy) < ACTIVATE_PX) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        gesture.current = null;
        return;
      }
      current.kind = resolveKind(current.zone, dy, current.side);
      if (!current.kind) {
        gesture.current = null;
        return;
      }
    }
    const reversed = current.kind === 'home' || current.kind === 'close';
    setDrag({ kind: current.kind, p: Math.max(0, reversed ? -dy : dy) });
  }

  function handlePointerUp() {
    const current = gesture.current;
    gesture.current = null;
    const finished = drag;
    setDrag(null);
    if (!current?.kind || !finished) return;
    const travel = screenRef.current?.clientHeight || DEFAULT_TRAVEL_PX;
    const p = finished.p;

    switch (finished.kind) {
      case 'nc':
      case 'cc':
      case 'spot':
        if (p > SWIPE_COMMIT_PX) setSheet(finished.kind);
        break;
      case 'close':
        if (p > SWIPE_COMMIT_PX) setSheet(null);
        break;
      case 'home':
        if (openState) {
          if (p > travel * 0.45) {
            setSwitcherOpen(true);
            closeApp();
          } else if (p > SWIPE_SHORT_PX) {
            closeApp();
          }
        } else if (switcherOpen) {
          if (p > SWIPE_SHORT_PX) setSwitcherOpen(false);
        } else if (p > travel * 0.45) {
          setSwitcherOpen(true);
        }
        break;
    }
  }

  return (
    <div className="phone-frame">
      <div
        ref={screenRef}
        className="phone-screen"
        data-theme={dark ? 'dark' : 'light'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Wallpaper dim={dark} />
        {locked ? null : (
          <HomeScreen
            now={now}
            page={page}
            onPageChange={setPage}
            editing={editing}
            onStartEditing={() => setEditing(true)}
            onStopEditing={() => setEditing(false)}
            onOpenApp={openApp}
          />
        )}

        {openState ? (
          <AppWindow
            key={openState.app.id}
            app={openState.app}
            origin={openState.origin}
            closing={openState.closing}
            onExited={() => setOpenState(null)}
          />
        ) : null}

        {switcherOpen ? (
          <AppSwitcher apps={recentApps} onResume={openApp} onClose={() => setSwitcherOpen(false)} />
        ) : null}

        <NotificationCenter
          progress={progressOf('nc')}
          dragging={drag !== null}
          now={now}
          onClose={() => setSheet(null)}
        />
        <ControlCenter progress={progressOf('cc')} dragging={drag !== null} onClose={() => setSheet(null)} />
        <Spotlight
          progress={progressOf('spot')}
          dragging={drag !== null}
          onClose={() => setSheet(null)}
          onOpenApp={openFromSpotlight}
        />

        {locked ? <LockScreen now={now} onUnlock={() => setLocked(false)} /> : null}

        <StatusBar now={now} />

        {locked ? null : (
          <span className="pointer-events-none absolute bottom-2 left-1/2 z-[60] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-[var(--fg)]" />
        )}
      </div>
    </div>
  );
}
