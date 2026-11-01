import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { insertCalendarEvent, KIND_META, KIND_ORDER, type CalendarKind } from '@/lib/calendar';

type Props = {
  defaultDate: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function CalendarEventForm({ defaultDate, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [place, setPlace] = useState('');
  const [memo, setMemo] = useState('');
  const [kind, setKind] = useState<CalendarKind>('personal');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return setError('일정 이름을 입력해 주세요.');
    if (!allDay && !start) return setError('시작 시간을 입력하거나 종일로 설정해 주세요.');
    if (!allDay && end && end <= start) return setError('끝나는 시간이 시작 시간보다 늦어야 해요.');

    setSaving(true);
    setError(null);
    try {
      await insertCalendarEvent({
        title: title.trim(),
        event_date: date,
        start_time: allDay ? null : start,
        end_time: allDay || !end ? null : end,
        place: place.trim() || null,
        memo: memo.trim() || null,
        kind,
      });
      onSaved();
    } catch {
      setError('일정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-[10px] bg-[var(--bg)] px-3 py-2.5 text-[14px] text-[var(--fg)] outline-none ring-1 ring-[var(--line)] focus:ring-[var(--accent)]';

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/40 phone-fade-in" onClick={onClose}>
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-[88%] w-full flex-col gap-3 overflow-y-auto rounded-t-[22px] bg-[var(--card)] px-4 pb-6 pt-4 text-[var(--fg)]"
      >
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-bold">일정 추가</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="rounded-full p-1 text-[var(--fg-2)]">
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-[12px] text-[var(--fg-2)]">
          일정 이름
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="예: 밴드 연습" maxLength={60} />
        </label>

        <label className="flex flex-col gap-1 text-[12px] text-[var(--fg-2)]">
          날짜
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} />
        </label>

        <label className="flex items-center justify-between text-[14px] text-[var(--fg)]">
          종일
          <input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
        </label>

        {!allDay && (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[12px] text-[var(--fg-2)]">
              시작
              <input type="time" value={start} onChange={(event) => setStart(event.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-[var(--fg-2)]">
              끝
              <input type="time" value={end} onChange={(event) => setEnd(event.target.value)} className={inputClass} />
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1 text-[12px] text-[var(--fg-2)]">
          장소
          <input value={place} onChange={(event) => setPlace(event.target.value)} className={inputClass} maxLength={60} />
        </label>

        <label className="flex flex-col gap-1 text-[12px] text-[var(--fg-2)]">
          분류
          <select value={kind} onChange={(event) => setKind(event.target.value as CalendarKind)} className={inputClass}>
            {KIND_ORDER.map((item) => (
              <option key={item} value={item}>
                {KIND_META[item].label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[12px] text-[var(--fg-2)]">
          메모
          <textarea value={memo} onChange={(event) => setMemo(event.target.value)} rows={3} className={`${inputClass} resize-none`} maxLength={300} />
        </label>

        {error && <p className="text-[13px] text-[#B91C1C] dark:text-[#FCA5A5]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 h-11 rounded-full bg-[var(--accent)] text-[15px] font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {saving ? '저장 중' : '저장'}
        </button>
      </form>
    </div>
  );
}
