import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import Avatar from '@/components/apps/Avatar';
import { type DmThread } from '@/lib/dmChat';
import { useGameState } from '@/state/GameState';
import { answerSanghyuk, eraseDraft, sendDm } from '@/state/runState';
import { sanghyukChoices, sanghyukEnding } from '@data/story/sanghyuk';

type Choice = 'why' | 'read';
type ReplyPhase = 'idle' | 'typing' | 'gap' | 'done';

const PRESS_MS = 400;
const FIRST_TYPING_MS = 2500;
const GAP_MS = 1000;
const SECOND_TYPING_MS = 2000;

type Props = { thread: DmThread; onBack: () => void };

export default function SanghyukChat({ thread, onBack }: Props) {
  const { run, update } = useGameState();
  const { choice, answeredAt } = run.sanghyuk;
  const [pressed, setPressed] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<ReplyPhase>(answeredAt === null ? 'idle' : 'done');
  const [draft, setDraft] = useState('');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function later(ms: number, fn: () => void) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function choose(next: Choice) {
    if (pressed || answeredAt !== null) return;
    setPressed(next);
    later(PRESS_MS, () => {
      setPressed(null);
      update((current) => answerSanghyuk(sendDm(current, 'sanghyuk'), next));
      if (next === 'read') {
        setPhase('done');
        return;
      }
      setPhase('typing');
      later(FIRST_TYPING_MS, () => setPhase('gap'));
      later(FIRST_TYPING_MS + GAP_MS, () => setPhase('typing'));
      later(FIRST_TYPING_MS + GAP_MS + SECOND_TYPING_MS, () => setPhase('done'));
    });
  }

  function handleDraftChange(value: string) {
    if (draft.length > 0 && value.length === 0) update(eraseDraft);
    setDraft(value);
  }

  function submit() {
    if (!draft.trim()) return;
    setDraft('');
  }

  const readLabel = sanghyukChoices.find((item) => item.id === 'read')?.label ?? '';
  const whyLabel = sanghyukChoices.find((item) => item.id === 'why')?.label ?? '';
  const leaveLabel = sanghyukChoices.find((item) => item.id === 'leave')?.label ?? '';
  const showChoices = answeredAt === null && !run.sanghyuk.ignored;
  const showEnding = choice === 'why' && phase === 'done';

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-[var(--line)] px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+58px)]">
        <button type="button" onClick={onBack} aria-label="목록으로" className="p-1 text-[var(--accent)]">
          <ChevronLeft size={26} strokeWidth={2} aria-hidden="true" />
        </button>
        <Avatar photo={thread.avatar} label={thread.name} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{thread.name}</p>
          <p className="text-[11px] text-[var(--fg-2)]">{phase === 'typing' ? '입력 중' : thread.activity}</p>
        </div>
      </header>

      <div className="pan-y-scroll flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3">
        {thread.messages.map((message, index) => {
          if (message.from === 'system') {
            return (
              <p key={`history-${index}`} className="my-2 text-center text-[11px] text-[var(--fg-2)]">
                {message.text}
              </p>
            );
          }
          const mine = message.from === 'me';
          return (
            <div key={`history-${index}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[75%] rounded-[18px] px-3.5 py-2 text-[15px] leading-[1.4] ${
                  mine ? 'rounded-br-[6px] bg-[#0A84FF] text-white' : 'rounded-bl-[6px] bg-[var(--card)] text-[var(--fg)]'
                }`}
              >
                {message.text}
              </p>
            </div>
          );
        })}

        {choice !== null && (
          <div className="flex justify-end">
            <p className="max-w-[75%] rounded-[18px] rounded-br-[6px] bg-[#0A84FF] px-3.5 py-2 text-[15px] leading-[1.4] text-white">
              {choice === 'why' ? whyLabel : readLabel}
            </p>
          </div>
        )}

        {showEnding &&
          sanghyukEnding.lines.slice(1).map((line, index) => (
            <div key={`ending-${index}`} className="flex justify-start">
              <p className="max-w-[75%] rounded-[18px] rounded-bl-[6px] bg-[var(--card)] px-3.5 py-2 text-[15px] leading-[1.4] text-[var(--fg)]">
                {line.text}
              </p>
            </div>
          ))}

        {phase === 'typing' && (
          <div className="flex justify-start">
            <span className="flex items-center gap-1 rounded-[18px] rounded-bl-[6px] bg-[var(--card)] px-3.5 py-3" aria-label="입력 중">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--fg-2)]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--fg-2)] [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--fg-2)] [animation-delay:300ms]" />
            </span>
          </div>
        )}

        {showEnding && (
          <section className="mt-3 rounded-[20px] bg-white p-4 text-[#111827] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] font-semibold tracking-wide text-[#4B5563]">{sanghyukEnding.codex} · {sanghyukEnding.codexNote}</p>
            <p className="mt-1 text-[16px] font-bold">{sanghyukEnding.title}</p>
            <p className="mt-2 text-[13px] leading-[1.6] text-[#374151]">{sanghyukEnding.closing}</p>
          </section>
        )}
      </div>

      {showChoices && (
        <div className="flex flex-col gap-2 border-t border-[var(--line)] px-3 pb-2 pt-3">
          {sanghyukChoices
            .filter((item) => item.id !== 'leave')
            .map((item) => {
              const id = item.id as Choice;
              const isPressed = pressed === id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(id)}
                  disabled={pressed !== null}
                  className={`h-10 rounded-full text-[14px] font-semibold transition-all duration-[400ms] ${
                    isPressed ? 'scale-[0.96] bg-[var(--accent)] text-white' : 'bg-[var(--card)] text-[var(--fg)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          <button
            type="button"
            onClick={onBack}
            className="h-9 text-[13px] text-[var(--fg-2)]"
          >
            {leaveLabel}
          </button>
        </div>
      )}

      <form
        className="flex items-center gap-2 border-t border-[var(--line)] px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          value={draft}
          onChange={(event) => handleDraftChange(event.target.value)}
          placeholder="메시지 보내기"
          maxLength={300}
          className="h-10 flex-1 rounded-full bg-[var(--card)] px-4 text-[15px] outline-none placeholder:text-[var(--fg-2)]"
        />
        <button
          type="submit"
          aria-label="보내기"
          disabled={!draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A84FF] text-white transition-opacity disabled:opacity-40"
        >
          <Send size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
