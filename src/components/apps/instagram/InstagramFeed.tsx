import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/apps/Avatar';
import PostCard, { type PostData } from '@/components/apps/instagram/PostCard';
import { useGameState } from '@/state/GameState';
import { openFeedPage } from '@/state/runState';
import { isNightForSanghyuk, RUMOR_HANDLE, SANGHYUK_HANDLE, visibleRumorPosts } from '@/state/social';
import { setComment, toggleLike, toggleSave } from '@/state/socialActions';
import { posts as postData } from '@data/instagram';

const posts = postData as PostData[];
const PAGE_STEP = 5;

type Props = {
  onOpenRumor: () => void;
  onOpenStory: () => void;
};

export default function InstagramFeed({ onOpenRumor, onOpenStory }: Props) {
  const { run, update } = useGameState();
  const [visible, setVisible] = useState(PAGE_STEP);
  const sentinel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = sentinel.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          update(openFeedPage);
          setVisible((count) => Math.min(count + PAGE_STEP, posts.length));
        }
      },
      { root: root.current, rootMargin: '200px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [update]);

  const { social } = run;
  const rumorItems = visibleRumorPosts(run.t)
    .slice()
    .reverse()
    .map<PostData & { commentCount: number }>((rumor) => ({
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
      commentCount: Math.max(rumor.comments.length, Math.round(rumor.likes / 30)),
    }));
  const shown = posts.slice(0, visible);
  const hasMore = visible < posts.length;
  const sanghyukNight = isNightForSanghyuk(run.t);

  return (
    <div ref={root} className="pan-y-scroll flex-1 overflow-y-auto overscroll-contain pb-10">
      <div className="flex gap-3 overflow-x-auto px-3 py-3">
        <div className="flex w-16 shrink-0 flex-col items-center gap-1">
          <Avatar photo={null} label="태산" size={56} />
          <span className="text-[11px] text-[var(--fg-2)]">내 스토리</span>
        </div>
        <button
          type="button"
          onClick={onOpenStory}
          disabled={!sanghyukNight}
          aria-label="상혁 스토리 보기"
          className="flex w-16 shrink-0 flex-col items-center gap-1 transition-opacity disabled:opacity-40"
        >
          <span
            className={`rounded-full p-[2.5px] ${
              sanghyukNight ? 'bg-[linear-gradient(45deg,#FBC17D,#E0457B)]' : 'bg-[var(--line)]'
            }`}
          >
            <span className="block rounded-full border-2 border-[var(--bg,#fff)]">
              <Avatar photo="상혁" label={SANGHYUK_HANDLE} size={52} />
            </span>
          </span>
          <span className="text-[11px] text-[var(--fg-2)]">{SANGHYUK_HANDLE}</span>
        </button>
      </div>

      {rumorItems.map((item, index) => (
        <PostCard
          key={item.id}
          post={item}
          liked={social.liked.includes(item.id)}
          saved={social.saved.includes(item.id)}
          comment={social.comments[item.id] ?? null}
          commentCount={item.commentCount}
          extraComments={index === 0 ? social.rumorNotes : []}
          onLike={() => update((current) => toggleLike(current, item.id))}
          onSave={() => update((current) => toggleSave(current, item.id))}
          onComment={(text) => update((current) => setComment(current, item.id, text))}
          onOpenAccount={onOpenRumor}
        />
      ))}

      {shown.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          liked={social.liked.includes(post.id)}
          saved={social.saved.includes(post.id)}
          comment={social.comments[post.id] ?? null}
          commentCount={post.comments.length}
          onLike={() => update((current) => toggleLike(current, post.id))}
          onSave={() => update((current) => toggleSave(current, post.id))}
          onComment={(text) => update((current) => setComment(current, post.id, text))}
          onOpenAccount={post.handle === RUMOR_HANDLE ? onOpenRumor : undefined}
        />
      ))}

      <div ref={sentinel} className="flex h-12 items-center justify-center text-[12px] text-[var(--fg-2)]">
        {hasMore ? '게시물을 불러오는 중' : '모든 게시물을 확인했습니다'}
      </div>
    </div>
  );
}
