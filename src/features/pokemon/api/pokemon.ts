import { DEX, isInDex } from '../dex';
import { cleanFlavorText, formatSlug, parseGeneration } from '../format';
import {
  POKEMON_TYPES,
  STAT_NAMES,
  type Pokemon,
  type PokemonIndex,
  type PokemonSpecies,
  type PokemonStat,
  type PokemonTypeName,
} from '../types';
import { ApiError, getJson } from './client';
import type {
  NamedResource,
  PokemonResponse,
  ResourceListResponse,
  SpeciesResponse,
  TypeResponse,
} from './schema';

const isTypeName = (name: string): name is PokemonTypeName =>
  (POKEMON_TYPES as readonly string[]).includes(name);

/** `https://pokeapi.co/api/v2/pokemon-species/25/` → `25`. */
function idFromUrl(url: string): number {
  return Number(url.replace(/\/$/, '').split('/').pop());
}

const isEnglish = (entry: { language: NamedResource }) => entry.language.name === 'en';

/** Entries outside the Kanto dex do not exist here; fail without a request. */
function assertInDex(id: number, path: string) {
  if (!isInDex(id)) throw new ApiError(404, path);
}

/** Oldest first, so the first hit is the value closest to Generation I. */
function oldestFirst<T extends { generation: NamedResource }>(entries: T[] = []): T[] {
  return entries.toSorted(
    (a, b) =>
      (parseGeneration(a.generation.name) ?? Infinity) -
      (parseGeneration(b.generation.name) ?? Infinity),
  );
}

/** Original typing: Clefairy is Normal, Magnemite is pure Electric. */
function originalTypes(data: PokemonResponse): PokemonTypeName[] {
  const slots = oldestFirst(data.past_types)[0]?.types ?? data.types;
  return slots
    .toSorted((a, b) => a.slot - b.slot)
    .map((entry) => entry.type.name)
    .filter(isTypeName);
}

/** Original base stats, including the single Special stat. */
function originalStats(data: PokemonResponse): PokemonStat[] {
  const history = oldestFirst(data.past_stats);
  return STAT_NAMES.flatMap((name) => {
    const past = history
      .map((entry) => entry.stats.find((stat) => stat.stat.name === name))
      .find((stat) => stat !== undefined);
    const value = (past ?? data.stats.find((stat) => stat.stat.name === name))?.base_stat;
    return value === undefined ? [] : [{ name, value }];
  });
}

/**
 * The Kanto dex as `{ id, name }` rows: one small request for exactly the
 * first 151 species, powering the list, search and previous/next labels.
 */
export async function fetchPokemonIndex(signal?: AbortSignal): Promise<PokemonIndex> {
  const data = await getJson<ResourceListResponse>(`pokemon-species?limit=${DEX.size}`, signal);
  const entries = data.results
    .map((resource) => ({
      id: idFromUrl(resource.url),
      slug: resource.name,
      name: formatSlug(resource.name),
    }))
    .filter((entry) => isInDex(entry.id))
    .sort((a, b) => a.id - b.id);
  return { count: entries.length, entries };
}

export async function fetchPokemon(id: number, signal?: AbortSignal): Promise<Pokemon> {
  const path = `pokemon/${id}`;
  assertInDex(id, path);
  const data = await getJson<PokemonResponse>(path, signal);
  // Keep only what the UI shows: the raw payload (moves, encounters, every
  // game's sprites) is ~100x larger and would sit in the query cache.
  return {
    id: data.id,
    name: formatSlug(data.name),
    heightMetres: data.height / 10,
    weightKilograms: data.weight / 10,
    types: originalTypes(data),
    stats: originalStats(data),
    // "Legacy" is the original Game Boy-era recording.
    cryUrl: data.cries?.legacy ?? data.cries?.latest ?? null,
  };
}

/** Pokédex text from the original games, in order of preference. */
const ORIGINAL_VERSIONS = ['red', 'blue', 'yellow'];

export async function fetchSpecies(id: number, signal?: AbortSignal): Promise<PokemonSpecies> {
  const path = `pokemon-species/${id}`;
  assertInDex(id, path);
  const data = await getJson<SpeciesResponse>(path, signal);
  const english = data.flavor_text_entries.filter(isEnglish);
  const flavor =
    ORIGINAL_VERSIONS.map((version) => english.find((entry) => entry.version.name === version)).find(
      (entry) => entry !== undefined,
    ) ?? english[0];
  return {
    id: data.id,
    displayName: data.names.find(isEnglish)?.name ?? null,
    genus: data.genera.find(isEnglish)?.genus ?? null,
    flavorText: flavor ? cleanFlavorText(flavor.flavor_text) : null,
  };
}

/**
 * The type endpoint reflects today's typing. Within Kanto the only Pokémon
 * that have left a Generation I type since are Clefairy and Clefable, which
 * were Normal before the Fairy type existed.
 */
const ORIGINAL_MEMBERS: Partial<Record<PokemonTypeName, number[]>> = {
  normal: [35, 36],
};

/** Kanto dex ids of every Pokémon that had this type in Generation I. */
export async function fetchTypeMembers(
  type: PokemonTypeName,
  signal?: AbortSignal,
): Promise<number[]> {
  const data = await getJson<TypeResponse>(`type/${type}`, signal);
  const current = data.pokemon.map((entry) => idFromUrl(entry.pokemon.url)).filter(isInDex);
  return [...new Set([...current, ...(ORIGINAL_MEMBERS[type] ?? [])])].sort((a, b) => a - b);
}

const RED_BLUE_SPRITES =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue';

/**
 * The Red/Blue sprite, addressable without an API call and well under 1 kB.
 *   grey:  the four Game Boy greys on a transparent background
 *   color: the same sprite in its Super Game Boy palette, on white
 * Both are drawn with `mix-blend-mode: multiply`, so the greys take on the
 * LCD's shades and the white background disappears into the panel.
 */
export function spriteUrlFor(id: number, palette: 'grey' | 'color' = 'grey'): string {
  return palette === 'color'
    ? `${RED_BLUE_SPRITES}/${id}.png`
    : `${RED_BLUE_SPRITES}/transparent/gray/${id}.png`;
}
