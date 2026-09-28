// ---------------------------------------------------------------------
// config/blendModes.ts
// Display labels for every BlendMode the engine actually supports (real
// GPU shaders via PixiJS's advanced-blend-modes package -- see
// engine/renderer/PixiRenderer.ts). No entry here that doesn't actually
// blend when selected.
// ---------------------------------------------------------------------

import type { BlendMode } from '../engine';

export const BLEND_MODE_OPTIONS: { id: BlendMode; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'darken', label: 'Darken' },
  { id: 'multiply', label: 'Multiply' },
  { id: 'color-burn', label: 'Color Burn' },
  { id: 'lighten', label: 'Lighten' },
  { id: 'screen', label: 'Screen' },
  { id: 'color-dodge', label: 'Color Dodge' },
  { id: 'add', label: 'Linear Dodge (Add)' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'soft-light', label: 'Soft Light' },
  { id: 'hard-light', label: 'Hard Light' },
  { id: 'difference', label: 'Difference' },
  { id: 'exclusion', label: 'Exclusion' },
  { id: 'saturation', label: 'Saturation' },
  { id: 'color', label: 'Color' },
  { id: 'luminosity', label: 'Luminosity' },
];
