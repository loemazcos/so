import { useCallback, useEffect, useState } from 'react';
import {
  fetchDmRows,
  openDmThreadOnServer,
  requestDmReply,
  rowToMessage,
  saveMyDmMessage,
  type DmMessage,
  type DmReply,
  type DmRow,
  type DmThread,
} from '@/lib/dmChat';

type Status = 'loading' | 'ready' | 'error';
type SendHandlers = { onSent: () => void; onReply: (reply: DmReply) => void };

const TYPING_MS = 2500;
const TYPING_GAP_MS = 4000;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export function useDmStore(now: number) {
  const [rows, setRows] = useState<DmRow[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [typingId, setTypingId] = useState<string | null>(null);
  const [dueTimes, setDueTimes] = useState<number[]>([]);
  const [notice, setNotice] = useState<{ threadId: string; text: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      setRows(await fetchDmRows());
      setStatus('ready');
    } catch {
      setStatus((current) => (current === 'loading' ? 'error' : current));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!dueTimes.some((time) => now >= time)) return;
    setDueTimes((current) => current.filter((time) => time > now));
    void refresh();
  }, [now, dueTimes, refresh]);

  function rowsFor(threadId: string) {
    return rows.filter((row) => row.thread_id === threadId);
  }

  function messagesFor(thread: DmThread): DmMessage[] {
    return [...thread.messages, ...rowsFor(thread.id).map((row) => rowToMessage(row, thread.name))];
  }

  async function openThread(threadId: string) {
    try {
      await openDmThreadOnServer(threadId);
    } catch {
      setNotice({ threadId, text: '대화를 여는 중 연결이 끊겼어요. 다시 열어 주세요.' });
    }
    await refresh();
  }

  async function send(thread: DmThread, text: string, handlers: SendHandlers) {
    if (status !== 'ready' || pendingId) return;
    setPendingId(thread.id);
    setNotice(null);

    try {
      await saveMyDmMessage(thread.id, text);
    } catch {
      setNotice({ threadId: thread.id, text: '메시지를 보내지 못했어요. 연결을 확인해 주세요.' });
      setPendingId(null);
      return;
    }
    handlers.onSent();
    await refresh();

    try {
      const history = [...messagesFor(thread), { from: 'me' as const, text }]
        .filter((message) => message.from !== 'system')
        .slice(-30)
        .map((message) => ({ from: message.from as 'me' | 'them', text: message.text }));
      const reply = await requestDmReply(thread.id, history);
      handlers.onReply(reply);

      let offset = 0;
      const due = reply.messages.map((message) => {
        offset += message.delay_min;
        return now + offset;
      });
      const later = due.filter((time) => time > now);
      if (later.length > 0) setDueTimes((current) => [...current, ...later]);

      const instantCycles = reply.messages
        .filter((message) => message.delay_min === 0)
        .reduce((max, message) => Math.max(max, message.typing_cycles), 0);
      for (let i = 0; i < instantCycles; i += 1) {
        setTypingId(thread.id);
        await wait(TYPING_MS);
        setTypingId(null);
        if (i < instantCycles - 1) await wait(TYPING_GAP_MS);
      }
      await refresh();
    } catch (error) {
      setNotice({
        threadId: thread.id,
        text: error instanceof Error ? error.message : '답장이 도착하지 않았어요. 다시 보내 주세요.',
      });
    } finally {
      setTypingId(null);
      setPendingId(null);
    }
  }

  return {
    status,
    rows,
    pendingId,
    typingId,
    notice,
    rowsFor,
    messagesFor,
    openThread,
    refresh,
    send,
  };
}
