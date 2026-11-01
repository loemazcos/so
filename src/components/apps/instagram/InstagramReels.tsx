import { useRef, useState, type UIEvent } from 'react';
import { Heart } from 'lucide-react';
import { useGameState } from '@/state/GameState';
import { toggleLike, watchReels } from '@/state/socialActions';
import { reels } from '@data/story/reels';

const REELS_PER_CHARGE = 5;

export default function InstagramReels() {
  const { run, update } = useGameState();
  const viewed = useRef(new Set<number>());
  const [index, setIndex] = useState(0);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const next = Math.round(element.scrollTop / element.clientHeight);
    if (next === index) return;
    setIndex(next);
    if (viewed.current.has(next)) return;
    viewed.current.add(next);
    if (viewed.current.size % REELS_PER_CHARGE === 0) {
      update(watchReels);
    }
  }

  return (
    <div onScroll={handleScroll} className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
      {reels.map((reel) => {
        const key = `reel-${reel.id}`;
        const liked = run.social.liked.includes(key);
        return (
          <section
            key={reel.id}
            className="relative flex h-full w-full snap-start snap-always items-end"
            style={{ backgroundImage: `linear-gradient(170deg, ${reel.tone[0]}, ${reel.tone[1]})` }}
          >
            <div className="flex w-full items-end justify-between gap-3 p-4 pb-[calc(env(safe-area-inset-bottom)+28px)] text-white">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold">{reel.handle}</p>
                <p className="pt-1.5 text-[16px] leading-[1.5]">{reel.caption}</p>
                {reel.likedBy && (
                  <p className="pt-2 text-[12px] text-white/80">{reel.likedBy}이(가) 좋아요 누름</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => update((current) => toggleLike(current, key))}
                aria-label={liked ? '좋아요 취소' : '좋아요'}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90"
              >
                <Heart size={26} strokeWidth={2} className={liked ? 'fill-[#E0457B] text-[#E0457B]' : ''} aria-hidden="true" />
                <span className="text-[12px]">{(reel.likes + (liked ? 1 : 0)).toLocaleString('ko-KR')}</span>
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
