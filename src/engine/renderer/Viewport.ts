// ---------------------------------------------------------------------
// engine/renderer/Viewport.ts
// Pure pan/zoom transform math -- screen-space <-> document-space
// conversion, zoom-at-a-point (keeps the point under the cursor fixed
// while zooming, the same behavior every real editor's scroll-to-zoom
// uses), and fit-to-container. No canvas/DOM access here so it's cheap
// to unit test.
// ---------------------------------------------------------------------

export interface Viewport {
  /** Screen-space offset of document-space (0, 0), in CSS pixels. */
  x: number;
  y: number;
  /** Document pixels per screen pixel is 1/scale; scale 1 = 100%. */
  scale: number;
}

export const MIN_SCALE = 0.02;
export const MAX_SCALE = 32;

export function clampScale(scale: number, min = MIN_SCALE, max = MAX_SCALE): number {
  return Math.min(max, Math.max(min, scale));
}

export function screenToDocument(viewport: Viewport, screenX: number, screenY: number): { x: number; y: number } {
  return { x: (screenX - viewport.x) / viewport.scale, y: (screenY - viewport.y) / viewport.scale };
}

export function documentToScreen(viewport: Viewport, docX: number, docY: number): { x: number; y: number } {
  return { x: docX * viewport.scale + viewport.x, y: docY * viewport.scale + viewport.y };
}

/** Zooms to `newScale` while keeping the document point under (screenX, screenY) visually fixed -- the standard "zoom toward cursor" behavior. */
export function zoomAt(viewport: Viewport, screenX: number, screenY: number, newScale: number, min = MIN_SCALE, max = MAX_SCALE): Viewport {
  const scale = clampScale(newScale, min, max);
  const docPoint = screenToDocument(viewport, screenX, screenY);
  return {
    scale,
    x: screenX - docPoint.x * scale,
    y: screenY - docPoint.y * scale,
  };
}

export function zoomBy(viewport: Viewport, screenX: number, screenY: number, factor: number, min = MIN_SCALE, max = MAX_SCALE): Viewport {
  return zoomAt(viewport, screenX, screenY, viewport.scale * factor, min, max);
}

export function pan(viewport: Viewport, dx: number, dy: number): Viewport {
  return { ...viewport, x: viewport.x + dx, y: viewport.y + dy };
}

/** Centers a `docWidth` x `docHeight` document in a `containerWidth` x `containerHeight` viewport, scaled (up or down) to fit within `padding` CSS pixels of the edges. */
export function fitToContainer(
  docWidth: number,
  docHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding = 40
): Viewport {
  const availW = Math.max(1, containerWidth - padding * 2);
  const availH = Math.max(1, containerHeight - padding * 2);
  const scale = clampScale(Math.min(availW / Math.max(1, docWidth), availH / Math.max(1, docHeight)));
  return {
    scale,
    x: (containerWidth - docWidth * scale) / 2,
    y: (containerHeight - docHeight * scale) / 2,
  };
}
