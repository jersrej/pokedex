import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Pokedex } from './features/pokedex/components/Pokedex';
import { createQueryClient } from './lib/queryClient';

export default function App() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Pokedex />
    </QueryClientProvider>
  );
}
