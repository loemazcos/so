import { ArrowBigUp, Delete } from 'lucide-react';
import { useState } from 'react';

const ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
];

const SHIFTED: Record<string, string> = {
  ㅂ: 'ㅃ',
  ㅈ: 'ㅉ',
  ㄷ: 'ㄸ',
  ㄱ: 'ㄲ',
  ㅅ: 'ㅆ',
  ㅐ: 'ㅒ',
  ㅔ: 'ㅖ',
};

type Props = {
  onKey: (key: string) => void;
  onSpace: () => void;
  onBackspace: () => void;
  onReturn: () => void;
};

export default function KoreanKeyboard({ onKey, onSpace, onBackspace, onReturn }: Props) {
  const [shift, setShift] = useState(false);

  function press(action: () => void, releaseShift = true) {
    navigator.vibrate?.(8);
    action();
    if (releaseShift) setShift(false);
  }

  function label(key: string) {
    return shift ? (SHIFTED[key] ?? key) : key;
  }

  const keyClass =
    'flex h-[44px] flex-1 items-center justify-center rounded-[6px] bg-[var(--key)] text-[22px] text-[var(--fg)] shadow-[0_1px_0_rgba(0,0,0,0.25)] transition-transform active:scale-95 active:bg-[var(--key-pressed)]';
  const functionKeyClass =
    'flex h-[44px] w-[46px] shrink-0 items-center justify-center rounded-[6px] bg-[#adb0b8]/60 text-[var(--fg)] shadow-[0_1px_0_rgba(0,0,0,0.25)] transition-transform active:scale-95';

  return (
    <div className="bg-[var(--kb)] px-1.5 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          {ROWS[0].map((key) => (
            <button key={key} type="button" className={keyClass} onClick={() => press(() => onKey(label(key)))}>
              {label(key)}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 px-4">
          {ROWS[1].map((key) => (
            <button key={key} type="button" className={keyClass} onClick={() => press(() => onKey(label(key)))}>
              {label(key)}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="대문자"
            aria-pressed={shift}
            className={`${functionKeyClass} ${shift ? 'bg-[var(--key)]' : ''}`}
            onClick={() => press(() => setShift((value) => !value), false)}
          >
            <ArrowBigUp size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {ROWS[2].map((key) => (
            <button key={key} type="button" className={keyClass} onClick={() => press(() => onKey(label(key)))}>
              {label(key)}
            </button>
          ))}
          <button
            type="button"
            aria-label="지우기"
            className={functionKeyClass}
            onClick={() => press(onBackspace, false)}
          >
            <Delete size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        <div className="flex gap-1.5">
          <button type="button" className={`${keyClass} flex-[4] text-[16px]`} onClick={() => press(onSpace)}>
            스페이스
          </button>
          <button
            type="button"
            className={`${keyClass} flex-[2] bg-[var(--accent)] text-[16px] text-white`}
            onClick={() => press(onReturn, false)}
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
}
