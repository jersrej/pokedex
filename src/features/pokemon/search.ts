import type { PokemonSummary } from './types';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Case-insensitive match on name (anywhere) or Pokédex number (prefix).
 * `pika` → Pikachu, `25` / `#025` → #25 then #250–259, `mr mime` → Mr Mime.
 */
export function searchPokemon(entries: PokemonSummary[], query: string): PokemonSummary[] {
  const trimmed = query.trim();
  if (!trimmed) return entries;

  const digits = /^#?\d+$/.test(trimmed) ? String(Number(trimmed.replace('#', ''))) : null;
  if (digits !== null) {
    return entries.filter((entry) => String(entry.id).startsWith(digits));
  }

  const needle = normalize(trimmed);
  if (!needle) return [];
  return entries.filter((entry) => normalize(entry.slug).includes(needle));
}
