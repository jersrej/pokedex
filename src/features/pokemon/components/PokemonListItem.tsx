import { Star } from 'lucide-react';
import { memo } from 'react';
import { cn } from '../../../lib/cn';
import { useDisplayMode } from '../../../lib/displayMode';
import { spriteUrlFor } from '../api/pokemon';
import { formatDexNumber } from '../format';
import { useCachedPokemon } from '../queries';
import type { PokemonSummary } from '../types';
import { TypeIcon } from './TypeBadge';

interface PokemonListItemProps {
  pokemon: PokemonSummary;
  selected: boolean;
  favorite: boolean;
  onSelect: (id: number) => void;
}

export const PokemonListItem = memo(function PokemonListItem({
  pokemon,
  selected,
  favorite,
  onSelect,
}: PokemonListItemProps) {
  // Types are only known for entries that have been opened; this never fetches.
  const scanned = useCachedPokemon(pokemon.id);
  const palette = useDisplayMode() === 'color' ? 'color' : 'grey';

  return (
    <li>
      <button
        type="button"
        data-pokemon-id={pokemon.id}
        aria-current={selected ? 'true' : undefined}
        onClick={() => onSelect(pokemon.id)}
        className={cn(
          'flex h-16 w-full items-center gap-2 pr-3 pl-1 text-left focus-visible:-outline-offset-2',
          // The selected row is the menu cursor: a ▶ and a highlighted bar.
          selected ? 'bg-highlight' : 'hover:bg-highlight/60',
        )}
      >
        <span
          aria-hidden="true"
          className={cn('w-3 font-display text-2xs text-ink', !selected && 'invisible')}
        >
          ▶
        </span>
        <span className="shrink-0 font-display text-2xs text-muted">
          <span className="sr-only">Number </span>
          {formatDexNumber(pokemon.id)}
        </span>
        {/* Drawn at native size (40–56px), so every sprite's pixels are 1:1. */}
        <span className="grid size-14 shrink-0 place-items-center">
          <img
            src={spriteUrlFor(pokemon.id, palette)}
            alt=""
            loading="lazy"
            decoding="async"
            className="sprite max-h-full max-w-full"
          />
        </span>
        <span className="min-w-0 flex-1 truncate text-xl font-medium text-ink uppercase">
          {pokemon.name}
        </span>
        {scanned && (
          <span className="flex shrink-0 gap-1 text-muted">
            {scanned.types.map((type) => (
              <TypeIcon key={type} type={type} labelled />
            ))}
          </span>
        )}
        {favorite && (
          <Star
            className="size-4 shrink-0 text-ink"
            fill="currentColor"
            role="img"
            aria-label="Registered"
          />
        )}
      </button>
    </li>
  );
});
