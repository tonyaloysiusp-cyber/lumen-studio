// ---------------------------------------------------------------------
// components/shell/RightDock.tsx
// Tabbed right-hand dock hosting the Layers and History panels. Only
// rendered once a document is open -- there's nothing real to show
// otherwise, so it doesn't render an empty shell.
// ---------------------------------------------------------------------

import { X } from 'lucide-react';
import type { DocumentId, Layer, LayerId } from '../../engine';
import type { HistoryStatus } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { LayersPanel } from '../panels/LayersPanel';
import { HistoryPanel } from '../panels/HistoryPanel';

interface RightDockProps {
  docId: DocumentId;
  layers: Layer[];
  activeLayerId: LayerId | null;
  historyStatus: HistoryStatus;
}

const TABS = [
  { id: 'layers', label: 'Layers' },
  { id: 'history', label: 'History' },
] as const;

export function RightDock({ docId, layers, activeLayerId, historyStatus }: RightDockProps) {
  const activeDockTab = useUIStore((s) => s.activeDockTab);
  const setActiveDockTab = useUIStore((s) => s.setActiveDockTab);
  const toggleDockVisible = useUIStore((s) => s.toggleDockVisible);

  return (
    <div className="flex w-64 shrink-0 flex-col border-l border-neutral-800 bg-neutral-900">
      <div role="tablist" aria-label="Panels" className="flex border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeDockTab === tab.id}
            onClick={() => setActiveDockTab(tab.id)}
            className={`flex-1 px-2 py-1.5 text-[12px] font-medium ${
              activeDockTab === tab.id
                ? 'border-b-2 border-sky-500 text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          title="Hide panels (Window menu to bring back)"
          onClick={toggleDockVisible}
          className="px-2 text-neutral-600 hover:text-neutral-300"
        >
          <X size={13} />
        </button>
      </div>
      <div className="min-h-0 flex-1">
        {activeDockTab === 'layers' ? (
          <LayersPanel docId={docId} layers={layers} activeLayerId={activeLayerId} />
        ) : (
          <HistoryPanel docId={docId} status={historyStatus} />
        )}
      </div>
    </div>
  );
}
