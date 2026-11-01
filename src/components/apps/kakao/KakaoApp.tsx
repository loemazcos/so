import { useMemo, useState } from 'react';
import KakaoRoomList from '@/components/apps/kakao/KakaoRoomList';
import KakaoRoomChat from '@/components/apps/kakao/KakaoRoomChat';
import { kakaoRooms, type KakaoMessage, type KakaoRoom } from '@/lib/kakao';

export default function KakaoApp() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [sent, setSent] = useState<Record<string, KakaoMessage[]>>({});
  const [votes, setVotes] = useState<Record<string, number>>({});

  const rooms = useMemo<KakaoRoom[]>(
    () =>
      kakaoRooms.map((room) => ({
        ...room,
        unread: readIds.includes(room.id) ? 0 : room.unread,
        messages: [...room.messages, ...(sent[room.id] ?? [])],
      })),
    [readIds, sent],
  );

  const activeRoom = rooms.find((room) => room.id === openId) ?? null;

  if (activeRoom) {
    return (
      <KakaoRoomChat
        room={activeRoom}
        votes={votes}
        onBack={() => setOpenId(null)}
        onVote={(messageId, optionIndex) => setVotes((current) => ({ ...current, [messageId]: optionIndex }))}
        onSend={(text) =>
          setSent((current) => ({
            ...current,
            [activeRoom.id]: [
              ...(current[activeRoom.id] ?? []),
              { id: `sent-${Date.now()}`, date: '2026-10-14', time: '방금', from: 'me', type: 'text', text },
            ],
          }))
        }
      />
    );
  }

  return (
    <KakaoRoomList
      rooms={rooms}
      onOpen={(id) => {
        setReadIds((current) => (current.includes(id) ? current : [...current, id]));
        setOpenId(id);
      }}
    />
  );
}
