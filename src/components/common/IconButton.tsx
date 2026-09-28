// ---------------------------------------------------------------------
// components/common/IconButton.tsx
// The one button component every toolbar/options-bar/panel uses, so
// active/disabled/hover states stay visually consistent everywhere.
// ---------------------------------------------------------------------

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Tooltip } from './Tooltip';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  tooltipSide?: 'right' | 'bottom';
  size?: 'sm' | 'md';
}

export function IconButton({
  icon,
  label,
  shortcut,
  active = false,
  tooltipSide = 'right',
  size = 'md',
  className = '',
  disabled,
  ...rest
}: IconButtonProps) {
  const dimensions = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  return (
    <Tooltip label={label} shortcut={shortcut} side={tooltipSide}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        className={`flex ${dimensions} items-center justify-center rounded-md text-neutral-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
          active ? 'bg-sky-600/90 text-white' : 'hover:bg-neutral-700/70'
        } ${disabled ? 'cursor-not-allowed opacity-35 hover:bg-transparent' : ''} ${className}`}
        {...rest}
      >
        {icon}
      </button>
    </Tooltip>
  );
}
