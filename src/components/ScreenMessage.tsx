import type { ReactNode } from 'react';

interface ScreenMessageProps {
  /** `status` for loading/empty states, `alert` for errors. */
  role: 'status' | 'alert';
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** Shows a stepping progress meter under the title. */
  busy?: boolean;
}

/** Full-panel readout used for loading, empty and error states. */
export function ScreenMessage({ role, icon, title, children, action, busy }: ScreenMessageProps) {
  return (
    <div
      role={role}
      className="flex h-full min-h-48 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      {icon && <div className="text-muted">{icon}</div>}
      <p className="font-display text-xs leading-relaxed text-ink uppercase">{title}</p>
      {busy && <ProgressMeter />}
      {children && <p className="max-w-xs text-lg leading-snug text-muted">{children}</p>}
      {action}
    </div>
  );
}

/** `████░░░░` — eight cells filling one at a time while something loads. */
export function ProgressMeter() {
  return (
    <span aria-hidden="true" className="relative flex gap-0.5">
      <Cells className="bg-highlight" />
      <span className="absolute inset-0 flex animate-progress gap-0.5">
        <Cells className="bg-ink" />
      </span>
    </span>
  );
}

function Cells({ className }: { className: string }) {
  return Array.from({ length: 8 }, (_, cell) => (
    <span key={cell} className={`h-3 w-2.5 ${className}`} />
  ));
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="lcd-key">
      Retry
    </button>
  );
}
