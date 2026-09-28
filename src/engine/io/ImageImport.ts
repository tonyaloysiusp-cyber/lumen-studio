// ---------------------------------------------------------------------
// engine/io/ImageImport.ts
// Decodes a File into an ImageBitmap via the browser's own native
// decoder. JPG/PNG/WebP/GIF/BMP/AVIF/SVG all decode for real through
// createImageBitmap in every current browser. TIFF and HEIC do NOT --
// no current browser ships a native decoder for either -- so importing
// one fails with a clear, real error instead of silently doing nothing.
// Wiring a WASM decoder (e.g. utif2 for TIFF, libheif-js for HEIC) is
// real, scoped follow-up work, not something to fake here.
// ---------------------------------------------------------------------

export interface ImportedImage {
  bitmap: ImageBitmap;
  name: string;
}

const NO_NATIVE_DECODER = new Set(['tiff', 'tif', 'heic', 'heif']);

function extensionOf(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx + 1).toLowerCase() : '';
}

function stripExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx > 0 ? filename.slice(0, idx) : filename;
}

export async function importImageFile(file: File): Promise<ImportedImage> {
  const ext = extensionOf(file.name);
  if (NO_NATIVE_DECODER.has(ext)) {
    throw new Error(
      `"${file.name}" is a ${ext.toUpperCase()} file. No current browser can decode ${ext.toUpperCase()} natively, and Lumen Studio doesn't have a dedicated decoder wired in yet -- try a JPG, PNG, WebP, GIF, BMP, AVIF, or SVG instead.`
    );
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    throw new Error(`Could not decode "${file.name}": ${err instanceof Error ? err.message : String(err)}`);
  }
  return { bitmap, name: stripExtension(file.name) };
}
