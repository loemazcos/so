import { useEffect, useState } from 'react';
import { device } from '@data/device';

const { year, month, day, hour, minute } = device.gameStart;
const startMs = new Date(year, month - 1, day, hour, minute).getTime();

export function useGameClock(): Date {
  const [now, setNow] = useState(() => new Date(startMs));

  useEffect(() => {
    const mountedAt = Date.now();
    const id = window.setInterval(() => {
      setNow(new Date(startMs + (Date.now() - mountedAt)));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}
