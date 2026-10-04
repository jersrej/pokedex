import { CryButton } from '../../pokemon/components/CryButton';
import { FavoriteButton } from '../../pokemon/components/FavoriteButton';
import { useCachedPokemon, useCachedSpecies } from '../../pokemon/queries';

/**
 * The two action keys beside the D-pad — this device's Select and Start.
 * They act on the entry on screen, read from the cache the entry screen
 * fills, and are dead until there is one.
 */
export function ActionKeys({ selectedId }: { selectedId: number | null }) {
  const pokemon = useCachedPokemon(selectedId ?? 0);
  const species = useCachedSpecies(selectedId ?? 0);
  const name = pokemon ? (species?.displayName ?? pokemon.name) : null;

  return (
    <div
      role="group"
      aria-label="Entry actions"
      className="flex flex-col gap-3 [@media(max-height:30rem)]:flex-row"
    >
      {/* Keyed so the cry state resets — and the previous cry stops — per Pokémon. */}
      <CryButton key={selectedId} url={pokemon?.cryUrl ?? null} pokemonName={name} />
      <FavoriteButton id={pokemon?.id ?? null} pokemonName={name} />
    </div>
  );
}
