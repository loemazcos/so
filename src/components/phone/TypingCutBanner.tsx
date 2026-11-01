import { useEffect, useState } from 'react';

const STEP_MS = [2500, 1000, 2500, 1000];

type Props = { onDone: () => void };

export default function TypingCutBanner({ onDone }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (step + 1 >= STEP_MS.length) onDone();
      else setStep(step + 1);
    }, STEP_MS[step]);
    return () => window.clearTimeout(id);
  }, [step, onDone]);

  const visible = step % 2 === 0;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+64px)] z-[59] flex justify-center">
      <div
        className={`rounded-full bg-[var(--glass)] px-4 py-2 text-[13px] text-[var(--fg)] backdrop-blur-[24px] transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        상혁님이 입력 중…
      </div>
    </div>
  );
}
