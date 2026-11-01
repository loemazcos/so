import { REMIT_EXPIRES_T } from '@/state/timeline';
import type { RunState } from '@/state/runState';

export function remainingMinutes(t: number): number {
  return Math.max(0, REMIT_EXPIRES_T - t);
}

export function formatRemain(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}시간 ${rest}분` : `${rest}분`;
}

export function remitBody(run: Pick<RunState, 'remitStatus' | 't'>): string {
  if (run.remitStatus === 'expired') return '만료된 송금';
  if (run.remitStatus === 'received') return '받은 송금';
  return `상혁님이 1원을 보냈어요 · ${formatRemain(remainingMinutes(run.t))} 후 만료`;
}
