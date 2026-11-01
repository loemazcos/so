import { useEffect, useState } from 'react';

const FRAME_WIDTH = 418;
const FRAME_HEIGHT = 872;
const WINDOW_MARGIN = 32;

function computeScale() {
  return Math.min(
    1,
    (window.innerWidth - WINDOW_MARGIN) / FRAME_WIDTH,
    (window.innerHeight - WINDOW_MARGIN) / FRAME_HEIGHT,
  );
}

export function usePhoneScale() {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const handleResize = () => setScale(computeScale());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return scale;
}
