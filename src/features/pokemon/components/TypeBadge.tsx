import { TYPE_META } from '../typeMeta';
import type { PokemonTypeName } from '../types';

/** Small type glyph for list rows; `labelled` exposes the type name. */
export function TypeIcon({ type, labelled = false }: { type: PokemonTypeName; labelled?: boolean }) {
  const { icon: Icon, label } = TYPE_META[type];
  return (
    <span
      className="grid size-5 shrink-0 place-items-center border border-current"
      {...(labelled ? { role: 'img', 'aria-label': label, title: label } : { 'aria-hidden': true })}
    >
      <Icon className="size-3" strokeWidth={2.5} />
    </span>
  );
}

/** `[◆ FIRE]` — a bordered LCD label: glyph in an inverted cell, then the name. */
export function TypeBadge({ type }: { type: PokemonTypeName }) {
  const { icon: Icon, label } = TYPE_META[type];
  return (
    <span className="inline-flex h-8 items-stretch border-2 border-ink font-display text-2xs text-ink uppercase">
      <span className="grid w-7 place-items-center bg-ink text-screen" aria-hidden="true">
        <Icon className="size-4" strokeWidth={2.5} />
      </span>
      <span className="flex items-center px-2 leading-none">{label}</span>
    </span>
  );
}
