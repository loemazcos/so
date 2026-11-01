import { BatteryLow } from 'lucide-react';

type Props = { onCharge: () => void };

export default function DeadPhone({ onCharge }: Props) {
  return (
    <div className="absolute inset-0 z-[59] flex flex-col items-center justify-center gap-6 bg-black px-8 text-center text-white">
      <BatteryLow size={48} strokeWidth={1.5} className="text-[#FF3B30]" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-semibold">배터리가 다 됐어요</p>
        <p className="text-[13px] leading-[1.5] text-white/60">충전기를 꽂으면 다시 켜져요.</p>
      </div>
      <button
        type="button"
        onClick={onCharge}
        aria-label="충전기 꽂기"
        className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black transition-transform active:scale-95"
      >
        충전기 꽂기
      </button>
    </div>
  );
}
