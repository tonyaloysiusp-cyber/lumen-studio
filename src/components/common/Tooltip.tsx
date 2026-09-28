// ---------------------------------------------------------------------
// components/common/Tooltip.tsx
// A real, lightweight hover tooltip (CSS-only positioning via a
// group/peer pattern -- no floating-ui dependency needed for a tooltip
// that's always anchored below or beside a toolbar icon). Shows the
// shortcut when one is given, matching "tooltips showing shortcuts."
// ---------------------------------------------------------------------

import type { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  shortcut?: string;
  side?: 'right' | 'bottom';
  children: ReactNode;
}

export function Tooltip({ label, shortcut, side = 'right', children }: TooltipProps) {
  const positionClass =
    side === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : 'top-full left-1/2 -translate-x-1/2 mt-2';

  return (
    <span className="relative inline-flex group/tooltip">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-neutral-100 opacity-0 shadow-lg ring-1 ring-neutral-700 transition-opacity duration-100 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${positionClass}`}
      >
        {label}
        {shortcut && <span className="ml-1.5 text-neutral-400">{shortcut}</span>}
      </span>
    </span>
  );
}
