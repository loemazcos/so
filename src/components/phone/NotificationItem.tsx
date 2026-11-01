import { findApp } from '@/lib/apps';
import AppGlyph from '@/components/phone/AppGlyph';
import { PROFILE_PHOTOS } from '@/lib/profiles';

type Props = { appId: string; title: string; body: string; time: string };

export default function NotificationItem({ appId, title, body, time }: Props) {
  const app = findApp(appId);
  return (
    <div className="flex gap-3 rounded-[20px] bg-[var(--glass)] p-3 text-left shadow-[0_6px_20px_rgba(0,0,0,0.08)] backdrop-blur-[24px] backdrop-saturate-[180%]">
      {PROFILE_PHOTOS[title] ? (
        <img
          src={PROFILE_PHOTOS[title]}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover object-[50%_22%]"
        />
      ) : app ? (
        <AppGlyph app={app} size={36} />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-[13px] text-[var(--fg-2)]">
          <span className="truncate">
            {app?.name} · {title}
          </span>
          <span className="shrink-0 tabular-nums">{time}</span>
        </div>
        <p className="mt-0.5 text-[15px] leading-[1.45] text-[var(--fg)]">{body}</p>
      </div>
    </div>
  );
}
