// ---------------------------------------------------------------------
// components/panels/HistoryPanel.tsx
// A real, clickable history list -- every past and undone-but-still
// -recoverable command is a row; clicking one reverts/replays to
// exactly that state via HistoryManager.jumpTo, the same mechanism
// Undo/Redo use. Rows in the "future" section are undone steps you can
// still redo, not decoration.
// ---------------------------------------------------------------------

import type { DocumentId } from '../../engine';
import type { HistoryStatus } from '../../store/useDocumentStore';
import { useDocumentStore } from '../../store/useDocumentStore';

interface HistoryPanelProps {
  docId: DocumentId;
  status: HistoryStatus;
}

export function HistoryPanel({ docId, status }: HistoryPanelProps) {
  const jumpToHistory = useDocumentStore((s) => s.jumpToHistory);

  const currentIndex = status.past.length - 1;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-800 px-2 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">History</span>
      </div>
      <div className="flex-1 overflow-y-auto text-[12px]">
        <button
          type="button"
          onClick={() => jumpToHistory(docId, -1)}
          className={`block w-full truncate px-3 py-1.5 text-left ${
            currentIndex === -1 ? 'bg-sky-500/10 text-neutral-100' : 'text-neutral-400 hover:bg-neutral-800/50'
          }`}
        >
          Document opened
        </button>
        {status.past.map((label, index) => (
          <button
            key={index}
            type="button"
            onClick={() => jumpToHistory(docId, index)}
            className={`block w-full truncate px-3 py-1.5 text-left ${
              index === currentIndex ? 'bg-sky-500/10 text-neutral-100' : 'text-neutral-400 hover:bg-neutral-800/50'
            }`}
          >
            {label}
          </button>
        ))}
        {status.future.length > 0 && (
          <div className="mt-1 border-t border-neutral-800 pt-1">
            {/* status.future is nearest-first (redoEntries' own convention), which is also
                the correct top-to-bottom display order continuing downward from "current". */}
            {status.future.map((label, i) => {
              const index = currentIndex + 1 + i;
              return (
                <button
                  key={`future-${i}`}
                  type="button"
                  onClick={() => jumpToHistory(docId, index)}
                  className="block w-full truncate px-3 py-1.5 text-left text-neutral-600 hover:bg-neutral-800/50 hover:text-neutral-400"
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {status.past.length === 0 && status.future.length === 0 && (
          <p className="px-3 py-3 text-neutral-600">No edits yet.</p>
        )}
      </div>
    </div>
  );
}
