import { useState } from 'react';
import { ChevronLeft, Megaphone, Send } from 'lucide-react';
import KakaoMessageItem from '@/components/apps/kakao/KakaoMessageItem';
import { useReportScreen } from '@/components/phone/ScreenReport';
import { formatDayLabel, type KakaoRoom } from '@/lib/kakao';

type Props = {
  room: KakaoRoom;
  votes: Record<string, number>;
  onBack: () => void;
  onSend: (text: string) => void;
  onVote: (messageId: string, optionIndex: number) => void;
};

export default function KakaoRoomChat({ room, votes, onBack, onSend, onVote }: Props) {
  const [draft, setDraft] = useState('');
  useReportScreen({
    screen: '카톡',
    title: room.name,
    lines: room.messages.filter((message) => message.type === 'text' && message.text).slice(-3).map((message) => message.text ?? ''),
  });
  const notice = [...room.messages].reverse().find((message) => message.type === 'notice');

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="flex items-center gap-2 border-b border-[var(--line)] px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+58px)]">
        <button type="button" onClick={onBack} aria-label="채팅 목록으로" className="p-1 text-[var(--fg)]">
          <ChevronLeft size={26} strokeWidth={2} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{room.name}</p>
          <p className="text-[11px] text-[var(--fg-2)]">{room.memberCount}명</p>
        </div>
      </header>

      {notice && (
        <div className="mx-3 mt-2 flex items-start gap-2 rounded-[12px] bg-[var(--card)] px-3 py-2">
          <Megaphone size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--fg-2)]" aria-hidden="true" />
          <p className="line-clamp-2 text-[12px] leading-[1.4] text-[var(--fg)]">{notice.text}</p>
        </div>
      )}

      <div className="pan-y-scroll flex flex-1 flex-col overflow-y-auto px-3 py-3">
        {room.messages.map((message, index) => {
          const previous = room.messages[index - 1];
          const showDate = !previous || previous.date !== message.date;
          const showSender = room.memberCount > 2 && (!previous || previous.from !== message.from || showDate);
          return (
            <div key={message.id}>
              {showDate && (
                <p className="my-3 text-center text-[11px] text-[var(--fg-2)]">{formatDayLabel(message.date)}</p>
              )}
              <KakaoMessageItem
                message={message}
                showSender={showSender}
                chosenOption={votes[message.id]}
                onVote={(optionIndex) => onVote(message.id, optionIndex)}
              />
            </div>
          );
        })}
      </div>

      <form
        className="flex items-center gap-2 border-t border-[var(--line)] px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="메시지 입력"
          className="h-10 flex-1 rounded-full bg-[var(--card)] px-4 text-[15px] outline-none placeholder:text-[var(--fg-2)]"
        />
        <button
          type="submit"
          aria-label="보내기"
          disabled={!draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEE500] text-[#191919] transition-opacity disabled:opacity-40"
        >
          <Send size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
