# Lumen Studio

A professional, browser-based photo editing workspace. Original name, branding,
icons, and UI — inspired by pro desktop editors in *capability*, not a visual
or code copy of any Adobe product.

## Status: Phase 2 of 9 — layers, blend modes, history integration

Phase 1 shipped a real shell (open/export, pan/zoom). Phase 2 makes it an
actual layer-based editor: real multi-layer documents, GPU blend-mode
compositing, and an Undo/Redo/History system wired to every edit — not just
built and left disconnected. Every tool the eventual product needs is already
visible in the UI so the full surface is legible, but a tool only becomes
clickable once the phase that implements it lands; until then it's disabled
with a tooltip naming which phase adds it. There are no fake buttons that
look functional but do nothing.

### What's real right now

**From Phase 1:**
- Open an image (drag-and-drop, file picker, paste, File → Open); TIFF/HEIC/HEIF
  explicitly rejected (no browser decoder, none faked)
- Create a blank document (custom size or 10 real presets)
- Multi-document tabs, each with independent zoom/pan
- Pan & zoom: wheel, Ctrl/Cmd+wheel toward cursor, trackpad pinch, Space+drag,
  middle-mouse-drag, Hand/Zoom tools, Fit/Actual Size
- Export as PNG/JPEG — real `canvas.toBlob` → file download
- Dark/light theme toggle

**New in Phase 2:**
- **Real multi-layer documents** — New Layer (blank transparent, sized to the
  document), Duplicate Layer (an actual pixel copy, own bitmap), Delete Layer,
  reorder (up/down), rename (double-click, commit on Enter/blur, Esc cancels),
  visibility and lock toggles, all from the Layers panel or the Layer menu.
- **Real GPU blend-mode compositing** — 16 blend modes (Normal, Multiply,
  Screen, Overlay, Darken, Lighten, Color/Linear Dodge, Color Burn, Hard/Soft
  Light, Difference, Exclusion, Saturation, Color, Luminosity), each an actual
  PixiJS shader via its `advanced-blend-modes` package — not a dropdown where
  only "Normal" does anything.
- **Real opacity** — a slider that live-previews while dragging and commits
  exactly one history entry on release (not one entry per pixel of drag).
- **Undo/Redo that actually works** — every layer edit is a
  `Command<LumenDocument>` (pure `do`/`undo`) pushed through a real
  `HistoryManager`. Edit menu shows the actual next command's name ("Undo
  Rename Layer"), not a generic label. `⌘Z` / `⌘⇧Z` are wired for real.
- **A clickable History panel** — every past and undone-but-redoable edit is
  a real row; click any of them to jump straight to that exact document
  state (`HistoryManager.jumpTo`), the same mechanism a professional editor's
  History panel uses.
- **Keyboard shortcuts that fire** — every shortcut label already shown in
  Phase 1's menus/toolbar (`⌘Z`, `⌘⇧Z`, `⌘+`/`⌘-`/`⌘0`/`⌘1`, `⇧⌘N`, `V`/`H`/`Z`
  tool switching) is now bound to a real handler. `⌘N`/`⌘O`/`⌘W` still show
  their desktop-convention labels but aren't interceptable — every browser
  reserves those at the chrome level (new window / open-file-dialog / close
  tab) and never even delivers the keydown to page JS; that's a universal
  browser limitation every web-based editor shares, not something faked here.
- **Live layer thumbnails** — drawn straight from each layer's own
  `ImageBitmap`, not a placeholder icon.

### What's explicitly NOT built yet (by design)

Selection tools, the brush engine, adjustments/filters, text and shapes,
retouching, masks/layer styles, AI tools, color management, photo merge,
animation, project save/load (`.lumen` format), plugins, touch gestures,
rulers/grid/guides, and PWA installability — all scheduled for Phases 3
through 9. None of these are stubbed with placeholder UI that looks
clickable; they're visibly disabled with the phase that adds them.

## Architecture

```
src/
  engine/          Framework-agnostic TypeScript. No React imports. Unit-tested
                    in isolation. The UI never reaches past engine/index.ts.
    document/       LumenDocument / Layer data model, pure factory functions,
                    and commands.ts -- every layer edit as a real Command<S>
    history/        Generic Command<S> + HistoryManager<S> (undo/redo/jumpTo)
    renderer/       Viewport math (pure) + PixiRenderer (WebGL2 canvas,
                    real blend-mode shaders via pixi.js/advanced-blend-modes)
    io/             Image import (decode) and export (canvas -> blob -> download)
    index.ts        The only module src/components and src/store may import from

  store/            Zustand stores. Only ever import from src/engine.
    useDocumentStore.ts   Documents, tabs, viewports, one HistoryManager per
                          document, and every layer/history action
    useUIStore.ts         Theme, active tool, right-dock visibility/tab

  components/
    shell/          MenuBar, Toolbar, OptionsBar, DocumentTabs, StatusBar,
                    RightDock, WorkspaceShell, useGlobalShortcuts
    canvas/         CanvasStage -- mounts PixiRenderer, owns pan/zoom interaction
    panels/         LayersPanel, HistoryPanel, LayerThumbnail
    welcome/        WelcomeScreen -- new/open/recent + presets gallery
    common/         Tooltip, IconButton, Menu -- shared, accessible primitives

  config/
    tools.ts         Every tool declared once with a real status (live/planned)
    presets.ts       Document size presets
    blendModes.ts     Every BlendMode the engine actually supports

tests/
  engine/            Vitest unit tests: HistoryManager (incl. jumpTo/redoEntries),
                     Viewport math, and every layer command (commands.test.ts)
```

The engine/UI separation is deliberate: every engine function is pure
(`(input) -> output`, no hidden mutable state), which is what makes
`HistoryManager.jumpTo` — revert/replay to any past or future state — a
20-line method instead of a redesign.

## Tech stack

React 19 + TypeScript (strict) + Vite, PixiJS 8 (WebGL2) for rendering,
Zustand for state, Tailwind CSS v4 (via `@tailwindcss/vite`) for styling,
Vitest + jsdom for tests, lucide-react for icons.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # typecheck + production build
npm test          # run the Vitest suite
npm run lint      # oxlint
```

## Roadmap

1. Project setup, layout shell, canvas pan/zoom, open/export
2. **Layers, blend modes, history integration** ← you are here
3. Selection tools, brush engine, eraser
4. Adjustments, filters, Develop panel
5. Text, shapes, pen tool, transforms
6. Retouching, liquify, warp
7. Layer styles, masks, actions, project save/load
8. AI tools, color management, photo merge
9. Timeline, print, plugins, touch, PWA, settings, onboarding, polish, tests
