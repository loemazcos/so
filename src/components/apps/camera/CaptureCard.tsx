import { Stamp } from 'lucide-react';
import type { Capture } from '@/state/captures';
import { clockOf } from '@/state/timeline';

type Props = { capture: Capture; size?: 'thumb' | 'full' };

export default function CaptureCard({ capture, size = 'thumb' }: Props) {
  const full = size === 'full';
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-[18px] bg-[#FBFBF8] text-[#1c1c1e] shadow-[0_2px_10px_rgba(0,0,0,0.15)] ${
        full ? 'w-full gap-3 p-5' : 'aspect-[3/4] gap-1.5 p-2.5'
      }`}
    >
      <p className={`font-semibold text-[#6b6b73] ${full ? 'text-[12px]' : 'text-[9px]'}`}>
        {capture.screen} · {clockOf(capture.t)}
      </p>
      <p className={`font-bold leading-[1.3] ${full ? 'text-[18px]' : 'text-[11px]'}`}>{capture.title}</p>
      <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
        {capture.lines.map((line, index) => (
          <p
            key={index}
            className={`line-clamp-3 rounded-[10px] bg-[#EFEFF3] px-2 py-1 leading-[1.4] ${full ? 'text-[15px]' : 'text-[10px]'}`}
          >
            {line}
          </p>
        ))}
      </div>
      {capture.evidence ? (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#B91C1C] px-2 py-0.5 text-[10px] font-bold text-white">
          <Stamp size={10} strokeWidth={2} aria-hidden="true" />
          증거
        </span>
      ) : null}
    </article>
  );
}
