import { useCallback, useEffect, useState } from 'react';
import { playSfx } from '../../../lib/sfx';
import { storage } from '../../../lib/storage';
import { prefersReducedMotion } from '../../../lib/useMediaQuery';
import { usePokemonIndex } from '../../pokemon/queries';

const KEY = 'pokedex:intro-seen';

/** Keep in sync with `--fold-duration` in index.css. */
export const FOLD_DURATION_MS = 650;

/** Power-on steps, in order. `done` is every moment after the boot. */
export type BootStep = 'off' | 'logo' | 'init' | 'load' | 'found' | 'ready';
export type BootPhase = BootStep | 'done';

const FULL_BOOT: readonly BootStep[] = ['off', 'logo', 'init', 'load', 'found', 'ready'];
/** Returning visitors get a power-on blink, not the whole routine. */
const SHORT_BOOT: readonly BootStep[] = ['off', 'logo', 'ready'];

/** How long each step stays up: long enough to read, no longer. */
const STEP_MS: Record<BootStep, number> = {
  off: 150,
  logo: 300,
  init: 250,
  load: 200,
  found: 350,
  ready: 200,
};
/** `load` waits for the real index request, but never holds the device shut for long. */
const LOAD_TIMEOUT_MS = 4000;

/**
 * Power and open/closed state of the device.
 *
 * - Every visit starts closed and boots on the cover, then unfolds on its
 *   own: the full routine the first time, a short one afterwards.
 * - The full boot's `load` step lasts as long as the index request does.
 * - A click or any key skips straight to the open device.
 * - Reduced-motion users start open, with no boot at all.
 * - `animating` gates the CSS transitions, so nothing animates on first
 *   paint or on resize, and any tap or key press during the fold skips it.
 */
export function useDeviceOpen() {
  const [sequence] = useState(() => (storage.get(KEY) === '1' ? SHORT_BOOT : FULL_BOOT));
  const [phase, setPhase] = useState<BootPhase>(() => (prefersReducedMotion() ? 'done' : 'off'));
  const [open, setOpen] = useState(prefersReducedMotion);
  const [animating, setAnimating] = useState(false);
  const indexSettled = !usePokemonIndex().isPending;

  const setOpenAnimated = useCallback((next: boolean) => {
    if (next) storage.set(KEY, '1');
    setAnimating(!prefersReducedMotion());
    setOpen(next);
  }, []);

  const openDevice = useCallback(() => setOpenAnimated(true), [setOpenAnimated]);
  const closeDevice = useCallback(() => setOpenAnimated(false), [setOpenAnimated]);

  const skipBoot = useCallback(() => {
    storage.set(KEY, '1');
    setPhase('done');
    setOpen(true);
  }, []);

  useEffect(() => {
    if (phase === 'done') return;
    const waiting = phase === 'load' && !indexSettled;
    const timer = window.setTimeout(
      () => {
        const next = sequence[sequence.indexOf(phase) + 1];
        if (next) {
          if (next === 'logo') playSfx('boot', { unprompted: true });
          setPhase(next);
        } else {
          setPhase('done');
          setOpenAnimated(true);
        }
      },
      waiting ? LOAD_TIMEOUT_MS : STEP_MS[phase],
    );
    // click, not pointerdown: the press must finish on the cover, or its
    // click would land on whatever the opened device reveals underneath.
    window.addEventListener('click', skipBoot);
    window.addEventListener('keydown', skipBoot);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('click', skipBoot);
      window.removeEventListener('keydown', skipBoot);
    };
  }, [phase, indexSettled, sequence, setOpenAnimated, skipBoot]);

  useEffect(() => {
    if (!animating) return;
    const finish = () => setAnimating(false);
    const timer = window.setTimeout(finish, FOLD_DURATION_MS);
    window.addEventListener('pointerdown', finish);
    window.addEventListener('keydown', finish);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('keydown', finish);
    };
  }, [animating, open]);

  const boot = {
    phase,
    /** The steps reached so far, oldest first; what the cover display has printed. */
    steps: phase === 'done' ? [] : sequence.slice(1, sequence.indexOf(phase) + 1),
  };

  return { open, animating, boot, openDevice, closeDevice, skipBoot };
}

export type BootState = ReturnType<typeof useDeviceOpen>['boot'];
