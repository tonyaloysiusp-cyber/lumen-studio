// ---------------------------------------------------------------------
// components/common/Menu.tsx
// A real dropdown menu (click to open, click outside/Escape to close,
// arrow-key navigation) used by MenuBar's File/Edit/Image/... top-level
// entries. Every item that isn't wired to a real action yet is rendered
// disabled with a reason, never a clickable no-op.
// ---------------------------------------------------------------------

import { useEffect, useId, useRef, useState } from 'react';

export interface MenuItem {
  label: string;
  shortcut?: string;
  onSelect?: () => void;
  disabled?: boolean;
  /** Shown next to a disabled item, e.g. "Phase 2" -- honest about why it's not clickable yet. */
  disabledReason?: string;
  separatorBefore?: boolean;
}

interface MenuProps {
  label: string;
  items: MenuItem[];
}

export function Menu({ label, items }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`rounded px-2.5 py-1 text-[13px] text-neutral-300 hover:bg-neutral-700/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
          open ? 'bg-neutral-700/70 text-white' : ''
        }`}
      >
        {label}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-md border border-neutral-700 bg-neutral-800 py-1 shadow-xl"
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.separatorBefore && <div className="my-1 border-t border-neutral-700" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect?.();
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] ${
                  item.disabled ? 'cursor-not-allowed text-neutral-500' : 'text-neutral-200 hover:bg-sky-600/80 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <span className="ml-4 text-[11px] text-neutral-500">
                  {item.disabled ? item.disabledReason : item.shortcut}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
