import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CalendarMonthGrid from '@/components/apps/calendar/CalendarMonthGrid';
import CalendarDayList from '@/components/apps/calendar/CalendarDayList';
import CalendarEventForm from '@/components/apps/calendar/CalendarEventForm';
import { fetchCalendarEvents, type CalendarEvent } from '@/lib/calendar';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const START_YEAR = 2026;
const START_MONTH = 9;
const START_DATE = '2026-10-14';

export default function CalendarApp() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [viewYear, setViewYear] = useState(START_YEAR);
  const [viewMonth, setViewMonth] = useState(START_MONTH);
  const [selectedKey, setSelectedKey] = useState(START_DATE);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCalendarEvents()
      .then((list) => {
        if (!active) return;
        setEvents(list);
        setLoadError(null);
      })
      .catch((error: Error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events ?? []) {
      (map[event.event_date] ??= []).push(event);
    }
    return map;
  }, [events]);

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  const selectedEvents = eventsByDate[selectedKey] ?? [];
  const [selectedYear, selectedMonth, selectedDay] = selectedKey.split('-').map(Number);
  const selectedWeekday = WEEKDAY_LABELS[new Date(selectedYear, selectedMonth - 1, selectedDay).getDay()];

  return (
    <div className="relative flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="이전 달" className="rounded-full p-1.5 transition-colors active:bg-[var(--card)]">
            <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <p className="min-w-[110px] text-center text-[17px] font-bold">
            {viewYear}년 {viewMonth + 1}월
          </p>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="다음 달" className="rounded-full p-1.5 transition-colors active:bg-[var(--card)]">
            <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          aria-label="일정 추가"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-transform active:scale-95"
        >
          <Plus size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </header>

      <div className="px-3">
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-[var(--fg-2)]">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-1">{label}</span>
          ))}
        </div>
        {events === null && !loadError && <p className="py-10 text-center text-[13px] text-[var(--fg-2)]">일정을 불러오는 중이에요.</p>}
        {loadError && (
          <div className="py-6 text-center">
            <p className="text-[13px] text-[var(--fg-2)]">일정을 불러오지 못했어요.</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-2 text-[13px] font-semibold text-[var(--accent)]">
              다시 시도
            </button>
          </div>
        )}
        {events && (
          <CalendarMonthGrid
            year={viewYear}
            monthIndex={viewMonth}
            selectedKey={selectedKey}
            eventsByDate={eventsByDate}
            onSelect={setSelectedKey}
          />
        )}
      </div>

      <div className="mx-4 mt-2 border-t border-[var(--line)]" />
      <div className="flex items-baseline gap-2 px-4 pb-1 pt-3">
        <p className="text-[15px] font-semibold">
          {selectedMonth}월 {selectedDay}일 ({selectedWeekday})
        </p>
      </div>
      <div className="pan-y-scroll flex-1 overflow-y-auto pb-6">
        <CalendarDayList events={selectedEvents} />
      </div>

      {formOpen && (
        <CalendarEventForm
          defaultDate={selectedKey}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            setReloadKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}
