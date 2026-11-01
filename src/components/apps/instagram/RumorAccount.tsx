import { useState } from 'react';
import { ChevronLeft, Megaphone } from 'lucide-react';
import PostCard, { type PostData } from '@/components/apps/instagram/PostCard';
import { useGameState } from '@/state/GameState';
import { dayIndex, RUMOR_HANDLE, visibleRumorPosts } from '@/state/social';
import { setComment, submitTipline, toggleLike, toggleSave } from '@/state/socialActions';
import { tipline } from '@data/story/tipline';

type Props = {
  onBack: () => void;
};

export default function RumorAccount({ onBack }: Props) {
  const { run, update } = useGameState();
  const [sheetOpen, setSheetOpen] = useState(false);
  const today = dayIndex(run.t);
  const tippedToday = run.social.tiplineDay === today;
  const { social } = run;

  const rumors = visibleRumorPosts(run.t).slice().reverse();

  function sendTip(choiceId: string) {
    update((current) => submitTipline(current, choiceId, Math.random()));
    setSheetOpen(false);
  }

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-[var(--line)] px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+58px)]">
        <button type="button" onClick={onBack} aria-label="뒤로" className="p-1 text-[var(--accent)]">
          <ChevronLeft size={26} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="flex-1 truncate text-[15px] font-semibold">{RUMOR_HANDLE}</p>
      </header>

      <div className="flex items-center gap-4 px-4 py-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0E0E12] text-white">
          <Megaphone size={26} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">보넥고 대신 전해드립니다</p>
          <p className="text-[12px] text-[var(--fg-2)]">학교 소문을 확인 중인 채로 전합니다</p>
        </div>
      </div>

      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          disabled={tippedToday}
          className="h-10 w-full rounded-full bg-[var(--card)] text-[14px] font-semibold text-[var(--fg)] transition-opacity disabled:opacity-40"
        >
          {tippedToday ? '오늘은 이미 제보했어요' : '제보하기'}
        </button>
      </div>

      <div className="pan-y-scroll flex-1 overflow-y-auto pb-10">
        {rumors.map((rumor, index) => {
          const post: PostData = {
            id: rumor.id,
            handle: RUMOR_HANDLE,
            avatar: null,
            place: '',
            time: `${rumor.day}일차 ${rumor.time}`,
            caption: rumor.text,
            likes: rumor.likes,
            tone: ['#2A2A33', '#0E0E12'],
            kind: 'notice',
            edited: null,
            comments: rumor.comments,
          };
          return (
            <PostCard
              key={rumor.id}
              post={post}
              liked={social.liked.includes(rumor.id)}
              saved={social.saved.includes(rumor.id)}
              comment={social.comments[rumor.id] ?? null}
              commentCount={Math.max(rumor.comments.length, Math.round(rumor.likes / 30))}
              extraComments={index === 0 ? social.rumorNotes : []}
              onLike={() => update((current) => toggleLike(current, rumor.id))}
              onSave={() => update((current) => toggleSave(current, rumor.id))}
              onComment={(text) => update((current) => setComment(current, rumor.id, text))}
            />
          );
        })}
      </div>

      {sheetOpen && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/60" onClick={() => setSheetOpen(false)}>
          <div
            role="dialog"
            aria-label="제보 선택"
            onClick={(event) => event.stopPropagation()}
            className="flex flex-col gap-2 rounded-t-[22px] bg-[var(--card)] p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"
          >
            <p className="pb-1 text-center text-[14px] font-semibold text-[var(--fg)]">어떻게 제보할까요?</p>
            <p className="pb-1 text-center text-[11px] text-[var(--fg-2)]">하루에 한 번만 보낼 수 있어요 · 2분 소요</p>
            {tipline.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => sendTip(choice.id)}
                className="h-11 rounded-full bg-[var(--bg,#fff)] text-[14px] font-semibold text-[var(--fg)] transition-transform active:scale-[0.98]"
              >
                {choice.label}
              </button>
            ))}
            <button type="button" onClick={() => setSheetOpen(false)} className="h-9 text-[13px] text-[var(--fg-2)]">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
