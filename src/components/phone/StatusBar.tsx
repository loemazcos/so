import { BatteryFull, Signal, Wifi } from 'lucide-react';
import { device } from '@data/device';
import { formatClock } from '@/lib/gameTime';

type Props = { now: Date };

export default function StatusBar({ now }: Props) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex h-[60px] items-start justify-between px-8 pt-[calc(env(safe-area-inset-top)+14px)] text-[var(--fg)]">
      <span className="w-[56px] text-center text-[16px] font-semibold tabular-nums">{formatClock(now)}</span>
      <span className="absolute left-1/2 top-[calc(env(safe-area-inset-top)+11px)] h-[37px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex w-[56px] items-center justify-end gap-1.5">
        <Signal size={16} strokeWidth={2.4} aria-hidden="true" />
        <Wifi size={16} strokeWidth={2.4} aria-hidden="true" />
        <span className="text-[13px] font-semibold tabular-nums">{device.battery}%</span>
        <BatteryFull size={22} strokeWidth={2} aria-hidden="true" />
      </span>
    </header>
  );
}
