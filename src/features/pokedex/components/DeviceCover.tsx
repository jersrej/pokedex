import { ProgressMeter } from '../../../components/ScreenMessage';
import { DEX } from '../../pokemon/dex';
import { formatDexNumber } from '../../pokemon/format';
import type { BootState, BootStep } from '../hooks/useDeviceOpen';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { Leds, Lens, Vents } from './Hardware';

interface DeviceCoverProps {
  boot: BootState;
  onOpen: () => void;
}

/**
 * The outside of the device, seen while it is closed: lens, LEDs and a small
 * status display that the power-on sequence prints to. The whole cover is
 * the open button, so there is nothing to aim for.
 */
export function DeviceCover({ boot, onOpen }: DeviceCoverProps) {
  const { failed, entryCount } = useDeviceStatus();
  const powered = boot.phase !== 'off';
  const range = `${DEX.region} ${formatDexNumber(DEX.first)}–${formatDexNumber(DEX.last)}`;

  // The database line reports what the index request actually returned.
  const printed: Record<Exclude<BootStep, 'off'>, string> = {
    logo: 'Pokédex system',
    init: 'Initializing...',
    load: 'Loading database...',
    found:
      entryCount !== null ? `${entryCount} entries found` : failed ? 'No data link' : 'Still loading',
    ready: 'System ready',
  };
  const lines =
    boot.phase === 'done'
      ? ['Pokédex', range, 'Standby']
      : boot.steps.map((step) => printed[step as keyof typeof printed]);
  const busy = powered && boot.phase !== 'done' && boot.phase !== 'ready';

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open Pokédex"
      className="shell group flex size-full flex-col gap-6 overflow-hidden rounded-2xl p-6 text-left focus-visible:-outline-offset-8 focus-visible:outline-body-ink md:rounded-l-3xl md:rounded-r-lg md:p-8"
    >
      <span className="flex items-center gap-3">
        <Lens className="size-16" />
        <Leds powered={powered} />
        <Vents className="ml-auto" />
      </span>

      <span className="bezel block rounded-xl rounded-br-4xl p-2 md:p-3">
        <span
          data-power={powered ? 'on' : 'off'}
          className="lcd flex h-40 flex-col gap-2 overflow-hidden rounded-sm p-3 font-display text-2xs text-ink uppercase"
        >
          {lines.map((line) => (
            <span key={line} className="animate-enter">
              {line}
            </span>
          ))}
          {busy && (
            <span className="mt-auto">
              <ProgressMeter />
            </span>
          )}
        </span>
      </span>

      {/* A moulded seam across the shell. */}
      <span
        aria-hidden="true"
        className="-mx-8 mt-auto h-0.5 bg-body-outline/70 shadow-[0_2px_0_rgb(255_255_255/0.18)]"
      />

      <span className="flex items-end justify-between gap-4">
        <span>
          <span className="block font-display text-2xl leading-normal uppercase md:text-3xl">
            Pokédex
          </span>
          <span className="mt-2 block font-display text-2xs uppercase opacity-80">{range}</span>
        </span>
        <span className="hw-key inline-flex h-11 shrink-0 items-center rounded-md px-4 font-display text-xs uppercase">
          ▶ Open
        </span>
      </span>
    </button>
  );
}
