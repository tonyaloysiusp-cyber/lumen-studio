// ---------------------------------------------------------------------
// engine/document/Document.ts
// Pure factory/query functions over LumenDocument -- no classes, no
// hidden mutable state, so every operation is trivially testable and
// safe to hand straight to a Zustand store (new object in, new object
// out).
// ---------------------------------------------------------------------

import type { LumenDocument, Layer, RasterLayer, ColorMode } from './types';

let idCounter = 0;
/** Monotonic-within-session ids -- good enough for local documents/layers; a real backend id scheme can replace this later without touching call sites. */
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

export interface CreateBlankDocumentOptions {
  name: string;
  width: number;
  height: number;
  colorMode?: ColorMode;
  dpi?: number;
}

export function createBlankDocument(opts: CreateBlankDocumentOptions): LumenDocument {
  const now = Date.now();
  return {
    id: nextId('doc'),
    name: opts.name,
    width: Math.max(1, Math.round(opts.width)),
    height: Math.max(1, Math.round(opts.height)),
    colorMode: opts.colorMode ?? 'rgb',
    dpi: opts.dpi ?? 72,
    layers: [],
    activeLayerId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createRasterLayer(bitmap: ImageBitmap, name: string): RasterLayer {
  return {
    id: nextId('layer'),
    type: 'raster',
    name,
    bitmap,
    x: 0,
    y: 0,
    width: bitmap.width,
    height: bitmap.height,
    opacity: 1,
    visible: true,
    locked: false,
  };
}

/** Opens an already-decoded image as a brand-new document sized to fit it exactly, with the image as its sole layer -- the common "open a photo" path. */
export function createDocumentFromImage(bitmap: ImageBitmap, name: string): LumenDocument {
  const doc = createBlankDocument({ name, width: bitmap.width, height: bitmap.height, dpi: 72 });
  const layer = createRasterLayer(bitmap, 'Background');
  return {
    ...doc,
    layers: [layer],
    activeLayerId: layer.id,
  };
}

export function getActiveLayer(doc: LumenDocument): Layer | null {
  return doc.layers.find((l) => l.id === doc.activeLayerId) ?? null;
}

export function withLayers(doc: LumenDocument, layers: Layer[]): LumenDocument {
  return { ...doc, layers, updatedAt: Date.now() };
}

export function touch(doc: LumenDocument): LumenDocument {
  return { ...doc, updatedAt: Date.now() };
}
