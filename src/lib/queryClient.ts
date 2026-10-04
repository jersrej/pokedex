import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../features/pokemon/api/client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Pokédex data is effectively static: once fetched, never refetch
        // on its own. A manual retry is offered wherever a request fails.
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          // A 4xx will not fix itself; only retry network/5xx failures, once.
          !(error instanceof ApiError && error.status < 500) && failureCount < 1,
      },
    },
  });
}
