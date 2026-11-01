import { useState } from 'react';
import { X } from 'lucide-react';
import CaptureCard from '@/components/apps/camera/CaptureCard';
import { useGameState } from '@/state/GameState';
import { MAX_CAPTURES } from '@/state/captures';

export default function CameraApp() {
  const { run } = useGameState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const newestFirst = [...run.captures].reverse();
  const selected = run.captures.find((capture) => capture.id === selectedId) ?? null;

  return (
    <div className="relative flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="px-4 pb-3 pt-[calc(env(safe-area-inset-top)+58px)]">
        <p className="text-[24px] font-bold leading-[1.2]">사진첩</p>
        <p className="text-[12px] text-[var(--fg-2)]">
          {run.captures.length} / {MAX_CAPTURES}장
        </p>
      </header>

      {newestFirst.length === 0 ? (
        <p className="px-8 pt-16 text-center text-[14px] leading-[1.5] text-[var(--fg-2)]">
          아직 찍은 사진이 없어요. 제어센터나 알림센터의 스크린샷 버튼으로 화면을 저장할 수 있어요.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 overflow-y-auto px-3 pb-6">
          {newestFirst.map((capture) => (
            <li key={capture.id}>
              <button
                type="button"
                onClick={() => setSelectedId(capture.id)}
                aria-label={`${capture.screen} 사진 크게 보기`}
                className="block w-full transition-transform active:scale-[0.97]"
              >
                <CaptureCard capture={capture} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 p-6"
          onClick={() => setSelectedId(null)}
        >
          <div className="w-full" onClick={(event) => event.stopPropagation()}>
            <CaptureCard capture={selected} size="full" />
          </div>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label="닫기"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#1c1c1e] transition-transform active:scale-95"
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
