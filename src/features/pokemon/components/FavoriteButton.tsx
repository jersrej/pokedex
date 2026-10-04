import { playSfx } from '../../../lib/sfx';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  /** `null` while there is no entry on screen to register. */
  id: number | null;
  pokemonName: string | null;
}

/** The device's Register key: `☆ Register` / `★ Registered`, held down while registered. */
export function FavoriteButton({ id, pokemonName }: FavoriteButtonProps) {
  const { favorites, toggle } = useFavorites();
  const available = id !== null && pokemonName !== null;
  const favorite = id !== null && favorites.has(id);

  return (
    <button
      type="button"
      disabled={!available}
      aria-pressed={favorite}
      aria-label={
        available
          ? favorite
            ? `Remove ${pokemonName} from favourites`
            : `Add ${pokemonName} to favourites`
          : 'Register'
      }
      onClick={() => {
        if (id === null) return;
        playSfx('confirm');
        toggle(id);
      }}
      className="action-key"
    >
      {favorite ? '★ Registered' : '☆ Register'}
    </button>
  );
}
