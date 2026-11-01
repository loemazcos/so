import { useState } from 'react';
import { Bookmark, Heart, ImageIcon, MapPin, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import Avatar from '@/components/apps/Avatar';

type Comment = { handle: string; text: string };

function isLightHex(hex: string): boolean {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

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
  comments: Comment[];
};

export type PostState = { liked: boolean; saved: boolean; likes: number };

type Props = {
  post: PostData;
  state: PostState;
  onToggleLike: () => void;
  onToggleSave: () => void;
};

export default function PostCard({ post, state, onToggleLike, onToggleSave }: Props) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [heartKey, setHeartKey] = useState(0);
  const isDeleted = post.kind === 'deleted';
  const inkClass = isLightHex(post.tone[0]) ? 'text-[#1c1c1e]' : 'text-white';

  function likeFromDoubleTap() {
    if (!state.liked) onToggleLike();
    setHeartKey((key) => key + 1);
  }

  function submitComment() {
    const text = draft.trim();
    if (!text) return;
    setComments((list) => [...list, { handle: 'taesan.k', text }]);
    setDraft('');
  }

  return (
    <article className="border-b border-[var(--line)] pb-3">
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar photo={post.avatar} label={post.handle} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-tight">{post.handle}</p>
          {post.place ? (
            <p className="flex items-center gap-0.5 truncate text-[12px] text-[var(--fg-2)]">
              <MapPin size={11} strokeWidth={2} aria-hidden="true" />
              {post.place}
            </p>
          ) : null}
        </div>
      </header>

      {isDeleted ? (
        <div className="mx-4 flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-[4px] bg-[var(--card)] px-8 text-center">
          <Trash2 size={22} strokeWidth={1.6} className="text-[var(--fg-2)]" aria-hidden="true" />
          <p className="text-[15px] font-semibold">삭제된 게시물입니다</p>
          <p className="text-[12px] leading-[1.5] text-[var(--fg-2)]">캐시에 남은 미리보기: “{post.caption}”</p>
        </div>
      ) : (
        <div
          className="relative aspect-[4/5] w-full select-none overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${post.tone[0]}, ${post.tone[1]})` }}
          onDoubleClick={likeFromDoubleTap}
        >
          {post.kind === 'notice' ? (
            <p className={`absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-[17px] font-medium leading-[1.6] ${inkClass}`}>
              {post.caption}
            </p>
          ) : (
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-60 ${inkClass}`}>
              <ImageIcon size={40} strokeWidth={1.4} aria-hidden="true" />
              <p className="text-[12px]">사진 준비 중</p>
            </div>
          )}
          {heartKey > 0 ? (
            <Heart
              key={heartKey}
              size={96}
              strokeWidth={0}
              fill="#FFFFFF"
              className="phone-fade-in absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
              aria-hidden="true"
            />
          ) : null}
        </div>
      )}

      {isDeleted ? null : (
        <>
          <div className="flex items-center gap-4 px-4 pt-3">
            <button
              type="button"
              aria-label={state.liked ? '좋아요 취소' : '좋아요'}
              onClick={onToggleLike}
              className="transition-transform active:scale-90"
            >
              <Heart
                size={24}
                strokeWidth={1.8}
                className={state.liked ? 'fill-[#FF3B5C] text-[#FF3B5C]' : 'text-[var(--fg)]'}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              aria-label="댓글 보기"
              onClick={() => setCommentsOpen((open) => !open)}
              className="text-[var(--fg)] transition-transform active:scale-90"
            >
              <MessageCircle size={24} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={state.saved ? '저장 취소' : '저장'}
              onClick={onToggleSave}
              className="ml-auto text-[var(--fg)] transition-transform active:scale-90"
            >
              <Bookmark
                size={24}
                strokeWidth={1.8}
                className={state.saved ? 'fill-[var(--fg)]' : ''}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="px-4 pt-2 text-[14px] leading-[1.5]">
            <p className="font-semibold">좋아요 {state.likes.toLocaleString('ko-KR')}개</p>
            <p className="mt-1">
              <span className="font-semibold">{post.handle}</span> {post.caption}
            </p>
            {post.edited ? <p className="mt-1 text-[12px] text-[var(--fg-2)]">{post.edited}</p> : null}
            <p className="mt-1 flex items-center gap-1 text-[12px] uppercase tracking-[0.2px] text-[var(--fg-2)]">
              {post.edited ? <Pencil size={10} strokeWidth={2} aria-hidden="true" /> : null}
              {post.time}
            </p>
          </div>

          {commentsOpen ? (
            <div className="mt-2 flex flex-col gap-2 px-4 text-[13px] leading-[1.45]">
              {comments.map((comment, index) => (
                <p key={index}>
                  <span className="font-semibold">{comment.handle}</span> {comment.text}
                </p>
              ))}
              <form
                className="mt-1 flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitComment();
                }}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="댓글 달기"
                  className="h-9 flex-1 rounded-full bg-[var(--card)] px-4 text-[13px] outline-none placeholder:text-[var(--fg-2)]"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="text-[14px] font-semibold text-[var(--accent)] disabled:opacity-40"
                >
                  게시
                </button>
              </form>
            </div>
          ) : comments.length > 0 ? (
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              className="px-4 pt-1 text-left text-[13px] text-[var(--fg-2)]"
            >
              댓글 {comments.length}개 모두 보기
            </button>
          ) : null}
        </>
      )}
    </article>
  );
}
