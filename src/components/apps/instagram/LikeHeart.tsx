import { useState } from 'react';
import { Heart } from 'lucide-react';

type Props = { liked: boolean; onToggle: () => void };

export default function LikeHeart({ liked, onToggle }: Props) {
  const [pops, setPops] = useState(0);

  return (
    <button
      type="button"
      onClick={() => {
        setPops((count) => count + 1);
        onToggle();
      }}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      className="transition-transform active:scale-90"
    >
      <Heart
        key={pops}
        size={22}
        strokeWidth={2}
        className={`${liked ? 'fill-[#E0457B] text-[#E0457B]' : 'text-[var(--fg)]'} ${pops > 0 && liked ? 'heart-pop' : ''}`}
      />
    </button>
  );
}
