import { cn } from '../../../lib/cn';
import { DEX } from '../../pokemon/dex';
import { useDeviceStatus } from '../hooks/useDeviceStatus';

/** The Pokédex's signature camera lens. Decorative. */
export function Lens({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('lens block shrink-0 rounded-full', className)} />;
}

/**
 * Three indicator LEDs in their housings. They mirror the text readout (see
 * StatusReadout), which is what assistive tech reads, so these are hidden
 * from it. Every state is real:
 *   red    power, as on a handheld of the era; blinks on a fault
 *          (offline, or the index failed)
 *   amber  link: the Pokédex database is loaded
 *   green  activity: blinks while a request is in flight
 */
export function Leds({ powered = true }: { powered?: boolean }) {
  const { online, syncing, failed, entryCount } = useDeviceStatus();
  const fault = !online || failed;

  return (
    <span aria-hidden="true" className="flex gap-1.5">
      <span className={cn('led led-red', powered && fault && 'animate-blink')} data-lit={powered} />
      <span className="led led-amber" data-lit={powered && !fault && entryCount !== null} />
      <span
        className={cn('led led-green', powered && syncing && 'animate-blink')}
        data-lit={powered && syncing}
      />
    </span>
  );
}

/** Speaker grille: a few slots cut into the shell. Decorative. */
export function Vents({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('flex flex-col gap-1', className)}>
      {[0, 1, 2].map((slot) => (
        <span
          key={slot}
          className="h-1 w-10 rounded-full bg-body-outline shadow-[0_1px_0_rgb(255_255_255/0.2)]"
        />
      ))}
    </span>
  );
}

/** Lettering moulded into the plastic. Decorative. */
export function Engraving({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className="font-display text-2xs text-body-dark uppercase [text-shadow:0_1px_0_rgb(255_255_255/0.22)]"
    >
      {children}
    </span>
  );
}

/** One-line device status: connectivity, region and the size of the loaded dex. */
export function StatusReadout() {
  const { online, syncing, failed, entryCount } = useDeviceStatus();

  const state = !online ? 'Offline' : failed ? 'No data' : syncing ? 'Syncing' : 'Online';

  return (
    <p role="status" className="min-w-0 truncate font-display text-2xs text-body-ink uppercase">
      {state}
      <span className="opacity-80">
        <span className="max-sm:hidden md:max-lg:hidden"> · {DEX.region}</span>
        {entryCount !== null && ` · ${entryCount} entries`}
      </span>
    </p>
  );
}
