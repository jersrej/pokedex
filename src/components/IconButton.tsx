import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name; also shown as the tooltip. */
  label: string;
  children: ReactNode;
}

/** Square 44px key raised from the device shell. */
export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'hw-key grid size-11 shrink-0 place-items-center rounded-md',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
