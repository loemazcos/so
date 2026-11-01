import { Wallet } from 'lucide-react';
import { formatRemain, remainingMinutes } from '@/lib/remit';
import { useGameState } from '@/state/GameState';
import { receiveRemit } from '@/state/runState';

export default function RemitApp() {
  const { run, update } = useGameState();
  const minutesLeft = remainingMinutes(run.t);
  const expiringSoon = run.remitStatus === 'open' && minutesLeft < 30;

  const statusText =
    run.remitStatus === 'open'
      ? `${formatRemain(minutesLeft)} 후 만료`
      : run.remitStatus === 'received'
        ? '받은 송금'
        : '만료된 송금';

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+58px)] text-[var(--fg)]">
      <p className="text-[26px] font-bold leading-[1.2]">토스</p>
      <section className="mt-6 flex flex-col gap-4 rounded-[24px] bg-[var(--card)] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--key-pressed)]">
            <Wallet size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[15px] font-semibold">상혁</p>
            <p className="text-[12px] text-[var(--fg-2)]">보낸 금액</p>
          </div>
        </div>
        <p className="text-[32px] font-bold tabular-nums">1원</p>
        <p
          className={`text-[13px] ${
            expiringSoon ? 'font-semibold text-[#B91C1C] dark:text-[#FCA5A5]' : 'text-[var(--fg-2)]'
          }`}
        >
          {statusText}
        </p>
        {run.remitStatus === 'open' ? (
          <button
            type="button"
            onClick={() => update(receiveRemit)}
            className="h-11 rounded-full bg-[var(--accent)] text-[15px] font-semibold text-white transition-transform active:scale-95"
          >
            받기
          </button>
        ) : null}
      </section>
    </div>
  );
}
