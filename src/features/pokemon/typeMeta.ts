import {
  Bug,
  Circle,
  Crown,
  Droplet,
  Eye,
  Feather,
  Flame,
  FlaskConical,
  Gem,
  Ghost,
  HandFist,
  Leaf,
  Mountain,
  Snowflake,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { PokemonTypeName } from './types';

interface TypeMeta {
  label: string;
  /** The LCD is monochrome, so a type is its name plus its own glyph. */
  icon: LucideIcon;
}

export const TYPE_META: Record<PokemonTypeName, TypeMeta> = {
  normal: { label: 'Normal', icon: Circle },
  fire: { label: 'Fire', icon: Flame },
  water: { label: 'Water', icon: Droplet },
  electric: { label: 'Electric', icon: Zap },
  grass: { label: 'Grass', icon: Leaf },
  ice: { label: 'Ice', icon: Snowflake },
  fighting: { label: 'Fighting', icon: HandFist },
  poison: { label: 'Poison', icon: FlaskConical },
  ground: { label: 'Ground', icon: Mountain },
  flying: { label: 'Flying', icon: Feather },
  psychic: { label: 'Psychic', icon: Eye },
  bug: { label: 'Bug', icon: Bug },
  rock: { label: 'Rock', icon: Gem },
  ghost: { label: 'Ghost', icon: Ghost },
  dragon: { label: 'Dragon', icon: Crown },
};
