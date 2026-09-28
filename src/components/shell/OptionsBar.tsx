// ---------------------------------------------------------------------
// components/shell/OptionsBar.tsx
// Context-sensitive settings for the active tool. Only Move/Hand/Zoom
// are live in Phase 1, so this only ever shows real, working controls --
// align/distribute (Move's own future options) stay off until layers
// exist to align in Phase 2.
// ---------------------------------------------------------------------

import { AlignLeft, AlignCenterHorizontal, AlignRight } from 'lucide-react';
import { IconButton } from '../common/IconButton';

interface OptionsBarProps {
  activeTool: string;
  zoomPercent: number;
  onZoomPercentChange: (percent: number) => void;
  onZoomToFit: () => void;
  onZoomTo100: () => void;
  hasActiveDocument: boolean;
}

export function OptionsBar({
  activeTool,
  zoomPercent,
  onZoomPercentChange,
  onZoomToFit,
  onZoomTo100,
  hasActiveDocument,
}: OptionsBarProps) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-3 border-b border-neutral-800 bg-neutral-900 px-3 text-[12px] text-neutral-300">
      {activeTool === 'move' && (
        <>
          <span className="text-neutral-500">Move</span>
          <div className="h-4 w-px bg-neutral-700" />
          <div className="flex items-center gap-1 opacity-35" title="Align/distribute needs layers to align — Phase 2">
            <IconButton icon={<AlignLeft size={15} />} label="Align Left" tooltipSide="bottom" disabled size="sm" />
            <IconButton icon={<AlignCenterHorizontal size={15} />} label="Align Center" tooltipSide="bottom" disabled size="sm" />
            <IconButton icon={<AlignRight size={15} />} label="Align Right" tooltipSide="bottom" disabled size="sm" />
          </div>
        </>
      )}
      {activeTool === 'hand' && <span className="text-neutral-500">Hand — drag to pan, scroll to zoom</span>}
      {activeTool === 'zoom' && (
        <>
          <span className="text-neutral-500">Zoom</span>
          <div className="h-4 w-px bg-neutral-700" />
          <input
            type="number"
            min={2}
            max={3200}
            value={Math.round(zoomPercent)}
            disabled={!hasActiveDocument}
            onChange={(e) => onZoomPercentChange(Number(e.target.value) || 100)}
            className="w-16 rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-right text-neutral-100 disabled:opacity-40"
          />
          <span className="text-neutral-500">%</span>
          <button
            type="button"
            disabled={!hasActiveDocument}
            onClick={onZoomToFit}
            className="rounded border border-neutral-700 px-2 py-0.5 hover:bg-neutral-700/70 disabled:opacity-40"
          >
            Fit
          </button>
          <button
            type="button"
            disabled={!hasActiveDocument}
            onClick={onZoomTo100}
            className="rounded border border-neutral-700 px-2 py-0.5 hover:bg-neutral-700/70 disabled:opacity-40"
          >
            100%
          </button>
        </>
      )}
    </div>
  );
}
