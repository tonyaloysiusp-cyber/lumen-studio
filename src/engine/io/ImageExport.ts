// ---------------------------------------------------------------------
// engine/io/ImageExport.ts
// Real canvas -> Blob -> file-download export. PDF/SVG export and the
// full "Export As" dialog (size/quality preview, file-size estimate)
// are later-phase work per the product spec's own phase list; this is
// the honest Phase 1 slice -- PNG/JPEG/WebP, which every browser's
// canvas.toBlob already does for real.
// ---------------------------------------------------------------------

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  format: ExportFormat;
  /** 0..1, ignored for png (lossless). */
  quality?: number;
}

const MIME_TYPE: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export function canvasToBlob(canvas: HTMLCanvasElement, options: ExportOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Export failed: the canvas produced no image data.'));
      },
      MIME_TYPE[options.format],
      options.quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function extensionFor(format: ExportFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}
