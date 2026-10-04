import { useSyncExternalStore } from 'react';
import { storage } from './storage';

/**
 * How the screens render. The device is the same in every mode; only the
 * LCD palette (see `data-display` in index.css) and the sprite set change.
 */
export const DISPLAY_MODES = ['classic', 'mono', 'color'] as const;

export type DisplayMode = (typeof DISPLAY_MODES)[number];

const KEY = 'pokedex-display-mode';
const DEFAULT_MODE: DisplayMode = 'classic';
const listeners = new Set<() => void>();

const isDisplayMode = (value: string | null): value is DisplayMode =>
  (DISPLAY_MODES as readonly string[]).includes(value ?? '');

/** Anything unrecognised in storage falls back to Classic. */
function getDisplayMode(): DisplayMode {
  const stored = storage.get(KEY);
  return isDisplayMode(stored) ? stored : DEFAULT_MODE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setDisplayMode(mode: DisplayMode) {
  storage.set(KEY, mode);
  listeners.forEach((listener) => listener());
}

export function useDisplayMode(): DisplayMode {
  return useSyncExternalStore(subscribe, getDisplayMode);
}
