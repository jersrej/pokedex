import { useIsFetching } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { usePokemonIndex } from '../../pokemon/queries';

function subscribeOnline(listener: () => void) {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

/**
 * Everything the status readout and LEDs show is real: the browser's
 * connectivity, whether any request is in flight, and the entry count
 * reported by the API.
 */
export function useDeviceStatus() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine);
  const syncing = useIsFetching() > 0;
  const index = usePokemonIndex();

  return {
    online,
    syncing,
    failed: index.isError,
    entryCount: index.data?.count ?? null,
  };
}
