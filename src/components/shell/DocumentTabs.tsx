// ---------------------------------------------------------------------
// components/shell/DocumentTabs.tsx
// Multi-document tabs across the top of the canvas area.
// ---------------------------------------------------------------------

import { X } from 'lucide-react';
import type { LumenDocument, DocumentId } from '../../engine';

interface DocumentTabsProps {
  documents: LumenDocument[];
  activeDocumentId: DocumentId | null;
  onSelect: (id: DocumentId) => void;
  onClose: (id: DocumentId) => void;
}

export function DocumentTabs({ documents, activeDocumentId, onSelect, onClose }: DocumentTabsProps) {
  if (documents.length === 0) return null;
  return (
    <div role="tablist" aria-label="Open documents" className="flex h-8 shrink-0 items-stretch overflow-x-auto border-b border-neutral-800 bg-neutral-950">
      {documents.map((doc) => {
        const active = doc.id === activeDocumentId;
        return (
          <div
            key={doc.id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            onClick={() => onSelect(doc.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(doc.id)}
            className={`group flex max-w-[180px] shrink-0 cursor-pointer items-center gap-2 border-r border-neutral-800 px-3 text-[12px] ${
              active ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:bg-neutral-900/60'
            }`}
          >
            <span className="truncate">{doc.name}</span>
            <button
              type="button"
              aria-label={`Close ${doc.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose(doc.id);
              }}
              className="ml-auto shrink-0 rounded p-0.5 text-neutral-500 opacity-0 hover:bg-neutral-700 hover:text-neutral-100 group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
