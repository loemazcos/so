import { useEffect, useState } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { LOCKED_MEMO_OPENS_ON_DAY, memo18Text, memos } from '@data/story/memos';
import { useGameState } from '@/state/GameState';
import { MEMO_18_INDEX, openMemoApp, readMemo } from '@/state/runState';

const MEMO_TOTAL = memos.length;

export default function MemoApp() {
  const { run, update } = useGameState();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    update(openMemoApp);
  }, [update]);

  const allRead = Array.from({ length: MEMO_TOTAL }, (_, index) => index).every((index) => run.memoRead.includes(index));
  const memo18Unlocked = allRead && run.day >= LOCKED_MEMO_OPENS_ON_DAY;

  function openMemo(index: number) {
    if (index === MEMO_18_INDEX && !memo18Unlocked) return;
    update((current) => readMemo(current, index));
    setOpenIndex(index);
  }

  if (openIndex !== null) {
    const isMemo18 = openIndex === MEMO_18_INDEX;
    const memo = isMemo18 ? { date: '', text: memo18Text } : memos[openIndex];
    return (
      <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
        <header className="flex items-center gap-2 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
          <button type="button" onClick={() => setOpenIndex(null)} aria-label="목록으로" className="p-1 text-[var(--accent)]">
            <ChevronLeft size={26} strokeWidth={2} aria-hidden="true" />
          </button>
          <p className="flex-1 text-center text-[15px] font-semibold">메모</p>
          <span className="w-8" aria-hidden="true" />
        </header>
        <article className="flex-1 overflow-y-auto px-5 pb-8">
          {memo.date ? <p className="text-[12px] text-[var(--fg-2)]">{memo.date}</p> : null}
          <p className="mt-3 whitespace-pre-line text-[17px] leading-[1.7]">{memo.text}</p>
        </article>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="px-4 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
        <p className="text-[26px] font-bold leading-[1.2]">메모</p>
      </header>
      <ul className="pan-y-scroll flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-6">
        {memos.map((memo, index) => {
          const read = run.memoRead.includes(index);
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => openMemo(index)}
                className="flex w-full flex-col gap-1 rounded-[18px] bg-[var(--card)] p-3.5 text-left transition-transform active:scale-[0.98]"
              >
                <span className="flex items-center gap-2 text-[11px] text-[var(--fg-2)]">
                  {memo.date}
                  {read ? null : <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-label="읽지 않음" />}
                </span>
                <span className="truncate text-[14px]">{memo.text}</span>
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => openMemo(MEMO_18_INDEX)}
            disabled={!memo18Unlocked}
            className="flex w-full items-center gap-2 rounded-[18px] bg-[var(--card)] p-3.5 text-left disabled:opacity-60"
          >
            {memo18Unlocked ? (
              <span className="text-[14px]">18. 열린 메모</span>
            ) : (
              <>
                <Lock size={14} strokeWidth={2} className="text-[var(--fg-2)]" aria-hidden="true" />
                <span className="text-[14px] text-[var(--fg-2)]">메모 {MEMO_TOTAL}개를 모두 읽으면 열려요</span>
              </>
            )}
          </button>
        </li>
      </ul>
    </div>
  );
}
