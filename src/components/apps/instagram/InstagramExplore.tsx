import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Avatar from '@/components/apps/Avatar';
import type { PostData } from '@/components/apps/instagram/PostCard';
import { useGameState } from '@/state/GameState';
import { dayIndex, RUMOR_HANDLE, SANGHYUK_HANDLE, SUB_HANDLE } from '@/state/social';
import { posts as postData } from '@data/instagram';

const posts = postData as PostData[];
const ACCEPT_DAY = 4;

type Props = {
  onOpenRumor: () => void;
};

export default function InstagramExplore({ onOpenRumor }: Props) {
  const { run } = useGameState();
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  const accounts = useMemo(() => {
    const handles = Array.from(new Set(posts.map((post) => post.handle)));
    return handles.map((handle) => {
      const sample = posts.find((post) => post.handle === handle);
      return { handle, avatar: sample?.avatar ?? null, place: sample?.place ?? '' };
    });
  }, []);

  const hashtags = useMemo(
    () => Array.from(new Set(posts.map((post) => post.place).filter(Boolean))).map((place) => `#${place}`),
    [],
  );

  const matchedAccounts = term
    ? accounts.filter((account) => account.handle.toLowerCase().includes(term))
    : [];
  const matchedTags = term ? hashtags.filter((tag) => tag.toLowerCase().includes(term)) : [];
  const accepted = dayIndex(run.t) >= ACCEPT_DAY;

  function openPost(post: PostData) {
    if (post.handle === RUMOR_HANDLE) onOpenRumor();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-2 pt-[calc(env(safe-area-inset-top)+58px)]">
        <label className="flex h-10 items-center gap-2 rounded-[12px] bg-[var(--card)] px-3">
          <Search size={16} strokeWidth={2} className="text-[var(--fg-2)]" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="계정, 해시태그 검색"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--fg-2)]"
          />
        </label>
      </div>

      {term ? (
        <ul className="pan-y-scroll flex-1 overflow-y-auto px-3">
          {matchedAccounts.map((account) => (
            <li key={account.handle}>
              <button
                type="button"
                onClick={() => account.handle === RUMOR_HANDLE && onOpenRumor()}
                className="flex w-full items-center gap-3 py-2.5 text-left"
              >
                <Avatar photo={account.avatar} label={account.handle} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{account.handle}</p>
                  {account.handle === SUB_HANDLE && accepted && (
                    <p className="text-[11px] text-[var(--fg-2)]">{SANGHYUK_HANDLE}님이 팔로우 요청을 수락했습니다</p>
                  )}
                </div>
              </button>
            </li>
          ))}
          {matchedTags.map((tag) => (
            <li key={tag} className="flex items-center gap-3 py-2.5 text-[14px] font-semibold">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)]">#</span>
              {tag}
            </li>
          ))}
          {matchedAccounts.length === 0 && matchedTags.length === 0 && (
            <li className="py-10 text-center text-[13px] text-[var(--fg-2)]">검색 결과가 없어요</li>
          )}
        </ul>
      ) : (
        <div className="pan-y-scroll grid flex-1 grid-cols-3 gap-0.5 overflow-y-auto">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => openPost(post)}
              aria-label={`${post.handle} 게시물`}
              className="relative aspect-square overflow-hidden transition-opacity active:opacity-80"
              style={{ backgroundImage: `linear-gradient(160deg, ${post.tone[0]}, ${post.tone[1]})` }}
            >
              {post.kind === 'notice' && (
                <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] leading-[1.4] text-white">
                  {post.caption.slice(0, 40)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
