import { canPlayCries, useCry } from '../hooks/useCry';

interface CryButtonProps {
  url: string | null;
  pokemonName: string;
}

/**
 * Plays the Pokémon's cry on request. Never autoplays, downloads nothing
 * until pressed, and renders nothing at all when there is no cry to play.
 */
export function CryButton({ url, pokemonName }: CryButtonProps) {
  const { status, toggle } = useCry(url);

  if (!url || !canPlayCries()) return null;

  const active = status === 'loading' || status === 'playing';
  const text = {
    idle: '▶ Cry',
    loading: '… Cry',
    playing: '■ Stop',
    error: '✕ Retry',
  }[status];

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? `Stop ${pokemonName}'s cry` : `Play ${pokemonName}'s cry`}
      className="lcd-key"
    >
      {text}
      <span role="status" className="sr-only">
        {status === 'loading' && 'Loading cry'}
        {status === 'playing' && 'Playing cry'}
        {status === 'error' && 'Cry could not be played'}
      </span>
    </button>
  );
}
