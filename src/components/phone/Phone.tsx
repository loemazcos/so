import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { apps } from '@data/apps.config';
import { cuts } from '@data/story/cuts';
import { questions, defaultQuestion } from '@data/story/questions';
import AppSwitcher from '@/components/phone/AppSwitcher';
import AppWindow from '@/components/phone/AppWindow';
import BootScreen from '@/components/phone/BootScreen';
import ClassOverlay from '@/components/phone/ClassOverlay';
import CallScreen from '@/components/phone/CallScreen';
import ClueBanner from '@/components/phone/ClueBanner';
import ControlCenter from '@/components/phone/ControlCenter';
import DayCutOverlay from '@/components/phone/DayCutOverlay';
import DeadPhone from '@/components/phone/DeadPhone';
import HomeScreen from '@/components/phone/HomeScreen';
import IncomingCall from '@/components/phone/IncomingCall';
import LockScreen from '@/components/phone/LockScreen';
import NotificationBanner from '@/components/phone/NotificationBanner';
import NotificationCenter from '@/components/phone/NotificationCenter';
import SleepSheet from '@/components/phone/SleepSheet';
import Spotlight from '@/components/phone/Spotlight';
import StatusBar from '@/components/phone/StatusBar';
import TypingCutBanner from '@/components/phone/TypingCutBanner';
import Wallpaper from '@/components/phone/Wallpaper';
import { useClueDiscovery } from '@/hooks/useClueDiscovery';
import { useGameClock } from '@/hooks/useGameClock';
import { isNightTime } from '@/lib/gameTime';
import { CALL_MIN_BATTERY, canCallBack, findCall, incomingCall } from '@/state/calls';
import { remainingMinutes } from '@/lib/remit';
import { useGameState } from '@/state/GameState';
import {
  answerCall,
  callBack,
  chargePhone,
  declineCall,
  finishBoot,
  finishSleep,
  hangUpCall,
  stepCall,
  goToSleep,
  markNightCutPlayed,
  advanceRun,
  openApp as runOpenApp,
  setDnd,
} from '@/state/runState';
import {
  LOW_BATTERY_LINE,
  LOW_POWER_LINE,
  SLEEP_FROM,
  clockOf,
  minutesIntoDay,
  minutesUntilNextBreak,
  phaseOf,
  type Notice,
} from '@/state/timeline';
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
  const { run, update } = useGameState();
  const clueDiscovery = useClueDiscovery(run.clues);
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
  const [sleepOpen, setSleepOpen] = useState(false);
  const [seenDay, setSeenDay] = useState(run.day);
  const [cutDay, setCutDay] = useState<number | null>(null);
  const [banner, setBanner] = useState<Notice | null>(null);
  const arrivedNotices = run.notices.filter((notice) => notice.arriveAt <= run.t && !notice.queued);
  const latestNotice = arrivedNotices[arrivedNotices.length - 1] ?? null;
  const seenNotice = useRef(latestNotice?.id ?? null);

  useEffect(() => {
    if (!latestNotice || latestNotice.id === seenNotice.current) return;
    seenNotice.current = latestNotice.id;
    setBanner(latestNotice);
  }, [latestNotice]);
  const clearBanner = useCallback(() => setBanner(null), []);

  if (run.day !== seenDay) {
    setSeenDay(run.day);
    setCutDay(run.day - 1);
  }
  const cut = cutDay === null ? null : cuts.find((item) => item.day === cutDay) ?? null;

  const phase = phaseOf(run);
  const inClass = phase === 'school' && !run.booted;
  const canSleep = minutesIntoDay(run) >= SLEEP_FROM && !run.booted;
  const remitMinutes = remainingMinutes(run.t);
  const remitPulsing = run.remitStatus === 'open' && remitMinutes < 30;
  const dimmed = !run.charging && run.battery <= LOW_POWER_LINE;
  const lowBattery = !run.charging && run.battery <= LOW_BATTERY_LINE;
  const sleepQuestion = questions[run.day as keyof typeof questions] ?? defaultQuestion;

  const finishBootScreen = useCallback(() => update(finishBoot), [update]);
  const clearDayCut = useCallback(() => setCutDay(null), []);
  const finishTypingCut = useCallback(() => update(markNightCutPlayed), [update]);
  const stepActiveCall = useCallback((choice: number | null) => update((current) => stepCall(current, choice)), [update]);
  const incoming = incomingCall(run);
  const activeCall = run.activeCall ? findCall(run.activeCall.id) : null;

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
    update(runOpenApp);
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
        <ControlCenter
          progress={progressOf('cc')}
          dragging={drag !== null}
          onClose={() => setSheet(null)}
          dnd={run.dnd}
          onToggleDnd={() => update((current) => setDnd(current, !current.dnd))}
        />
        <Spotlight
          progress={progressOf('spot')}
          dragging={drag !== null}
          onClose={() => setSheet(null)}
          onOpenApp={openFromSpotlight}
        />

        {locked ? <LockScreen now={now} onUnlock={() => setLocked(false)} /> : null}

        {!locked && inClass ? (
          <ClassOverlay
            nextBreak={clockOf(run.t + minutesUntilNextBreak(run))}
            onWait={() => update((current) => advanceRun(current, minutesUntilNextBreak(current), 0))}
          />
        ) : null}

        {!locked && canSleep && !sleepOpen && !inClass ? (
          <button
            type="button"
            onClick={() => setSleepOpen(true)}
            className="absolute left-1/2 top-[calc(env(safe-area-inset-top)+64px)] z-[54] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[var(--glass)] px-4 py-2 text-[13px] font-semibold text-[var(--fg)] backdrop-blur-[24px] transition-transform active:scale-95"
          >
            잠들기
          </button>
        ) : null}

        {!locked && sleepOpen ? (
          <SleepSheet
            question={sleepQuestion}
            clueCount={run.clues.length}
            ignores={run.ignores}
            onClose={() => setSleepOpen(false)}
            onSleep={(charging) => {
              setSleepOpen(false);
              update((current) => finishSleep(goToSleep(current, charging)));
            }}
          />
        ) : null}

        {!locked && canCallBack(run) ? (
          <button
            type="button"
            onClick={() => update(callBack)}
            className="absolute left-1/2 top-[calc(env(safe-area-inset-top)+112px)] z-[54] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#34C759] px-4 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95"
          >
            상혁에게 다시 걸기
          </button>
        ) : null}

        {!locked && lowBattery ? (
          <p className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+104px)] z-[54] text-center text-[12px] font-semibold text-[#FF3B30]">
            배터리 {run.battery}%
          </p>
        ) : null}

        {remitPulsing ? (
          <div
            className="phone-edge-pulse pointer-events-none absolute inset-0 z-[58] rounded-[52px]"
            style={{ animationDuration: remitMinutes < 10 ? '0.5s' : '0.9s' }}
          />
        ) : null}

        {dimmed ? <div className="pointer-events-none absolute inset-0 z-[57] bg-black/25" /> : null}

        {!locked && run.nightCutPending && !run.nightCutPlayed ? <TypingCutBanner onDone={finishTypingCut} /> : null}

        {!locked && banner ? (
          <NotificationBanner
            key={banner.id}
            appId={banner.appId}
            title={banner.title}
            body={banner.body}
            time={banner.time}
            onDismiss={clearBanner}
          />
        ) : null}

        {!locked && clueDiscovery.pending ? (
          <ClueBanner key={clueDiscovery.pending} clueId={clueDiscovery.pending} onDone={clueDiscovery.dismiss} />
        ) : null}

        {!locked && incoming && !run.activeCall ? (
          <IncomingCall
            call={incoming}
            canAnswer={run.battery >= CALL_MIN_BATTERY}
            onAnswer={() => update(answerCall)}
            onDecline={() => update(declineCall)}
          />
        ) : null}

        {!locked && activeCall && run.activeCall ? (
          <CallScreen
            call={activeCall}
            step={run.activeCall.step}
            picks={run.activeCall.picks}
            battery={run.battery}
            onStep={stepActiveCall}
            onHangUp={() => update(hangUpCall)}
          />
        ) : null}

        {cut ? <DayCutOverlay key={cut.day} text={cut.text} onDone={clearDayCut} /> : null}

        {!locked && run.battery <= 0 ? <DeadPhone onCharge={() => update(chargePhone)} /> : null}

        {run.booted ? <BootScreen onDone={finishBootScreen} /> : null}

        <StatusBar now={now} />

        {locked ? null : (
          <span className="pointer-events-none absolute bottom-2 left-1/2 z-[60] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-[var(--fg)]" />
        )}
      </div>
    </div>
  );
}
