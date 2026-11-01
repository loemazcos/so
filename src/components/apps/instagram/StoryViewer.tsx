import { useState } from 'react';
import { ChevronLeft, Heart, MessageCircle } from 'lucide-react';
import Avatar from '@/components/apps/Avatar';
import { useGameState } from '@/state/GameState';
import { dayIndex, MAIN_HANDLE, SANGHYUK_HANDLE, SUB_ACCOUNT_DAY, SUB_HANDLE } from '@/state/social';
import { heartStory } from '@/state/socialActions';
import { sanghyukStory } from '@data/instagram';

type Account = 'main' | 'sub';

type Props = {
  onClose: () => void;
  onReply: () => void;
};

export default function StoryViewer({ onClose, onReply }: Props) {
  const { run, update } = useGameState();
  const [account, setAccount] = useState<Account | null>(null);
  const [hearted, setHearted] = useState(false);
  const subAllowed = dayIndex(run.t) >= SUB_ACCOUNT_DAY;

  function viewAs(next: Account) {
    setAccount(next);
  }

  function heart() {
    if (!account || hearted) return;
    update((current) => heartStory(current, account));
    setHearted(true);
  }

  if (account === null) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/70 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="flex flex-col gap-2 rounded-[22px] bg-[var(--card)] p-4 shadow-xl">
          <p className="text-center text-[14px] font-semibold text-[var(--fg)]">어느 계정으로 볼까요?</p>
          <button
            type="button"
            onClick={() => viewAs('main')}
            className="h-11 rounded-full bg-[#0A84FF] text-[14px] font-semibold text-white transition-transform active:scale-[0.98]"
          >
            본계정으로 보기 ({MAIN_HANDLE})
          </button>
          <button
            type="button"
            onClick={() => viewAs('sub')}
            disabled={!subAllowed}
            className="h-11 rounded-full bg-[var(--bg,#fff)] text-[14px] font-semibold text-[var(--fg)] transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {subAllowed ? `부계정으로 보기 (${SUB_HANDLE})` : '부계정은 4일차부터 쓸 수 있어요'}
          </button>
          <button type="button" onClick={onClose} className="h-9 text-[13px] text-[var(--fg-2)]">
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col text-white"
      style={{ backgroundImage: `linear-gradient(170deg, ${sanghyukStory.tone[0]}, ${sanghyukStory.tone[1]})` }}
    >
      <header className="flex items-center gap-2.5 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+52px)]">
        <button type="button" onClick={onClose} aria-label="닫기" className="p-1">
          <ChevronLeft size={24} strokeWidth={2} aria-hidden="true" />
        </button>
        <Avatar photo="상혁" label={SANGHYUK_HANDLE} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{SANGHYUK_HANDLE}</p>
          <p className="text-[11px] text-white/70">{sanghyukStory.postedAgo}</p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-8">
        <p className="text-center text-[20px] font-semibold leading-[1.5]">{sanghyukStory.caption}</p>
      </div>

      <footer className="flex items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3">
        <button
          type="button"
          onClick={heart}
          disabled={hearted}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 text-[14px] font-semibold transition-transform active:scale-95 disabled:opacity-80"
        >
          <Heart size={18} strokeWidth={2} className={hearted ? 'fill-[#E0457B] text-[#E0457B]' : ''} aria-hidden="true" />
          {hearted ? '하트 보냄' : '하트'}
        </button>
        <button
          type="button"
          onClick={onReply}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 text-[14px] font-semibold transition-transform active:scale-95"
        >
          <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
          답장
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-11 flex-1 rounded-full bg-white/15 text-[14px] font-semibold transition-transform active:scale-95"
        >
          넘기기
        </button>
      </footer>
    </div>
  );
}
