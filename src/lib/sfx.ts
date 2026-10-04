import { useSyncExternalStore } from 'react';
import { storage } from './storage';

/**
 * Optional interface blips, synthesised with the Web Audio API — two square
 * wave notes at most, no audio files. Off until the user switches them on,
 * so nothing can sound before a deliberate gesture. Pokémon cries are
 * separate (see useCry) and are not affected by this switch.
 */
export type SfxName =
  | 'boot'
  | 'open'
  | 'close'
  | 'select'
  | 'move'
  | 'back'
  | 'confirm'
  | 'display';

/** Each note: [frequency in Hz, start offset in ms, length in ms]. */
const PATTERNS: Record<SfxName, ReadonlyArray<readonly [number, number, number]>> = {
  boot: [
    [440, 0, 80],
    [880, 140, 110],
  ],
  open: [
    [523, 0, 60],
    [784, 60, 90],
  ],
  close: [
    [784, 0, 60],
    [523, 60, 90],
  ],
  select: [
    [988, 0, 40],
    [1319, 40, 70],
  ],
  move: [[880, 0, 35]],
  back: [[440, 0, 70]],
  confirm: [[1175, 0, 50]],
  display: [
    [659, 0, 35],
    [1319, 45, 45],
  ],
};

const KEY = 'pokedex:sfx';
const VOLUME = 0.04;
const listeners = new Set<() => void>();

let context: AudioContext | null = null;

const isEnabled = () => storage.get(KEY) === 'on';

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSfxEnabled(enabled: boolean) {
  storage.set(KEY, enabled ? 'on' : 'off');
  listeners.forEach((listener) => listener());
}

/**
 * `unprompted` marks a sound no gesture asked for (the boot chime). If the
 * browser is still holding audio back it is dropped, rather than queued to
 * blurt out at the next press.
 */
export function playSfx(name: SfxName, { unprompted = false } = {}) {
  if (!isEnabled() || typeof AudioContext === 'undefined') return;
  context ??= new AudioContext();
  // Browsers suspend a context made before a gesture; a later one resumes it.
  if (context.state === 'suspended') {
    if (unprompted) return;
    void context.resume();
  }

  for (const [frequency, start, length] of PATTERNS[name]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const from = context.currentTime + start / 1000;
    const to = from + length / 1000;
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(VOLUME, from);
    gain.gain.setValueAtTime(0, to);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(from);
    oscillator.stop(to);
  }
}

export function useSfxEnabled(): boolean {
  return useSyncExternalStore(subscribe, isEnabled);
}
