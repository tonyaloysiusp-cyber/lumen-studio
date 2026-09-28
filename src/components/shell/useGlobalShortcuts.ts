// ---------------------------------------------------------------------
// components/shell/useGlobalShortcuts.ts
// Wires the keyboard shortcuts the UI already shows (toolbar tooltips,
// MenuBar's ⌘Z/⌘⇧Z/⌘+/⌘-/⌘0/⌘1/⇧⌘N/V/H/Z labels) to real handlers -- a
// shortcut label that doesn't fire is exactly the kind of "looks real,
// isn't" thing this project avoids. The exception is ⌘N/⌘O/⌘W: real
// browsers reserve those at the chrome level (new window/open-file-
// dialog/close-tab) and never deliver the keydown to page JS at all, in
// every major browser -- so no web app can intercept them. Showing the
// desktop-convention label anyway is the same choice every browser-based
// editor (Photopea included) makes; it isn't this app pretending to
// support something it doesn't. Ignored while focus is in a text input
// so typing "v" or "z" into a rename field doesn't switch tools instead.
// ---------------------------------------------------------------------

import { useEffect } from 'react';

interface GlobalShortcutsOptions {
  onUndo: () => void;
  onRedo: () => void;
  onSelectTool: (toolId: 'move' | 'hand' | 'zoom') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
  onZoomTo100: () => void;
  onNewLayer: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

export function useGlobalShortcuts({
  onUndo,
  onRedo,
  onSelectTool,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomTo100,
  onNewLayer,
}: GlobalShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNewLayer();
        return;
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        onZoomIn();
        return;
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        onZoomOut();
        return;
      }
      if (mod && e.key === '0') {
        e.preventDefault();
        onZoomToFit();
        return;
      }
      if (mod && e.key === '1') {
        e.preventDefault();
        onZoomTo100();
        return;
      }
      if (mod) return; // leave every other Cmd/Ctrl combo (copy, save, ...) alone

      switch (e.key.toLowerCase()) {
        case 'v':
          onSelectTool('move');
          break;
        case 'h':
          onSelectTool('hand');
          break;
        case 'z':
          onSelectTool('zoom');
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onUndo, onRedo, onSelectTool, onZoomIn, onZoomOut, onZoomToFit, onZoomTo100, onNewLayer]);
}
