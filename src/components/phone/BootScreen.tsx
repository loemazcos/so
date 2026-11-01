import { useEffect } from 'react';
import { Power } from 'lucide-react';

const BOOT_MS = 2500;

type Props = { onDone: () => void };

export default function BootScreen({ onDone }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onDone, BOOT_MS);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-black text-white">
      <Power size={28} strokeWidth={1.6} className="text-white/70" aria-hidden="true" />
      <p className="text-[14px] text-white/70">다시 켜는 중</p>
    </div>
  );
}
