import { device } from '@data/device';
import { costs } from '@data/story/costs';
import { effects } from '@data/story/effects';
import { notices } from '@data/story/notices';
import { onDayStart } from '@/state/dayStart';
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
  nightCutPending: boolean;
  nightCutPlayed: boolean;
  notices: Notice[];
  notificationsCleared: boolean;
  codex: string[];
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
  nightCutPending: false,
  nightCutPlayed: false,
  notices: [],
  notificationsCleared: false,
  codex: [],
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
  return next;
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

export function sendDm(run: RunState): RunState {
  return advanceRun(run, costs.dmSend.minutes, costs.dmSend.battery);
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
