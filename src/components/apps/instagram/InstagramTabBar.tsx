import { Clapperboard, Home, Search, Send, UserRound } from 'lucide-react';

export type InstagramTab = 'home' | 'explore' | 'reels' | 'dm' | 'profile';

const TABS: { id: InstagramTab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'explore', label: '탐색', Icon: Search },
  { id: 'reels', label: '릴스', Icon: Clapperboard },
  { id: 'dm', label: '메시지', Icon: Send },
  { id: 'profile', label: '프로필', Icon: UserRound },
];

type Props = {
  active: InstagramTab;
  onChange: (tab: InstagramTab) => void;
};

export default function InstagramTabBar({ active, onChange }: Props) {
  return (
    <nav className="flex items-stretch border-t border-[var(--line)] bg-[var(--bg,#fff)] pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ id, label, Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            aria-current={selected ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              selected ? 'text-[var(--fg)]' : 'text-[var(--fg-2)]'
            }`}
          >
            <Icon size={24} strokeWidth={selected ? 2.4 : 1.8} aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
