import type { RunState } from '@/state/runState';
import { addKakaoMessage } from '@/state/kakaoEvents';
import { openConsult, type ConsultEffect, type ConsultRoom } from '@/state/consults';
import { clampStat } from '@/state/stats';

const SENDER: Record<ConsultRoom, string> = { donghyun: '동현', jaehyun: '재현' };

export function chooseConsult(run: RunState, room: ConsultRoom): RunState {
  const entry = openConsult(run.consult, run.t);
  if (!entry) return run;
  const effect: ConsultEffect = entry[room];
  const next: RunState = {
    ...run,
    consult: {
      answered: { ...run.consult.answered, [entry.no]: room },
      unlocks: effect.unlock ? [...run.consult.unlocks, effect.unlock] : run.consult.unlocks,
    },
    courage: clampStat(run.courage + (effect.courage ?? 0)),
    mind: clampStat(run.mind + (effect.mind ?? 0)),
    rumor: clampStat(run.rumor + (effect.rumor ?? 0)),
    clues: effect.clue && !run.clues.includes(effect.clue) ? [...run.clues, effect.clue] : run.clues,
  };
  const withChoice = addKakaoMessage(next, { id: `consult-${entry.no}-me`, room, from: 'me', type: 'text', text: '응, 상담 받을게' }, run.t);
  if (!effect.line) return withChoice;
  return addKakaoMessage(withChoice, { id: `consult-${entry.no}`, room, from: SENDER[room], type: 'text', text: effect.line }, run.t);
}

export function voteUniform(run: RunState, choice: 1 | 2): RunState {
  if (run.uniform !== null) return run;
  const text = choice === 1 ? '1번 후드? 의외다ㅋㅋ' : '바람막이 쪽이구나. 나도 그거 낌';
  return addKakaoMessage({ ...run, uniform: choice }, { id: 'uniform-reaction', room: 'class', from: '동현', type: 'text', text }, run.t);
}
