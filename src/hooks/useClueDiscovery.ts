import { useCallback, useEffect, useRef, useState } from 'react';
import { callFunction } from '@/lib/gameApi';

type DiscoverResponse = { ok?: unknown };

export function useClueDiscovery(found: string[]) {
  const announced = useRef(new Set(found));
  const synced = useRef(new Set<string>());
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    found.forEach((clueId) => {
      if (synced.current.has(clueId)) return;
      synced.current.add(clueId);
      callFunction<DiscoverResponse>('game-api', { action: 'discoverClue', payload: { clueId } })
        .then((response) => {
          if (response.ok !== true) throw new Error('discover failed');
        })
        .catch(() => {
          synced.current.delete(clueId);
        });
    });

    const fresh = found.filter((clueId) => !announced.current.has(clueId));
    if (fresh.length === 0) return;
    fresh.forEach((clueId) => announced.current.add(clueId));
    setPending(fresh[fresh.length - 1]);
  }, [found]);

  const dismiss = useCallback(() => setPending(null), []);

  return { pending, dismiss };
}
