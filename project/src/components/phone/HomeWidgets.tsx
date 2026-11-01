import { device } from '@data/device';
import { formatClock, formatLockDate } from '@/lib/gameTime';

type Props = { now: Date };

export default function HomeWidgets({ now }: Props) {
  const { dday, weather, steps } = device;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2 flex items-center justify-between rounded-[22px] bg-[var(--card)] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div>
          <p className="text-[13px] text-[var(--fg-2)]">{formatLockDate(now)}</p>
          <p className="mt-1 text-[44px] font-light leading-none tracking-[-1px] tabular-nums">{formatClock(now)}</p>
        </div>
      </div>
      <div className="flex aspect-square flex-col justify-between rounded-[22px] bg-[var(--card)] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <p className="text-[13px] text-[var(--fg-2)]">{dday.title}</p>
        <div>
          <p className="text-[34px] font-bold leading-none tabular-nums">{dday.label}</p>
          <p className="mt-2 text-[12px] text-[var(--fg-2)]">캘린더</p>
        </div>
      </div>
      <div className="flex aspect-square flex-col justify-between rounded-[22px] bg-[var(--card)] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <p className="text-[13px] text-[var(--fg-2)]">{weather.place}</p>
        <div>
          <p className="text-[34px] font-light leading-none tabular-nums">{weather.temp}°</p>
          <p className="mt-2 text-[12px] text-[var(--fg-2)]">{weather.summary}</p>
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-between rounded-[22px] bg-[var(--card)] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <p className="text-[13px] text-[var(--fg-2)]">오늘 걸음</p>
        <p className="text-[26px] font-semibold tabular-nums">
          {steps.toLocaleString('ko-KR')}
          <span className="ml-1 text-[13px] font-normal text-[var(--fg-2)]">걸음</span>
        </p>
      </div>
    </div>
  );
}
