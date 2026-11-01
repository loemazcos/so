import { doublesPrompts } from '@data/story/doubles';
import type { RunState } from '@/state/runState';
import { parseClock } from '@/state/social';
import { DAY_MIN, type Notice, clockOf } from '@/state/timeline';

export type DoublesChoice = 'go' | 'sick';

export type DoublesReply = { id: string; at: number; text: string };

export type DoublesState = {
  answered: Record<string, DoublesChoice>;
  results: Record<string, number>;
  replies: DoublesReply[];
};

export const DEFAULT_DOUBLES: DoublesState = { answered: {}, results: {}, replies: [] };

const MORNING_CLOSE_MIN = 7 * 60;

export function promptStart(prompt: { day: number; time: string }): number {
  return (prompt.day - 1) * DAY_MIN + parseClock(prompt.time);
}

export function openDoublesPrompt(doubles: DoublesState, t: number) {
  return (
    doublesPrompts.find((prompt) => {
      if (doubles.answered[prompt.id]) return false;
      return t >= promptStart(prompt) && t < prompt.day * DAY_MIN + MORNING_CLOSE_MIN;
    }) ?? null
  );
}

export function settleDoubles(run: RunState): RunState {
  const due = run.doubles.replies.filter((reply) => reply.at <= run.t);
  if (due.length === 0) return run;
  const notices: Notice[] = due.map((reply) => ({
    id: `doubles-reply-${reply.id}`,
    appId: 'instagram',
    title: '상혁',
    body: reply.text,
    time: clockOf(reply.at),
    arriveAt: reply.at,
    queued: run.dnd,
    threadId: 'sanghyuk',
  }));
  return {
    ...run,
    notices: [...run.notices, ...notices],
    doubles: { ...run.doubles, replies: run.doubles.replies.filter((reply) => reply.at > run.t) },
  };
}
