// ---------------------------------------------------------------------
// components/shell/MenuBar.tsx
// The nine menus the product spec calls for. File/View/Window/Edit/Layer
// have real items as of Phase 2 (Undo/Redo carry the actual next
// command's label, same as every real editor's Edit menu); Image/Select/
// Filter are disabled placeholders naming their phase; Help is a
// placeholder until the shortcut cheat-sheet / command palette land.
// ---------------------------------------------------------------------

import { Menu, type MenuItem } from '../common/Menu';
import { useUIStore } from '../../store/useUIStore';

interface MenuBarProps {
  hasActiveDocument: boolean;
  hasActiveLayer: boolean;
  canDeleteActiveLayer: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
  onNewDocument: () => void;
  onOpenFile: () => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onCloseDocument: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
  onZoomTo100: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onNewLayer: () => void;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
  onShowLayersPanel: () => void;
  onShowHistoryPanel: () => void;
}

export function MenuBar({
  hasActiveDocument,
  hasActiveLayer,
  canDeleteActiveLayer,
  canUndo,
  canRedo,
  undoLabel,
  redoLabel,
  onNewDocument,
  onOpenFile,
  onExportPNG,
  onExportJPEG,
  onCloseDocument,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomTo100,
  onUndo,
  onRedo,
  onNewLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onShowLayersPanel,
  onShowHistoryPanel,
}: MenuBarProps) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const fileItems: MenuItem[] = [
    { label: 'New...', shortcut: '⌘N', onSelect: onNewDocument },
    { label: 'Open...', shortcut: '⌘O', onSelect: onOpenFile },
    { label: 'Open Recent', disabled: true, disabledReason: 'Phase 7' },
    { label: 'Close', shortcut: '⌘W', onSelect: onCloseDocument, disabled: !hasActiveDocument, separatorBefore: true },
    { label: 'Save Project (.lumen)', disabled: true, disabledReason: 'Phase 7', separatorBefore: true },
    { label: 'Export as PNG', onSelect: onExportPNG, disabled: !hasActiveDocument },
    { label: 'Export as JPEG', onSelect: onExportJPEG, disabled: !hasActiveDocument },
    { label: 'Export as PDF/SVG', disabled: true, disabledReason: 'Later phase' },
    { label: 'Print...', disabled: true, disabledReason: 'Phase 9', separatorBefore: true },
  ];

  const editItems: MenuItem[] = [
    { label: undoLabel ? `Undo ${undoLabel}` : 'Undo', shortcut: '⌘Z', onSelect: onUndo, disabled: !canUndo, disabledReason: canUndo ? undefined : 'Nothing to undo yet' },
    { label: redoLabel ? `Redo ${redoLabel}` : 'Redo', shortcut: '⌘⇧Z', onSelect: onRedo, disabled: !canRedo, disabledReason: canRedo ? undefined : 'Nothing to redo yet' },
    { label: 'Cut / Copy / Paste', disabled: true, disabledReason: 'Phase 3', separatorBefore: true },
    { label: 'Preferences...', disabled: true, disabledReason: 'Phase 9', separatorBefore: true },
  ];

  const imageItems: MenuItem[] = [
    { label: 'Image Size...', disabled: true, disabledReason: 'Phase 5' },
    { label: 'Canvas Size...', disabled: true, disabledReason: 'Phase 5' },
    { label: 'Crop', disabled: true, disabledReason: 'Phase 5' },
  ];

  const layerItems: MenuItem[] = [
    { label: 'New Layer', shortcut: '⇧⌘N', onSelect: onNewLayer, disabled: !hasActiveDocument },
    { label: 'Duplicate Layer', onSelect: onDuplicateLayer, disabled: !hasActiveLayer },
    { label: 'Delete Layer', onSelect: onDeleteLayer, disabled: !canDeleteActiveLayer },
    { label: 'Layer Mask', disabled: true, disabledReason: 'Phase 7', separatorBefore: true },
    { label: 'Layer Style', disabled: true, disabledReason: 'Phase 7' },
  ];

  const selectItems: MenuItem[] = [
    { label: 'All', shortcut: '⌘A', disabled: true, disabledReason: 'Phase 3' },
    { label: 'Deselect', shortcut: '⌘D', disabled: true, disabledReason: 'Phase 3' },
    { label: 'Refine Edge...', disabled: true, disabledReason: 'Phase 3' },
  ];

  const filterItems: MenuItem[] = [
    { label: 'Gaussian Blur...', disabled: true, disabledReason: 'Phase 4' },
    { label: 'Sharpen...', disabled: true, disabledReason: 'Phase 4' },
    { label: 'Liquify...', disabled: true, disabledReason: 'Phase 6' },
  ];

  const viewItems: MenuItem[] = [
    { label: 'Zoom In', shortcut: '⌘+', onSelect: onZoomIn, disabled: !hasActiveDocument },
    { label: 'Zoom Out', shortcut: '⌘−', onSelect: onZoomOut, disabled: !hasActiveDocument },
    { label: 'Fit on Screen', shortcut: '⌘0', onSelect: onZoomToFit, disabled: !hasActiveDocument },
    { label: 'Actual Size (100%)', shortcut: '⌘1', onSelect: onZoomTo100, disabled: !hasActiveDocument },
    { label: 'Rulers', disabled: true, disabledReason: 'Later phase', separatorBefore: true },
    { label: 'Grid', disabled: true, disabledReason: 'Later phase' },
    { label: 'Guides', disabled: true, disabledReason: 'Later phase' },
  ];

  const windowItems: MenuItem[] = [
    { label: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme', onSelect: toggleTheme },
    { label: 'Layers Panel', onSelect: onShowLayersPanel, disabled: !hasActiveDocument, separatorBefore: true },
    { label: 'History Panel', onSelect: onShowHistoryPanel, disabled: !hasActiveDocument },
  ];

  const helpItems: MenuItem[] = [
    { label: 'Keyboard Shortcuts', disabled: true, disabledReason: 'Phase 9' },
    { label: 'Command Palette (⌘K)', disabled: true, disabledReason: 'Phase 9' },
    { label: 'About Lumen Studio', disabled: true, disabledReason: 'Phase 9' },
  ];

  return (
    <div className="flex h-9 shrink-0 items-center gap-0.5 border-b border-neutral-800 bg-neutral-900 px-2">
      <span className="mr-2 select-none text-[13px] font-semibold tracking-wide text-neutral-200">Lumen Studio</span>
      <Menu label="File" items={fileItems} />
      <Menu label="Edit" items={editItems} />
      <Menu label="Image" items={imageItems} />
      <Menu label="Layer" items={layerItems} />
      <Menu label="Select" items={selectItems} />
      <Menu label="Filter" items={filterItems} />
      <Menu label="View" items={viewItems} />
      <Menu label="Window" items={windowItems} />
      <Menu label="Help" items={helpItems} />
    </div>
  );
}
