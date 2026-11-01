import { useEffect, useState } from 'react';
import { clues } from '@data/story/clues';

type Props = {
  clueId: string;
  onDone(): void;
};

const SHOW_MS = 3200;
const HIDE_MS = 500;

export default function ClueBanner({ clueId, onDone }: Props) {
  const clue = clues.find((item) => item.id === clueId);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const enter = window.setTimeout(() => setShown(true), 20);
    const leave = window.setTimeout(() => setShown(false), SHOW_MS);
    const done = window.setTimeout(onDone, SHOW_MS + HIDE_MS);
    return () => {
      window.clearTimeout(enter);
      window.clearTimeout(leave);
      window.clearTimeout(done);
    };
  }, [onDone]);

  if (!clue) return null;

  return (
    <div
      role="status"
      className={`pointer-events-none absolute inset-x-3 top-[calc(env(safe-area-inset-top)+8px)] z-[70] rounded-[22px] bg-[var(--glass)] px-4 py-3 shadow-lg backdrop-blur-[24px] transition-all duration-500 ease-out ${
        shown ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
      }`}
    >
      <p className="text-[11px] font-semibold text-[var(--fg-2)]">단서 획득 · {clue.app}</p>
      <p className="text-[15px] font-bold text-[var(--fg)]">{clue.title}</p>
    </div>
  );
}
