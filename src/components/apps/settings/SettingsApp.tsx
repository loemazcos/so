import { useGameState } from '@/state/GameState';
import { setActivityStatus, setSoundOn } from '@/state/runState';

export default function SettingsApp() {
  const { run, update } = useGameState();
  const on = run.activityStatus;

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+58px)] text-[var(--fg)]">
      <p className="text-[26px] font-bold leading-[1.2]">설정</p>
      <div className="mt-6 rounded-[22px] bg-[var(--card)] p-4">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => update((current) => setActivityStatus(current, !current.activityStatus))}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">활동 상태 표시</span>
            <span className="block text-[12px] text-[var(--fg-2)]">켜 두면 상대에게 활동 중으로 보여요</span>
          </span>
          <span className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${on ? 'bg-[#34C759]' : 'bg-[var(--key-pressed)]'}`}>
            <span
              className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform ${
                on ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
          </span>
        </button>
        <div className="my-3 h-px bg-[var(--line)]" />
        <button
          type="button"
          role="switch"
          aria-checked={run.soundOn}
          aria-label="소리"
          onClick={() => update((current) => setSoundOn(current, !current.soundOn))}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">소리</span>
            <span className="block text-[12px] text-[var(--fg-2)]">메시지와 알림에 소리가 나요. 방해금지 중에는 조용해요</span>
          </span>
          <span className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${run.soundOn ? 'bg-[#34C759]' : 'bg-[var(--key-pressed)]'}`}>
            <span
              className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform ${
                run.soundOn ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
