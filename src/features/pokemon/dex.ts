/**
 * This Pokédex is the original one: Kanto, #001–#151. The range is enforced
 * here and in the API functions, so nothing beyond it is ever requested.
 */
export const DEX = {
  region: 'Kanto',
  first: 1,
  last: 151,
  size: 151,
} as const;

export const isInDex = (id: number): boolean =>
  Number.isInteger(id) && id >= DEX.first && id <= DEX.last;

/** Neighbouring entries, wrapping around the ends: #001 ← → #151. */
export const previousInDex = (id: number): number => (id <= DEX.first ? DEX.last : id - 1);
export const nextInDex = (id: number): number => (id >= DEX.last ? DEX.first : id + 1);
