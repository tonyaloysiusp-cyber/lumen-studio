// ---------------------------------------------------------------------
// components/canvas/CanvasStage.tsx
// Mounts the PixiRenderer into a container and owns the real pan/zoom
// interaction: wheel-to-zoom (toward the cursor), space+drag or
// middle-mouse-drag to pan, and two-finger trackpad pinch (delivered by
// the browser as ctrlKey+wheel, same as every other web canvas editor
// handles it). Also the drop target for drag-and-drop image opening.
// ---------------------------------------------------------------------

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { PixiRenderer, zoomBy, pan, type LumenDocument, type Viewport } from '../../engine';

interface CanvasStageProps {
  document: LumenDocument;
  viewport: Viewport;
  activeTool: string;
  onViewportChange: (viewport: Viewport) => void;
  onDropFile: (file: File) => void;
}

export interface CanvasStageHandle {
  /** The document's own rendered pixels, no checkerboard or viewport transform baked in -- what Export As actually ships. Null until the renderer has mounted. */
  extractDocumentCanvas(): HTMLCanvasElement | null;
}

export const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(function CanvasStage(
  { document: doc, viewport, activeTool, onViewportChange, onDropFile },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PixiRenderer | null>(null);
  const viewportRef = useRef(viewport);
  const [isDragOver, setIsDragOver] = useState(false);
  const spaceHeldRef = useRef(false);
  const panStateRef = useRef<{ startScreenX: number; startScreenY: number; startViewport: Viewport } | null>(null);
  const onViewportChangeRef = useRef(onViewportChange);

  viewportRef.current = viewport;
  onViewportChangeRef.current = onViewportChange;

  useImperativeHandle(ref, () => ({
    extractDocumentCanvas: () => rendererRef.current?.extractDocumentCanvas() ?? null,
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const renderer = new PixiRenderer();
    rendererRef.current = renderer;
    let cancelled = false;
    renderer.mount(container).then(() => {
      if (cancelled) return;
      renderer.setViewport(viewportRef.current);
      renderer.renderDocument(doc);
    });
    return () => {
      cancelled = true;
      renderer.destroy();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rendererRef.current?.renderDocument(doc);
  }, [doc]);

  useEffect(() => {
    rendererRef.current?.setViewport(viewport);
  }, [viewport]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) spaceHeldRef.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceHeldRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // React attaches its synthetic onWheel as a passive listener, so e.preventDefault() inside
  // it silently fails (and logs a console warning) -- the page would scroll instead of the
  // canvas zooming/panning. A native, explicitly non-passive listener is the only way to
  // actually stop that default scroll.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        // Pinch-zoom (trackpad) or ctrl+wheel -- deltaY sign follows the browser's zoom-out/in convention.
        const factor = Math.exp(-e.deltaY * 0.01);
        onViewportChangeRef.current(zoomBy(viewportRef.current, screenX, screenY, factor));
      } else if (e.shiftKey) {
        onViewportChangeRef.current(pan(viewportRef.current, -e.deltaY, 0));
      } else {
        onViewportChangeRef.current(pan(viewportRef.current, -e.deltaX, -e.deltaY));
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  const isPanTool = activeTool === 'hand';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const shouldPan = isPanTool || spaceHeldRef.current || e.button === 1;
    if (!shouldPan) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    panStateRef.current = { startScreenX: e.clientX, startScreenY: e.clientY, startViewport: viewportRef.current };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const panState = panStateRef.current;
    if (!panState) return;
    const dx = e.clientX - panState.startScreenX;
    const dy = e.clientY - panState.startScreenY;
    onViewportChange({ ...panState.startViewport, x: panState.startViewport.x + dx, y: panState.startViewport.y + dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panStateRef.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      panStateRef.current = null;
    }
  };

  const handleZoomToolClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'zoom') return;
    const rect = containerRef.current!.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const factor = e.altKey ? 0.5 : 2;
    onViewportChange(zoomBy(viewportRef.current, screenX, screenY, factor));
  };

  const cursorClass = isPanTool || spaceHeldRef.current ? 'cursor-grab' : activeTool === 'zoom' ? 'cursor-zoom-in' : 'cursor-default';

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-neutral-950 ${cursorClass}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleZoomToolClick}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onDropFile(file);
      }}
    >
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-sky-500 bg-sky-500/5">
          <span className="rounded-full bg-neutral-900/90 px-4 py-2 text-sm text-sky-300">Drop to open as a new document</span>
        </div>
      )}
    </div>
  );
});
