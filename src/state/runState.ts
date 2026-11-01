import { device } from '@data/device';
import { costs } from '@data/story/costs';
import { effects } from '@data/story/effects';
import { notices } from '@data/story/notices';
import { onDayStart } from '@/state/dayStart';
import { DEFAULT_SOCIAL, settleSocial, type SocialState } from '@/state/social';
import { DEFAULT_CONSULT, type ConsultState } from '@/state/consults';
import { DEFAULT_DOUBLES, settleDoubles, type DoublesState } from '@/state/doubles';
import { settleKakaoEvents, type KakaoAddition } from '@/state/kakaoEvents';
import {
  CALL_DROP_MIND,
  CALL_MIN_BATTERY,
  CALL_STEP_BATTERY,
  CALL_STEP_MIN,
  CHARGE_REVIVE_BATTERY,
  canCallBack,
  findCall,
  type CallChoice,
  incomingCall,
  missCall,
  settleCalls,
  type CallScript,
} from '@/state/calls';
import { clampStat } from '@/state/stats';
import {
  CHARGED_BATTERY,
  DAY_MIN,
  DEBT_LINE,
  FIRST_WAKE_T,
  LOW_POWER_DELAY,
  LOW_POWER_LINE,
  NO_CHARGE_PENALTY,
  REMIT_EXPIRES_T,
  RESTART_BATTERY,
  START_T,
  clockOf,
  crossingsBetween,
  dayStartOf,
  isRecessSkipped,
  type Crossing,
  type Notice,
} from '@/state/timeline';

export const CLUE_FIRST_DM = 'C01';
export const CLUE_MEMO_APP = 'C17';
export const CLUE_REMIT = 'C19';
export const ENDING_A0 = 'A-0';

export type SanghyukState = {
  openedAt: number | null;
  choice: 'why' | 'read' | null;
  answeredAt: number | null;
  ignored: boolean;
  draftErase: number;
};

export type RunState = {
  t: number;
  day: number;
  nextWakeT: number;
  battery: number;
  charging: boolean;
  sleptAt: number | null;
  sleepDebt: boolean;
  skipLastRecess: boolean;
  booted: boolean;
  dnd: boolean;
  activityStatus: boolean;
  courage: number;
  mind: number;
  rumor: number;
  ignores: number;
  clues: string[];
  memoRead: number[];
  remitStatus: 'open' | 'received' | 'expired';
  sanghyuk: SanghyukState;
  erasedThrice: boolean;
  morning: { erasedThrice: boolean; dndNight: boolean };
  dmReadAt: Record<string, number>;
  nightCutPending: boolean;
  nightCutPlayed: boolean;
  notices: Notice[];
  notificationsCleared: boolean;
  codex: string[];
  social: SocialState;
  consult: ConsultState;
  kakaoAdded: KakaoAddition[];
  uniform: 1 | 2 | null;
  rumorPeak: number;
  doubles: DoublesState;
  activeCall: { id: string; step: number; picks: number[] } | null;
  callsDone: string[];
  droppedAt: number | null;
  droppedCall: string | null;
};

export const DEFAULT_RUN: RunState = {
  t: START_T,
  day: 1,
  nextWakeT: FIRST_WAKE_T,
  battery: device.battery,
  charging: false,
  sleptAt: null,
  sleepDebt: false,
  skipLastRecess: false,
  booted: false,
  dnd: false,
  activityStatus: true,
  courage: 20,
  mind: 60,
  rumor: 10,
  ignores: 0,
  clues: [],
  memoRead: [],
  remitStatus: 'open',
  sanghyuk: { openedAt: null, choice: null, answeredAt: null, ignored: false, draftErase: 0 },
  erasedThrice: false,
  morning: { erasedThrice: false, dndNight: false },
  dmReadAt: {},
  nightCutPending: false,
  nightCutPlayed: false,
  notices: [],
  notificationsCleared: false,
  codex: [],
  social: DEFAULT_SOCIAL,
  consult: DEFAULT_CONSULT,
  kakaoAdded: [],
  uniform: null,
  rumorPeak: 10,
  doubles: DEFAULT_DOUBLES,
  activeCall: null,
  callsDone: [],
  droppedAt: null,
  droppedCall: null,
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export function parseRun(value: unknown): RunState | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Partial<RunState>;
  if (typeof candidate.t !== 'number' || typeof candidate.nextWakeT !== 'number' || typeof candidate.day !== 'number') {
    return null;
  }
  if (typeof candidate.battery !== 'number' || !Array.isArray(candidate.clues)) return null;
  return { ...DEFAULT_RUN, ...candidate };
}

function makeNotice(run: RunState, key: string, at: number, notice: { appId: string; title: string; body: string }): Notice {
  return {
    id: `${key}-${at}`,
    appId: notice.appId,
    title: notice.title,
    body: notice.body,
    time: clockOf(at),
    arriveAt: at + (run.battery <= LOW_POWER_LINE ? LOW_POWER_DELAY : 0),
    queued: run.dnd,
  };
}

function applyCrossings(run: RunState, crossings: Crossing[]): RunState {
  return crossings.reduce<RunState>((acc, crossing) => {
    if (crossing.kind === 'recessStart') {
      if (isRecessSkipped(acc, crossing.recessIndex)) return acc;
      return { ...acc, notices: [...acc.notices, makeNotice(acc, `recess${crossing.recessIndex}`, crossing.at, notices.recess)] };
    }
    if (crossing.kind === 'dismissal') {
      return { ...acc, notices: [...acc.notices, makeNotice(acc, 'dismissal', crossing.at, notices.dismissal)] };
    }
    if (acc.nightCutPlayed) return acc;
    return {
      ...acc,
      nightCutPending: true,
      notices: [...acc.notices, makeNotice(acc, 'tip', crossing.at, notices.tipPost)],
    };
  }, run);
}

function normalize(run: RunState): RunState {
  let next = run;
  if (next.remitStatus === 'open' && next.t >= REMIT_EXPIRES_T) {
    next = { ...next, remitStatus: 'expired' };
  }
  const { sanghyuk } = next;
  if (sanghyuk.openedAt !== null && sanghyuk.answeredAt === null && !sanghyuk.ignored && next.t >= sanghyuk.openedAt + DAY_MIN) {
    next = {
      ...next,
      ignores: next.ignores + 1,
      mind: next.mind + (next.activityStatus ? effects.ignoredWhileActive.mind : 0),
      sanghyuk: { ...sanghyuk, ignored: true },
    };
  }
  const overdue = Object.keys(next.dmReadAt).filter((threadId) => next.t >= next.dmReadAt[threadId] + DAY_MIN);
  if (overdue.length > 0) {
    const dmReadAt = { ...next.dmReadAt };
    overdue.forEach((threadId) => delete dmReadAt[threadId]);
    next = {
      ...next,
      dmReadAt,
      ignores: next.ignores + overdue.length,
      mind: next.mind + (next.activityStatus ? effects.ignoredWhileActive.mind * overdue.length : 0),
    };
  }
  next = { ...next, rumorPeak: Math.max(next.rumorPeak, next.rumor) };
  return settleSocial(settleKakaoEvents(settleDoubles(settleCalls(next))));
}

function wakeUp(run: RunState, extraMinutes: number, shutdownNow: boolean): RunState {
  const wokeAt = run.nextWakeT;
  const sleepDebt = run.sleptAt === null || run.sleptAt >= dayStartOf(run) + DEBT_LINE;
  const restored = run.charging ? CHARGED_BATTERY : round1(run.battery - NO_CHARGE_PENALTY);
  const shutdown = shutdownNow || restored <= 0;
  const day = run.day + 1;
  return normalize({
    ...run,
    day,
    nextWakeT: wokeAt + DAY_MIN,
    t: wokeAt + extraMinutes,
    battery: shutdown ? RESTART_BATTERY : restored,
    charging: false,
    sleptAt: null,
    sleepDebt,
    skipLastRecess: sleepDebt,
    booted: shutdown,
    notices: [...run.notices, ...onDayStart(day, wokeAt)],
    notificationsCleared: false,
    morning: { erasedThrice: run.erasedThrice, dndNight: run.dnd },
  });
}

export function advanceRun(run: RunState, minutes: number, batteryCost: number): RunState {
  const target = run.t + minutes;
  const wakeAt = run.nextWakeT;
  const charged: RunState = { ...run, battery: round1(run.battery - batteryCost) };
  const withEvents = applyCrossings(charged, crossingsBetween(run, run.t, Math.min(target, wakeAt)));
  if (withEvents.battery <= 0) return wakeUp({ ...withEvents, t: wakeAt }, 0, true);
  if (target >= wakeAt) return wakeUp({ ...withEvents, t: wakeAt }, target - wakeAt, false);
  return normalize({ ...withEvents, t: target });
}

export function openApp(run: RunState): RunState {
  return advanceRun(run, costs.appOpen.minutes, costs.appOpen.battery);
}

export function openDm(run: RunState): RunState {
  return advanceRun(run, costs.dmOpen.minutes, costs.dmOpen.battery);
}

export function sendDm(run: RunState, threadId: string): RunState {
  const dmReadAt = { ...run.dmReadAt };
  delete dmReadAt[threadId];
  return advanceRun({ ...run, dmReadAt }, costs.dmSend.minutes, costs.dmSend.battery);
}

export function openFeedPage(run: RunState): RunState {
  return advanceRun(run, costs.feedPage.minutes, costs.feedPage.battery);
}

export const MEMO_18_INDEX = 17;

export function openMemoApp(run: RunState): RunState {
  return addClue(run, CLUE_MEMO_APP);
}

export function readMemo(run: RunState, index: number): RunState {
  if (run.memoRead.includes(index)) return run;
  const next = advanceRun(run, costs.memoRead.minutes, costs.memoRead.battery);
  const courage = index === MEMO_18_INDEX ? next.courage + effects.memo18Unlock.courage : next.courage;
  return { ...next, courage, memoRead: [...next.memoRead, index] };
}

export function addClue(run: RunState, clueId: string): RunState {
  return run.clues.includes(clueId) ? run : { ...run, clues: [...run.clues, clueId] };
}

export function receiveRemit(run: RunState): RunState {
  if (run.remitStatus !== 'open') return run;
  return addClue(
    { ...run, remitStatus: 'received', courage: run.courage + effects.remitReceive.courage },
    CLUE_REMIT,
  );
}

export function openSanghyukRoom(run: RunState): RunState {
  const withClue = addClue(run, CLUE_FIRST_DM);
  if (withClue.sanghyuk.openedAt !== null) return withClue;
  return { ...withClue, sanghyuk: { ...withClue.sanghyuk, openedAt: withClue.t } };
}

export function answerSanghyuk(run: RunState, choice: 'why' | 'read'): RunState {
  if (run.sanghyuk.answeredAt !== null) return run;
  const next: RunState = {
    ...run,
    sanghyuk: { ...run.sanghyuk, choice, answeredAt: run.t },
  };
  if (choice === 'why' && !next.codex.includes(ENDING_A0)) {
    return { ...next, codex: [...next.codex, ENDING_A0] };
  }
  return next;
}

export function eraseDraft(run: RunState): RunState {
  const count = run.sanghyuk.draftErase + 1;
  return {
    ...run,
    sanghyuk: { ...run.sanghyuk, draftErase: count },
    erasedThrice: run.erasedThrice || count >= 3,
  };
}

export function goToSleep(run: RunState, charging: boolean): RunState {
  return { ...run, charging, sleptAt: run.t };
}

export function finishSleep(run: RunState): RunState {
  return advanceRun(run, run.nextWakeT - run.t, 0);
}

export function finishBoot(run: RunState): RunState {
  return { ...run, booted: false };
}

export function setDnd(run: RunState, dnd: boolean): RunState {
  return { ...run, dnd };
}

export function setActivityStatus(run: RunState, activityStatus: boolean): RunState {
  return { ...run, activityStatus };
}

export function markNightCutPlayed(run: RunState): RunState {
  return { ...run, nightCutPending: false, nightCutPlayed: true };
}

export function clearNotifications(run: RunState): RunState {
  return { ...run, notices: [], notificationsCleared: true };
}

export function openDmThread(run: RunState, threadId: string, hasUnread: boolean): RunState {
  const opened = openDm(run);
  const dmReadAt =
    hasUnread && opened.dmReadAt[threadId] === undefined ? { ...opened.dmReadAt, [threadId]: opened.t } : opened.dmReadAt;
  return { ...opened, dmReadAt, notices: opened.notices.filter((notice) => notice.threadId !== threadId) };
}

export function arriveDmNotice(
  run: RunState,
  notice: { id: string; threadId: string; title: string; body: string; at: number },
): RunState {
  if (run.notices.some((item) => item.id === notice.id)) return run;
  return {
    ...run,
    notices: [
      ...run.notices,
      {
        id: notice.id,
        appId: 'instagram',
        title: notice.title,
        body: notice.body,
        time: clockOf(notice.at),
        arriveAt: notice.at,
        queued: run.dnd,
        threadId: notice.threadId,
      },
    ],
  };
}

export function releaseOneNotice(run: RunState): RunState {
  const index = run.notices.findIndex((notice) => notice.queued);
  if (index < 0) return run;
  return { ...run, notices: run.notices.map((notice, i) => (i === index ? { ...notice, queued: false } : notice)) };
}

export function answerCall(run: RunState): RunState {
  const call = incomingCall(run);
  if (!call || run.battery < CALL_MIN_BATTERY) return run;
  return { ...run, activeCall: { id: call.id, step: 0, picks: [] }, callsDone: [...run.callsDone, call.id] };
}

export function declineCall(run: RunState): RunState {
  const call = incomingCall(run);
  return call ? missCall(run, call) : run;
}

export function hangUpCall(run: RunState): RunState {
  return { ...run, activeCall: null };
}

function dropCall(run: RunState): RunState {
  return {
    ...run,
    mind: clampStat(run.mind + CALL_DROP_MIND),
    battery: 0,
    activeCall: null,
    droppedAt: run.t,
    droppedCall: run.activeCall?.id ?? null,
  };
}

export function chargePhone(run: RunState): RunState {
  if (run.battery > 0) return run;
  return { ...run, battery: CHARGE_REVIVE_BATTERY, charging: true, booted: true };
}

export function callBack(run: RunState): RunState {
  if (!canCallBack(run) || run.droppedCall === null) return run;
  return {
    ...run,
    mind: clampStat(run.mind + Math.abs(CALL_DROP_MIND)),
    activeCall: { id: run.droppedCall, step: 0, picks: [] },
    droppedAt: null,
    droppedCall: null,
  };
}

export function stepCall(run: RunState, choice: number | null): RunState {
  const active = run.activeCall;
  if (!active) return run;
  const call: CallScript | null = findCall(active.id);
  const step = call?.steps?.[active.step];
  if (!call || !step) return run;

  let picked: CallChoice | null = null;
  if (step.type === 'choose') {
    picked = choice === null ? null : step.options[choice] ?? null;
    if (!picked) return run;
  }
  if (run.battery - CALL_STEP_BATTERY <= 0) return dropCall(run);

  const withEffects: RunState = picked
    ? {
        ...run,
        mind: clampStat(run.mind + picked.mind),
        courage: clampStat(run.courage + picked.courage),
        activeCall: { ...active, picks: [...active.picks, choice as number] },
      }
    : run;
  const advanced = advanceRun(withEffects, CALL_STEP_MIN, CALL_STEP_BATTERY);
  const nextIndex = active.step + 1;
  const ended = nextIndex >= (call.steps?.length ?? 0) || advanced.booted || advanced.day !== run.day;
  return { ...advanced, activeCall: ended ? null : { ...withEffects.activeCall ?? active, step: nextIndex } };
}

export function applyDmEffects(run: RunState, delta: { trust: number; courage: number; rumor: number }): RunState {
  return {
    ...run,
    mind: clampStat(run.mind + delta.trust),
    courage: clampStat(run.courage + delta.courage),
    rumor: clampStat(run.rumor + delta.rumor),
  };
}
