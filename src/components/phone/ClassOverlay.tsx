import { BookOpen } from 'lucide-react';

type Props = { nextBreak: string; onWait: () => void };

export default function ClassOverlay({ nextBreak, onWait }: Props) {
  return (
    <div className="phone-fade-in absolute inset-0 z-[55] flex flex-col items-center justify-center gap-4 bg-[var(--bg)] px-8 text-center text-[var(--fg)]">
      <BookOpen size={44} strokeWidth={1.6} className="text-[var(--fg-2)]" aria-hidden="true" />
      <p className="text-[22px] font-bold">수업 중</p>
      <p className="text-[14px] leading-[1.5] text-[var(--fg-2)]">폰은 쉬는 시간에만 볼 수 있어요.</p>
      <p className="text-[14px] text-[var(--fg-2)]">다음 쉬는 시간 {nextBreak}</p>
      <button
        type="button"
        onClick={onWait}
        className="mt-2 h-11 rounded-full bg-[var(--accent)] px-6 text-[15px] font-semibold text-white transition-transform active:scale-95"
      >
        쉬는 시간까지 기다리기
      </button>
    </div>
  );
}
