import { Star } from 'lucide-react';
import { playSfx } from '../../../lib/sfx';
import { TYPE_META } from '../typeMeta';
import { POKEMON_TYPES, type PokemonTypeName } from '../types';

interface ListFiltersProps {
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  type: PokemonTypeName | null;
  onTypeChange: (type: PokemonTypeName | null) => void;
}

/** A single scrolling row of toggle keys: registered, then one per type. */
export function ListFilters({
  favoritesOnly,
  onFavoritesOnlyChange,
  type,
  onTypeChange,
}: ListFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filters"
      // Padding leaves room for the keys' hard shadows and focus rings.
      className="scrollbar-none -mx-3 flex gap-2.5 overflow-x-auto px-3 pt-1 pb-2"
    >
      <button
        type="button"
        aria-pressed={favoritesOnly}
        onClick={() => {
          playSfx('confirm');
          onFavoritesOnlyChange(!favoritesOnly);
        }}
        className="lcd-key"
      >
        <Star className="size-4" fill="currentColor" aria-hidden="true" />
        Registered
      </button>
      {POKEMON_TYPES.map((name) => {
        const { icon: Icon, label } = TYPE_META[name];
        const active = type === name;
        return (
          <button
            key={name}
            type="button"
            aria-pressed={active}
            onClick={() => {
              playSfx('confirm');
              onTypeChange(active ? null : name);
            }}
            className="lcd-key"
          >
            <Icon className="size-4" strokeWidth={2.5} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
