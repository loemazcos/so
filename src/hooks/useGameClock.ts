import { dateOf } from '@/state/timeline';
import { useGameState } from '@/state/GameState';

export function useGameClock(): Date {
  const { run } = useGameState();
  return dateOf(run.t);
}
