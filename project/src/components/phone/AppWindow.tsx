import { useEffect, useState, type CSSProperties } from 'react';
import AppContent from '@/components/apps/AppContent';
import type { AppConfig, Rect } from '@/lib/types';

const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)';

type Props = {
  app: AppConfig;
  origin: Rect;
  closing: boolean;
  onExited: () => void;
};

export default function AppWindow({ app, origin, closing, onExited }: Props) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const expanded = entered && !closing;
  const frame: CSSProperties = expanded
    ? { left: 0, top: 0, width: '100%', height: '100%', borderRadius: 0 }
    : { left: origin.left, top: origin.top, width: origin.width, height: origin.height, borderRadius: 14 };

  return (
    <div
      className="absolute z-20 overflow-hidden bg-[var(--bg)] shadow-[0_0_40px_rgba(0,0,0,0.2)]"
      style={{ ...frame, transition: `all 450ms ${SPRING}` }}
      onTransitionEnd={(event) => {
        if (closing && event.propertyName === 'width') onExited();
      }}
    >
      <div className="h-full transition-opacity duration-300" style={{ opacity: expanded ? 1 : 0 }}>
        <AppContent app={app} />
      </div>
    </div>
  );
}
