import { apps } from '@data/apps.config';

export function findApp(id: string) {
  return apps.find((app) => app.id === id);
}
