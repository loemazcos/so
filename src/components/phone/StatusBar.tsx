import { BatteryFull, BatteryLow, Moon, Signal, Wifi } from 'lucide-react';
import { formatClock } from '@/lib/gameTime';
import { useGameState } from '@/state/GameState';
import { LOW_POWER_LINE } from '@/state/timeline';

type Props = { now: Date };

export default function StatusBar({ now }: Props) {
  const { run } = useGameState();
  const low = run.battery <= LOW_POWER_LINE;
  const BatteryIcon = low ? BatteryLow : BatteryFull;
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex h-[60px] items-start justify-between px-8 pt-[calc(env(safe-area-inset-top)+14px)] text-[var(--fg)]">
      <span className="flex items-center gap-1 text-[16px] font-semibold tabular-nums">
        {formatClock(now)}
        {run.dnd ? <Moon size={12} strokeWidth={2.4} aria-label="방해금지 켜짐" /> : null}
      </span>
      <span className="absolute left-1/2 top-[calc(env(safe-area-inset-top)+11px)] h-[37px] w-[124px] -translate-x-1/2 rounded-full bg-black">
        <span className="absolute right-[18px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full bg-[#1c1c24] ring-1 ring-white/5" />
      </span>
      <span className="flex items-center gap-1.5">
        <Signal size={16} strokeWidth={2.4} aria-hidden="true" />
        <Wifi size={16} strokeWidth={2.4} aria-hidden="true" />
        <span className={`text-[13px] font-semibold tabular-nums ${low ? 'text-[#FFCC00]' : ''}`}>
          {run.battery.toFixed(1).replace(/\.0$/, '')}%
        </span>
        <BatteryIcon size={22} strokeWidth={2} aria-hidden="true" className={low ? 'text-[#FFCC00]' : ''} />
      </span>
    </header>
  );
}
