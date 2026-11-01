import { callFunction } from '@/lib/gameApi';
import { parseRun, type RunState } from '@/state/runState';

type LoadResponse = { gameState?: unknown };

export async function loadRun(): Promise<RunState | null> {
  const data = await callFunction<LoadResponse>('game-api', { action: 'load' });
  if (data.gameState === undefined || data.gameState === null) return null;
  const run = parseRun(data.gameState);
  if (!run) throw new Error('저장된 진행을 읽지 못했어요.');
  return run;
}

export async function saveRun(run: RunState): Promise<void> {
  await callFunction('game-api', { action: 'saveState', payload: { run } });
}
