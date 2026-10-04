import { playSfx } from '../../../lib/sfx';
import { useFavorites } from '../hooks/useFavorites';

/** `☆ Register` / `★ Registered` — keeps a Pokémon in the favourites list. */
export function FavoriteButton({ id, pokemonName }: { id: number; pokemonName: string }) {
  const { favorites, toggle } = useFavorites();
  const favorite = favorites.has(id);

  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={favorite ? `Remove ${pokemonName} from favourites` : `Add ${pokemonName} to favourites`}
      onClick={() => {
        playSfx('confirm');
        toggle(id);
      }}
      className="lcd-key"
    >
      {favorite ? '★ Registered' : '☆ Register'}
    </button>
  );
}
