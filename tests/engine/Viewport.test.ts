import { describe, it, expect } from 'vitest';
import {
  MIN_SCALE,
  MAX_SCALE,
  clampScale,
  screenToDocument,
  documentToScreen,
  zoomAt,
  zoomBy,
  pan,
  fitToContainer,
  type Viewport,
} from '../../src/engine/renderer/Viewport';

describe('clampScale', () => {
  it('leaves in-range scales untouched', () => {
    expect(clampScale(1)).toBe(1);
  });

  it('clamps below MIN_SCALE up to MIN_SCALE', () => {
    expect(clampScale(0)).toBe(MIN_SCALE);
    expect(clampScale(-5)).toBe(MIN_SCALE);
  });

  it('clamps above MAX_SCALE down to MAX_SCALE', () => {
    expect(clampScale(1000)).toBe(MAX_SCALE);
  });

  it('honors custom min/max bounds', () => {
    expect(clampScale(0.5, 1, 2)).toBe(1);
    expect(clampScale(5, 1, 2)).toBe(2);
  });
});

describe('screenToDocument / documentToScreen', () => {
  it('round-trips a point through both conversions', () => {
    const viewport: Viewport = { x: 50, y: -20, scale: 2 };
    const screenPoint = { x: 130, y: 80 };
    const docPoint = screenToDocument(viewport, screenPoint.x, screenPoint.y);
    const backToScreen = documentToScreen(viewport, docPoint.x, docPoint.y);
    expect(backToScreen.x).toBeCloseTo(screenPoint.x);
    expect(backToScreen.y).toBeCloseTo(screenPoint.y);
  });

  it('maps document origin to the viewport offset', () => {
    const viewport: Viewport = { x: 10, y: 20, scale: 3 };
    expect(documentToScreen(viewport, 0, 0)).toEqual({ x: 10, y: 20 });
  });
});

describe('zoomAt', () => {
  it('keeps the document point under the cursor visually fixed', () => {
    const viewport: Viewport = { x: 0, y: 0, scale: 1 };
    const cursorScreen = { x: 200, y: 150 };
    const docPointBefore = screenToDocument(viewport, cursorScreen.x, cursorScreen.y);

    const zoomed = zoomAt(viewport, cursorScreen.x, cursorScreen.y, 2);
    const docPointAfter = screenToDocument(zoomed, cursorScreen.x, cursorScreen.y);

    expect(docPointAfter.x).toBeCloseTo(docPointBefore.x);
    expect(docPointAfter.y).toBeCloseTo(docPointBefore.y);
    expect(zoomed.scale).toBe(2);
  });

  it('clamps the resulting scale', () => {
    const viewport: Viewport = { x: 0, y: 0, scale: 1 };
    expect(zoomAt(viewport, 0, 0, 999).scale).toBe(MAX_SCALE);
    expect(zoomAt(viewport, 0, 0, -5).scale).toBe(MIN_SCALE);
  });
});

describe('zoomBy', () => {
  it('multiplies the current scale by the given factor', () => {
    const viewport: Viewport = { x: 0, y: 0, scale: 2 };
    const zoomed = zoomBy(viewport, 100, 100, 1.5);
    expect(zoomed.scale).toBe(3);
  });
});

describe('pan', () => {
  it('offsets x/y without touching scale', () => {
    const viewport: Viewport = { x: 5, y: 10, scale: 1.5 };
    expect(pan(viewport, 3, -4)).toEqual({ x: 8, y: 6, scale: 1.5 });
  });
});

describe('fitToContainer', () => {
  it('centers a document that is smaller than the container', () => {
    const viewport = fitToContainer(100, 50, 500, 300, 0);
    // width-constrained and height-constrained both give 5x here (500/100 == 300/50)
    expect(viewport.scale).toBeCloseTo(5);
    expect(viewport.x).toBeCloseTo((500 - 100 * 5) / 2);
    expect(viewport.y).toBeCloseTo((300 - 50 * 5) / 2);
  });

  it('scales down a document larger than the container to fit within padding', () => {
    const viewport = fitToContainer(4000, 2000, 800, 600, 40);
    // available space is 720x520; width-constrained: 720/4000 = 0.18
    expect(viewport.scale).toBeCloseTo(0.18);
  });

  it('never returns a scale outside MIN_SCALE/MAX_SCALE', () => {
    const tiny = fitToContainer(1, 1, 1, 1, 0);
    expect(tiny.scale).toBeLessThanOrEqual(MAX_SCALE);
    const huge = fitToContainer(1_000_000, 1_000_000, 10, 10, 0);
    expect(huge.scale).toBeGreaterThanOrEqual(MIN_SCALE);
  });
});
