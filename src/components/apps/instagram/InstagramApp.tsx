import { useState } from 'react';
import InstagramDm from '@/components/apps/instagram/InstagramDm';
import InstagramExplore from '@/components/apps/instagram/InstagramExplore';
import InstagramFeed from '@/components/apps/instagram/InstagramFeed';
import InstagramProfile from '@/components/apps/instagram/InstagramProfile';
import InstagramReels from '@/components/apps/instagram/InstagramReels';
import InstagramTabBar, { type InstagramTab } from '@/components/apps/instagram/InstagramTabBar';
import RumorAccount from '@/components/apps/instagram/RumorAccount';
import StoryViewer from '@/components/apps/instagram/StoryViewer';

const SANGHYUK_THREAD = 'sanghyuk';

export default function InstagramApp() {
  const [tab, setTab] = useState<InstagramTab>('home');
  const [rumorOpen, setRumorOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [dmThreadId, setDmThreadId] = useState<string | null>(null);

  function switchTab(next: InstagramTab) {
    setTab(next);
    setRumorOpen(false);
  }

  function renderContent() {
    if (rumorOpen) return <RumorAccount onBack={() => setRumorOpen(false)} />;
    switch (tab) {
      case 'home':
        return <InstagramFeed onOpenRumor={() => setRumorOpen(true)} onOpenStory={() => setStoryOpen(true)} />;
      case 'explore':
        return <InstagramExplore onOpenRumor={() => setRumorOpen(true)} />;
      case 'reels':
        return <InstagramReels />;
      case 'dm':
        return <InstagramDm key={dmThreadId ?? 'list'} initialThreadId={dmThreadId} />;
      case 'profile':
        return <InstagramProfile />;
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">{renderContent()}</div>
      <InstagramTabBar active={tab} onChange={switchTab} />
      {storyOpen && (
        <StoryViewer
          onClose={() => setStoryOpen(false)}
          onReply={() => {
            setStoryOpen(false);
            setDmThreadId(SANGHYUK_THREAD);
            switchTab('dm');
          }}
        />
      )}
    </div>
  );
}
