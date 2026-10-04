import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchPokemon, fetchPokemonIndex, fetchSpecies, fetchTypeMembers } from './api/pokemon';
import type { PokemonTypeName } from './types';

export const pokemonKeys = {
  all: ['pokemon'] as const,
  index: () => [...pokemonKeys.all, 'index'] as const,
  detail: (id: number) => [...pokemonKeys.all, 'detail', id] as const,
  species: (id: number) => [...pokemonKeys.all, 'species', id] as const,
  type: (type: PokemonTypeName) => [...pokemonKeys.all, 'type', type] as const,
};

export const pokemonIndexOptions = () =>
  queryOptions({
    queryKey: pokemonKeys.index(),
    queryFn: ({ signal }) => fetchPokemonIndex(signal),
  });

export const pokemonOptions = (id: number) =>
  queryOptions({
    queryKey: pokemonKeys.detail(id),
    queryFn: ({ signal }) => fetchPokemon(id, signal),
  });

export const speciesOptions = (id: number) =>
  queryOptions({
    queryKey: pokemonKeys.species(id),
    queryFn: ({ signal }) => fetchSpecies(id, signal),
  });

export const typeMembersOptions = (type: PokemonTypeName) =>
  queryOptions({
    queryKey: pokemonKeys.type(type),
    queryFn: ({ signal }) => fetchTypeMembers(type, signal),
    select: (ids: number[]) => new Set(ids),
  });

export const usePokemonIndex = () => useQuery(pokemonIndexOptions());

export const usePokemon = (id: number) => useQuery(pokemonOptions(id));

export const useSpecies = (id: number) => useQuery(speciesOptions(id));

/** Members of a type; idle until a type filter is actually chosen. */
export const useTypeMembers = (type: PokemonTypeName | null) =>
  useQuery({ ...typeMembersOptions(type ?? 'normal'), enabled: type !== null });

/**
 * Reads a Pokémon from the cache without ever triggering a request. List rows
 * use it to show types for entries that have already been scanned, and the
 * device's action keys to act on the entry on screen.
 */
export const useCachedPokemon = (id: number) =>
  useQuery({ ...pokemonOptions(id), enabled: false }).data;

export const useCachedSpecies = (id: number) =>
  useQuery({ ...speciesOptions(id), enabled: false }).data;

/** Warm the cache for an entry the user is about to open. */
export function usePrefetchPokemon() {
  const client = useQueryClient();
  return useCallback(
    (id: number) => {
      void client.prefetchQuery(pokemonOptions(id));
      void client.prefetchQuery(speciesOptions(id));
    },
    [client],
  );
}
