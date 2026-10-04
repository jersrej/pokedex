/** The fifteen types that existed in Generation I. */
export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

/** Generation I had a single Special stat, in this order on the status screen. */
export const STAT_NAMES = ['hp', 'attack', 'defense', 'speed', 'special'] as const;

export type StatName = (typeof STAT_NAMES)[number];

/** One row of the Pokédex index. */
export interface PokemonSummary {
  id: number;
  /** API slug, e.g. `mr-mime`. */
  slug: string;
  /** Human-readable name derived from the slug, e.g. `Mr. Mime`. */
  name: string;
}

export interface PokemonIndex {
  count: number;
  entries: PokemonSummary[];
}

export interface PokemonStat {
  name: StatName;
  value: number;
}

/** A Pokémon as it was in Generation I: original typing, stats and cry. */
export interface Pokemon {
  id: number;
  name: string;
  heightMetres: number;
  weightKilograms: number;
  types: PokemonTypeName[];
  stats: PokemonStat[];
  /** Null when PokéAPI has no recording for this Pokémon. */
  cryUrl: string | null;
}

export interface PokemonSpecies {
  id: number;
  /** Official English name, e.g. `Mr. Mime`. */
  displayName: string | null;
  /** e.g. `Seed Pokémon`. */
  genus: string | null;
  /** Pokédex text from Red/Blue (or Yellow), as written in the games. */
  flavorText: string | null;
}
