// ---------------------------------------------------------------------
// config/tools.ts
// Every tool declared once with a real status: live or planned. Matches
// the same honest convention used elsewhere for this kind of large,
// phased tool surface -- a tool only shows as clickable once it's real;
// until then it's visible (so the eventual full toolset is legible) but
// disabled, with a tooltip naming which phase adds it.
// ---------------------------------------------------------------------

export type ToolStatus = 'live' | 'planned';

export type ToolGroupId = 'view' | 'select' | 'crop' | 'retouch' | 'paint' | 'draw' | 'type' | 'shape' | 'color';

export interface ToolDefinition {
  id: string;
  label: string;
  status: ToolStatus;
  shortcut?: string;
  group: ToolGroupId;
  /** Only set for planned tools -- which phase (per the product roadmap) actually builds it. */
  plannedPhase?: number;
}

export const TOOL_REGISTRY: ToolDefinition[] = [
  { id: 'move', label: 'Move', status: 'live', shortcut: 'V', group: 'view' },
  { id: 'hand', label: 'Hand', status: 'live', shortcut: 'H', group: 'view' },
  { id: 'zoom', label: 'Zoom', status: 'live', shortcut: 'Z', group: 'view' },

  { id: 'marquee-rect', label: 'Rectangular Marquee', status: 'planned', plannedPhase: 3, group: 'select' },
  { id: 'marquee-ellipse', label: 'Elliptical Marquee', status: 'planned', plannedPhase: 3, group: 'select' },
  { id: 'lasso', label: 'Lasso', status: 'planned', plannedPhase: 3, group: 'select' },
  { id: 'polygonal-lasso', label: 'Polygonal Lasso', status: 'planned', plannedPhase: 3, group: 'select' },
  { id: 'magnetic-lasso', label: 'Magnetic Lasso', status: 'planned', plannedPhase: 3, group: 'select' },
  { id: 'magic-wand', label: 'Magic Wand', status: 'planned', plannedPhase: 3, group: 'select' },
  { id: 'quick-selection', label: 'Quick Selection', status: 'planned', plannedPhase: 3, group: 'select' },

  { id: 'crop', label: 'Crop', status: 'planned', plannedPhase: 5, group: 'crop' },
  { id: 'slice', label: 'Slice', status: 'planned', plannedPhase: 5, group: 'crop' },

  { id: 'brush', label: 'Brush', status: 'planned', plannedPhase: 3, group: 'paint' },
  { id: 'pencil', label: 'Pencil', status: 'planned', plannedPhase: 3, group: 'paint' },
  { id: 'eraser', label: 'Eraser', status: 'planned', plannedPhase: 3, group: 'paint' },
  { id: 'gradient', label: 'Gradient', status: 'planned', plannedPhase: 3, group: 'paint' },
  { id: 'paint-bucket', label: 'Paint Bucket', status: 'planned', plannedPhase: 3, group: 'paint' },

  { id: 'clone-stamp', label: 'Clone Stamp', status: 'planned', plannedPhase: 6, group: 'retouch' },
  { id: 'healing-brush', label: 'Healing Brush', status: 'planned', plannedPhase: 6, group: 'retouch' },
  { id: 'spot-healing', label: 'Spot Healing', status: 'planned', plannedPhase: 6, group: 'retouch' },
  { id: 'dodge', label: 'Dodge', status: 'planned', plannedPhase: 6, group: 'retouch' },
  { id: 'burn', label: 'Burn', status: 'planned', plannedPhase: 6, group: 'retouch' },

  { id: 'pen', label: 'Pen', status: 'planned', plannedPhase: 5, group: 'draw' },
  { id: 'type', label: 'Type', status: 'planned', plannedPhase: 5, group: 'type' },
  { id: 'rectangle', label: 'Rectangle', status: 'planned', plannedPhase: 5, group: 'shape' },
  { id: 'ellipse-shape', label: 'Ellipse', status: 'planned', plannedPhase: 5, group: 'shape' },

  { id: 'eyedropper', label: 'Eyedropper', status: 'planned', plannedPhase: 4, group: 'color' },
];

export function getToolsByGroup(group: ToolGroupId): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.group === group);
}

export function getToolStatus(id: string): ToolStatus {
  return TOOL_REGISTRY.find((t) => t.id === id)?.status ?? 'planned';
}
