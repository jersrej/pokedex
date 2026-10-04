import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name; also shown as the tooltip. */
  label: string;
  children: ReactNode;
}

/** Square 44px button moulded into the device shell. */
export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-11 shrink-0 place-items-center rounded-md text-body-ink transition-colors duration-150 hover:bg-body-dark/60 focus-visible:outline-body-ink aria-pressed:bg-body-dark',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
