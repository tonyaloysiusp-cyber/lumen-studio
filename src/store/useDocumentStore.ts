// ---------------------------------------------------------------------
// store/useDocumentStore.ts
// Thin Zustand store: holds open documents + their viewports for the
// multi-document-tabs UI, and delegates all real document construction
// to the engine (createDocumentFromImage / createBlankDocument). No
// document-editing logic lives here -- that's what HistoryManager +
// engine commands are for, starting in Phase 2.
// ---------------------------------------------------------------------

import { create } from 'zustand';
import {
  type LumenDocument,
  type DocumentId,
  type Viewport,
  type CreateBlankDocumentOptions,
  createBlankDocument,
  createDocumentFromImage,
  importImageFile,
  fitToContainer,
} from '../engine';

interface DocumentStoreState {
  documents: Record<DocumentId, LumenDocument>;
  /** Tab order, left to right. */
  order: DocumentId[];
  activeDocumentId: DocumentId | null;
  viewports: Record<DocumentId, Viewport>;
  /** Set while an async open (file decode) is in flight, so the UI can show real loading state instead of nothing happening. */
  isOpening: boolean;
  openError: string | null;

  openImageFile(file: File, containerSize: { width: number; height: number }): Promise<void>;
  createBlank(opts: CreateBlankDocumentOptions, containerSize: { width: number; height: number }): void;
  closeDocument(id: DocumentId): void;
  setActiveDocument(id: DocumentId): void;
  setViewport(id: DocumentId, viewport: Viewport): void;
  dismissOpenError(): void;
}

function addDocument(
  state: Pick<DocumentStoreState, 'documents' | 'order' | 'viewports'>,
  doc: LumenDocument,
  containerSize: { width: number; height: number }
): Pick<DocumentStoreState, 'documents' | 'order' | 'viewports' | 'activeDocumentId'> {
  return {
    documents: { ...state.documents, [doc.id]: doc },
    order: [...state.order, doc.id],
    viewports: {
      ...state.viewports,
      [doc.id]: fitToContainer(doc.width, doc.height, containerSize.width, containerSize.height),
    },
    activeDocumentId: doc.id,
  };
}

export const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  documents: {},
  order: [],
  activeDocumentId: null,
  viewports: {},
  isOpening: false,
  openError: null,

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
    const activeDocumentId =
      state.activeDocumentId === id ? (order[order.length - 1] ?? null) : state.activeDocumentId;
    set({ documents, order, viewports, activeDocumentId });
  },

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  setViewport: (id, viewport) => set((state) => ({ viewports: { ...state.viewports, [id]: viewport } })),

  dismissOpenError: () => set({ openError: null }),
}));
