// ---------------------------------------------------------------------
// components/welcome/WelcomeScreen.tsx
// New / Open / Recent + preset sizes. "Recent" and the templates gallery
// are later-phase work (they need project persistence, which is Phase 7)
// so they're shown, disabled, with an honest reason rather than omitted
// silently or faked with placeholder data.
// ---------------------------------------------------------------------

import { useRef, useState } from 'react';
import { FolderOpen, ImagePlus } from 'lucide-react';
import { DOCUMENT_PRESETS, PRESET_CATEGORIES, type DocumentPreset } from '../../config/presets';

interface WelcomeScreenProps {
  onOpenFile: (file: File) => void;
  onCreateFromPreset: (preset: DocumentPreset) => void;
  onCreateCustom: (width: number, height: number) => void;
  isOpening: boolean;
  openError: string | null;
  onDismissError: () => void;
}

export function WelcomeScreen({
  onOpenFile,
  onCreateFromPreset,
  onCreateCustom,
  isOpening,
  openError,
  onDismissError,
}: WelcomeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onOpenFile(file);
  };

  return (
    <div
      className="flex h-full items-center justify-center overflow-y-auto bg-neutral-950 p-8"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 font-bold text-neutral-950">
            L
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-50">Lumen Studio</h1>
            <p className="text-sm text-neutral-500">A professional photo editing workspace, in your browser.</p>
          </div>
        </div>

        {openError && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            <span>{openError}</span>
            <button type="button" onClick={onDismissError} className="shrink-0 text-red-400 hover:text-red-100">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? 'border-sky-500 bg-sky-500/5' : 'border-neutral-800 bg-neutral-900/40'
            }`}
          >
            <ImagePlus size={28} className="text-neutral-500" />
            <p className="text-sm text-neutral-300">Drag and drop an image, or</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={isOpening}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              <FolderOpen size={15} />
              {isOpening ? 'Opening…' : 'Open a photo'}
            </button>
            <p className="text-xs text-neutral-600">JPG, PNG, WebP, GIF, BMP, AVIF, SVG · paste also works</p>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
            <h2 className="mb-3 text-sm font-semibold text-neutral-300">Custom size</h2>
            <div className="flex items-end gap-2">
              <label className="flex flex-col text-xs text-neutral-500">
                Width
                <input
                  type="number"
                  min={1}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-24 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-100"
                />
              </label>
              <span className="pb-1.5 text-neutral-600">×</span>
              <label className="flex flex-col text-xs text-neutral-500">
                Height
                <input
                  type="number"
                  min={1}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-24 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-100"
                />
              </label>
              <button
                type="button"
                onClick={() => onCreateCustom(customWidth, customHeight)}
                className="ml-2 rounded-full bg-neutral-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-600"
              >
                Create
              </button>
            </div>

            <h2 className="mb-2 mt-6 text-sm font-semibold text-neutral-300">Recent</h2>
            <p
              className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-4 text-center text-xs text-neutral-600"
              title="Project persistence (.lumen save/load) lands in Phase 7"
            >
              No recent projects yet — project save/load is coming in Phase 7.
            </p>
          </section>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-neutral-300">Presets</h2>
          {PRESET_CATEGORIES.map((category) => (
            <div key={category} className="mb-4">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-neutral-600">{category}</p>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_PRESETS.filter((p: DocumentPreset) => p.category === category).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onCreateFromPreset(preset)}
                    className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-sky-500 hover:text-sky-300"
                  >
                    {preset.label}{' '}
                    <span className="text-neutral-600">
                      {preset.width}×{preset.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
