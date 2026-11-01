import type { CSSProperties } from 'react';
import Phone from '@/components/phone/Phone';
import { usePhoneScale } from '@/hooks/usePhoneScale';

function App() {
  const scale = usePhoneScale();

  return (
    <div className="phone-stage" style={{ '--phone-scale': scale } as CSSProperties}>
      <Phone />
    </div>
  );
}

export default App;
