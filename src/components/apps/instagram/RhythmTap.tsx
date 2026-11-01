import { useEffect, useRef, useState } from 'react';

const BOUNCE_MS = [2000, 5000, 8000];
const PERFECT_MS = 120;
const GOOD_MS = 260;
const FINISH_DELAY_MS = 900;

type Judge = 'perfect' | 'good' | 'miss';

const JUDGE_TEXT: Record<Judge, string> = { perfect: '완벽', good: '좋아', miss: '놓침' };

type Props = {
  onFinish: (successes: number) => void;
  onSkip: () => void;
};

export default function RhythmTap({ onFinish, onSkip }: Props) {
  const [judged, setJudged] = useState<Judge[]>([]);
  const judgedRef = useRef<Judge[]>([]);
  const startRef = useRef(0);
  const timers = useRef<number[]>([]);
  const finishRef = useRef(onFinish);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const pending = timers.current;
    startRef.current = performance.now();

    BOUNCE_MS.forEach((at, index) => {
      pending.push(
        window.setTimeout(() => {
          if (judgedRef.current.length === index) judge('miss');
        }, at + GOOD_MS + 20),
      );
    });

    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function judge(result: Judge) {
    judgedRef.current = [...judgedRef.current, result];
    setJudged(judgedRef.current);
    if (judgedRef.current.length === BOUNCE_MS.length) {
      const successes = judgedRef.current.filter((item) => item !== 'miss').length;
      timers.current.push(window.setTimeout(() => finishRef.current(successes), FINISH_DELAY_MS));
    }
  }

  function tap() {
    const index = judgedRef.current.length;
    if (index >= BOUNCE_MS.length) return;
    const now = performance.now() - startRef.current;
    const diff = Math.abs(now - BOUNCE_MS[index]);
    if (diff > GOOD_MS) return;
    judge(diff <= PERFECT_MS ? 'perfect' : 'good');
  }

  const last = judged[judged.length - 1];

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[var(--bg)]/95 px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+64px)] backdrop-blur-sm">
      <p className="text-[15px] font-semibold text-[var(--fg)]">탁구 리듬</p>
      <p className="mt-1 text-[13px] leading-[1.5] text-[var(--fg-2)]">공이 바닥에 닿는 순간 화면을 누르세요.</p>

      <button
        type="button"
        onPointerDown={tap}
        aria-label="공 치기"
        className="relative mt-6 flex flex-1 touch-manipulation items-end justify-center overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--card)]"
      >
        <span
          className="mb-6 block h-7 w-7 rounded-full bg-[#FEE500] shadow-[0_4px_12px_rgba(0,0,0,0.25)] animate-[bounce_3s_linear_500ms_infinite]"
          aria-hidden="true"
        />
        <span className="absolute inset-x-0 bottom-4 h-px bg-[var(--line)]" aria-hidden="true" />
      </button>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-[var(--fg)]" aria-live="polite">
          {last ? JUDGE_TEXT[last] : '준비'}
        </p>
        <p className="text-[12px] text-[var(--fg-2)]">
          {judged.length} / {BOUNCE_MS.length}
        </p>
      </div>

      <button type="button" onClick={onSkip} className="mt-3 h-10 text-[13px] text-[var(--fg-2)]">
        건너뛰기
      </button>
    </div>
  );
}
