import { kakaoRooms, type KakaoMessage } from '@/lib/kakao';
import type { RunState } from '@/state/runState';
import { dayIndex, parseClock } from '@/state/social';
import { clampStat } from '@/state/stats';
import { DAY_MIN, clockOf, type Notice } from '@/state/timeline';
import { kakaoEvents } from '@data/story/kakao-events';

export const UNIFORM_POLL_ID = 'ev-d1-uniform';

export type KakaoAddition = KakaoMessage & { room: string };

type KakaoEffect = {
  mind?: number;
  rumor?: number;
  courage?: number;
  clue?: string;
  mindIfRumorPeak?: { atLeast: number; mind: number };
};

type NewKakaoMessage = {
  id: string;
  room: string;
  from: string;
  type: KakaoMessage['type'];
  text: string;
  question?: string;
  options?: { label: string; votes: number }[];
};

export function kakaoDate(t: number): string {
  return `2026-10-${String(13 + dayIndex(t)).padStart(2, '0')}`;
}

function roomName(roomId: string): string {
  return kakaoRooms.find((room) => room.id === roomId)?.name ?? roomId;
}

export function addKakaoMessage(run: RunState, message: NewKakaoMessage, at: number): RunState {
  const time = clockOf(at);
  const entry: KakaoAddition = { ...message, date: kakaoDate(at), time };
  const notice: Notice[] =
    message.from === 'me'
      ? []
      : [
          {
            id: `kakao-${message.id}`,
            appId: 'kakao',
            title: roomName(message.room),
            body: message.text,
            time,
            arriveAt: at,
            queued: run.dnd,
          },
        ];
  return { ...run, kakaoAdded: [...run.kakaoAdded, entry], notices: [...run.notices, ...notice] };
}

function applyKakaoEffect(run: RunState, effect: KakaoEffect | undefined): RunState {
  if (!effect) return run;
  const peakHit = effect.mindIfRumorPeak !== undefined && run.rumorPeak >= effect.mindIfRumorPeak.atLeast;
  const mindDelta = peakHit && effect.mindIfRumorPeak ? effect.mindIfRumorPeak.mind : (effect.mind ?? 0);
  const clues =
    effect.clue && !run.clues.includes(effect.clue) ? [...run.clues, effect.clue] : run.clues;
  return {
    ...run,
    mind: clampStat(run.mind + mindDelta),
    rumor: clampStat(run.rumor + (effect.rumor ?? 0)),
    courage: clampStat(run.courage + (effect.courage ?? 0)),
    clues,
  };
}

export function settleKakaoEvents(run: RunState): RunState {
  const known = new Set(run.kakaoAdded.map((entry) => entry.id));
  return kakaoEvents.reduce<RunState>((acc, event) => {
    const at = (event.day - 1) * DAY_MIN + parseClock(event.time);
    if (at > acc.t || known.has(event.id)) return acc;
    known.add(event.id);
    const added = addKakaoMessage(
      acc,
      {
        id: event.id,
        room: event.room,
        from: event.from,
        type: event.type as KakaoMessage['type'],
        text: event.text,
        question: 'question' in event ? event.question : undefined,
        options: 'options' in event ? event.options?.map((option) => ({ ...option })) : undefined,
      },
      at,
    );
    return applyKakaoEffect(added, 'effect' in event ? (event.effect as KakaoEffect) : undefined);
  }, run);
}
