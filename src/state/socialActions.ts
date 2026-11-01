import { advanceRun, type RunState } from '@/state/runState';
import { dayIndex, SUB_ACCOUNT_DAY } from '@/state/social';
import { DAY_MIN, RECESS_STARTS, clockOf, dayStartOf, type Notice } from '@/state/timeline';
import { costs } from '@data/story/costs';
import { tipline } from '@data/story/tipline';

const clamp = (value: number) => Math.min(100, Math.max(0, value));

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function toggleLike(run: RunState, postId: string): RunState {
  return { ...run, social: { ...run.social, liked: toggle(run.social.liked, postId) } };
}

export function toggleSave(run: RunState, postId: string): RunState {
  return { ...run, social: { ...run.social, saved: toggle(run.social.saved, postId) } };
}

export function setComment(run: RunState, postId: string, text: string): RunState {
  if (run.social.comments[postId]) return run;
  return { ...run, social: { ...run.social, comments: { ...run.social.comments, [postId]: text } } };
}

export function setAccount(run: RunState, account: 'main' | 'sub'): RunState {
  if (account === 'sub' && dayIndex(run.t) < SUB_ACCOUNT_DAY) return run;
  return { ...run, social: { ...run.social, account } };
}

export function heartStory(run: RunState, account: 'main' | 'sub'): RunState {
  const subHeartDay = account === 'sub' && run.social.subHeartDay === null ? dayIndex(run.t) : run.social.subHeartDay;
  return {
    ...run,
    courage: clamp(run.courage + 2),
    mind: clamp(run.mind + 1),
    social: { ...run.social, subHeartDay },
  };
}

export function watchReels(run: RunState): RunState {
  return advanceRun(run, costs.reelBatch.minutes, costs.reelBatch.battery);
}

function nextRecessAt(run: RunState): number {
  const start = dayStartOf(run);
  const candidates = [0, 1].flatMap((day) => RECESS_STARTS.map((offset) => start + day * DAY_MIN + offset));
  return candidates.find((at) => at > run.t) ?? run.t + 1;
}

export function submitTipline(run: RunState, choiceId: string, roll: number): RunState {
  const today = dayIndex(run.t);
  const choice = tipline.choices.find((item) => item.id === choiceId);
  if (!choice || run.social.tiplineDay === today) return run;

  const next = advanceRun(run, tipline.cost.minutes, tipline.cost.battery);
  const social = { ...next.social, tiplineDay: today };

  if (choice.id === 'correct' && choice.backfire && roll < choice.backfire.chance) {
    return {
      ...next,
      rumor: clamp(next.rumor + choice.backfire.delta),
      social: { ...social, rumorNotes: [...social.rumorNotes, choice.backfire.note] },
    };
  }

  const rumor = clamp(next.rumor + choice.delta);
  if (choice.id === 'reveal' && choice.followUp) {
    const arriveAt = nextRecessAt(next);
    const notice: Notice = {
      id: `tip-followup-${today}`,
      appId: 'kakao',
      title: choice.followUp.title,
      body: choice.followUp.text,
      time: clockOf(arriveAt),
      arriveAt,
      queued: next.dnd,
    };
    return { ...next, rumor, notices: [...next.notices, notice], social };
  }

  return { ...next, rumor, social };
}
