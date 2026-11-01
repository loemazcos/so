import { useEffect } from 'react';

const CUT_MS = 2500;

type Props = { text: string; onDone: () => void };

export default function DayCutOverlay({ text, onDone }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onDone, CUT_MS);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <div className="phone-fade-in absolute inset-0 z-[68] flex items-center justify-center bg-black px-10 text-center">
      <p className="text-[16px] leading-[1.8] text-white">{text}</p>
    </div>
  );
}
