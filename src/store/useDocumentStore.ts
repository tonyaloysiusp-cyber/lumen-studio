// ---------------------------------------------------------------------
// store/useDocumentStore.ts
// Zustand store: holds open documents + their viewports for the
// multi-document-tabs UI, and (Phase 2) a HistoryManager per document
// driving real Undo/Redo. All document construction and every edit
// delegates to the engine (pure functions / Command<LumenDocument>) --
// this store never mutates a document's fields itself.
// ---------------------------------------------------------------------

import { create } from 'zustand';
import {
  type LumenDocument,
  type DocumentId,
  type LayerId,
  type BlendMode,
  type Viewport,
  type CreateBlankDocumentOptions,
  type Command,
  HistoryManager,
  createBlankDocument,
  createDocumentFromImage,
  createBlankRasterLayer,
  duplicateRasterLayer,
  importImageFile,
  fitToContainer,
  insertLayerCommand,
  deleteLayerCommand,
  reorderLayerCommand,
  renameLayerCommand,
  setLayerOpacityCommand,
  setLayerVisibilityCommand,
  setLayerLockedCommand,
  setLayerBlendModeCommand,
  withLayers,
} from '../engine';

export interface HistoryStatus {
  canUndo: boolean;
  canRedo: boolean;
  /** Oldest first. */
  past: string[];
  /** Nearest-future first. */
  future: string[];
}

const EMPTY_HISTORY_STATUS: HistoryStatus = { canUndo: false, canRedo: false, past: [], future: [] };

interface DocumentStoreState {
  documents: Record<DocumentId, LumenDocument>;
  /** Tab order, left to right. */
  order: DocumentId[];
  activeDocumentId: DocumentId | null;
  viewports: Record<DocumentId, Viewport>;
  /** Set while an async open (file decode) is in flight, so the UI can show real loading state instead of nothing happening. */
  isOpening: boolean;
  openError: string | null;

  /** One HistoryManager per open document. Not itself reactive state -- historyStatus mirrors what the UI needs to re-render on. */
  histories: Record<DocumentId, HistoryManager<LumenDocument>>;
  historyStatus: Record<DocumentId, HistoryStatus>;

  openImageFile(file: File, containerSize: { width: number; height: number }): Promise<void>;
  createBlank(opts: CreateBlankDocumentOptions, containerSize: { width: number; height: number }): void;
  closeDocument(id: DocumentId): void;
  setActiveDocument(id: DocumentId): void;
  setViewport(id: DocumentId, viewport: Viewport): void;
  dismissOpenError(): void;

  runCommand(docId: DocumentId, command: Command<LumenDocument>): void;
  undo(docId: DocumentId): void;
  redo(docId: DocumentId): void;
  jumpToHistory(docId: DocumentId, index: number): void;

  setActiveLayer(docId: DocumentId, layerId: LayerId): void;
  addLayer(docId: DocumentId): Promise<void>;
  duplicateLayer(docId: DocumentId, layerId: LayerId): Promise<void>;
  deleteLayer(docId: DocumentId, layerId: LayerId): void;
  reorderLayer(docId: DocumentId, layerId: LayerId, toIndex: number): void;
  renameLayer(docId: DocumentId, layerId: LayerId, name: string): void;
  setLayerVisibility(docId: DocumentId, layerId: LayerId, visible: boolean): void;
  setLayerLocked(docId: DocumentId, layerId: LayerId, locked: boolean): void;
  setLayerBlendMode(docId: DocumentId, layerId: LayerId, blendMode: BlendMode): void;
  /** Live preview while dragging an opacity slider -- does not touch history. */
  previewLayerOpacity(docId: DocumentId, layerId: LayerId, opacity: number): void;
  /** Records one history entry for an opacity change from `from` to the layer's current value (call on drag-end/blur). */
  commitLayerOpacity(docId: DocumentId, layerId: LayerId, from: number): void;
}

function addDocument(
  state: Pick<DocumentStoreState, 'documents' | 'order' | 'viewports' | 'histories' | 'historyStatus'>,
  doc: LumenDocument,
  containerSize: { width: number; height: number }
): Pick<DocumentStoreState, 'documents' | 'order' | 'viewports' | 'activeDocumentId' | 'histories' | 'historyStatus'> {
  return {
    documents: { ...state.documents, [doc.id]: doc },
    order: [...state.order, doc.id],
    viewports: {
      ...state.viewports,
      [doc.id]: fitToContainer(doc.width, doc.height, containerSize.width, containerSize.height),
    },
    activeDocumentId: doc.id,
    histories: { ...state.histories, [doc.id]: new HistoryManager<LumenDocument>() },
    historyStatus: { ...state.historyStatus, [doc.id]: EMPTY_HISTORY_STATUS },
  };
}

function statusFrom(history: HistoryManager<LumenDocument>): HistoryStatus {
  return { canUndo: history.canUndo(), canRedo: history.canRedo(), past: [...history.entries], future: [...history.redoEntries] };
}

export const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  documents: {},
  order: [],
  activeDocumentId: null,
  viewports: {},
  isOpening: false,
  openError: null,
  histories: {},
  historyStatus: {},

  openImageFile: async (file, containerSize) => {
    set({ isOpening: true, openError: null });
    try {
      const { bitmap, name } = await importImageFile(file);
      const doc = createDocumentFromImage(bitmap, name);
      set((state) => ({ ...addDocument(state, doc, containerSize), isOpening: false }));
    } catch (err) {
      set({ isOpening: false, openError: err instanceof Error ? err.message : String(err) });
    }
  },

  createBlank: (opts, containerSize) => {
    const doc = createBlankDocument(opts);
    set((state) => addDocument(state, doc, containerSize));
  },

  closeDocument: (id) => {
    const state = get();
    const order = state.order.filter((docId) => docId !== id);
    const { [id]: _removed, ...documents } = state.documents;
    const { [id]: _removedViewport, ...viewports } = state.viewports;
    const { [id]: _removedHistory, ...histories } = state.histories;
    const { [id]: _removedStatus, ...historyStatus } = state.historyStatus;
    const activeDocumentId =
      state.activeDocumentId === id ? (order[order.length - 1] ?? null) : state.activeDocumentId;
    set({ documents, order, viewports, histories, historyStatus, activeDocumentId });
  },

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  setViewport: (id, viewport) => set((state) => ({ viewports: { ...state.viewports, [id]: viewport } })),

  dismissOpenError: () => set({ openError: null }),

  runCommand: (docId, command) => {
    const state = get();
    const history = state.histories[docId];
    const doc = state.documents[docId];
    if (!history || !doc) return;
    const next = history.execute(doc, command);
    set({
      documents: { ...state.documents, [docId]: next },
      historyStatus: { ...state.historyStatus, [docId]: statusFrom(history) },
    });
  },

  undo: (docId) => {
    const state = get();
    const history = state.histories[docId];
    const doc = state.documents[docId];
    if (!history || !doc) return;
    const next = history.undo(doc);
    if (next === null) return;
    set({
      documents: { ...state.documents, [docId]: next },
      historyStatus: { ...state.historyStatus, [docId]: statusFrom(history) },
    });
  },

  redo: (docId) => {
    const state = get();
    const history = state.histories[docId];
    const doc = state.documents[docId];
    if (!history || !doc) return;
    const next = history.redo(doc);
    if (next === null) return;
    set({
      documents: { ...state.documents, [docId]: next },
      historyStatus: { ...state.historyStatus, [docId]: statusFrom(history) },
    });
  },

  jumpToHistory: (docId, index) => {
    const state = get();
    const history = state.histories[docId];
    const doc = state.documents[docId];
    if (!history || !doc) return;
    const next = history.jumpTo(doc, index);
    if (next === null) return;
    set({
      documents: { ...state.documents, [docId]: next },
      historyStatus: { ...state.historyStatus, [docId]: statusFrom(history) },
    });
  },

  setActiveLayer: (docId, layerId) => {
    // Which layer is selected is UI state, not an edit -- not pushed to history, same as every editor's own convention.
    const state = get();
    const doc = state.documents[docId];
    if (!doc) return;
    set({ documents: { ...state.documents, [docId]: { ...doc, activeLayerId: layerId } } });
  },

  addLayer: async (docId) => {
    const doc = get().documents[docId];
    if (!doc) return;
    const layer = await createBlankRasterLayer(doc, `Layer ${doc.layers.length + 1}`);
    get().runCommand(docId, insertLayerCommand(layer, doc.layers.length, 'New Layer'));
  },

  duplicateLayer: async (docId, layerId) => {
    const doc = get().documents[docId];
    const source = doc?.layers.find((l) => l.id === layerId);
    if (!doc || !source) return;
    const copy = await duplicateRasterLayer(source);
    const index = doc.layers.findIndex((l) => l.id === layerId);
    get().runCommand(docId, insertLayerCommand(copy, index + 1, 'Duplicate Layer'));
  },

  deleteLayer: (docId, layerId) => {
    const doc = get().documents[docId];
    if (!doc) return;
    get().runCommand(docId, deleteLayerCommand(doc, layerId));
  },

  reorderLayer: (docId, layerId, toIndex) => {
    const doc = get().documents[docId];
    if (!doc) return;
    const fromIndex = doc.layers.findIndex((l) => l.id === layerId);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    get().runCommand(docId, reorderLayerCommand(layerId, fromIndex, toIndex));
  },

  renameLayer: (docId, layerId, name) => {
    const doc = get().documents[docId];
    const layer = doc?.layers.find((l) => l.id === layerId);
    if (!doc || !layer || layer.name === name) return;
    get().runCommand(docId, renameLayerCommand(layerId, layer.name, name));
  },

  setLayerVisibility: (docId, layerId, visible) => {
    const doc = get().documents[docId];
    const layer = doc?.layers.find((l) => l.id === layerId);
    if (!doc || !layer) return;
    get().runCommand(docId, setLayerVisibilityCommand(layerId, layer.visible, visible));
  },

  setLayerLocked: (docId, layerId, locked) => {
    const doc = get().documents[docId];
    const layer = doc?.layers.find((l) => l.id === layerId);
    if (!doc || !layer) return;
    get().runCommand(docId, setLayerLockedCommand(layerId, layer.locked, locked));
  },

  setLayerBlendMode: (docId, layerId, blendMode) => {
    const doc = get().documents[docId];
    const layer = doc?.layers.find((l) => l.id === layerId);
    if (!doc || !layer) return;
    get().runCommand(docId, setLayerBlendModeCommand(layerId, layer.blendMode, blendMode));
  },

  previewLayerOpacity: (docId, layerId, opacity) => {
    const state = get();
    const doc = state.documents[docId];
    if (!doc) return;
    set({
      documents: {
        ...state.documents,
        [docId]: withLayers(
          doc,
          doc.layers.map((l) => (l.id === layerId ? { ...l, opacity } : l))
        ),
      },
    });
  },

  commitLayerOpacity: (docId, layerId, from) => {
    const doc = get().documents[docId];
    const layer = doc?.layers.find((l) => l.id === layerId);
    if (!doc || !layer || layer.opacity === from) return;
    get().runCommand(docId, setLayerOpacityCommand(layerId, from, layer.opacity));
  },
}));
