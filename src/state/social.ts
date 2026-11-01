import type { RunState } from '@/state/runState';
import { DAY_MIN, clockOf, type Notice } from '@/state/timeline';
import { rumorPosts } from '@data/story/rumors';

export type SocialState = {
  liked: string[];
  saved: string[];
  comments: Record<string, string>;
  rumorSeen: string[];
  rumorNotes: string[];
  tiplineDay: number | null;
  account: 'main' | 'sub';
  subHeartDay: number | null;
  subHeartDelivered: boolean;
};

export const DEFAULT_SOCIAL: SocialState = {
  liked: [],
  saved: [],
  comments: {},
  rumorSeen: [],
  rumorNotes: [],
  tiplineDay: null,
  account: 'main',
  subHeartDay: null,
  subHeartDelivered: false,
};

export const SUB_ACCOUNT_DAY = 4;
export const SANGHYUK_HANDLE = 'sanghyuk.gym';
export const SUB_HANDLE = 'xclovts';
export const MAIN_HANDLE = 'taesan.k';
export const RUMOR_HANDLE = 'bonego_tip_line';

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function dayIndex(t: number): number {
  return Math.floor(t / DAY_MIN) + 1;
}

export function minuteOfDay(t: number): number {
  return t % DAY_MIN;
}

function parseClock(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function rumorAt(post: { day: number; time: string }): number {
  return (post.day - 1) * DAY_MIN + parseClock(post.time);
}

export function visibleRumorPosts(t: number) {
  return rumorPosts.filter((post) => rumorAt(post) <= t);
}

export function isNightForSanghyuk(t: number): boolean {
  const minute = minuteOfDay(t);
  return minute >= 21 * 60 || minute < 3 * 60;
}

export function settleSocial(run: RunState): RunState {
  let next = run;

  const seen = new Set(next.social.rumorSeen);
  const arriving = rumorPosts.filter((post) => !seen.has(post.id) && rumorAt(post) <= next.t);
  if (arriving.length > 0) {
    const delta = arriving.reduce((sum, post) => sum + post.rumorDelta, 0);
    next = {
      ...next,
      rumor: clamp(next.rumor + delta),
      social: { ...next.social, rumorSeen: [...next.social.rumorSeen, ...arriving.map((post) => post.id)] },
    };
  }

  const { subHeartDay, subHeartDelivered } = next.social;
  if (subHeartDay !== null && !subHeartDelivered && dayIndex(next.t) > subHeartDay) {
    const notice: Notice = {
      id: 'sanghyuk-sub-heart',
      appId: 'instagram',
      title: '상혁',
      body: '그 계정 누구냐ㅋㅋ. 모르는 사람이 하트를 눌렀더라.',
      time: clockOf(next.t),
      arriveAt: next.t,
      queued: next.dnd,
      threadId: 'sanghyuk',
    };
    next = {
      ...next,
      mind: clamp(next.mind + 1),
      notices: [...next.notices, notice],
      social: { ...next.social, subHeartDelivered: true },
    };
  }

  return next;
}
