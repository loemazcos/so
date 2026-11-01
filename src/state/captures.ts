export const MAX_CAPTURES = 30;
export const CAPTURE_MINUTES = 1;
export const CAPTURE_BATTERY = 0.2;

export type Capture = {
  id: string;
  t: number;
  screen: string;
  title: string;
  lines: string[];
  evidence: boolean;
};

export function pushCapture(captures: Capture[], capture: Capture): Capture[] {
  const next = [...captures, capture];
  return next.length > MAX_CAPTURES ? next.slice(next.length - MAX_CAPTURES) : next;
}

export function evidenceCount(captures: Capture[]): number {
  return captures.filter((capture) => capture.evidence).length;
}
