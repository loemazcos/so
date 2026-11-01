const DEVICE_ID_KEY = 'taesan-device-id';

export function getDeviceId(): string {
  const stored = window.localStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;
  const created = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}
