import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/cn';

export type PadDirection = 'up' | 'down' | 'left' | 'right';

const KEYS = [
  {
    direction: 'up',
    label: 'D-pad up: previous in list',
    Icon: ChevronUp,
    place: 'col-start-2 row-start-1 rounded-t-md border-b-0',
  },
  {
    direction: 'left',
    label: 'D-pad left: previous Pokémon',
    Icon: ChevronLeft,
    place: 'col-start-1 row-start-2 rounded-l-md border-r-0',
  },
  {
    direction: 'right',
    label: 'D-pad right: next Pokémon',
    Icon: ChevronRight,
    place: 'col-start-3 row-start-2 rounded-r-md border-l-0',
  },
  {
    direction: 'down',
    label: 'D-pad down: next in list',
    Icon: ChevronDown,
    place: 'col-start-2 row-start-3 rounded-b-md border-t-0',
  },
] as const;

/**
 * The directional pad, sat in a round well in the shell. Up/down walk the
 * index as filtered; left/right step through the dex like the arrow keys.
 * Four real buttons around a decorative hub.
 */
export function DPad({ onPress }: { onPress: (direction: PadDirection) => void }) {
  return (
    <div role="group" aria-label="Directional pad" className="dpad shrink-0 [@media(max-height:30rem)]:hidden">
      {KEYS.map(({ direction, label, Icon, place }) => (
        <button
          key={direction}
          type="button"
          aria-label={label}
          onClick={() => onPress(direction)}
          className={cn('dpad-key', place)}
        >
          <Icon className="size-4" strokeWidth={3} aria-hidden="true" />
        </button>
      ))}
      <span aria-hidden="true" className="dpad-hub col-start-2 row-start-2" />
    </div>
  );
}
