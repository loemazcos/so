import { useState } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { clues } from '@data/story/clues';
import { useGameState } from '@/state/GameState';

type Clue = (typeof clues)[number];

const TOTAL = clues.length;

export default function ClueBookApp() {
  const { run } = useGameState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const found = new Set(run.clues);
  const selected = selectedId ? clues.find((clue) => clue.id === selectedId) ?? null : null;

  if (selected && found.has(selected.id)) {
    return <ClueDetail clue={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="px-4 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
        <p className="text-[26px] font-bold leading-[1.2]">단서 도감</p>
        <p className="mt-1 text-[13px] text-[var(--fg-2)]">
          {found.size} / {TOTAL}
        </p>
      </header>
      <ul className="pan-y-scroll grid flex-1 grid-cols-4 gap-2 overflow-y-auto px-4 pb-6">
        {clues.map((clue) => {
          const discovered = found.has(clue.id);
          return (
            <li key={clue.id}>
              <button
                type="button"
                disabled={!discovered}
                onClick={() => setSelectedId(clue.id)}
                aria-label={discovered ? clue.title : '잠긴 단서'}
                className={`flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-[16px] transition-transform active:scale-95 ${
                  discovered ? 'bg-[var(--card)] text-[var(--fg)]' : 'bg-[var(--card)]/50 text-[var(--fg-2)]'
                }`}
              >
                {discovered ? (
                  <>
                    <span className="text-[11px] font-semibold text-[var(--fg-2)]">{clue.id}</span>
                    <span className="px-1 text-center text-[11px] leading-[1.3]">{clue.title}</span>
                  </>
                ) : (
                  <Lock size={18} strokeWidth={1.8} className="opacity-50" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ClueDetail({ clue, onBack }: { clue: Clue; onBack(): void }) {
  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="flex items-center gap-2 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
        <button type="button" onClick={onBack} aria-label="도감으로" className="p-1 text-[var(--accent)]">
          <ChevronLeft size={26} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="flex-1 text-center text-[15px] font-semibold">단서 {clue.id}</p>
        <span className="w-8" aria-hidden="true" />
      </header>
      <article className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-8">
        <p className="text-[12px] text-[var(--fg-2)]">
          {clue.app} · {clue.day}일차{clue.core ? ' · 핵심' : ''}
        </p>
        <h2 className="text-[22px] font-bold leading-[1.2]">{clue.title}</h2>
        <p className="text-[16px] leading-[1.7]">{clue.text}</p>
      </article>
    </div>
  );
}
