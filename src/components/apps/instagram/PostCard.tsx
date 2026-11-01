import { useState } from 'react';
import { Bookmark, MessageCircle } from 'lucide-react';
import LikeHeart from '@/components/apps/instagram/LikeHeart';
import Avatar from '@/components/apps/Avatar';
import { commentChoices } from '@data/instagram';

export type PostData = {
  id: string;
  handle: string;
  avatar: string | null;
  place: string;
  time: string;
  caption: string;
  likes: number;
  tone: [string, string];
  kind: 'photo' | 'notice' | 'deleted';
  edited: string | null;
  comments: { handle: string; text: string }[];
};

type Props = {
  post: PostData;
  liked: boolean;
  saved: boolean;
  comment: string | null;
  commentCount: number;
  extraComments?: string[];
  onLike: () => void;
  onSave: () => void;
  onComment: (text: string) => void;
  onOpenAccount?: () => void;
};

function isDark(hex: string): boolean {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export default function PostCard({
  post,
  liked,
  saved,
  comment,
  commentCount,
  extraComments = [],
  onLike,
  onSave,
  onComment,
  onOpenAccount,
}: Props) {
  const [choosing, setChoosing] = useState(false);
  const likeCount = post.likes + (liked ? 1 : 0);
  const mediaInk = isDark(post.tone[0]) ? 'text-white' : 'text-[#111827]';
  const isNotice = post.kind === 'notice';
  const preview = post.comments.slice(0, 3);

  return (
    <article className="border-b border-[var(--line)] pb-3">
      <header className="flex items-center gap-2.5 px-3 py-2.5">
        <Avatar photo={post.avatar} label={post.handle} size={32} />
        <div className="min-w-0 flex-1">
          {onOpenAccount ? (
            <button type="button" onClick={onOpenAccount} className="truncate text-[13px] font-semibold hover:underline">
              {post.handle}
            </button>
          ) : (
            <p className="truncate text-[13px] font-semibold">{post.handle}</p>
          )}
          {(post.place || post.time) && (
            <p className="truncate text-[11px] text-[var(--fg-2)]">{[post.place, post.time].filter(Boolean).join(' · ')}</p>
          )}
        </div>
      </header>

      {post.kind === 'deleted' ? (
        <div className="mx-3 flex aspect-[4/3] items-center justify-center rounded-[14px] bg-[var(--card)] text-[13px] text-[var(--fg-2)]">
          삭제된 게시물입니다
        </div>
      ) : (
        <div
          className={`mx-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[14px] p-6 ${mediaInk}`}
          style={{ backgroundImage: `linear-gradient(160deg, ${post.tone[0]}, ${post.tone[1]})` }}
        >
          {isNotice && <p className="text-center text-[15px] leading-[1.6]">{post.caption}</p>}
        </div>
      )}

      <div className="flex items-center gap-4 px-3 pt-2.5">
        <LikeHeart liked={liked} onToggle={onLike} />
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--fg-2)]">
          <MessageCircle size={20} strokeWidth={2} aria-hidden="true" />
          {commentCount}
        </span>
        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? '저장 취소' : '저장'}
          className="ml-auto transition-transform active:scale-90"
        >
          <Bookmark size={21} strokeWidth={2} className={saved ? 'fill-[var(--fg)] text-[var(--fg)]' : 'text-[var(--fg)]'} />
        </button>
      </div>

      <div className="px-3">
        <p className="pt-1.5 text-[13px] font-semibold">좋아요 {likeCount.toLocaleString('ko-KR')}개</p>
        {!isNotice && post.kind === 'photo' && (
          <p className="pt-1 text-[13px] leading-[1.5]">
            <span className="font-semibold">{post.handle}</span> {post.caption}
          </p>
        )}
        {post.edited && <p className="text-[11px] text-[var(--fg-2)]">{post.edited}</p>}

        {(preview.length > 0 || extraComments.length > 0 || comment) && (
          <ul className="flex flex-col gap-0.5 pt-1.5 text-[13px] leading-[1.5]">
            {preview.map((item, index) => (
              <li key={`c-${index}`}>
                <span className="font-semibold">{item.handle}</span> {item.text}
              </li>
            ))}
            {extraComments.map((text, index) => (
              <li key={`x-${index}`}>
                <span className="font-semibold">{post.handle}</span> {text}
              </li>
            ))}
            {comment && (
              <li>
                <span className="font-semibold">나</span> {comment}
              </li>
            )}
          </ul>
        )}

        {!comment && post.kind !== 'deleted' && (
          <div className="pt-2">
            {choosing ? (
              <div className="flex flex-wrap gap-1.5">
                {commentChoices.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => onComment(text)}
                    className="rounded-full bg-[var(--card)] px-3 py-1.5 text-[12px] text-[var(--fg)] transition-transform active:scale-95"
                  >
                    {text}
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => setChoosing(true)} className="text-[12px] text-[var(--fg-2)]">
                댓글 달기
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
