import { useEffect, useState } from 'react';
import { fetchStoredDmMessages, nowLabel, requestDmReply, saveMyDmMessage, type DmMessage, type DmThread } from '@/lib/dmChat';

type Status = 'loading' | 'ready' | 'error';

export function useDmStore() {
  const [stored, setStored] = useState<Record<string, DmMessage[]>>({});
  const [status, setStatus] = useState<Status>('loading');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ threadId: string; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetchStoredDmMessages()
      .then((grouped) => {
        if (!active) return;
        setStored(grouped);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  function messagesFor(thread: DmThread) {
    return [...thread.messages, ...(stored[thread.id] ?? [])];
  }

  async function send(thread: DmThread, text: string) {
    if (status !== 'ready' || pendingId) return;

    const mine: DmMessage = { from: 'me', text, time: nowLabel() };
    const history = [...messagesFor(thread), mine]
      .filter((message) => message.from !== 'system')
      .slice(-30)
      .map((message) => ({ from: message.from as 'me' | 'them', text: message.text }));

    setStored((current) => ({ ...current, [thread.id]: [...(current[thread.id] ?? []), mine] }));
    setPendingId(thread.id);
    setNotice(null);

    try {
      await saveMyDmMessage(thread.id, text);
    } catch {
      setStored((current) => ({
        ...current,
        [thread.id]: (current[thread.id] ?? []).filter((message) => message !== mine),
      }));
      setNotice({ threadId: thread.id, text: '메시지를 보내지 못했어요. 연결을 확인해 주세요.' });
      setPendingId(null);
      return;
    }

    try {
      const reply = await requestDmReply(thread.id, history);
      setStored((current) => ({
        ...current,
        [thread.id]: [...(current[thread.id] ?? []), { from: 'them', text: reply, time: nowLabel() }],
      }));
    } catch (error) {
      setNotice({ threadId: thread.id, text: error instanceof Error ? error.message : '답장이 도착하지 않았어요.' });
    } finally {
      setPendingId(null);
    }
  }

  return {
    status,
    pendingId,
    notice,
    messagesFor,
    send,
  };
}
