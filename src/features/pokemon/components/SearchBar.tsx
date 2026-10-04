import { X } from 'lucide-react';
import { useId, type KeyboardEvent, type Ref } from 'react';

interface SearchBarProps {
  ref?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  /** Enter: open the first result. */
  onSubmit: () => void;
  /** Arrow down: move into the results. */
  onArrowDown: () => void;
}

/** `SEARCH: PIKACHU_` — a labelled readout rather than a web form field. */
export function SearchBar({ ref, value, onChange, onSubmit, onArrowDown }: SearchBarProps) {
  const id = useId();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onArrowDown();
    } else if (event.key === 'Escape' && value) {
      onChange('');
    }
  };

  return (
    <div
      role="search"
      className="flex h-12 items-center border-2 border-ink bg-screen focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
    >
      <label
        htmlFor={id}
        className="flex h-full shrink-0 items-center bg-ink px-2.5 font-display text-2xs leading-none text-screen uppercase"
      >
        Search
      </label>
      {/* 16px+ text stops iOS zooming on focus. The wrapper draws the focus ring. */}
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Name or No."
        aria-label="Search Pokémon by name or number"
        aria-keyshortcuts="/"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-xl text-ink uppercase caret-ink outline-none placeholder:text-muted placeholder:normal-case"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="grid size-11 shrink-0 place-items-center text-ink hover:bg-highlight focus-visible:-outline-offset-4"
        >
          <X className="size-5" strokeWidth={3} aria-hidden="true" />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className="mr-3 hidden border border-line px-1.5 py-1 font-display text-2xs leading-none text-muted md:block"
        >
          /
        </kbd>
      )}
    </div>
  );
}
