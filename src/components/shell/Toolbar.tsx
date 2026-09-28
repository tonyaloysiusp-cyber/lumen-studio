// ---------------------------------------------------------------------
// components/shell/Toolbar.tsx
// Left vertical toolbar. Every tool in TOOL_REGISTRY gets an icon so the
// eventual full toolset is visible at a glance, but only 'live' tools
// are clickable -- a 'planned' tool is visibly disabled with a tooltip
// naming the phase that builds it, never a button that looks real but
// does nothing when clicked.
// ---------------------------------------------------------------------

import {
  Move,
  Hand,
  ZoomIn,
  SquareDashed,
  CircleDashed,
  Lasso,
  Spline,
  Magnet,
  Wand2,
  MousePointerClick,
  Crop,
  Scissors,
  Paintbrush,
  Pencil,
  Eraser,
  Blend,
  PaintBucket,
  Stamp,
  Sparkles,
  Sun,
  Flame,
  PenTool,
  Type,
  Square,
  Circle,
  Pipette,
  type LucideIcon,
} from 'lucide-react';
import { TOOL_REGISTRY, type ToolDefinition } from '../../config/tools';
import { useUIStore } from '../../store/useUIStore';
import { IconButton } from '../common/IconButton';

const ICONS: Record<string, LucideIcon> = {
  move: Move,
  hand: Hand,
  zoom: ZoomIn,
  'marquee-rect': SquareDashed,
  'marquee-ellipse': CircleDashed,
  lasso: Lasso,
  'polygonal-lasso': Spline,
  'magnetic-lasso': Magnet,
  'magic-wand': Wand2,
  'quick-selection': MousePointerClick,
  crop: Crop,
  slice: Scissors,
  brush: Paintbrush,
  pencil: Pencil,
  eraser: Eraser,
  gradient: Blend,
  'paint-bucket': PaintBucket,
  'clone-stamp': Stamp,
  'healing-brush': Sparkles,
  'spot-healing': Sparkles,
  dodge: Sun,
  burn: Flame,
  pen: PenTool,
  type: Type,
  rectangle: Square,
  'ellipse-shape': Circle,
  eyedropper: Pipette,
};

function tooltipFor(tool: ToolDefinition): string {
  return tool.status === 'planned' ? `${tool.label} — coming in Phase ${tool.plannedPhase}` : tool.label;
}

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const setActiveTool = useUIStore((s) => s.setActiveTool);

  return (
    <nav
      aria-label="Tools"
      className="flex w-12 shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r border-neutral-800 bg-neutral-900 py-2"
    >
      {TOOL_REGISTRY.map((tool) => {
        const Icon = ICONS[tool.id] ?? Square;
        const isLive = tool.status === 'live';
        return (
          <IconButton
            key={tool.id}
            icon={<Icon size={17} strokeWidth={1.75} />}
            label={tooltipFor(tool)}
            shortcut={tool.shortcut}
            active={isLive && activeTool === tool.id}
            disabled={!isLive}
            onClick={() => isLive && setActiveTool(tool.id)}
          />
        );
      })}
    </nav>
  );
}
