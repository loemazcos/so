import { doublesPrompts } from '@data/story/doubles';
import { advanceRun, type RunState } from '@/state/runState';
import { DAY_MIN } from '@/state/timeline';
import { clampStat } from '@/state/stats';

const REPLY_HOUR_MIN = 9 * 60;
const GO_MINUTES = 10;

function findPrompt(id: string) {
  return doublesPrompts.find((prompt) => prompt.id === id) ?? null;
}

export function chooseDoublesGo(run: RunState, id: string): RunState {
  if (!findPrompt(id) || run.doubles.answered[id]) return run;
  const next: RunState = {
    ...run,
    courage: clampStat(run.courage + 5),
    doubles: { ...run.doubles, answered: { ...run.doubles.answered, [id]: 'go' } },
  };
  return advanceRun(next, GO_MINUTES, 0);
}

export function chooseDoublesSick(run: RunState, id: string): RunState {
  if (!findPrompt(id) || run.doubles.answered[id]) return run;
  return {
    ...run,
    courage: clampStat(run.courage - 3),
    mind: clampStat(run.mind - 2),
    doubles: { ...run.doubles, answered: { ...run.doubles.answered, [id]: 'sick' } },
  };
}

export function finishRhythm(run: RunState, id: string, successes: number | null): RunState {
  const prompt = findPrompt(id);
  if (!prompt || run.doubles.answered[id] !== 'go' || run.doubles.results[id] !== undefined) return run;
  const results = { ...run.doubles.results, [id]: successes ?? -1 };
  if (successes === null) {
    return { ...run, mind: clampStat(run.mind + 1), doubles: { ...run.doubles, results } };
  }
  const text = successes === 3 ? '손목 괜찮냐. …잘 치네.' : '손목 괜찮냐';
  const reply = { id, at: prompt.day * DAY_MIN + REPLY_HOUR_MIN, text };
  return {
    ...run,
    mind: clampStat(run.mind + successes),
    doubles: { ...run.doubles, results, replies: [...run.doubles.replies, reply] },
  };
}
