import type { CSSProperties } from 'react';
import Phone from '@/components/phone/Phone';
import { usePhoneScale } from '@/hooks/usePhoneScale';
import { GameStateProvider } from '@/state/GameState';

function App() {
  const scale = usePhoneScale();

  return (
    <GameStateProvider>
      <div className="phone-stage" style={{ '--phone-scale': scale } as CSSProperties}>
        <Phone />
      </div>
    </GameStateProvider>
  );
}

export default App;
