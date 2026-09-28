import { describe, it, expect } from 'vitest';
import { createBlankDocument, createRasterLayer, withLayers } from '../../../src/engine/document/Document';
import {
  insertLayerCommand,
  deleteLayerCommand,
  reorderLayerCommand,
  renameLayerCommand,
  setLayerOpacityCommand,
  setLayerVisibilityCommand,
  setLayerLockedCommand,
  setLayerBlendModeCommand,
} from '../../../src/engine/document/commands';
import type { LumenDocument } from '../../../src/engine/document/types';

// Commands never touch bitmap pixels, so a fake ImageBitmap-shaped object is fine here.
const fakeBitmap = { width: 10, height: 10 } as ImageBitmap;

function docWithLayers(count: number): LumenDocument {
  const base = createBlankDocument({ name: 'Test', width: 100, height: 100 });
  const layers = Array.from({ length: count }, (_, i) => createRasterLayer(fakeBitmap, `Layer ${i + 1}`));
  return { ...withLayers(base, layers), activeLayerId: layers[0]?.id ?? null };
}

describe('insertLayerCommand', () => {
  it('inserts at the given index and makes the new layer active', () => {
    const doc = docWithLayers(2);
    const newLayer = createRasterLayer(fakeBitmap, 'New');
    const cmd = insertLayerCommand(newLayer, 1);
    const next = cmd.do(doc);
    expect(next.layers.map((l) => l.name)).toEqual(['Layer 1', 'New', 'Layer 2']);
    expect(next.activeLayerId).toBe(newLayer.id);
  });

  it('undo removes exactly the inserted layer and restores prior active layer', () => {
    const doc = docWithLayers(2);
    const newLayer = createRasterLayer(fakeBitmap, 'New');
    const cmd = insertLayerCommand(newLayer, 1);
    const inserted = cmd.do(doc);
    const reverted = cmd.undo(inserted);
    expect(reverted.layers.map((l) => l.name)).toEqual(['Layer 1', 'Layer 2']);
  });
});

describe('deleteLayerCommand', () => {
  it('removes the layer and falls back activeLayerId to the topmost remaining layer', () => {
    const doc = docWithLayers(3);
    const [l1, l2, l3] = doc.layers;
    const docWithActive = { ...doc, activeLayerId: l2.id };
    const cmd = deleteLayerCommand(docWithActive, l2.id);
    const next = cmd.do(docWithActive);
    expect(next.layers.map((l) => l.id)).toEqual([l1.id, l3.id]);
    expect(next.activeLayerId).toBe(l3.id);
  });

  it('undo restores the layer at its original index and the original active layer', () => {
    const doc = docWithLayers(3);
    const [, l2] = doc.layers;
    const docWithActive = { ...doc, activeLayerId: l2.id };
    const cmd = deleteLayerCommand(docWithActive, l2.id);
    const deleted = cmd.do(docWithActive);
    const restored = cmd.undo(deleted);
    expect(restored.layers.map((l) => l.id)).toEqual(doc.layers.map((l) => l.id));
    expect(restored.activeLayerId).toBe(l2.id);
  });
});

describe('reorderLayerCommand', () => {
  it('moves a layer to the target index', () => {
    const doc = docWithLayers(3);
    const [l1] = doc.layers;
    const cmd = reorderLayerCommand(l1.id, 0, 2);
    const next = cmd.do(doc);
    expect(next.layers.map((l) => l.name)).toEqual(['Layer 2', 'Layer 3', 'Layer 1']);
  });

  it('undo moves it back to the original index', () => {
    const doc = docWithLayers(3);
    const [l1] = doc.layers;
    const cmd = reorderLayerCommand(l1.id, 0, 2);
    const moved = cmd.do(doc);
    const reverted = cmd.undo(moved);
    expect(reverted.layers.map((l) => l.name)).toEqual(['Layer 1', 'Layer 2', 'Layer 3']);
  });
});

describe('renameLayerCommand', () => {
  it('renames and undoes back to the original name', () => {
    const doc = docWithLayers(1);
    const [layer] = doc.layers;
    const cmd = renameLayerCommand(layer.id, layer.name, 'Renamed');
    const renamed = cmd.do(doc);
    expect(renamed.layers[0].name).toBe('Renamed');
    const reverted = cmd.undo(renamed);
    expect(reverted.layers[0].name).toBe(layer.name);
  });
});

describe('setLayerOpacityCommand', () => {
  it('sets and undoes opacity', () => {
    const doc = docWithLayers(1);
    const [layer] = doc.layers;
    const cmd = setLayerOpacityCommand(layer.id, 1, 0.4);
    expect(cmd.do(doc).layers[0].opacity).toBe(0.4);
    expect(cmd.undo(cmd.do(doc)).layers[0].opacity).toBe(1);
  });
});

describe('setLayerVisibilityCommand', () => {
  it('toggles visibility and undoes it', () => {
    const doc = docWithLayers(1);
    const [layer] = doc.layers;
    const cmd = setLayerVisibilityCommand(layer.id, true, false);
    expect(cmd.do(doc).layers[0].visible).toBe(false);
    expect(cmd.undo(cmd.do(doc)).layers[0].visible).toBe(true);
  });
});

describe('setLayerLockedCommand', () => {
  it('toggles locked and undoes it', () => {
    const doc = docWithLayers(1);
    const [layer] = doc.layers;
    const cmd = setLayerLockedCommand(layer.id, false, true);
    expect(cmd.do(doc).layers[0].locked).toBe(true);
    expect(cmd.undo(cmd.do(doc)).layers[0].locked).toBe(false);
  });
});

describe('setLayerBlendModeCommand', () => {
  it('sets and undoes blend mode', () => {
    const doc = docWithLayers(1);
    const [layer] = doc.layers;
    const cmd = setLayerBlendModeCommand(layer.id, 'normal', 'multiply');
    expect(cmd.do(doc).layers[0].blendMode).toBe('multiply');
    expect(cmd.undo(cmd.do(doc)).layers[0].blendMode).toBe('normal');
  });
});
