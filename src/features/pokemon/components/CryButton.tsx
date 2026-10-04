import { canPlayCries, useCry } from '../hooks/useCry';

interface CryButtonProps {
  /** `null` while nothing is selected, or when the Pokémon has no cry. */
  url: string | null;
  pokemonName: string | null;
}

/**
 * The device's Cry key. Never autoplays and downloads nothing until
 * pressed. With no cry to play it stays on the device, but dead.
 */
export function CryButton({ url, pokemonName }: CryButtonProps) {
  const { status, toggle } = useCry(url);
  const available = url !== null && pokemonName !== null && canPlayCries();

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
      disabled={!available}
      aria-pressed={active}
      aria-label={
        available ? (active ? `Stop ${pokemonName}'s cry` : `Play ${pokemonName}'s cry`) : 'Cry'
      }
      className="action-key"
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
