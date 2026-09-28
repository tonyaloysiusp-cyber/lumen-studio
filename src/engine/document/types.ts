// ---------------------------------------------------------------------
// engine/document/types.ts
// Core document data model. Deliberately scoped to what Phase 1 actually
// implements (a single raster layer, opened from an image file) rather
// than pre-declaring layer kinds (text/shape/adjustment/group) that
// don't exist yet — those are added for real in the phase that builds
// them, not stubbed in advance.
// ---------------------------------------------------------------------

export type ColorMode = 'rgb' | 'grayscale';

export type LayerId = string;
export type DocumentId = string;

export interface RasterLayer {
  id: LayerId;
  type: 'raster';
  name: string;
  /** Decoded pixel source for this layer's own content, at its native resolution. */
  bitmap: ImageBitmap;
  /** Layer-space position of the bitmap's top-left corner, in document pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number; // 0..1
  visible: boolean;
  locked: boolean;
}

/** Widened intentionally so Phase 2's layer kinds can be added as real union members later. */
export type Layer = RasterLayer;

export interface LumenDocument {
  id: DocumentId;
  name: string;
  width: number;
  height: number;
  colorMode: ColorMode;
  dpi: number;
  /** Bottom-to-top stacking order, matching how every layer-based editor orders its list internally. */
  layers: Layer[];
  activeLayerId: LayerId | null;
  createdAt: number;
  updatedAt: number;
}
