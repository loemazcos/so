import { useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import Avatar from '@/components/apps/Avatar';
import { useDmStore } from '@/hooks/useDmStore';
import { type DmMessage, type DmThread } from '@/lib/dmChat';
import { dmThreads as threadData } from '@data/instagram';

const dmThreads = threadData as DmThread[];

type Props = { onBack: () => void };

export default function InstagramDm({ onBack }: Props) {
  const store = useDmStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = dmThreads.find((thread) => thread.id === activeId) ?? null;

  if (active) {
    return (
      <ChatView
        thread={active}
        messages={store.messagesFor(active)}
        status={store.status}
        typing={store.pendingId === active.id}
        notice={store.notice?.threadId === active.id ? store.notice.text : null}
        onBack={() => setActiveId(null)}
        onSend={(text) => store.send(active, text)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
        <button type="button" onClick={onBack} aria-label="뒤로" className="text-[var(--accent)]">
          <ChevronLeft size={28} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="flex-1 text-center text-[17px] font-semibold">DM</p>
        <span className="w-7" aria-hidden="true" />
      </header>
      <ul className="flex flex-1 flex-col overflow-y-auto pan-y-scroll">
        {dmThreads.map((thread) => {
          const last = [...store.messagesFor(thread)].reverse().find((message) => message.from !== 'system');
          return (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => setActiveId(thread.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-[var(--card)]"
              >
                <Avatar photo={thread.avatar} label={thread.name} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">{thread.name}</p>
                  <p className="truncate text-[13px] text-[var(--fg-2)]">
                    {last ? (last.from === 'me' ? `나: ${last.text}` : last.text) : '대화를 시작해 보세요'}
                  </p>
                </div>
                <p className="shrink-0 text-[11px] text-[var(--fg-2)]">{thread.activity}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type ChatProps = {
  thread: DmThread;
  messages: DmMessage[];
  status: 'loading' | 'ready' | 'error';
  typing: boolean;
  notice: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
};

function ChatView({ thread, messages, status, typing, notice, onBack, onSend }: ChatProps) {
  const [draft, setDraft] = useState('');
  const inputLocked = status !== 'ready' || typing;

  function submit() {
    const text = draft.trim();
    if (!text || inputLocked) return;
    onSend(text);
    setDraft('');
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-[var(--line)] px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+58px)]">
        <button type="button" onClick={onBack} aria-label="목록으로" className="p-1 text-[var(--accent)]">
          <ChevronLeft size={26} strokeWidth={2} aria-hidden="true" />
        </button>
        <Avatar photo={thread.avatar} label={thread.name} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{thread.name}</p>
          <p className="text-[11px] text-[var(--fg-2)]">{typing ? '입력 중' : thread.activity}</p>
        </div>
      </header>

      <div className="pan-y-scroll flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3">
        {status === 'loading' && <p className="my-2 text-center text-[11px] text-[var(--fg-2)]">대화를 불러오는 중이에요</p>}
        {status === 'error' && <p className="my-2 text-center text-[11px] text-[#B91C1C] dark:text-[#FCA5A5]">대화를 불러오지 못했어요. 다시 열어 주세요.</p>}
        {messages.map((message, index) => {
          if (message.from === 'system') {
            return (
              <p key={index} className="my-2 text-center text-[11px] text-[var(--fg-2)]">
                {message.text}
              </p>
            );
          }
          const mine = message.from === 'me';
          return (
            <div key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
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
        {typing && (
          <div className="flex justify-start">
            <span className="flex items-center gap-1 rounded-[18px] rounded-bl-[6px] bg-[var(--card)] px-3.5 py-3" aria-label="입력 중">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--fg-2)]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--fg-2)] [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--fg-2)] [animation-delay:300ms]" />
            </span>
          </div>
        )}
        {notice && <p className="my-2 text-center text-[12px] text-[#B91C1C] dark:text-[#FCA5A5]">{notice}</p>}
      </div>

      <form
        className="flex items-center gap-2 border-t border-[var(--line)] px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={inputLocked}
          placeholder="메시지 보내기"
          maxLength={300}
          className="h-10 flex-1 rounded-full bg-[var(--card)] px-4 text-[15px] outline-none placeholder:text-[var(--fg-2)] disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="보내기"
          disabled={inputLocked || !draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A84FF] text-white transition-opacity disabled:opacity-40"
        >
          <Send size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
