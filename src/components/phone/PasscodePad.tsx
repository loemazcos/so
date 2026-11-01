import { useEffect, useState } from 'react';
import { Delete } from 'lucide-react';
import { device } from '@data/device';

const LETTERS: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

type Props = { onUnlock: () => void; onCancel: () => void };

export default function PasscodePad({ onUnlock, onCancel }: Props) {
  const [code, setCode] = useState('');
  const [failures, setFailures] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [, setTick] = useState(0);

  const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));

  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [lockedUntil]);

  function pressDigit(digit: string) {
    if (remaining > 0 || code.length >= 4) return;
    navigator.vibrate?.(8);
    const next = code + digit;
    if (next.length < 4) {
      setCode(next);
      return;
    }
    if (next === device.passcode) {
      onUnlock();
      return;
    }
    navigator.vibrate?.([60, 40, 60]);
    setShakeKey((key) => key + 1);
    setCode('');
    const count = failures + 1;
    if (count >= device.maxPasscodeTries) {
      setFailures(0);
      setLockedUntil(Date.now() + device.lockoutSeconds * 1000);
    } else {
      setFailures(count);
    }
  }

  let message = '암호를 입력하세요';
  if (remaining > 0) message = `${remaining}초 뒤에 다시 시도하세요`;
  else if (failures >= device.passcodeHintAfter) message = `힌트: ${device.passcodeHint}`;

  return (
    <div className="flex flex-col items-center gap-6 px-6 pb-[calc(env(safe-area-inset-bottom)+20px)]">
      <p className="text-[15px] font-medium text-[var(--fg)]">{message}</p>
      <div key={shakeKey} className={`flex gap-4 ${shakeKey ? 'phone-shake' : ''}`}>
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-3.5 w-3.5 rounded-full border-2 border-[var(--fg)] transition-colors duration-150 ${
              index < code.length ? 'bg-[var(--fg)]' : ''
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-x-5 gap-y-3">
        {DIGITS.map((digit, index) => {
          if (digit === '') return <span key={index} />;
          if (digit === 'del') {
            return (
              <span key={index} className="flex h-[76px] w-[76px] items-center justify-center">
                {code.length > 0 ? (
                  <button
                    type="button"
                    aria-label="한 글자 지우기"
                    onClick={() => setCode((value) => value.slice(0, -1))}
                    className="flex h-12 w-12 items-center justify-center text-[var(--fg)]"
                  >
                    <Delete size={26} strokeWidth={1.6} aria-hidden="true" />
                  </button>
                ) : null}
              </span>
            );
          }
          return (
            <button
              key={index}
              type="button"
              onClick={() => pressDigit(digit)}
              className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-[var(--glass)] text-[var(--fg)] backdrop-blur-[16px] transition-colors active:bg-[var(--key-pressed)]"
            >
              <span className="text-[32px] font-light leading-none">{digit}</span>
              <span className="mt-0.5 h-[12px] text-[10px] font-semibold tracking-[2px] text-[var(--fg-2)]">
                {LETTERS[digit] ?? ''}
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onCancel} className="h-11 px-4 text-[17px] text-[var(--accent)]">
        취소
      </button>
    </div>
  );
}
