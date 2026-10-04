import { cn } from '../../../lib/cn';
import { DISPLAY_MODES, type DisplayMode } from '../../../lib/displayMode';

const LABELS: Record<DisplayMode, { short: string; full: string }> = {
  classic: { short: 'Classic', full: 'Classic LCD display' },
  mono: { short: 'Mono', full: 'Monochrome display' },
  color: { short: 'Color', full: 'Color display' },
};

interface DisplayModeControlProps {
  mode: DisplayMode;
  onChange: (mode: DisplayMode) => void;
}

/**
 * Three keys moulded into the shell under the screen. The active one is
 * filled and pressed in, with a lit indicator — never colour alone.
 */
export function DisplayModeControl({ mode, onChange }: DisplayModeControlProps) {
  return (
    <div role="group" aria-labelledby="display-mode-label" className="flex items-center gap-2">
      <span
        id="display-mode-label"
        className="font-display text-2xs text-body-ink uppercase opacity-80 max-sm:sr-only"
      >
        Display
      </span>
      {DISPLAY_MODES.map((option) => {
        const active = option === mode;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            aria-label={LABELS[option].full}
            onClick={() => onChange(option)}
            className={cn(
              'flex h-11 flex-1 items-center justify-center gap-2 border-2 border-body-ink px-2 font-display text-2xs leading-none uppercase focus-visible:outline-body-ink',
              active
                ? 'translate-0.5 bg-body-ink text-body-dark'
                : 'text-body-ink shadow-[2px_2px_0_var(--pokedex-body-dark)] hover:bg-body-dark/60',
            )}
          >
            <span
              aria-hidden="true"
              className={cn('size-1.5 bg-current', !active && 'opacity-30')}
            />
            {LABELS[option].short}
          </button>
        );
      })}
    </div>
  );
}
