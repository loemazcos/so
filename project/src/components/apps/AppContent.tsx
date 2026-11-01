import { HelpCircle } from 'lucide-react';
import AppGlyph from '@/components/phone/AppGlyph';
import KakaoApp from '@/components/apps/kakao/KakaoApp';
import CalendarApp from '@/components/apps/calendar/CalendarApp';
import InstagramApp from '@/components/apps/instagram/InstagramApp';
import type { AppConfig } from '@/lib/types';

type Props = { app: AppConfig };

export default function AppContent({ app }: Props) {
  if (app.id === 'insta') return <InstagramApp />;
  if (app.id === 'kakao') return <KakaoApp />;
  if (app.id === 'calendar') return <CalendarApp />;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-[var(--bg)] px-8 text-center text-[var(--fg)]">
      <AppGlyph app={app} size={96} />
      <p className="text-[24px] font-bold">{app.name}</p>
      <p className="flex items-center gap-1.5 text-[14px] leading-[1.5] text-[var(--fg-2)]">
        <HelpCircle size={14} strokeWidth={2} aria-hidden="true" />
        이 앱은 아직 준비 중이에요.
      </p>
    </div>
  );
}
