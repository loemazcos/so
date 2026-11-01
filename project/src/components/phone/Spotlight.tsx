import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { apps } from '@data/apps.config';
import AppGlyph from '@/components/phone/AppGlyph';
import KoreanKeyboard from '@/components/phone/KoreanKeyboard';
import type { AppConfig } from '@/lib/types';

type Props = {
  progress: number;
  dragging: boolean;
  onClose: () => void;
  onOpenApp: (app: AppConfig, rect: DOMRect) => void;
};

export default function Spotlight({ progress, dragging, onClose, onOpenApp }: Props) {
  const [query, setQuery] = useState('');
  const firstResult = useRef<HTMLButtonElement>(null);
  const trimmed = query.trim();
  const results = trimmed ? apps.filter((app) => app.name.includes(trimmed)) : [];
  const hidden = progress === 0 && !dragging;

  return (
    <div className={`absolute inset-0 z-40 ${hidden ? 'invisible' : ''}`}>
      <section
        className="absolute inset-0 flex flex-col bg-[var(--glass)] pt-[calc(env(safe-area-inset-top)+58px)] backdrop-blur-[28px] backdrop-saturate-[180%]"
        style={{
          transform: `translate3d(0, ${(progress - 1) * 100}%, 0)`,
          transition: dragging ? 'none' : 'transform 450ms var(--spring)',
        }}
      >
        <div className="px-4">
          <div className="flex h-10 items-center gap-2 rounded-[12px] bg-[var(--key)] px-3">
            <Search size={18} strokeWidth={2} className="text-[var(--fg-2)]" aria-hidden="true" />
            <span className="flex-1 truncate text-[17px]">
              {query || <span className="text-[var(--fg-2)]">검색</span>}
            </span>
            <span className="h-5 w-[2px] animate-pulse rounded-full bg-[var(--accent)]" />
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-4">
          {trimmed === '' ? (
            <p className="pt-10 text-center text-[14px] text-[var(--fg-2)]">찾고 싶은 앱 이름을 입력하세요</p>
          ) : results.length === 0 ? (
            <p className="pt-10 text-center text-[14px] text-[var(--fg-2)]">검색 결과가 없어요</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((app, index) => (
                <li key={app.id}>
                  <button
                    ref={index === 0 ? firstResult : undefined}
                    type="button"
                    onClick={(event) => onOpenApp(app, event.currentTarget.getBoundingClientRect())}
                    className="flex w-full items-center gap-3 rounded-[14px] p-2 text-left transition-colors active:bg-[var(--key-pressed)]"
                  >
                    <AppGlyph app={app} size={40} />
                    <span className="text-[16px]">{app.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-auto">
          <button type="button" onClick={onClose} className="mx-auto mb-2 block h-8 px-4 text-[14px] text-[var(--accent)]">
            닫기
          </button>
          <KoreanKeyboard
            onKey={(key) => setQuery((value) => value + key)}
            onSpace={() => setQuery((value) => value + ' ')}
            onBackspace={() => setQuery((value) => value.slice(0, -1))}
            onReturn={() => firstResult.current?.click()}
          />
        </div>
      </section>
    </div>
  );
}
