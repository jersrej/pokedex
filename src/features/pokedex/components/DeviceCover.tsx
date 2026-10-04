import { DEX } from '../../pokemon/dex';
import { formatDexNumber } from '../../pokemon/format';
import { Lens } from './Hardware';

/**
 * The outside of the device, seen while it is closed. The whole cover is
 * the open button, so there is nothing to aim for.
 */
export function DeviceCover({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open Pokédex"
      className="group relative flex size-full flex-col justify-between overflow-hidden border-body-dark bg-body p-6 text-left text-body-ink focus-visible:-outline-offset-8 focus-visible:outline-body-ink md:rounded-l-3xl md:rounded-r-lg md:border-2 md:p-8"
    >
      <span className="flex items-center gap-3">
        <Lens className="size-16" />
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-led-red" />
          <span className="size-2.5 rounded-full bg-led-amber" />
          <span className="size-2.5 rounded-full bg-led-green" />
        </span>
      </span>

      {/* A moulded seam across the shell. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-1/3 h-0.5 bg-body-dark shadow-[0_2px_0_var(--pokedex-body-light)]"
      />

      <span>
        <span className="block font-display text-2xl leading-normal uppercase md:text-3xl">
          Pokédex
        </span>
        <span className="mt-3 block font-display text-2xs uppercase opacity-80">
          {DEX.region} {formatDexNumber(DEX.first)}–{formatDexNumber(DEX.last)}
        </span>
      </span>

      <span className="inline-flex h-11 items-center self-start border-2 border-body-ink px-4 font-display text-xs uppercase shadow-[2px_2px_0_var(--pokedex-body-dark)] group-hover:bg-body-dark/60">
        ▶ Open
      </span>
    </button>
  );
}
