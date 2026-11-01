import { HelpCircle } from 'lucide-react';
import AppGlyph from '@/components/phone/AppGlyph';
import KakaoApp from '@/components/apps/kakao/KakaoApp';
import CalendarApp from '@/components/apps/calendar/CalendarApp';
import ClueBookApp from '@/components/apps/clueBook/ClueBookApp';
import InstagramApp from '@/components/apps/instagram/InstagramApp';
import MemoApp from '@/components/apps/memo/MemoApp';
import RemitApp from '@/components/apps/remit/RemitApp';
import SettingsApp from '@/components/apps/settings/SettingsApp';
import CameraApp from '@/components/apps/camera/CameraApp';
import type { AppConfig } from '@/lib/types';

type Props = { app: AppConfig };

export default function AppContent({ app }: Props) {
  if (app.id === 'insta') return <InstagramApp />;
  if (app.id === 'kakao') return <KakaoApp />;
  if (app.id === 'calendar') return <CalendarApp />;
  if (app.id === 'memo') return <MemoApp />;
  if (app.id === 'clueBook') return <ClueBookApp />;
  if (app.id === 'remit') return <RemitApp />;
  if (app.id === 'settings') return <SettingsApp />;
  if (app.id === 'camera') return <CameraApp />;
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
