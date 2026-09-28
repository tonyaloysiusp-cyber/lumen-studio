// ---------------------------------------------------------------------
// components/shell/WorkspaceShell.tsx
// Top-level composition: menu bar, toolbar, options bar, document tabs,
// canvas, status bar, and the welcome screen when nothing's open yet.
// Owns the container-size measurement (for fit-to-container math) and
// the real file-open / paste / export wiring that every child component
// only exposes hooks for.
// ---------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { zoomAt, fitToContainer, canvasToBlob, downloadBlob, extensionFor, type ExportFormat } from '../../engine';
import { MenuBar } from './MenuBar';
import { Toolbar } from './Toolbar';
import { OptionsBar } from './OptionsBar';
import { DocumentTabs } from './DocumentTabs';
import { StatusBar } from './StatusBar';
import { WelcomeScreen } from '../welcome/WelcomeScreen';
import { CanvasStage, type CanvasStageHandle } from '../canvas/CanvasStage';

export function WorkspaceShell() {
  const documents = useDocumentStore((s) => s.documents);
  const order = useDocumentStore((s) => s.order);
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId);
  const viewports = useDocumentStore((s) => s.viewports);
  const isOpening = useDocumentStore((s) => s.isOpening);
  const openError = useDocumentStore((s) => s.openError);
  const openImageFile = useDocumentStore((s) => s.openImageFile);
  const createBlank = useDocumentStore((s) => s.createBlank);
  const closeDocument = useDocumentStore((s) => s.closeDocument);
  const setActiveDocument = useDocumentStore((s) => s.setActiveDocument);
  const setViewport = useDocumentStore((s) => s.setViewport);
  const dismissOpenError = useDocumentStore((s) => s.dismissOpenError);
  const activeTool = useUIStore((s) => s.activeTool);

  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const canvasStageRef = useRef<CanvasStageHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewDocOverlay, setShowNewDocOverlay] = useState(false);

  const openDocuments = order.map((id) => documents[id]).filter(Boolean);
  const activeDocument = activeDocumentId ? (documents[activeDocumentId] ?? null) : null;
  const activeViewport = activeDocumentId ? viewports[activeDocumentId] : undefined;
  const hasActiveDocument = activeDocument !== null;

  const getContainerSize = useCallback(() => {
    const rect = canvasAreaRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 1024, height: rect?.height ?? 768 };
  }, []);

  const handleOpenFile = useCallback(
    (file: File) => {
      openImageFile(file, getContainerSize());
      setShowNewDocOverlay(false);
    },
    [openImageFile, getContainerSize]
  );

  const handleCreateCustom = useCallback(
    (width: number, height: number) => {
      createBlank({ name: 'Untitled', width, height }, getContainerSize());
      setShowNewDocOverlay(false);
    },
    [createBlank, getContainerSize]
  );

  const handleCreateFromPreset = useCallback(
    (preset: { label: string; width: number; height: number; dpi: number }) => {
      createBlank({ name: preset.label, width: preset.width, height: preset.height, dpi: preset.dpi }, getContainerSize());
      setShowNewDocOverlay(false);
    },
    [createBlank, getContainerSize]
  );

  // Paste-from-clipboard: opens the pasted image as a new document, same as a file drop.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((it) => it.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (file) handleOpenFile(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleOpenFile]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!activeDocument) return;
      const canvas = canvasStageRef.current?.extractDocumentCanvas();
      if (!canvas) return;
      const blob = await canvasToBlob(canvas, { format, quality: format === 'jpeg' ? 0.92 : undefined });
      downloadBlob(blob, `${activeDocument.name}.${extensionFor(format)}`);
    },
    [activeDocument]
  );

  const zoomStep = (factor: number) => {
    if (!activeDocumentId || !activeViewport) return;
    const size = getContainerSize();
    setViewport(activeDocumentId, zoomAt(activeViewport, size.width / 2, size.height / 2, activeViewport.scale * factor));
  };

  const zoomToFit = () => {
    if (!activeDocumentId || !activeDocument) return;
    const size = getContainerSize();
    setViewport(activeDocumentId, fitToContainer(activeDocument.width, activeDocument.height, size.width, size.height));
  };

  const zoomTo100 = () => {
    if (!activeDocumentId || !activeDocument || !activeViewport) return;
    const size = getContainerSize();
    setViewport(activeDocumentId, zoomAt(activeViewport, size.width / 2, size.height / 2, 1));
  };

  const zoomPercent = (activeViewport?.scale ?? 1) * 100;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      <MenuBar
        hasActiveDocument={hasActiveDocument}
        onNewDocument={() => setShowNewDocOverlay(true)}
        onOpenFile={() => fileInputRef.current?.click()}
        onExportPNG={() => handleExport('png')}
        onExportJPEG={() => handleExport('jpeg')}
        onCloseDocument={() => activeDocumentId && closeDocument(activeDocumentId)}
        onZoomIn={() => zoomStep(1.25)}
        onZoomOut={() => zoomStep(0.8)}
        onZoomToFit={zoomToFit}
        onZoomTo100={zoomTo100}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleOpenFile(file);
          e.target.value = '';
        }}
      />
      <div className="flex min-h-0 flex-1">
        <Toolbar />
        <div className="flex min-w-0 flex-1 flex-col">
          <OptionsBar
            activeTool={activeTool}
            zoomPercent={zoomPercent}
            onZoomPercentChange={(percent) => {
              if (!activeDocumentId || !activeViewport) return;
              const size = getContainerSize();
              setViewport(activeDocumentId, zoomAt(activeViewport, size.width / 2, size.height / 2, percent / 100));
            }}
            onZoomToFit={zoomToFit}
            onZoomTo100={zoomTo100}
            hasActiveDocument={hasActiveDocument}
          />
          <DocumentTabs
            documents={openDocuments}
            activeDocumentId={activeDocumentId}
            onSelect={setActiveDocument}
            onClose={closeDocument}
          />
          <div ref={canvasAreaRef} className="relative min-h-0 flex-1">
            {activeDocument && activeViewport ? (
              <CanvasStage
                ref={canvasStageRef}
                document={activeDocument}
                viewport={activeViewport}
                activeTool={activeTool}
                onViewportChange={(v) => setViewport(activeDocument.id, v)}
                onDropFile={handleOpenFile}
              />
            ) : (
              <WelcomeScreen
                onOpenFile={handleOpenFile}
                onCreateFromPreset={handleCreateFromPreset}
                onCreateCustom={handleCreateCustom}
                isOpening={isOpening}
                openError={openError}
                onDismissError={dismissOpenError}
              />
            )}
            {hasActiveDocument && showNewDocOverlay && (
              <div className="absolute inset-0 z-20 bg-neutral-950/95">
                <button
                  type="button"
                  onClick={() => setShowNewDocOverlay(false)}
                  className="absolute right-4 top-4 z-30 rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <WelcomeScreen
                  onOpenFile={handleOpenFile}
                  onCreateFromPreset={handleCreateFromPreset}
                  onCreateCustom={handleCreateCustom}
                  isOpening={isOpening}
                  openError={openError}
                  onDismissError={dismissOpenError}
                />
              </div>
            )}
          </div>
          <StatusBar document={activeDocument} zoomPercent={zoomPercent} />
        </div>
      </div>
    </div>
  );
}
