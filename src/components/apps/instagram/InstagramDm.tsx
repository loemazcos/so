import { useEffect, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import Avatar from '@/components/apps/Avatar';
import SanghyukChat from '@/components/apps/instagram/SanghyukChat';
import { useDmStore } from '@/hooks/useDmStore';
import { requestDmCallback, type DmCallbackKey, type DmMessage, type DmThread } from '@/lib/dmChat';
import { useGameState } from '@/state/GameState';
import { applyDmEffects, arriveDmNotice, openDmThread, openSanghyukRoom, sendDm } from '@/state/runState';
import { dmThreads as threadData } from '@data/instagram';

const dmThreads = threadData as DmThread[];
const CALLBACK_KEYS: DmCallbackKey[] = ['erasedThrice', 'dndNight'];

function threadNameOf(threadId: string) {
  return dmThreads.find((thread) => thread.id === threadId)?.name ?? '';
}

type Props = { initialThreadId: string | null };

export default function InstagramDm({ initialThreadId }: Props) {
  const { run, update } = useGameState();
  const store = useDmStore(run.t);
  const [activeId, setActiveId] = useState<string | null>(initialThreadId);

  const active = dmThreads.find((thread) => thread.id === activeId) ?? null;
  const { refresh } = store;

  useEffect(() => {
    const pending = CALLBACK_KEYS.filter((key) => run.morning[key]);
    if (pending.length === 0) return;
    let mounted = true;
    (async () => {
      let delivered = false;
      for (const key of pending) {
        const result = await requestDmCallback(key).catch(() => null);
        if (!mounted || !result?.delivered) continue;
        delivered = true;
        update((current) => applyDmEffects(current, { trust: result.mindDelta ?? 0, courage: 0, rumor: 0 }));
      }
      if (mounted && delivered) void refresh();
    })();
    return () => {
      mounted = false;
    };
  }, [run.morning.erasedThrice, run.morning.dndNight, refresh, update]);

  useEffect(() => {
    const missing = store.rows.filter(
      (row) =>
        row.sender === 'them' &&
        row.thread_id !== activeId &&
        !run.notices.some((notice) => notice.id === `dm-${row.id}`),
    );
    if (missing.length === 0) return;
    update((current) =>
      missing.reduce(
        (acc, row) =>
          arriveDmNotice(acc, {
            id: `dm-${row.id}`,
            threadId: row.thread_id,
            title: threadNameOf(row.thread_id),
            body: row.body,
            at: row.deliver_at,
          }),
        current,
      ),
    );
  }, [store.rows, activeId, run.notices, update]);

  function openThread(thread: DmThread) {
    const threadRows = store.rowsFor(thread.id);
    const hasUnread = thread.id !== 'sanghyuk' && threadRows[threadRows.length - 1]?.sender === 'them';
    update((current) => {
      const opened = openDmThread(current, thread.id, hasUnread);
      return thread.id === 'sanghyuk' ? openSanghyukRoom(opened) : opened;
    });
    setActiveId(thread.id);
    void store.openThread(thread.id);
  }

  useEffect(() => {
    const thread = dmThreads.find((item) => item.id === initialThreadId);
    if (thread) openThread(thread);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (active?.id === 'sanghyuk') {
    return <SanghyukChat thread={active} onBack={() => setActiveId(null)} />;
  }

  if (active) {
    return (
      <ChatView
        thread={active}
        messages={store.messagesFor(active)}
        status={store.status}
        typing={store.typingId === active.id}
        locked={store.pendingId !== null}
        notice={store.notice?.threadId === active.id ? store.notice.text : null}
        onBack={() => setActiveId(null)}
        onSend={(text) =>
          void store.send(active, text, {
            onSent: () => update((current) => sendDm(current, active.id)),
            onReply: (reply) => update((current) => applyDmEffects(current, reply.effects)),
          })
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
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
                onClick={() => openThread(thread)}
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
  locked: boolean;
  notice: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
};

function ChatView({ thread, messages, status, typing, locked, notice, onBack, onSend }: ChatProps) {
  const [draft, setDraft] = useState('');
  const inputLocked = status !== 'ready' || locked;

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
              <p key={message.id ?? index} className="my-2 text-center text-[11px] text-[var(--fg-2)]">
                {message.text}
              </p>
            );
          }
          const mine = message.from === 'me';
          return (
            <div key={message.id ?? index} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <p
                className={`max-w-[75%] rounded-[18px] px-3.5 py-2 text-[15px] leading-[1.4] ${
                  mine ? 'rounded-br-[6px] bg-[#0A84FF] text-white' : 'rounded-bl-[6px] bg-[var(--card)] text-[var(--fg)]'
                }`}
              >
                {message.text}
              </p>
              {mine && message.read && <span className="mt-0.5 text-[10px] text-[var(--fg-2)]">읽음</span>}
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
