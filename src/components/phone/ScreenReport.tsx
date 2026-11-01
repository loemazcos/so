import { createContext, useContext, useEffect, type ReactNode } from 'react';

export type ScreenSnapshot = { screen: string; title: string; lines: string[] };

type Report = (snapshot: ScreenSnapshot | null) => void;

const ScreenReportContext = createContext<Report>(() => undefined);

export function ScreenReportProvider({ value, children }: { value: Report; children: ReactNode }) {
  return <ScreenReportContext.Provider value={value}>{children}</ScreenReportContext.Provider>;
}

export function useReportScreen(snapshot: ScreenSnapshot | null) {
  const report = useContext(ScreenReportContext);
  const key = snapshot ? JSON.stringify(snapshot) : '';

  useEffect(() => {
    report(key ? (JSON.parse(key) as ScreenSnapshot) : null);
    return () => report(null);
  }, [key, report]);
}
