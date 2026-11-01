import { CircleSlash, RefreshCcw } from 'lucide-react';
import { formatEventTime, KIND_META, type CalendarEvent } from '@/lib/calendar';

type Props = { events: CalendarEvent[] };

export default function CalendarDayList({ events }: Props) {
  if (events.length === 0) {
    return <p className="px-4 py-8 text-center text-[13px] text-[var(--fg-2)]">이 날은 일정이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 px-4">
      {events.map((event) => {
        const cancelled = event.status === 'cancelled';
        return (
          <li
            key={event.id}
            className="flex gap-3 rounded-[14px] bg-[var(--card)] px-3.5 py-3"
          >
            <span className={`mt-1 h-auto w-1 shrink-0 self-stretch rounded-full ${KIND_META[event.kind].dot}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`truncate text-[14px] font-semibold ${cancelled ? 'line-through opacity-60' : ''}`}>{event.title}</p>
                <span className="shrink-0 text-[11px] text-[var(--fg-2)]">{KIND_META[event.kind].label}</span>
              </div>
              <p className="mt-0.5 text-[12px] text-[var(--fg-2)]">
                {formatEventTime(event.start_time, event.end_time)}
                {event.place ? ` · ${event.place}` : ''}
              </p>
              {event.status !== 'scheduled' && (
                <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-[#B45309] dark:text-[#FBBF24]">
                  {cancelled ? <CircleSlash size={13} strokeWidth={2} aria-hidden="true" /> : <RefreshCcw size={13} strokeWidth={2} aria-hidden="true" />}
                  {cancelled ? '취소' : '변경'}
                  {event.status_note ? ` · ${event.status_note}` : ''}
                </p>
              )}
              {event.memo && <p className="mt-1.5 text-[12px] leading-[1.5] text-[var(--fg)]">{event.memo}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
