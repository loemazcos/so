import { useState } from 'react';
import { Moon, Plug, X } from 'lucide-react';

type Props = {
  question: string;
  clueCount: number;
  ignores: number;
  onSleep: (charging: boolean) => void;
  onClose: () => void;
};

const OPTIONS = [
  { charging: true, label: '충전기 꽂고 자기', hint: '아침 배터리 100%' },
  { charging: false, label: '충전기 없이 자기', hint: '아침 배터리 -10%' },
] as const;

export default function SleepSheet({ question, clueCount, ignores, onSleep, onClose }: Props) {
  const [charging, setCharging] = useState<boolean | null>(null);

  return (
    <div className="absolute inset-0 z-[56] flex items-end bg-black/40">
      <section className="phone-fade-in w-full rounded-t-[28px] bg-[var(--bg)] px-5 pb-10 pt-5 text-[var(--fg)] shadow-[0_-12px_40px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[18px] font-bold">
            <Moon size={18} strokeWidth={1.8} aria-hidden="true" />
            잠들기
          </p>
          <button type="button" onClick={onClose} aria-label="닫기" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card)]">
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 rounded-[20px] bg-[var(--card)] p-4">
          <p className="text-[12px] text-[var(--fg-2)]">오늘의 의문</p>
          <p className="mt-1 text-[15px] leading-[1.5]">{question}</p>
          <div className="mt-3 flex gap-4 text-[13px] text-[var(--fg-2)]">
            <span>단서 {clueCount}개</span>
            <span>읽씹 {ignores}회</span>
          </div>
        </div>

        <p className="mt-5 text-[13px] text-[var(--fg-2)]">충전기는 꽂고 잘까요?</p>
        <div className="mt-2 flex flex-col gap-2">
          {OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={charging === option.charging}
              onClick={() => setCharging(option.charging)}
              className={`flex items-center gap-3 rounded-[18px] p-3.5 text-left transition-colors ${
                charging === option.charging ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)] text-[var(--fg)]'
              }`}
            >
              <Plug size={18} strokeWidth={1.8} aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">{option.label}</span>
                <span className="block text-[12px] opacity-80">{option.hint}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={charging === null}
          onClick={() => charging !== null && onSleep(charging)}
          className="mt-5 h-12 w-full rounded-full bg-[var(--accent)] text-[16px] font-semibold text-white transition-opacity disabled:opacity-40"
        >
          잠들기
        </button>
      </section>
    </div>
  );
}
