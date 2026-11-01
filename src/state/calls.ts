import { calls } from '@data/story/calls';
import { DAY_MIN, clockOf, type Notice } from '@/state/timeline';
import type { RunState } from '@/state/runState';

export type CallSay = { type: 'say'; who: string; text: string };
export type CallChoice = { label: string; mind: number; courage: number; reply: string };
export type CallChoose = { type: 'choose'; options: CallChoice[] };
export type CallStep = CallSay | CallChoose;
export type CallScript = {
  id: string;
  day: number;
  time: string;
  kind: 'live' | 'missed';
  caller?: string;
  count?: number;
  steps?: CallStep[];
};

export const RING_WINDOW = 10;
export const CALL_MIN_BATTERY = 8;
export const CALL_STEP_MIN = 20 / 60;
export const CALL_STEP_BATTERY = 0.5;
export const CALL_DROP_MIND = -10;
export const CALLBACK_WINDOW = 5;
export const CHARGE_REVIVE_BATTERY = 20;

export const callList = calls as CallScript[];

export function callAt(call: CallScript): number {
  const [hour, minute] = call.time.split(':').map(Number);
  return (call.day - 1) * DAY_MIN + hour * 60 + minute;
}

export function findCall(id: string): CallScript | null {
  return callList.find((call) => call.id === id) ?? null;
}

export function incomingCall(run: Pick<RunState, 't' | 'callsDone' | 'activeCall'>): CallScript | null {
  if (run.activeCall) return null;
  return (
    callList.find((call) => {
      if (call.kind !== 'live' || run.callsDone.includes(call.id)) return false;
      const at = callAt(call);
      return run.t >= at && run.t < at + RING_WINDOW;
    }) ?? null
  );
}

export function missCall(run: RunState, call: CallScript): RunState {
  const at = callAt(call);
  const notice: Notice =
    call.kind === 'missed'
      ? { id: `call-${call.id}`, appId: 'phone', title: '부재중 전화', body: `부재중 전화 ${call.count ?? 1}통`, time: clockOf(at), arriveAt: at, queued: run.dnd }
      : { id: `call-${call.id}`, appId: 'phone', title: '부재중 전화', body: `${call.caller ?? '알 수 없음'}`, time: clockOf(at), arriveAt: at, queued: run.dnd };
  return { ...run, callsDone: [...run.callsDone, call.id], notices: [...run.notices, notice] };
}

export function canCallBack(run: RunState): boolean {
  return (
    run.droppedAt !== null &&
    run.t <= run.droppedAt + CALLBACK_WINDOW &&
    run.battery >= CALL_MIN_BATTERY &&
    run.activeCall === null
  );
}

export function settleCalls(run: RunState): RunState {
  const expired = run.droppedAt !== null && run.t > run.droppedAt + CALLBACK_WINDOW;
  const cleared = expired ? { ...run, droppedAt: null, droppedCall: null } : run;
  return callList.reduce<RunState>((acc, call) => {
    if (acc.callsDone.includes(call.id)) return acc;
    const at = callAt(call);
    if (call.kind === 'missed' && acc.t >= at) return missCall(acc, call);
    if (call.kind === 'live' && acc.t >= at + RING_WINDOW) return missCall(acc, call);
    return acc;
  }, run);
}
