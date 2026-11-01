import Avatar from '@/components/apps/Avatar';
import type { PostData } from '@/components/apps/instagram/PostCard';
import { useGameState } from '@/state/GameState';
import { dayIndex, MAIN_HANDLE, SUB_ACCOUNT_DAY, SUB_HANDLE } from '@/state/social';
import { setAccount } from '@/state/socialActions';
import { posts as postData } from '@data/instagram';
import { reels } from '@data/story/reels';

const posts = postData as PostData[];

export default function InstagramProfile() {
  const { run, update } = useGameState();
  const { account, liked } = run.social;
  const subAllowed = dayIndex(run.t) >= SUB_ACCOUNT_DAY;
  const handle = account === 'sub' ? SUB_HANDLE : MAIN_HANDLE;
  const ownPosts = posts.filter((post) => post.handle === handle);

  const activity = liked
    .map((id) => {
      if (id.startsWith('reel-')) {
        const reel = reels.find((item) => `reel-${item.id}` === id);
        return reel ? { id, handle: reel.handle, text: reel.caption } : null;
      }
      const post = posts.find((item) => item.id === id);
      return post ? { id, handle: post.handle, text: post.caption } : null;
    })
    .filter((item): item is { id: string; handle: string; text: string } => item !== null)
    .reverse();

  return (
    <div className="pan-y-scroll flex h-full flex-col overflow-y-auto pb-10">
      <header className="flex items-center gap-5 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+58px)]">
        <Avatar photo={null} label={handle} size={72} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold">{handle}</p>
          <p className="pt-1 text-[12px] text-[var(--fg-2)]">게시물 {ownPosts.length}개</p>
        </div>
      </header>

      <div className="px-4 pb-4">
        <div className="flex rounded-full bg-[var(--card)] p-1">
          <button
            type="button"
            onClick={() => update((current) => setAccount(current, 'main'))}
            className={`h-8 flex-1 rounded-full text-[13px] font-semibold transition-colors ${
              account === 'main' ? 'bg-[var(--bg,#fff)] text-[var(--fg)] shadow-sm' : 'text-[var(--fg-2)]'
            }`}
          >
            본계정
          </button>
          <button
            type="button"
            onClick={() => update((current) => setAccount(current, 'sub'))}
            disabled={!subAllowed}
            className={`h-8 flex-1 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-40 ${
              account === 'sub' ? 'bg-[var(--bg,#fff)] text-[var(--fg)] shadow-sm' : 'text-[var(--fg-2)]'
            }`}
          >
            {subAllowed ? '부계정' : '부계정 (4일차부터)'}
          </button>
        </div>
      </div>

      {ownPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5">
          {ownPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square"
              style={{ backgroundImage: `linear-gradient(160deg, ${post.tone[0]}, ${post.tone[1]})` }}
            />
          ))}
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-[13px] text-[var(--fg-2)]">아직 올린 게시물이 없어요</p>
      )}

      <section className="px-4 pt-6">
        <h2 className="pb-2 text-[14px] font-semibold">활동 기록</h2>
        {activity.length === 0 ? (
          <p className="py-4 text-[13px] text-[var(--fg-2)]">좋아요를 누른 게시물이 여기에 쌓여요</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--line)]">
            {activity.map((item) => (
              <li key={item.id} className="py-2.5">
                <p className="text-[12px] font-semibold">{item.handle}</p>
                <p className="truncate text-[13px] text-[var(--fg-2)]">{item.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
