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
 * Three keys raised from the shell under the screen. The active one is
 * filled and held down, with a lit indicator — never colour alone.
 */
export function DisplayModeControl({ mode, onChange }: DisplayModeControlProps) {
  return (
    <div role="group" aria-labelledby="display-mode-label" className="flex items-center gap-2">
      <span
        id="display-mode-label"
        className="font-display text-2xs text-body-ink uppercase opacity-80 max-sm:sr-only md:max-lg:sr-only"
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
              'hw-key flex h-11 flex-1 items-center justify-center gap-2 rounded-md px-2 font-display text-2xs leading-none uppercase',
              active && 'hw-key-lit',
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
