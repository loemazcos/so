import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadRun, saveRun } from '@/lib/gameSave';
import { DEFAULT_RUN, releaseOneNotice, type RunState } from '@/state/runState';

type Status = 'loading' | 'ready' | 'error';

const DND_RELEASE_MS = 300;

type GameStateValue = {
  run: RunState;
  update: (change: (run: RunState) => RunState) => void;
  saveNow: () => void;
  saveFailed: boolean;
};

const GameStateContext = createContext<GameStateValue | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [loadKey, setLoadKey] = useState(0);
  const [run, setRun] = useState<RunState>(DEFAULT_RUN);
  const [saveFailed, setSaveFailed] = useState(false);
  const latest = useRef<RunState>(DEFAULT_RUN);

  useEffect(() => {
    let active = true;
    loadRun()
      .then((saved) => {
        if (!active) return;
        const next = saved ?? DEFAULT_RUN;
        latest.current = next;
        setRun(next);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [loadKey]);

  const update = useCallback((change: (run: RunState) => RunState) => {
    setRun((previous) => {
      const next = change(previous);
      latest.current = next;
      return next;
    });
  }, []);

  const saveNow = useCallback(() => {
    saveRun(latest.current)
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    const id = window.setTimeout(saveNow, 1000);
    return () => window.clearTimeout(id);
  }, [run, status, saveNow]);

  useEffect(() => {
    if (status !== 'ready') return;
    const onHide = () => {
      if (document.visibilityState === 'hidden') saveNow();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [status, saveNow]);

  const queuedId = run.dnd ? undefined : run.notices.find((notice) => notice.queued && notice.arriveAt <= run.t)?.id;
  useEffect(() => {
    if (!queuedId) return;
    const id = window.setTimeout(() => update(releaseOneNotice), DND_RELEASE_MS);
    return () => window.clearTimeout(id);
  }, [queuedId, update]);

  const value = useMemo<GameStateValue>(
    () => ({ run, update, saveNow, saveFailed }),
    [run, update, saveNow, saveFailed],
  );

  if (status === 'loading') {
    return <div className="flex h-full w-full items-center justify-center bg-black text-[14px] text-white">불러오는 중</div>;
  }

  if (status === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black text-[14px] text-white">
        <p>진행 상황을 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={() => {
            setStatus('loading');
            setLoadKey((key) => key + 1);
          }}
          className="h-10 rounded-full bg-white/15 px-5"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState(): GameStateValue {
  const value = useContext(GameStateContext);
  if (!value) throw new Error('useGameState must be used inside GameStateProvider');
  return value;
}
