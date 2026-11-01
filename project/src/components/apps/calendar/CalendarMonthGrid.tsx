import { buildMonthCells, KIND_META, type CalendarEvent } from '@/lib/calendar';

type Props = {
  year: number;
  monthIndex: number;
  selectedKey: string;
  eventsByDate: Record<string, CalendarEvent[]>;
  onSelect: (key: string) => void;
};

export default function CalendarMonthGrid({ year, monthIndex, selectedKey, eventsByDate, onSelect }: Props) {
  const cells = buildMonthCells(year, monthIndex);

  return (
    <div className="grid grid-cols-7 gap-y-1">
      {cells.map((cell, index) => {
        if (!cell) return <span key={`empty-${index}`} aria-hidden="true" />;
        const dayEvents = eventsByDate[cell.key] ?? [];
        const kinds = [...new Set(dayEvents.map((event) => event.kind))].slice(0, 3);
        const selected = cell.key === selectedKey;
        return (
          <button
            key={cell.key}
            type="button"
            onClick={() => onSelect(cell.key)}
            aria-pressed={selected}
            className="flex flex-col items-center gap-0.5 rounded-[12px] py-1 transition-colors active:bg-[var(--card)]"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] ${
                selected ? 'bg-[var(--accent)] font-bold text-white' : 'text-[var(--fg)]'
              }`}
            >
              {cell.day}
            </span>
            <span className="flex h-1.5 items-center gap-0.5">
              {kinds.map((kind) => (
                <span key={kind} className={`h-1.5 w-1.5 rounded-full ${KIND_META[kind].dot}`} />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
