// ---------------------------------------------------------------------
// components/panels/LayersPanel.tsx
// Real layer management: add/duplicate/delete, reorder (up/down -- no
// drag-and-drop yet, so the panel doesn't claim more than it does),
// rename inline, visibility/lock toggles, opacity (drag-preview that
// commits one history entry on release), and blend mode -- every one of
// these routes through useDocumentStore, which pushes a real, undoable
// command. Nothing here mutates the document directly.
// ---------------------------------------------------------------------

import { useState } from 'react';
import { Copy, Eye, EyeOff, Lock, Plus, Trash2, Unlock, ChevronUp, ChevronDown } from 'lucide-react';
import type { DocumentId, Layer, LayerId, BlendMode } from '../../engine';
import { useDocumentStore } from '../../store/useDocumentStore';
import { BLEND_MODE_OPTIONS } from '../../config/blendModes';
import { LayerThumbnail } from './LayerThumbnail';

interface LayersPanelProps {
  docId: DocumentId;
  layers: Layer[];
  activeLayerId: LayerId | null;
}

function OpacityControl({ docId, layer }: { docId: DocumentId; layer: Layer }) {
  const previewLayerOpacity = useDocumentStore((s) => s.previewLayerOpacity);
  const commitLayerOpacity = useDocumentStore((s) => s.commitLayerOpacity);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const percent = Math.round(layer.opacity * 100);

  return (
    <div className="flex items-center gap-1.5" title="Opacity">
      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onPointerDown={() => setDragStart(layer.opacity)}
        onChange={(e) => previewLayerOpacity(docId, layer.id, Number(e.target.value) / 100)}
        onPointerUp={() => {
          if (dragStart !== null) commitLayerOpacity(docId, layer.id, dragStart);
          setDragStart(null);
        }}
        className="h-1 w-16 accent-sky-500"
      />
      <span className="w-8 text-right text-[11px] tabular-nums text-neutral-500">{percent}%</span>
    </div>
  );
}

function LayerRow({ docId, layer, isActive }: { docId: DocumentId; layer: Layer; isActive: boolean }) {
  const setActiveLayer = useDocumentStore((s) => s.setActiveLayer);
  const setLayerVisibility = useDocumentStore((s) => s.setLayerVisibility);
  const setLayerLocked = useDocumentStore((s) => s.setLayerLocked);
  const setLayerBlendMode = useDocumentStore((s) => s.setLayerBlendMode);
  const renameLayer = useDocumentStore((s) => s.renameLayer);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(layer.name);

  const commitRename = () => {
    setRenaming(false);
    const trimmed = draftName.trim();
    if (trimmed) renameLayer(docId, layer.id, trimmed);
    else setDraftName(layer.name);
  };

  return (
    <div
      onClick={() => setActiveLayer(docId, layer.id)}
      className={`flex cursor-pointer flex-col gap-1.5 border-b border-neutral-800 px-2 py-2 text-[12px] ${
        isActive ? 'bg-sky-500/10' : 'hover:bg-neutral-800/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLayerVisibility(docId, layer.id, !layer.visible);
          }}
          className="shrink-0 text-neutral-400 hover:text-neutral-100"
          title={layer.visible ? 'Hide layer' : 'Show layer'}
        >
          {layer.visible ? <Eye size={14} /> : <EyeOff size={14} className="opacity-40" />}
        </button>

        <LayerThumbnail bitmap={layer.bitmap} />

        {renaming ? (
          <input
            autoFocus
            value={draftName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setDraftName(layer.name);
                setRenaming(false);
              }
            }}
            className="min-w-0 flex-1 rounded border border-sky-600 bg-neutral-800 px-1 py-0.5 text-neutral-100"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setDraftName(layer.name);
              setRenaming(true);
            }}
            className={`min-w-0 flex-1 truncate ${isActive ? 'text-neutral-100' : 'text-neutral-300'}`}
            title="Double-click to rename"
          >
            {layer.name}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLayerLocked(docId, layer.id, !layer.locked);
          }}
          className="shrink-0 text-neutral-400 hover:text-neutral-100"
          title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked ? <Lock size={13} /> : <Unlock size={13} className="opacity-40" />}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 pl-6" onClick={(e) => e.stopPropagation()}>
        <select
          value={layer.blendMode}
          onChange={(e) => setLayerBlendMode(docId, layer.id, e.target.value as BlendMode)}
          className="rounded border border-neutral-700 bg-neutral-800 px-1 py-0.5 text-[11px] text-neutral-300"
        >
          {BLEND_MODE_OPTIONS.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.label}
            </option>
          ))}
        </select>
        <OpacityControl docId={docId} layer={layer} />
      </div>
    </div>
  );
}

export function LayersPanel({ docId, layers, activeLayerId }: LayersPanelProps) {
  const addLayer = useDocumentStore((s) => s.addLayer);
  const duplicateLayer = useDocumentStore((s) => s.duplicateLayer);
  const deleteLayer = useDocumentStore((s) => s.deleteLayer);
  const reorderLayer = useDocumentStore((s) => s.reorderLayer);

  // Display topmost-first; the document stores layers bottom-to-top.
  const displayLayers = [...layers].reverse();
  const activeIndex = layers.findIndex((l) => l.id === activeLayerId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-neutral-800 px-2 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Layers</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Move layer up"
            disabled={activeIndex === -1 || activeIndex === layers.length - 1}
            onClick={() => activeLayerId && reorderLayer(docId, activeLayerId, Math.min(layers.length - 1, activeIndex + 1))}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            title="Move layer down"
            disabled={activeIndex <= 0}
            onClick={() => activeLayerId && reorderLayer(docId, activeLayerId, Math.max(0, activeIndex - 1))}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            title="Duplicate layer"
            disabled={!activeLayerId}
            onClick={() => activeLayerId && duplicateLayer(docId, activeLayerId)}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-30"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            title="Delete layer"
            disabled={!activeLayerId || layers.length <= 1}
            onClick={() => activeLayerId && deleteLayer(docId, activeLayerId)}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-red-400 disabled:opacity-30"
          >
            <Trash2 size={14} />
          </button>
          <button
            type="button"
            title="New layer"
            onClick={() => addLayer(docId)}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayLayers.map((layer) => (
          <LayerRow key={layer.id} docId={docId} layer={layer} isActive={layer.id === activeLayerId} />
        ))}
      </div>
    </div>
  );
}
