// ---------------------------------------------------------------------
// engine/index.ts
// The only module the UI layer is allowed to import from the engine --
// keeps engine internals free to change shape between phases without
// hunting down every React component that reached in directly.
// ---------------------------------------------------------------------

export type { ColorMode, LayerId, DocumentId, RasterLayer, Layer, LumenDocument } from './document/types';
export {
  nextId,
  createBlankDocument,
  createRasterLayer,
  createDocumentFromImage,
  getActiveLayer,
  withLayers,
  touch,
} from './document/Document';
export type { CreateBlankDocumentOptions } from './document/Document';

export type { Command } from './history/Command';
export { HistoryManager } from './history/HistoryManager';

export type { Viewport } from './renderer/Viewport';
export { MIN_SCALE, MAX_SCALE, clampScale, screenToDocument, documentToScreen, zoomAt, zoomBy, pan, fitToContainer } from './renderer/Viewport';
export { PixiRenderer } from './renderer/PixiRenderer';

export type { ImportedImage } from './io/ImageImport';
export { importImageFile } from './io/ImageImport';
export type { ExportFormat, ExportOptions } from './io/ImageExport';
export { canvasToBlob, downloadBlob, extensionFor } from './io/ImageExport';
