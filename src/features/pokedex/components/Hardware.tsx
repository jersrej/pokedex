import { cn } from '../../../lib/cn';
import { DEX } from '../../pokemon/dex';
import { useDeviceStatus } from '../hooks/useDeviceStatus';

/** The Pokédex's signature camera lens. Decorative. */
export function Lens({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block shrink-0 rounded-full border-4 border-body-ink bg-lens shadow-inner',
        className,
      )}
    >
      <span className="absolute top-[18%] left-[18%] size-1/4 rounded-full bg-white/60" />
    </span>
  );
}

const led = 'size-2.5 rounded-full border border-black/25';

/**
 * Three indicator LEDs. They mirror the text readout (see StatusReadout),
 * which is what assistive tech reads, so these are hidden from it.
 *   red: offline or the index failed · amber: a request is in flight · green: ready
 */
export function Leds() {
  const { online, syncing, failed } = useDeviceStatus();
  const fault = !online || failed;

  return (
    <span aria-hidden="true" className="flex gap-1.5">
      <span className={cn(led, 'bg-led-red', !fault && 'opacity-30')} />
      <span className={cn(led, 'bg-led-amber', syncing ? 'animate-blink' : 'opacity-30')} />
      <span className={cn(led, 'bg-led-green', fault && 'opacity-30')} />
    </span>
  );
}

/** Speaker grille on the right half. Decorative. */
export function Vents() {
  return (
    <span aria-hidden="true" className="flex gap-1">
      {[0, 1, 2, 3].map((slot) => (
        <span key={slot} className="h-4 w-1 rounded-full bg-body-dark" />
      ))}
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
