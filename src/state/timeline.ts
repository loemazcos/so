import { formatClock } from '@/lib/gameTime';

export const DAY_MIN = 24 * 60;
export const START_T = 21 * 60 + 47;
export const FIRST_WAKE_T = DAY_MIN + 7 * 60;
export const SCHOOL_START = 60;
export const SCHOOL_END = 540;
export const RECESS_MINUTES = 10;
export const RECESS_STARTS = [180, 330, 480];
export const LAST_RECESS_INDEX = RECESS_STARTS.length - 1;
export const SLEEP_FROM = 900;
export const DEBT_LINE = 1140;
export const NIGHT_CUT_AT = 941;
export const MIDNIGHT_AT = 1020;
export const REMIT_EXPIRES_T = DAY_MIN;
export const LOW_POWER_LINE = 20;
export const LOW_BATTERY_LINE = 10;
export const LOW_POWER_DELAY = 30;
export const CHARGED_BATTERY = 100;
export const NO_CHARGE_PENALTY = 10;
export const RESTART_BATTERY = 5;

export type Phase = 'school' | 'recess' | 'free';
export type Crossing = { at: number; kind: 'recessStart' | 'dismissal' | 'nightCut'; recessIndex: number };
export type Notice = {
  id: string;
  appId: string;
  title: string;
  body: string;
  time: string;
  arriveAt: number;
  queued?: boolean;
  threadId?: string;
};
export type ClockRun = { t: number; nextWakeT: number; skipLastRecess: boolean };

const CROSSING_OFFSETS: { offset: number; kind: Crossing['kind']; recessIndex: number }[] = [
  ...RECESS_STARTS.map((offset, recessIndex) => ({ offset, kind: 'recessStart' as const, recessIndex })),
  { offset: SCHOOL_END, kind: 'dismissal', recessIndex: -1 },
  { offset: NIGHT_CUT_AT, kind: 'nightCut', recessIndex: -1 },
];

export function dateOf(t: number): Date {
  return new Date(2026, 9, 14, 0, t);
}

export function clockOf(t: number): string {
  return formatClock(dateOf(t));
}

export function dayStartOf(run: ClockRun): number {
  return run.nextWakeT - DAY_MIN;
}

export function minutesIntoDay(run: ClockRun): number {
  return run.t - dayStartOf(run);
}

export function isRecessSkipped(run: ClockRun, index: number): boolean {
  return run.skipLastRecess && index === LAST_RECESS_INDEX;
}

export function phaseOf(run: ClockRun): Phase {
  const rel = minutesIntoDay(run);
  if (rel < SCHOOL_START || rel >= SCHOOL_END) return 'free';
  const inRecess = RECESS_STARTS.some(
    (start, index) => rel >= start && rel < start + RECESS_MINUTES && !isRecessSkipped(run, index),
  );
  return inRecess ? 'recess' : 'school';
}

export function minutesUntilNextBreak(run: ClockRun): number {
  const rel = minutesIntoDay(run);
  const next = RECESS_STARTS.find((start, index) => start > rel && !isRecessSkipped(run, index)) ?? SCHOOL_END;
  return next - rel;
}

export function crossingsBetween(run: ClockRun, from: number, to: number): Crossing[] {
  const start = dayStartOf(run);
  return CROSSING_OFFSETS.map((c) => ({ at: start + c.offset, kind: c.kind, recessIndex: c.recessIndex })).filter(
    (c) => c.at > from && c.at <= to,
  );
}
