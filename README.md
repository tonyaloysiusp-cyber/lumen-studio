# Lumen Studio

A professional, browser-based photo editing workspace. Original name, branding,
icons, and UI — inspired by pro desktop editors in *capability*, not a visual
or code copy of any Adobe product.

## Status: Phase 1 of 9 — project setup, layout shell, pan/zoom, open/export

This is the first of a 9-phase build. Phase 1 delivers a real, working shell:
opening and exporting images, and a GPU-accelerated canvas you can pan and
zoom — nothing further. Every tool the eventual product needs is already
visible in the UI (toolbar, menus) so the full surface is legible, but a tool
only becomes clickable once the phase that implements it lands; until then
it's disabled with a tooltip naming which phase adds it. There are no fake
buttons that look functional but do nothing.

### What's real right now

- **Open an image** — drag-and-drop onto the canvas or the welcome screen,
  the "Open a photo" button, paste from the clipboard, or File → Open. Decodes
  via `createImageBitmap`; JPG/PNG/WebP/GIF/BMP/AVIF/SVG all work because the
  browser decodes them natively. TIFF/HEIC/HEIF are explicitly rejected with a
  clear error rather than silently failing — no browser decodes them without a
  WASM decoder, which isn't wired in yet.
- **Create a blank document** — a custom width/height, or one of ten real
  presets (Instagram Post/Story, YouTube Thumbnail, X Post, 1080p, 4K UHD,
  Web, A4/Letter/8×8in at 300 DPI).
- **Multi-document tabs** — open several documents at once, switch and close
  them independently, each with its own zoom/pan state.
- **Pan & zoom** — mouse-wheel pans, Ctrl/Cmd+wheel (and trackpad pinch, which
  the browser reports the same way) zooms toward the cursor, Space+drag or
  middle-mouse-drag pans, the Hand tool pans by default, the Zoom tool
  click-to-zoom-in / Alt-click-to-zoom-out, plus Fit on Screen and Actual Size
  (100%) from the View menu or the Zoom tool's options bar.
- **Export** — File → Export as PNG or JPEG renders the document's actual
  pixels (no checkerboard, no viewport transform baked in) through
  `canvas.toBlob` and triggers a real file download.
- **Rendering** — PixiJS on WebGL2, one Sprite per layer (today: always
  exactly one, since layers land in Phase 2), a checkerboard background so
  transparency is visually obvious.
- **Honest tool surface** — Move/Hand/Zoom are the only live tools. Every
  other tool in the toolbar and every disabled menu item names the exact
  phase that implements it.
- **Command-pattern history infrastructure** — `HistoryManager<S>` is built,
  tested, and memory-capped, ready for Phase 2's real layer-editing commands.
  Undo/Redo in the Edit menu are correctly disabled ("Nothing to undo yet")
  rather than wired to nothing.
- **Dark/light theme toggle** (Window menu), a live status bar (zoom %,
  document size, color mode, JS heap usage where the browser exposes it).

### What's explicitly NOT built yet (by design)

Selection tools, the brush engine, layers panel, adjustments/filters, text
and shapes, retouching, masks/layer styles, AI tools, color management,
photo merge, animation, project save/load (`.lumen` format), plugins, touch
gestures, and PWA installability — all scheduled for Phases 2 through 9 per
the product roadmap. None of these are stubbed with placeholder UI that
looks clickable; they're visibly disabled with the phase that adds them.

## Architecture

```
src/
  engine/          Framework-agnostic TypeScript. No React imports. Unit-tested
                    in isolation. The UI never reaches past engine/index.ts.
    document/       LumenDocument / Layer data model + pure factory functions
    history/        Generic Command<S> + HistoryManager<S> (undo/redo)
    renderer/        Viewport math (pure) + PixiRenderer (the actual WebGL2 canvas)
    io/              Image import (decode) and export (canvas -> blob -> download)
    index.ts         The only module src/components and src/store may import from

  store/            Zustand stores. Only ever import from src/engine.
    useDocumentStore.ts   Open documents, tabs, viewports, async open state
    useUIStore.ts         Theme, active tool

  components/
    shell/           MenuBar, Toolbar, OptionsBar, DocumentTabs, StatusBar, WorkspaceShell
    canvas/          CanvasStage — mounts PixiRenderer, owns pan/zoom interaction
    welcome/         WelcomeScreen — new/open/recent + presets gallery
    common/          Tooltip, IconButton, Menu — shared, accessible primitives

  config/
    tools.ts         Every tool declared once with a real status (live/planned)
    presets.ts       Document size presets

tests/
  engine/            Vitest unit tests for HistoryManager and Viewport math
```

The engine/UI separation is deliberate: every engine function is pure
(`(input) -> output`, no hidden mutable state), which makes it trivial to
unit test and makes Phase 2's history/undo integration straightforward —
Zustand stores just call engine functions and set the result.

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

1. **Project setup, layout shell, canvas pan/zoom, open/export** ← you are here
2. Layers, blend modes, history integration
3. Selection tools, brush engine, eraser
4. Adjustments, filters, Develop panel
5. Text, shapes, pen tool, transforms
6. Retouching, liquify, warp
7. Layer styles, masks, actions, project save/load
8. AI tools, color management, photo merge
9. Timeline, print, plugins, touch, PWA, settings, onboarding, polish, tests
