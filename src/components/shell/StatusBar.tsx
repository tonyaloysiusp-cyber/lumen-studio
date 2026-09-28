// ---------------------------------------------------------------------
// components/shell/StatusBar.tsx
// Zoom / document size / color mode / memory usage. Memory usage reads
// the real (non-standard, Chromium-only) performance.memory API when
// present; elsewhere it honestly shows "—" rather than a made-up number.
// ---------------------------------------------------------------------

import { useEffect, useState } from 'react';
import type { LumenDocument } from '../../engine';

interface StatusBarProps {
  document: LumenDocument | null;
  zoomPercent: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
}

function readUsedHeapMB(): number | null {
  const memory = (performance as Performance & { memory?: MemoryInfo }).memory;
  if (!memory) return null;
  return Math.round(memory.usedJSHeapSize / (1024 * 1024));
}

export function StatusBar({ document: doc, zoomPercent }: StatusBarProps) {
  const [heapMB, setHeapMB] = useState<number | null>(() => readUsedHeapMB());

  useEffect(() => {
    const interval = window.setInterval(() => setHeapMB(readUsedHeapMB()), 2000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex h-6 shrink-0 items-center gap-4 border-t border-neutral-800 bg-neutral-900 px-3 text-[11px] text-neutral-400">
      <span>{Math.round(zoomPercent)}%</span>
      <span>{doc ? `${doc.width} × ${doc.height} px` : '—'}</span>
      <span>{doc ? doc.colorMode.toUpperCase() : '—'}</span>
      <span className="ml-auto">{heapMB !== null ? `${heapMB} MB` : 'Memory: —'}</span>
    </div>
  );
}
