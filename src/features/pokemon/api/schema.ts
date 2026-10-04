/** Raw PokéAPI response shapes — only the fields this app reads. */

export interface NamedResource {
  name: string;
  url: string;
}

export interface ResourceListResponse {
  count: number;
  results: NamedResource[];
}

interface TypeSlot {
  slot: number;
  type: NamedResource;
}

interface StatValue {
  base_stat: number;
  stat: NamedResource;
}

export interface PokemonResponse {
  id: number;
  name: string;
  /** Decimetres. */
  height: number;
  /** Hectograms. */
  weight: number;
  types: TypeSlot[];
  /** Typing that applied up to and including `generation`, where it has changed since. */
  past_types?: Array<{ generation: NamedResource; types: TypeSlot[] }>;
  stats: StatValue[];
  /** Stats that applied up to and including `generation`, where they have changed since. */
  past_stats?: Array<{ generation: NamedResource; stats: StatValue[] }>;
  cries?: { latest: string | null; legacy: string | null };
}

export interface SpeciesResponse {
  id: number;
  name: string;
  names: Array<{ name: string; language: NamedResource }>;
  genera: Array<{ genus: string; language: NamedResource }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: NamedResource;
    version: NamedResource;
  }>;
}

export interface TypeResponse {
  name: string;
  pokemon: Array<{ slot: number; pokemon: NamedResource }>;
}
