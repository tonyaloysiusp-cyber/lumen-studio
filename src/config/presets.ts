// ---------------------------------------------------------------------
// config/presets.ts
// New-document size presets for the Welcome screen.
// ---------------------------------------------------------------------

export interface DocumentPreset {
  id: string;
  label: string;
  category: string;
  width: number;
  height: number;
  dpi: number;
}

export const DOCUMENT_PRESETS: DocumentPreset[] = [
  { id: 'instagram-post', label: 'Instagram Post', category: 'Social', width: 1080, height: 1080, dpi: 72 },
  { id: 'instagram-story', label: 'Instagram Story', category: 'Social', width: 1080, height: 1920, dpi: 72 },
  { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', category: 'Social', width: 1280, height: 720, dpi: 72 },
  { id: 'twitter-post', label: 'X / Twitter Post', category: 'Social', width: 1200, height: 675, dpi: 72 },

  { id: 'hd-1080p', label: '1080p', category: 'Screen', width: 1920, height: 1080, dpi: 72 },
  { id: 'uhd-4k', label: '4K UHD', category: 'Screen', width: 3840, height: 2160, dpi: 72 },
  { id: 'web-1440', label: 'Web (1440px)', category: 'Screen', width: 1440, height: 900, dpi: 72 },

  { id: 'a4-print', label: 'A4 (300 DPI)', category: 'Print', width: 2480, height: 3508, dpi: 300 },
  { id: 'letter-print', label: 'US Letter (300 DPI)', category: 'Print', width: 2550, height: 3300, dpi: 300 },
  { id: 'square-print', label: '8x8 in (300 DPI)', category: 'Print', width: 2400, height: 2400, dpi: 300 },
];

export const PRESET_CATEGORIES: string[] = Array.from(new Set(DOCUMENT_PRESETS.map((p) => p.category)));
