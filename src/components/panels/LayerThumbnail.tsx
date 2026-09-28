// ---------------------------------------------------------------------
// components/panels/LayerThumbnail.tsx
// A real, live thumbnail of the layer's own bitmap -- drawn straight
// from its ImageBitmap into a small canvas, not a placeholder icon.
// ---------------------------------------------------------------------

import { useEffect, useRef } from 'react';

interface LayerThumbnailProps {
  bitmap: ImageBitmap;
  size?: number;
}

export function LayerThumbnail({ bitmap, size = 32 }: LayerThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height);
    const drawWidth = bitmap.width * scale;
    const drawHeight = bitmap.height * scale;
    ctx.drawImage(bitmap, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
  }, [bitmap]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="shrink-0 rounded border border-neutral-700 bg-[repeating-conic-gradient(#3a3a3f_0%_25%,#2a2a2e_0%_50%)] bg-[length:8px_8px]"
    />
  );
}
