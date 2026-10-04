import { useCallback, useSyncExternalStore } from 'react';
import { storage } from '../../../lib/storage';

const KEY = 'pokedex:favorites';
const listeners = new Set<() => void>();

let lastRaw: string | null | undefined;
let lastSet: ReadonlySet<number> = new Set();

function parse(raw: string | null): ReadonlySet<number> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    return new Set(Array.isArray(value) ? value.filter((id) => typeof id === 'number') : []);
  } catch {
    return new Set();
  }
}

/** Snapshot keyed on the stored string, so it is stable between changes. */
function getSnapshot(): ReadonlySet<number> {
  const raw = storage.get(KEY);
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastSet = parse(raw);
  }
  return lastSet;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in sync.
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function toggleFavorite(id: number) {
  const next = new Set(getSnapshot());
  if (!next.delete(id)) next.add(id);
  storage.set(KEY, JSON.stringify([...next].sort((a, b) => a - b)));
  listeners.forEach((listener) => listener());
}

/**
 * Favourites live in localStorage and are shared between the list and the
 * detail screen through a tiny external store — no context or state library.
 */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot);
  const toggle = useCallback((id: number) => toggleFavorite(id), []);
  return { favorites, toggle };
}
