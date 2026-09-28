// ---------------------------------------------------------------------
// engine/document/types.ts
// Core document data model. Phase 1 scoped this to a single raster layer;
// Phase 2 adds real multi-layer support and blend modes, still without
// pre-declaring layer kinds (text/shape/adjustment/group) that don't
// exist yet -- those are added for real in the phase that builds them.
// ---------------------------------------------------------------------

export type ColorMode = 'rgb' | 'grayscale';

export type LayerId = string;
export type DocumentId = string;

/**
 * Every value here is a blend mode PixiJS actually implements as a real GPU
 * shader (via its advanced-blend-modes package, registered once in
 * PixiRenderer) -- not a subset that looks complete in a dropdown but only
 * partially works.
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'saturation'
  | 'color'
  | 'luminosity'
  | 'add';

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
  blendMode: BlendMode;
}

/** Widened intentionally so later phases' layer kinds can be added as real union members. */
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
