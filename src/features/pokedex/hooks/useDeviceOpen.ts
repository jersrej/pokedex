import { useCallback, useEffect, useState } from 'react';
import { storage } from '../../../lib/storage';
import { prefersReducedMotion } from '../../../lib/useMediaQuery';

const KEY = 'pokedex:intro-seen';

/** Keep in sync with `--fold-duration` in index.css. */
export const FOLD_DURATION_MS = 650;
/** How long a first-time visitor sees the closed device before it opens itself. */
const AUTO_OPEN_DELAY_MS = 900;

/**
 * Open/closed state of the device.
 *
 * - First visit: starts closed, then unfolds on its own (or on tap).
 * - Returning visits and reduced-motion users: starts open, no animation.
 * - `animating` gates the CSS transitions, so nothing animates on first
 *   paint or on resize, and any tap or key press during the fold skips it.
 */
export function useDeviceOpen() {
  const [open, setOpen] = useState(() => storage.get(KEY) === '1' || prefersReducedMotion());
  const [animating, setAnimating] = useState(false);

  const setOpenAnimated = useCallback((next: boolean) => {
    if (next) storage.set(KEY, '1');
    setAnimating(!prefersReducedMotion());
    setOpen(next);
  }, []);

  const openDevice = useCallback(() => setOpenAnimated(true), [setOpenAnimated]);
  const closeDevice = useCallback(() => setOpenAnimated(false), [setOpenAnimated]);

  // First visit: unfold automatically so nobody has to work out what to tap.
  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(openDevice, AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
    // Only on mount: closing the device by hand must not re-open it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return { open, animating, openDevice, closeDevice };
}
