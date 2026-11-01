import { callFunction } from '@/lib/gameApi';

export type DmSender = 'me' | 'them' | 'system';
export type DmMessage = { id?: number; from: DmSender; text: string; time?: string; read?: boolean; at?: number };
export type DmThread = { id: string; name: string; handle: string; avatar: string; activity: string; messages: DmMessage[] };

export type DmRow = {
  id: number;
  thread_id: string;
  sender: 'me' | 'them';
  body: string;
  status: 'sent' | 'delivered' | 'read' | 'unsent';
  deliver_at: number;
  read_at: number | null;
  unsend_after_min: number | null;
  unsent_at: number | null;
  typing_cycles: number;
};

export type DmReplyMessage = { text: string; delay_min: number; unsend_after_min: number | null; typing_cycles: number };
export type DmEffects = { trust: number; courage: number; rumor: number };
export type DmReply = {
  messages: DmReplyMessage[];
  effects: DmEffects;
  reveal: string[];
  read_now: boolean;
  mood: string;
  fallback: boolean;
};
export type DmCallbackKey = 'erasedThrice' | 'dndNight';
export type DmCallbackResult = { delivered: boolean; text?: string; mindDelta?: number };

export function formatGameTime(t: number) {
  const minute = ((t % 1440) + 1440) % 1440;
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

export function rowToMessage(row: DmRow, threadName: string): DmMessage {
  const time = formatGameTime(row.deliver_at);
  if (row.status === 'unsent') {
    return { id: row.id, from: 'system', text: `${threadName}님이 메시지를 전송 취소했습니다`, time };
  }
  return { id: row.id, from: row.sender, text: row.body, time, read: row.sender === 'me' && row.status === 'read', at: row.deliver_at };
}

function isDmRow(value: unknown): value is DmRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<DmRow>;
  return typeof row.id === 'number' && typeof row.thread_id === 'string' && typeof row.body === 'string' &&
    typeof row.deliver_at === 'number' && (row.sender === 'me' || row.sender === 'them');
}

function isDmReply(value: unknown): value is DmReply {
  if (!value || typeof value !== 'object') return false;
  const reply = value as Partial<DmReply>;
  return Array.isArray(reply.messages) && reply.messages.length > 0 && typeof reply.effects === 'object' && reply.effects !== null;
}

export async function fetchDmRows(): Promise<DmRow[]> {
  const data = await callFunction<{ dmMessages?: unknown }>('game-api', { action: 'load' });
  if (!Array.isArray(data.dmMessages) || !data.dmMessages.every(isDmRow)) throw new Error('대화를 불러오지 못했어요.');
  return data.dmMessages;
}

export async function openDmThreadOnServer(threadId: string): Promise<void> {
  await callFunction('game-api', { action: 'openThread', payload: { threadId } });
}

export async function saveMyDmMessage(threadId: string, body: string): Promise<void> {
  await callFunction('game-api', { action: 'sendDm', payload: { threadId, body } });
}

export async function requestDmReply(threadId: string, history: { from: 'me' | 'them'; text: string }[]): Promise<DmReply> {
  const data = await callFunction<unknown>('dm-reply', { threadId, history });
  if (!isDmReply(data)) throw new Error('답장이 도착하지 않았어요. 다시 보내 주세요.');
  return data;
}

export async function requestDmCallback(key: DmCallbackKey): Promise<DmCallbackResult> {
  const data = await callFunction<DmCallbackResult>('dm-reply', { callback: key });
  if (typeof data.delivered !== 'boolean') throw new Error('메시지를 확인하지 못했어요.');
  return data;
}
