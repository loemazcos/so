import { useEffect } from 'react';
import { PhoneOff } from 'lucide-react';
import type { CallScript } from '@/state/calls';

const LINE_PAUSE_MS = 1500;

type Props = {
  call: CallScript;
  step: number;
  picks: number[];
  battery: number;
  onStep: (choice: number | null) => void;
  onHangUp: () => void;
};

export default function CallScreen({ call, step, picks, battery, onStep, onHangUp }: Props) {
  const steps = call.steps ?? [];
  const current = steps[step];
  const isSay = current?.type === 'say';

  useEffect(() => {
    if (!isSay) return;
    const timer = window.setTimeout(() => onStep(null), LINE_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [isSay, step, onStep]);

  let pickIndex = 0;
  const transcript = steps.slice(0, step).map((item) => {
    if (item.type === 'say') return { who: item.who, text: item.text };
    const choice = item.options[picks[pickIndex] ?? -1];
    pickIndex += 1;
    return { who: '나', text: choice?.reply ?? '' };
  });

  return (
    <div className="absolute inset-0 z-[56] flex flex-col bg-[#0B0B0F] pb-12 pt-16 text-white">
      <div className="flex flex-col items-center gap-1 px-6 text-center">
        <p className="text-[22px] font-semibold">{call.caller}</p>
        <p className="text-[13px] text-white/60">통화 중 · 배터리 {battery}%</p>
      </div>

      <ul className="flex flex-1 flex-col justify-end gap-3 overflow-y-auto px-5 py-6">
        {transcript.map((line, index) => (
          <li key={index} className={`flex ${line.who === '나' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`max-w-[80%] rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.5] ${
                line.who === '나' ? 'bg-[#0A84FF] text-white' : 'bg-white/10 text-white'
              }`}
            >
              {line.text}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 px-5">
        {current?.type === 'choose' ? (
          current.options.map((option, index) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onStep(index)}
              className="rounded-[16px] border border-white/20 bg-white/5 px-4 py-3 text-left text-[15px] text-white transition-colors hover:bg-white/10 active:scale-[0.99]"
            >
              {option.label}
            </button>
          ))
        ) : (
          <p className="py-3 text-center text-[13px] text-white/50">...</p>
        )}
        <button
          type="button"
          onClick={onHangUp}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#FF3B30] py-3 text-[15px] font-semibold text-white transition-transform active:scale-95"
        >
          <PhoneOff size={18} strokeWidth={2} aria-hidden="true" />
          끊기
        </button>
      </div>
    </div>
  );
}
