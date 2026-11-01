import { callFunction } from '@/lib/gameApi';

export type DmSender = 'me' | 'them' | 'system';
export type DmMessage = { from: DmSender; text: string; time?: string };
export type DmThread = { id: string; name: string; handle: string; avatar: string; activity: string; messages: DmMessage[] };

type StoredRow = { thread_id: string; sender: 'me' | 'them'; body: string; created_at: string };
type LoadResponse = { dmMessages?: unknown };

export function formatMessageTime(iso: string) {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function nowLabel() {
  return formatMessageTime(new Date().toISOString());
}

export async function fetchStoredDmMessages(): Promise<Record<string, DmMessage[]>> {
  const data = await callFunction<LoadResponse>('game-api', { action: 'load' });
  if (!Array.isArray(data.dmMessages)) throw new Error('대화를 불러오지 못했어요.');

  const grouped: Record<string, DmMessage[]> = {};
  for (const row of data.dmMessages as StoredRow[]) {
    (grouped[row.thread_id] ??= []).push({ from: row.sender, text: row.body, time: formatMessageTime(row.created_at) });
  }
  return grouped;
}

export async function saveMyDmMessage(threadId: string, body: string): Promise<void> {
  await callFunction('game-api', { action: 'sendDm', payload: { threadId, body } });
}

export async function requestDmReply(threadId: string, history: { from: 'me' | 'them'; text: string }[]): Promise<string> {
  const data = await callFunction<{ reply?: unknown }>('dm-reply', { threadId, history });
  if (typeof data.reply !== 'string' || data.reply.length === 0) {
    throw new Error('답장이 도착하지 않았어요. 다시 보내 주세요.');
  }
  return data.reply;
}
