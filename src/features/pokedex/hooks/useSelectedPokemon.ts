import { useCallback, useSyncExternalStore } from 'react';

/**
 * The selected Pokémon lives in the URL hash (`#/pokemon/25`). That makes
 * entries linkable and lets the browser/phone Back button return to the
 * list, without pulling in a router.
 */
function parseHash(): number | null {
  const match = /^#\/pokemon\/(\d+)$/.exec(window.location.hash);
  if (!match) return null;
  const id = Number(match[1]);
  return id > 0 ? id : null;
}

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

function navigate(hash: string, replace: boolean) {
  if (replace) {
    window.history.replaceState(null, '', hash);
    // replaceState does not announce itself.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export function useSelectedPokemon() {
  const selectedId = useSyncExternalStore(subscribe, parseHash);

  /** `replace` steps between entries without stacking up history. */
  const select = useCallback((id: number, options?: { replace?: boolean }) => {
    navigate(`#/pokemon/${id}`, options?.replace ?? false);
  }, []);

  const clear = useCallback(() => navigate('#/', false), []);

  return { selectedId, select, clear };
}
