import { SearchX, Star, TriangleAlert } from 'lucide-react';
import {
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { RetryButton, ScreenMessage } from '../../../components/ScreenMessage';
import { useFavorites } from '../hooks/useFavorites';
import { usePokemonIndex, useTypeMembers } from '../queries';
import { searchPokemon } from '../search';
import { TYPE_META } from '../typeMeta';
import type { PokemonSummary, PokemonTypeName } from '../types';
import { ListFilters } from './ListFilters';
import { PokemonListItem } from './PokemonListItem';
import { SearchBar } from './SearchBar';

/** Rows rendered at first and added each time the end of the list scrolls into view. */
const PAGE_SIZE = 60;

export interface PokemonBrowserHandle {
  /** Move the selection up (-1) or down (1) the list as currently filtered. */
  step: (delta: -1 | 1) => void;
}

interface PokemonBrowserProps {
  ref?: Ref<PokemonBrowserHandle>;
  selectedId: number | null;
  onSelect: (id: number, options?: { replace?: boolean }) => void;
}

/** Search, filters and the scrolling index — the left screen of the device. */
export function PokemonBrowser({ ref, selectedId, onSelect }: PokemonBrowserProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<PokemonTypeName | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  // Typing stays responsive even while a long result list re-renders.
  const deferredQuery = useDeferredValue(query);

  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const index = usePokemonIndex();
  const typeMembers = useTypeMembers(type);
  const { favorites } = useFavorites();

  const results = useMemo(() => {
    let entries = index.data?.entries ?? [];
    if (favoritesOnly) entries = entries.filter((entry) => favorites.has(entry.id));
    if (type) {
      const members = typeMembers.data;
      entries = members ? entries.filter((entry) => members.has(entry.id)) : [];
    }
    return searchPokemon(entries, deferredQuery);
  }, [index.data, favoritesOnly, favorites, type, typeMembers.data, deferredQuery]);

  useImperativeHandle(
    ref,
    () => ({
      step(delta) {
        const at = results.findIndex((entry) => entry.id === selectedId);
        // Nothing selected (or it is filtered out): start from the top.
        const next = results[at === -1 ? 0 : at + delta];
        if (next) onSelect(next.id, { replace: selectedId !== null });
      },
    }),
    [results, selectedId, onSelect],
  );

  // "/" jumps to search from anywhere, like most searchable apps.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (event.key !== '/' || typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (searchRef.current?.closest('[inert]')) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const focusRow = (row: Element | null | undefined) => {
    row?.querySelector('button')?.focus();
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const row = (event.target as HTMLElement).closest('li');
    if (!row) return;
    event.preventDefault();
    if (event.key === 'ArrowDown') focusRow(row.nextElementSibling);
    else if (row.previousElementSibling) focusRow(row.previousElementSibling);
    else searchRef.current?.focus();
  };

  let body;
  if (index.isPending) {
    body = <ScreenMessage role="status" title="Scanning Pokédex database…" busy />;
  } else if (index.isError) {
    body = (
      <ScreenMessage
        role="alert"
        icon={<TriangleAlert className="size-8" aria-hidden="true" />}
        title="Pokédex connection error"
        action={<RetryButton onClick={() => void index.refetch()} />}
      >
        Unable to retrieve Pokémon data. Check your connection and try again.
      </ScreenMessage>
    );
  } else if (type && typeMembers.isPending) {
    body = (
      <ScreenMessage role="status" title={`Searching ${TYPE_META[type].label} types…`} busy />
    );
  } else if (type && typeMembers.isError) {
    body = (
      <ScreenMessage
        role="alert"
        icon={<TriangleAlert className="size-8" aria-hidden="true" />}
        title="Filter unavailable"
        action={<RetryButton onClick={() => void typeMembers.refetch()} />}
      >
        Unable to retrieve {TYPE_META[type].label}-type Pokémon.
      </ScreenMessage>
    );
  } else if (results.length === 0) {
    const noFavorites = favoritesOnly && favorites.size === 0;
    body = noFavorites ? (
      <ScreenMessage
        role="status"
        icon={<Star className="size-8" aria-hidden="true" />}
        title="None registered"
      >
        Open a Pokémon and press Register to keep it here.
      </ScreenMessage>
    ) : (
      <ScreenMessage
        role="status"
        icon={<SearchX className="size-8" aria-hidden="true" />}
        title="No Pokémon found"
      >
        Nothing matches the current search and filters.
      </ScreenMessage>
    );
  } else {
    body = (
      <ResultList
        // Remount on a new result set: scroll and paging start from the top.
        key={`${deferredQuery}|${type ?? ''}|${favoritesOnly}`}
        ref={listRef}
        results={results}
        selectedId={selectedId}
        favorites={favorites}
        onSelect={onSelect}
        onKeyDown={handleListKeyDown}
      />
    );
  }

  const filtered = Boolean(deferredQuery.trim()) || type !== null || favoritesOnly;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b-2 border-ink p-3">
        <SearchBar
          ref={searchRef}
          value={query}
          onChange={setQuery}
          onSubmit={() => {
            const first = results[0];
            if (first) onSelect(first.id);
          }}
          onArrowDown={() => focusRow(listRef.current?.firstElementChild)}
        />
        <ListFilters
          favoritesOnly={favoritesOnly}
          onFavoritesOnlyChange={setFavoritesOnly}
          type={type}
          onTypeChange={setType}
        />
        <p aria-live="polite" className="font-display text-2xs text-muted uppercase">
          {index.data
            ? `${results.length} ${filtered ? (results.length === 1 ? 'match' : 'matches') : 'entries'}`
            : ' '}
        </p>
      </div>
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  );
}

interface ResultListProps {
  ref: React.Ref<HTMLUListElement>;
  results: PokemonSummary[];
  selectedId: number | null;
  favorites: ReadonlySet<number>;
  onSelect: (id: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLUListElement>) => void;
}

/**
 * Renders the result set a page at a time. The data is already in memory;
 * what we avoid is mounting (and loading sprites for) a thousand rows.
 */
function ResultList({ ref, results, selectedId, favorites, onSelect, onKeyDown }: ResultListProps) {
  const [pages, setPages] = useState(1);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Always render far enough to include the selected entry, so stepping
  // with next/previous keeps the highlighted row in the list.
  const selectedIndex = selectedId === null ? -1 : results.findIndex((r) => r.id === selectedId);
  const limit = Math.max(pages * PAGE_SIZE, selectedIndex + 1 + PAGE_SIZE / 2);
  const visible = results.slice(0, limit);
  const hasMore = limit < results.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPages(Math.ceil(limit / PAGE_SIZE) + 1);
        }
      },
      { root: scrollerRef.current, rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  // Keep the selected row in view. Done by hand rather than with
  // scrollIntoView, which may also scroll the device's clipped ancestors.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const row = scroller?.querySelector(`[data-pokemon-id="${selectedId}"]`);
    if (!scroller || !row) return;
    const view = scroller.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    const margin = 8;
    if (box.top < view.top) scroller.scrollTop -= view.top - box.top + margin;
    else if (box.bottom > view.bottom) scroller.scrollTop += box.bottom - view.bottom + margin;
  }, [selectedId]);

  return (
    <div ref={scrollerRef} className="scrollbar-slim h-full overflow-y-auto overscroll-contain p-2">
      <ul ref={ref} aria-label="Pokémon" onKeyDown={onKeyDown} className="flex flex-col">
        {visible.map((pokemon) => (
          <PokemonListItem
            key={pokemon.id}
            pokemon={pokemon}
            selected={pokemon.id === selectedId}
            favorite={favorites.has(pokemon.id)}
            onSelect={onSelect}
          />
        ))}
      </ul>
      {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
    </div>
  );
}
