import { useEffect, useRef, useState } from 'react';
import PostCard, { type PostData, type PostState } from '@/components/apps/instagram/PostCard';
import { useGameState } from '@/state/GameState';
import { openFeedPage } from '@/state/runState';
import { posts as postData } from '@data/instagram';

const posts = postData as PostData[];

const PAGE_STEP = 5;

function initialStates(): Record<string, PostState> {
  return Object.fromEntries(posts.map((post) => [post.id, { liked: false, saved: false, likes: post.likes }]));
}

export default function InstagramFeed() {
  const { update } = useGameState();
  const [states, setStates] = useState(initialStates);
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

  function updateState(id: string, change: (state: PostState) => PostState) {
    setStates((current) => ({ ...current, [id]: change(current[id]) }));
  }

  const shown = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  return (
    <div ref={root} className="pan-y-scroll flex-1 overflow-y-auto overscroll-contain pb-10">
      {shown.map((post) => {
        const state = states[post.id];
        return (
          <PostCard
            key={post.id}
            post={post}
            state={state}
            onToggleLike={() =>
              updateState(post.id, (s) => ({
                ...s,
                liked: !s.liked,
                likes: s.liked ? s.likes - 1 : s.likes + 1,
              }))
            }
            onToggleSave={() => updateState(post.id, (s) => ({ ...s, saved: !s.saved }))}
          />
        );
      })}
      <div ref={sentinel} className="flex h-12 items-center justify-center text-[12px] text-[var(--fg-2)]">
        {hasMore ? '게시물을 불러오는 중' : '모든 게시물을 확인했습니다'}
      </div>
    </div>
  );
}
