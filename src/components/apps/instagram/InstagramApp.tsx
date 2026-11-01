import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import InstagramDm from '@/components/apps/instagram/InstagramDm';
import InstagramFeed from '@/components/apps/instagram/InstagramFeed';

export default function InstagramApp() {
  const [dmOpen, setDmOpen] = useState(false);

  if (dmOpen) return <InstagramDm onBack={() => setDmOpen(false)} />;

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="flex items-center justify-between px-4 pb-2.5 pt-[calc(env(safe-area-inset-top)+56px)]">
        <p className="text-[24px] font-bold tracking-[-0.5px]">인스타</p>
        <button
          type="button"
          aria-label="DM 열기"
          onClick={() => setDmOpen(true)}
          className="p-1 text-[var(--fg)] transition-transform active:scale-90"
        >
          <MessageSquare size={24} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </header>
      <InstagramFeed />
    </div>
  );
}
