import { Users } from 'lucide-react';
import { previewOf, type KakaoRoom } from '@/lib/kakao';

type Props = { rooms: KakaoRoom[]; onOpen: (id: string) => void };

export default function KakaoRoomList({ rooms, onOpen }: Props) {
  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="px-4 pb-2 pt-[calc(env(safe-area-inset-top)+58px)]">
        <p className="text-[26px] font-bold leading-[1.2]">채팅</p>
      </header>
      <ul className="pan-y-scroll flex flex-1 flex-col overflow-y-auto pb-4">
        {rooms.map((room) => {
          const last = room.messages[room.messages.length - 1];
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onOpen(room.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-[var(--card)]"
              >
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-[var(--card)] text-[var(--fg-2)]">
                  <Users size={22} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[15px] font-semibold">{room.name}</p>
                    <span className="shrink-0 text-[12px] text-[var(--fg-2)]">{room.memberCount}</span>
                  </div>
                  <p className="truncate text-[13px] text-[var(--fg-2)]">{previewOf(last)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-[11px] text-[var(--fg-2)]">{last?.time}</p>
                  {room.unread > 0 && (
                    <span className="flex min-w-[20px] items-center justify-center rounded-full bg-[#FEE500] px-1.5 py-[1px] text-[11px] font-bold text-[#191919]">
                      {room.unread}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
