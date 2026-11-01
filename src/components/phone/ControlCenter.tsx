import { useState, type ComponentType, type ReactNode } from 'react';
import {
  Bluetooth,
  BatteryLow,
  Calculator,
  Camera,
  CircleDot,
  Flashlight,
  Moon,
  Music,
  Play,
  Plane,
  RotateCw,
  Signal,
  Sun,
  Timer,
  Volume2,
  Wifi,
  type LucideProps,
} from 'lucide-react';

type Icon = ComponentType<LucideProps>;

const CONNECTIVITY: { id: string; label: string; icon: Icon; on: boolean }[] = [
  { id: 'wifi', label: '와이파이', icon: Wifi, on: true },
  { id: 'data', label: '데이터', icon: Signal, on: true },
  { id: 'plane', label: '비행기', icon: Plane, on: false },
  { id: 'bluetooth', label: '블루투스', icon: Bluetooth, on: true },
];

const ROUND_TOOLS: { id: string; label: string; icon: Icon; on: boolean }[] = [
  { id: 'flashlight', label: '손전등', icon: Flashlight, on: false },
  { id: 'timer', label: '타이머', icon: Timer, on: false },
  { id: 'calc', label: '계산기', icon: Calculator, on: false },
  { id: 'camera', label: '카메라', icon: Camera, on: false },
];

type Props = {
  progress: number;
  dragging: boolean;
  onClose: () => void;
  dnd: boolean;
  onToggleDnd: () => void;
  onCapture: () => void;
};

export default function ControlCenter({ progress, dragging, onClose, dnd, onToggleDnd, onCapture }: Props) {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...CONNECTIVITY, ...ROUND_TOOLS].map((item) => [item.id, item.on]))
  );
  const [rotationLock, setRotationLock] = useState(true);
  const [brightness, setBrightness] = useState(70);
  const [volume, setVolume] = useState(45);
  const hidden = progress === 0 && !dragging;

  function flip(id: string) {
    setOn((state) => ({ ...state, [id]: !state[id] }));
  }

  return (
    <div className={`absolute inset-0 z-40 ${hidden ? 'invisible' : ''}`}>
      <div className="absolute inset-0 bg-black/30" style={{ opacity: progress }} onClick={onClose} />
      <section
        className="absolute inset-x-0 top-0 flex h-[92%] flex-col gap-3 rounded-b-[32px] bg-[var(--glass)] px-4 pb-6 pt-[calc(env(safe-area-inset-top)+64px)] shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-[24px] backdrop-saturate-[180%]"
        style={{
          transform: `translate3d(0, ${(progress - 1) * 100}%, 0)`,
          transition: dragging ? 'none' : 'transform 450ms var(--spring)',
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 rounded-[22px] bg-[var(--card)] p-4">
            {CONNECTIVITY.map(({ id, label, icon: IconComp }) => (
              <ToggleButton key={id} label={label} active={!!on[id]} onClick={() => flip(id)}>
                <IconComp size={22} strokeWidth={1.8} aria-hidden="true" />
              </ToggleButton>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              aria-pressed={dnd}
              onClick={onToggleDnd}
              className="flex flex-1 items-center gap-3 rounded-[22px] bg-[var(--card)] p-4 text-left transition-transform active:scale-[0.98]"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${dnd ? 'bg-[var(--accent)] text-white' : 'bg-[var(--key-pressed)] text-[var(--fg)]'}`}>
                <Moon size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold">방해금지</span>
                <span className="block text-[12px] text-[var(--fg-2)]">{dnd ? '켜짐' : '꺼짐'}</span>
              </span>
            </button>
            <button
              type="button"
              aria-pressed={rotationLock}
              onClick={() => setRotationLock((value) => !value)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[22px] bg-[var(--card)] text-[14px] transition-transform active:scale-[0.98]"
            >
              <RotateCw size={18} strokeWidth={1.8} aria-hidden="true" />
              화면 회전 잠금
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-[22px] bg-[var(--card)] p-4">
          <label className="flex items-center gap-3">
            <Sun size={18} strokeWidth={1.8} aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={100}
              value={brightness}
              onChange={(event) => setBrightness(Number(event.target.value))}
              className="phone-range"
              aria-label="밝기"
            />
          </label>
          <label className="flex items-center gap-3">
            <Volume2 size={18} strokeWidth={1.8} aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="phone-range"
              aria-label="볼륨"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] bg-[var(--card)] p-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--key-pressed)]">
            <Music size={20} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">재생 중인 곡 없음</span>
            <span className="block text-[12px] text-[var(--fg-2)]">스포티파이 앱에서 재생하면 여기 보여요</span>
          </span>
          <button type="button" aria-label="재생" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--key)]">
            <Play size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-4 justify-items-center gap-2">
          {ROUND_TOOLS.map(({ id, label, icon: IconComp }) => (
            <ToggleButton key={id} label={label} active={!!on[id]} onClick={() => flip(id)}>
              <IconComp size={22} strokeWidth={1.8} aria-hidden="true" />
            </ToggleButton>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ToggleButton label="저전력 모드" active={false} onClick={() => undefined} wide>
            <BatteryLow size={20} strokeWidth={1.8} aria-hidden="true" />
          </ToggleButton>
          <ToggleButton label="화면 녹화" active={false} onClick={() => undefined} wide>
            <CircleDot size={20} strokeWidth={1.8} aria-hidden="true" />
          </ToggleButton>
        </div>
        <button
          type="button"
          onClick={onCapture}
          className="flex items-center justify-center gap-2 rounded-[22px] bg-[var(--card)] py-4 text-[14px] font-semibold transition-transform active:scale-[0.98]"
        >
          <Camera size={20} strokeWidth={1.8} aria-hidden="true" />
          스크린샷
        </button>
      </section>
    </div>
  );
}

type ToggleProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  wide?: boolean;
  children: ReactNode;
};

function ToggleButton({ label, active, onClick, wide = false, children }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`flex items-center text-[12px] transition-transform active:scale-95 ${
        wide ? 'gap-3 rounded-[22px] bg-[var(--card)] p-3 text-[14px]' : 'flex-col gap-1.5'
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-full transition-colors ${
          wide ? 'h-10 w-10' : 'h-[52px] w-[52px]'
        } ${active ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)] text-[var(--fg)]'}`}
      >
        {children}
      </span>
      <span className="text-[var(--fg)]">{label}</span>
    </button>
  );
}
