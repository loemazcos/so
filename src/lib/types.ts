import type { apps } from '@data/apps.config';

export type AppConfig = (typeof apps)[number];

export type Rect = { left: number; top: number; width: number; height: number };
