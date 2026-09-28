// ---------------------------------------------------------------------
// engine/document/commands.ts
// Every layer edit as a real Command<LumenDocument> -- do()/undo() are
// pure functions over the document, so HistoryManager can push, pop, and
// jump between them with no special-casing per operation. UI code never
// mutates a document directly; it builds one of these and hands it to
// the store's runCommand, which is what actually makes Undo/Redo real
// instead of a menu item that's wired to nothing.
// ---------------------------------------------------------------------

import type { Command } from '../history/Command';
import type { BlendMode, Layer, LayerId, LumenDocument } from './types';
import { withLayers } from './Document';

function replaceLayer(doc: LumenDocument, layerId: LayerId, update: (layer: Layer) => Layer): LumenDocument {
  return withLayers(
    doc,
    doc.layers.map((l) => (l.id === layerId ? update(l) : l))
  );
}

/** Inserts `layer` at `index` in the stacking order (used by both New Layer and Duplicate Layer) and makes it active. */
export function insertLayerCommand(layer: Layer, index: number, label = 'New Layer'): Command<LumenDocument> {
  return {
    label,
    do: (doc) => {
      const layers = [...doc.layers];
      layers.splice(index, 0, layer);
      return { ...withLayers(doc, layers), activeLayerId: layer.id };
    },
    undo: (doc) => {
      const layers = doc.layers.filter((l) => l.id !== layer.id);
      return { ...withLayers(doc, layers), activeLayerId: doc.activeLayerId === layer.id ? null : doc.activeLayerId };
    },
  };
}

/** Removes the layer at `index`, restoring the previously active layer on undo. */
export function deleteLayerCommand(doc: LumenDocument, layerId: LayerId): Command<LumenDocument> {
  const index = doc.layers.findIndex((l) => l.id === layerId);
  const removed = doc.layers[index];
  const previousActiveLayerId = doc.activeLayerId;
  return {
    label: `Delete Layer "${removed?.name ?? ''}"`,
    do: (state) => {
      const layers = state.layers.filter((l) => l.id !== layerId);
      const nextActive = state.activeLayerId === layerId ? (layers[layers.length - 1]?.id ?? null) : state.activeLayerId;
      return { ...withLayers(state, layers), activeLayerId: nextActive };
    },
    undo: (state) => {
      const layers = [...state.layers];
      layers.splice(index, 0, removed);
      return { ...withLayers(state, layers), activeLayerId: previousActiveLayerId };
    },
  };
}

/** Moves a layer to a new stacking-order index (drag-to-reorder in the Layers panel). Looks the layer up by id rather than trusting a raw index, so do()/undo() stay correct even if replayed from a jumpTo(). */
export function reorderLayerCommand(layerId: LayerId, fromIndex: number, toIndex: number): Command<LumenDocument> {
  const move = (doc: LumenDocument, to: number): LumenDocument => {
    const from = doc.layers.findIndex((l) => l.id === layerId);
    if (from === -1) return doc;
    const layers = [...doc.layers];
    const [layer] = layers.splice(from, 1);
    layers.splice(to, 0, layer);
    return withLayers(doc, layers);
  };
  return {
    label: 'Reorder Layer',
    do: (doc) => move(doc, toIndex),
    undo: (doc) => move(doc, fromIndex),
  };
}

export function renameLayerCommand(layerId: LayerId, from: string, to: string): Command<LumenDocument> {
  return {
    label: 'Rename Layer',
    do: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, name: to })),
    undo: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, name: from })),
  };
}

export function setLayerOpacityCommand(layerId: LayerId, from: number, to: number): Command<LumenDocument> {
  return {
    label: 'Layer Opacity',
    do: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, opacity: to })),
    undo: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, opacity: from })),
  };
}

export function setLayerVisibilityCommand(layerId: LayerId, from: boolean, to: boolean): Command<LumenDocument> {
  return {
    label: to ? 'Show Layer' : 'Hide Layer',
    do: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, visible: to })),
    undo: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, visible: from })),
  };
}

export function setLayerLockedCommand(layerId: LayerId, from: boolean, to: boolean): Command<LumenDocument> {
  return {
    label: to ? 'Lock Layer' : 'Unlock Layer',
    do: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, locked: to })),
    undo: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, locked: from })),
  };
}

export function setLayerBlendModeCommand(layerId: LayerId, from: BlendMode, to: BlendMode): Command<LumenDocument> {
  return {
    label: 'Blend Mode',
    do: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, blendMode: to })),
    undo: (doc) => replaceLayer(doc, layerId, (l) => ({ ...l, blendMode: from })),
  };
}
