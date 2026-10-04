import type {
  PokemonResponse,
  ResourceListResponse,
  SpeciesResponse,
  TypeResponse,
} from '../features/pokemon/api/schema';

const API = 'https://pokeapi.co/api/v2';
const named = (name: string, path = name) => ({ name, url: `${API}/${path}/` });

const DEX = ['bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'mr-mime'];

export const indexResponse: ResourceListResponse = {
  count: DEX.length,
  results: DEX.map((name, i) => named(name, `pokemon-species/${i + 1}`)),
};

export function pokemonResponse(id: number, withCry = true): PokemonResponse {
  const fire = id === 4;
  return {
    id,
    name: DEX[id - 1] ?? `pokemon-${id}`,
    height: 7,
    weight: 69,
    types: fire
      ? [{ slot: 1, type: named('fire') }]
      : [
          { slot: 2, type: named('poison') },
          { slot: 1, type: named('grass') },
        ],
    // #2 stands in for a Pokémon retyped after Generation I (like Clefairy).
    past_types:
      id === 2
        ? [
            { generation: named('generation-v'), types: [{ slot: 1, type: named('normal') }] },
            { generation: named('generation-i'), types: [{ slot: 1, type: named('psychic') }] },
          ]
        : [],
    stats: [
      { base_stat: 45, stat: named('hp') },
      { base_stat: 49, stat: named('attack') },
      { base_stat: 65, stat: named('special-attack') },
      { base_stat: 65, stat: named('special-defense') },
    ],
    past_stats: [
      { generation: named('generation-v'), stats: [{ base_stat: 40, stat: named('attack') }] },
      { generation: named('generation-i'), stats: [{ base_stat: 77, stat: named('special') }] },
    ],
    cries: withCry
      ? { latest: `https://audio.test/latest/${id}.ogg`, legacy: `https://audio.test/${id}.ogg` }
      : undefined,
  };
}

export function speciesResponse(id: number): SpeciesResponse {
  return {
    id,
    name: DEX[id - 1] ?? `pokemon-${id}`,
    names: [{ name: id === 1 ? 'Bulbasaur' : `Species ${id}`, language: named('en') }],
    genera: [{ genus: 'Seed Pokémon', language: named('en') }],
    flavor_text_entries: [
      { flavor_text: 'Eine Beschreibung.', language: named('de'), version: named('red') },
      { flavor_text: 'A yellow one.', language: named('en'), version: named('yellow') },
      {
        flavor_text: 'A strange seed was\nplanted on its\fback at birth.',
        language: named('en'),
        version: named('red'),
      },
      { flavor_text: 'A modern rewrite.', language: named('en'), version: named('sword') },
    ],
  };
}

export const fireTypeResponse: TypeResponse = {
  name: 'fire',
  pokemon: [
    { slot: 1, pokemon: named('charmander', 'pokemon/4') },
    // Later generations and alternate forms must never reach the list.
    { slot: 1, pokemon: named('cyndaquil', 'pokemon/155') },
    { slot: 1, pokemon: named('charizard-mega-x', 'pokemon/10034') },
  ],
};
