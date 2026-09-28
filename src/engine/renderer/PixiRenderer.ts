// ---------------------------------------------------------------------
// engine/renderer/PixiRenderer.ts
// The real WebGL2 canvas, via PixiJS (v8's async Application.init API).
// Owns exactly two things: a checkerboard background sized to the
// document (so transparency is visually obvious, matching every raster
// editor's convention) and a layers container holding one Sprite per
// raster layer, composited with real GPU blend-mode shaders (Phase 2).
// ---------------------------------------------------------------------

import { Application, Container, Sprite, Texture, TilingSprite } from 'pixi.js';
// Side-effect import: registers the shader-based blend modes (multiply,
// screen, overlay, color-dodge, etc.) as real GPU blending, not a fake
// dropdown of options that only "normal" actually does anything for.
import 'pixi.js/advanced-blend-modes';
import type { LumenDocument } from '../document/types';
import type { Viewport } from './Viewport';

const CHECKER_TILE = 16; // CSS px per checker square, matches this app's own light/dark checker convention
const CHECKER_LIGHT = '#3a3a3f';
const CHECKER_DARK = '#2a2a2e';

function buildCheckerTexture(): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = CHECKER_TILE * 2;
  canvas.height = CHECKER_TILE * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = CHECKER_LIGHT;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = CHECKER_DARK;
  ctx.fillRect(0, 0, CHECKER_TILE, CHECKER_TILE);
  ctx.fillRect(CHECKER_TILE, CHECKER_TILE, CHECKER_TILE, CHECKER_TILE);
  return Texture.from(canvas);
}

export class PixiRenderer {
  private app: Application | null = null;
  private worldContainer: Container | null = null;
  private checkerboard: TilingSprite | null = null;
  private layersContainer: Container | null = null;
  private layerSprites = new Map<string, Sprite>();

  get isMounted(): boolean {
    return this.app !== null;
  }

  async mount(container: HTMLElement): Promise<void> {
    const app = new Application();
    await app.init({
      resizeTo: container,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      preference: 'webgl',
    });
    container.appendChild(app.canvas);

    const worldContainer = new Container();
    const checkerboard = new TilingSprite({ texture: buildCheckerTexture(), width: 0, height: 0 });
    const layersContainer = new Container();
    worldContainer.addChild(checkerboard, layersContainer);
    app.stage.addChild(worldContainer);

    this.app = app;
    this.worldContainer = worldContainer;
    this.checkerboard = checkerboard;
    this.layersContainer = layersContainer;
  }

  destroy(): void {
    this.app?.destroy(true, { children: true, texture: false }); // textures are owned by ImageBitmaps the store manages, not this renderer
    this.app = null;
    this.worldContainer = null;
    this.checkerboard = null;
    this.layersContainer = null;
    this.layerSprites.clear();
  }

  resize(): void {
    // resizeTo handles this automatically via a ResizeObserver on the container.
  }

  setViewport(viewport: Viewport): void {
    if (!this.worldContainer) return;
    this.worldContainer.position.set(viewport.x, viewport.y);
    this.worldContainer.scale.set(viewport.scale);
  }

  /** Syncs the checkerboard + one Sprite per raster layer (position, visibility, opacity, blend mode, and stacking order) to the document's current state. Cheap to call every frame -- only touches what actually changed. */
  renderDocument(doc: LumenDocument): void {
    if (!this.checkerboard || !this.layersContainer) return;
    this.checkerboard.width = doc.width;
    this.checkerboard.height = doc.height;

    const seen = new Set<string>();
    doc.layers.forEach((layer, index) => {
      seen.add(layer.id);
      let sprite = this.layerSprites.get(layer.id);
      if (!sprite) {
        sprite = new Sprite(Texture.from(layer.bitmap));
        this.layerSprites.set(layer.id, sprite);
        this.layersContainer!.addChild(sprite);
      }
      sprite.position.set(layer.x, layer.y);
      sprite.visible = layer.visible;
      sprite.alpha = layer.opacity;
      sprite.blendMode = layer.blendMode;
      // Bottom-to-top array order must match child order for compositing/reordering to render correctly.
      if (this.layersContainer!.getChildIndex(sprite) !== index) {
        this.layersContainer!.setChildIndex(sprite, index);
      }
    });
    for (const [id, sprite] of this.layerSprites) {
      if (!seen.has(id)) {
        sprite.destroy();
        this.layerSprites.delete(id);
      }
    }
  }

  /** Renders just the document's own content (no checkerboard, no viewport pan/zoom) to a fresh canvas -- what Export As actually ships. */
  extractDocumentCanvas(): HTMLCanvasElement | null {
    if (!this.app || !this.layersContainer) return null;
    return this.app.renderer.extract.canvas({ target: this.layersContainer }) as HTMLCanvasElement;
  }
}
