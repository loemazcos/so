import { Phone, PhoneOff } from 'lucide-react';
import type { CallScript } from '@/state/calls';

type Props = {
  call: CallScript;
  canAnswer: boolean;
  onAnswer: () => void;
  onDecline: () => void;
};

export default function IncomingCall({ call, canAnswer, onAnswer, onDecline }: Props) {
  return (
    <div className="absolute inset-0 z-[56] flex flex-col items-center justify-between bg-[#0B0B0F]/95 px-8 pb-16 pt-28 text-center text-white backdrop-blur-[24px]">
      <div className="flex flex-col items-center gap-2">
        <p className="text-[14px] text-white/60">수신 전화</p>
        <p className="text-[30px] font-semibold">{call.caller}</p>
      </div>
      <div className="flex w-full items-start justify-around">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onDecline}
            aria-label="거절"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30] transition-transform active:scale-95"
          >
            <PhoneOff size={28} strokeWidth={2} aria-hidden="true" />
          </button>
          <span className="text-[13px] text-white/70">거절</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onAnswer}
            disabled={!canAnswer}
            aria-label="받기"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#34C759] transition-transform active:scale-95 disabled:opacity-40"
          >
            <Phone size={28} strokeWidth={2} aria-hidden="true" />
          </button>
          <span className="text-[13px] text-white/70">{canAnswer ? '받기' : '배터리 부족'}</span>
        </div>
      </div>
    </div>
  );
}
