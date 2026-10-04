import { SearchX, TriangleAlert } from 'lucide-react';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ProgressMeter, RetryButton, ScreenMessage } from '../../../components/ScreenMessage';
import { cn } from '../../../lib/cn';
import { useDisplayMode } from '../../../lib/displayMode';
import { ApiError } from '../api/client';
import { spriteUrlFor } from '../api/pokemon';
import { DEX, isInDex, nextInDex, previousInDex } from '../dex';
import { formatDexNumber, formatHeight, formatWeight } from '../format';
import { usePokemon, usePokemonIndex, usePrefetchPokemon, useSpecies } from '../queries';
import type { Pokemon } from '../types';
import { CryButton } from './CryButton';
import { FavoriteButton } from './FavoriteButton';
import { StatBars } from './StatBars';
import { TypeBadge } from './TypeBadge';

interface PokemonDetailProps {
  id: number;
  /** `replace` is set when stepping to the previous/next entry. */
  onSelect: (id: number, options?: { replace?: boolean }) => void;
  onClose: () => void;
}

/** The right screen of the device: one Pokémon's Pokédex page. */
export default function PokemonDetail({ id, onSelect, onClose }: PokemonDetailProps) {
  const pokemon = usePokemon(id);
  const index = usePokemonIndex();

  // Stepping wraps around the dex; an invalid entry has no neighbours.
  const valid = isInDex(id);
  const previousId = valid ? previousInDex(id) : null;
  const nextId = valid ? nextInDex(id) : null;

  // ← / → step through the dex, Escape returns to the list.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.key === 'ArrowLeft' && previousId) onSelect(previousId, { replace: true });
      else if (event.key === 'ArrowRight' && nextId) onSelect(nextId, { replace: true });
      else if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previousId, nextId, onSelect, onClose]);

  let body;
  if (pokemon.isPending) {
    body = <ScreenMessage role="status" title="Scanning…" busy />;
  } else if (pokemon.isError) {
    const notFound = pokemon.error instanceof ApiError && pokemon.error.status === 404;
    body = notFound ? (
      <ScreenMessage
        role="alert"
        icon={<SearchX className="size-8" aria-hidden="true" />}
        title="No data found"
      >
        This Pokédex covers No. {formatDexNumber(DEX.first)}–{formatDexNumber(DEX.last)}.
      </ScreenMessage>
    ) : (
      <ScreenMessage
        role="alert"
        icon={<TriangleAlert className="size-8" aria-hidden="true" />}
        title="Pokédex connection error"
        action={<RetryButton onClick={() => void pokemon.refetch()} />}
      >
        Unable to retrieve data for No. {formatDexNumber(id)}.
      </ScreenMessage>
    );
  } else {
    // Keyed so the sprite, scan line, stat blocks and cry state restart per Pokémon.
    body = <Entry key={pokemon.data.id} pokemon={pokemon.data} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-slim @container min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {body}
      </div>
      {previousId && nextId && (
        <nav
          aria-label="Adjacent Pokémon"
          className="grid grid-cols-2 border-t-2 border-ink"
        >
          <StepButton
            direction="previous"
            id={previousId}
            name={index.data?.entries[previousId - 1]?.name}
            onSelect={onSelect}
          />
          <StepButton
            direction="next"
            id={nextId}
            name={index.data?.entries[nextId - 1]?.name}
            onSelect={onSelect}
          />
        </nav>
      )}
    </div>
  );
}

function Entry({ pokemon }: { pokemon: Pokemon }) {
  const species = useSpecies(pokemon.id);
  const palette = useDisplayMode() === 'color' ? 'color' : 'grey';
  // Tied to the sprite actually arriving, not to a timer.
  const [scanned, setScanned] = useState(false);
  const name = species.data?.displayName ?? pokemon.name;
  // "Mouse Pokémon" → "Mouse": the page already says what it is a page of.
  const genus = species.data?.genus?.replace(/\s*Pokémon$/i, '');

  return (
    // --px is the on-screen size of one sprite pixel; it grows with the panel.
    <article
      aria-labelledby="entry-name"
      className="flex flex-col gap-5 p-4 [--px:2] @sm:[--px:3] @md:p-5 @lg:[--px:4]"
    >
      <p
        role="status"
        className="flex h-3 items-center gap-3 font-display text-2xs leading-none text-muted uppercase"
      >
        {scanned ? 'Data found' : 'Scanning…'}
        {!scanned && <ProgressMeter />}
      </p>

      {/* The classic page: sprite and number on the left, vitals on the right. */}
      <header className="flex items-start gap-4 @sm:gap-5">
        <div className="flex shrink-0 flex-col items-center gap-2">
          {/* Keyed by palette: a different image is a fresh load (and scan pass). */}
          <Specimen
            key={palette}
            src={spriteUrlFor(pokemon.id, palette)}
            name={name}
            onSettled={() => setScanned(true)}
          />
          <p className="font-display text-xs text-ink @sm:text-sm">
            <span aria-hidden="true">No.</span>
            <span className="sr-only">Pokédex number </span>
            {formatDexNumber(pokemon.id)}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
          <h2
            id="entry-name"
            className="font-display text-sm leading-normal break-words text-ink uppercase @sm:text-base @lg:text-xl"
          >
            {name}
          </h2>
          <p className="min-h-6 text-xl leading-none text-muted uppercase">{genus}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-display text-2xs text-ink @sm:text-xs">
            <dt>
              <abbr title="Height" className="no-underline">
                HT
              </abbr>
            </dt>
            <dd>{formatHeight(pokemon.heightMetres)}</dd>
            <dt>
              <abbr title="Weight" className="no-underline">
                WT
              </abbr>
            </dt>
            <dd>{formatWeight(pokemon.weightKilograms)}</dd>
          </dl>
        </div>
      </header>

      <ul aria-label="Types" className="flex flex-wrap gap-2">
        {pokemon.types.map((type) => (
          <li key={type}>
            <TypeBadge type={type} />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <CryButton url={pokemon.cryUrl} pokemonName={name} />
        <FavoriteButton id={pokemon.id} pokemonName={name} />
      </div>

      <Section title="Dex entry">
        {species.isPending ? (
          <div role="status" aria-label="Loading description" className="py-1">
            <ProgressMeter />
          </div>
        ) : species.isError ? (
          <p className="text-xl text-muted">
            Description unavailable.{' '}
            <button
              type="button"
              onClick={() => void species.refetch()}
              className="font-semibold text-ink underline underline-offset-4"
            >
              Retry
            </button>
          </p>
        ) : (
          <p className="text-xl leading-snug text-pretty text-ink @sm:text-2xl @sm:leading-snug">
            {species.data.flavorText ?? 'No description on record.'}
          </p>
        )}
      </Section>

      <Section title="Base stats">
        <StatBars stats={pokemon.stats} />
      </Section>
    </article>
  );
}

/** Red/Blue sprites are 40, 48 or 56 pixels square; the frame fits the largest. */
const SPRITE_FRAME = 56;

/** The sprite in its frame, with a scan pass as it appears. */
function Specimen({
  src,
  name,
  onSettled,
}: {
  src: string;
  name: string;
  onSettled: () => void;
}) {
  // Known once loaded: lets every sprite be scaled by the same whole factor.
  const [nativeSize, setNativeSize] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const settled = nativeSize !== null || failed;

  return (
    <div
      className="relative grid place-items-center overflow-hidden border-2 border-ink"
      style={
        {
          width: `calc(${SPRITE_FRAME}px * var(--px) + 12px)`,
          height: `calc(${SPRITE_FRAME}px * var(--px) + 12px)`,
          '--scan-distance': `calc(${SPRITE_FRAME}px * var(--px) + 8px)`,
        } as CSSProperties
      }
    >
      {failed ? (
        <p className="p-2 text-center font-display text-2xs text-muted uppercase">No image</p>
      ) : (
        <img
          src={src}
          alt={`${name}, as it appears in Pokémon Red and Blue`}
          decoding="async"
          onLoad={(event) => {
            setNativeSize(event.currentTarget.naturalWidth);
            onSettled();
          }}
          onError={() => {
            setFailed(true);
            onSettled();
          }}
          style={nativeSize ? { width: `calc(${nativeSize}px * var(--px))` } : undefined}
          className={cn('sprite', !nativeSize && 'invisible')}
        />
      )}
      {settled && (
        // One stepped pass of a scan bar once the image is in. Decorative.
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 animate-scan bg-ink/40" />
      )}
    </div>
  );
}

/** A titled block under the game's dotted page divider. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex animate-enter flex-col gap-3">
      <h3 className="flex items-center gap-2 font-display text-2xs text-muted uppercase">
        {title}
        <span className="h-0 flex-1 border-t-2 border-dotted border-line" aria-hidden="true" />
      </h3>
      {children}
    </section>
  );
}

interface StepButtonProps {
  direction: 'previous' | 'next';
  id: number;
  name: string | undefined;
  onSelect: (id: number, options?: { replace?: boolean }) => void;
}

function StepButton({ direction, id, name, onSelect }: StepButtonProps) {
  const prefetch = usePrefetchPokemon();
  const isNext = direction === 'next';
  const warm = () => prefetch(id);

  return (
    <button
      type="button"
      onClick={() => onSelect(id, { replace: true })}
      onPointerEnter={warm}
      onFocus={warm}
      aria-label={`${isNext ? 'Next' : 'Previous'}: ${name ?? `No. ${formatDexNumber(id)}`}`}
      aria-keyshortcuts={isNext ? 'ArrowRight' : 'ArrowLeft'}
      className={cn(
        'flex h-14 min-w-0 items-center gap-3 px-3 text-ink hover:bg-highlight focus-visible:-outline-offset-2',
        isNext ? 'flex-row-reverse text-right' : 'border-r-2 border-ink',
      )}
    >
      <span className="font-display text-2xs" aria-hidden="true">
        {isNext ? '▶' : '◀'}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-2xs text-muted">{formatDexNumber(id)}</span>
        <span className="block truncate text-lg leading-tight font-medium uppercase">
          {name ?? ' '}
        </span>
      </span>
    </button>
  );
}
