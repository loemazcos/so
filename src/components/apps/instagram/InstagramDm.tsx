import { useEffect, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { useReportScreen } from '@/components/phone/ScreenReport';
import Avatar from '@/components/apps/Avatar';
import SanghyukChat from '@/components/apps/instagram/SanghyukChat';
import { useDmStore } from '@/hooks/useDmStore';
import { requestDmCallback, type DmCallbackKey, type DmMessage, type DmThread } from '@/lib/dmChat';
import { playSound } from '@/lib/sound';
import { useGameState } from '@/state/GameState';
import { openConsult, type ConsultRoom } from '@/state/consults';
import { chooseConsult } from '@/state/kakaoActions';
import { kakaoAt } from '@/state/kakaoEvents';
import { applyDmEffects, arriveDmNotice, openDmThread, openSanghyukRoom, sendDm } from '@/state/runState';
import { dmThreads as threadData, personalHistory } from '@data/instagram';

const dmThreads = threadData as DmThread[];
const CALLBACK_KEYS: DmCallbackKey[] = ['erasedThrice', 'dndNight'];
const CONSULT_ROOMS: string[] = ['donghyun', 'jaehyun'];

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
  const consultOpen = openConsult(run.consult, run.t) !== null;

  function messagesOf(thread: DmThread): DmMessage[] {
    const scripted: DmMessage[] = [
      ...(personalHistory[thread.id as keyof typeof personalHistory] ?? []),
      ...run.kakaoAdded.filter((message) => message.room === thread.id),
    ].map((message) => ({
      from: message.from === 'me' ? 'me' : 'them',
      text: message.text ?? '',
      time: message.time,
      at: kakaoAt(message.date, message.time),
    }));
    return [...store.messagesFor(thread), ...scripted].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  }

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
        messages={messagesOf(active)}
        status={store.status}
        typing={store.typingId === active.id}
        locked={store.pendingId !== null}
        notice={store.notice?.threadId === active.id ? store.notice.text : null}
        consultOpen={consultOpen && CONSULT_ROOMS.includes(active.id)}
        onConsult={() => update((current) => chooseConsult(current, active.id as ConsultRoom))}
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
          const last = [...messagesOf(thread)].reverse().find((message) => message.from !== 'system');
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
  consultOpen: boolean;
  onConsult: () => void;
  onBack: () => void;
  onSend: (text: string) => void;
};

function ChatView({ thread, messages, status, typing, locked, notice, consultOpen, onConsult, onBack, onSend }: ChatProps) {
  const [draft, setDraft] = useState('');
  const { run } = useGameState();
  const audible = run.soundOn && !run.dnd;
  useReportScreen({ screen: '인스타 DM', title: thread.name, lines: messages.slice(-3).map((message) => message.text) });

  useEffect(() => {
    if (!typing) return;
    const id = window.setInterval(() => playSound('typing', audible), 320);
    return () => window.clearInterval(id);
  }, [typing, audible]);
  const [consultDismissed, setConsultDismissed] = useState(false);
  const inputLocked = status !== 'ready' || locked;
  const lastMineIndex = messages.reduce((found, message, index) => (message.from === 'me' ? index : found), -1);

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

      {consultOpen && !consultDismissed && (
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3 py-2.5">
          <p className="min-w-0 flex-1 text-[13px] leading-[1.4] text-[var(--fg)]">오늘 밤 상담 받을래요?</p>
          <button type="button" onClick={() => setConsultDismissed(true)} className="h-8 px-2 text-[12px] text-[var(--fg-2)]">
            나중에
          </button>
          <button type="button" onClick={onConsult} className="h-8 rounded-full bg-[#0A84FF] px-3 text-[12px] font-semibold text-white">
            상담 받기
          </button>
        </div>
      )}

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
          const next = messages[index + 1];
          const endsRun = !next || next.from !== message.from;
          const tail = endsRun ? (mine ? 'rounded-br-[6px]' : 'rounded-bl-[6px]') : '';
          return (
            <div key={message.id ?? index} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <p
                className={`max-w-[75%] rounded-[18px] px-3.5 py-2 text-[15px] leading-[1.4] ${tail} ${
                  mine ? 'bg-[#0A84FF] text-white' : 'bg-[#E9E9EB] text-[#1C1C1E] dark:bg-[#26262B] dark:text-[#F2F2F7]'
                }`}
              >
                {message.text}
              </p>
              {mine && message.read && index === lastMineIndex && (
                <span className="mt-0.5 text-[10px] text-[var(--fg-2)]">읽음</span>
              )}
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <span className="flex items-center gap-1 rounded-[18px] rounded-bl-[6px] bg-[#E9E9EB] px-3.5 py-3 dark:bg-[#26262B]" aria-label="입력 중">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--fg-2)]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--fg-2)] [animation-delay:150ms]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--fg-2)] [animation-delay:300ms]" />
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
