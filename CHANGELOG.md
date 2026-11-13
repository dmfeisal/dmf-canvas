# Changelog

## 0.3.0-alpha.3 (prepared 13 November 2026, private, experimental)

- Add Shapes delivery step 1 ([proposal](docs/prd/SHAPES.md)): `createShape` and `shapeKinds` from `dmf-canvas/owners` create geometry-only `rectangle`, `ellipse`, `diamond`, `line` and `arrow` owners drawn as local SVG from semantic keys: Pencil `ink` and `strokeWidth`, `fill` `none`/`tint`, rectangle `corners` `sharp`/`round`, and two points for lines and arrows. Shapes share geometry, locks, layers, grouping, Duplicate, Copy/Paste, Save/Open and history; the stroke Eraser never removes them.
- Add free resize for shapes (step 2): eight handles plus rotate; sides change one dimension and corners both (Shift keeps the ratio), keeping the opposite edge or corner fixed even when rotated. The artwork is redrawn, so strokes keep their width and line points stretch. `TransformHandle` adds `n`/`s`, `createTextOwner` takes `freeResize` and `onBox`, and shape records keep `state.height`. Side handles hide on boxes under 48px in that direction. Text handles are unchanged.
- Add the Shapes tool (step 3): `createPencil` arms `setTool('shape')` with `setShape`, `setFill` and `setCorners`, and reports `shape`, `fill` and `corners`. Drag to draw (Shift keeps a square or circle, or snaps lines to 45°), click for a 120 × 80px default, or press Enter to place one at the centre; R, O, D, L and A arm each kind. The new `shapes` tool permission (default on) governs it. The rail gains Shapes, and its options bar gains the kinds, inks, widths, Fill and Round corners. Adds Lucide 1.60.0 `shapes`, `square`, `diamond`, `slash`, `move-up-right`, `paint-bucket` and `square-round-corner`, plus a local `ellipse`. The configurator, playground, import lab and shared custom host include it.
- The Shape style menu and Excalidraw mapping are not in this release.

Migration: boards and transfers containing shapes use schema 4 and portable documents use version 3; readers accept 1–4 and 1–3. 0.3.0-alpha.2 and earlier readers reject them instead of dropping shapes. Shape-free files are written exactly as before. See [compatibility](docs/COMPATIBILITY.md#shapes-schema-4).

## 0.3.0-alpha.2 (prepared 13 November 2026, private, experimental)

Documentation-only prerelease. Runtime modules, exports, styles, assets and board, clipboard, draft and portable formats are unchanged from 0.3.0-alpha.1; this version exists because shipped documentation changed after the alpha.1 archive was recorded.

- Correct shipped docs to match alpha.1 behaviour: the Selection inspector re-contains itself with a panel ResizeObserver (`docs/INSPECTOR.md`), portable documents are version 2 when they contain a highlight (`docs/API.md`), and the README lists the Highlighter, stroke Eraser, `dmf-canvas/documents`, `drawingPalettes`, the More menu and `createCanvasInspector`.
- Add a [glossary](docs/GLOSSARY.md) of Canvas parts, code names and not-yet-available terms, with a labelled anatomy diagram, linked from the documentation index. The glossary is published with the documentation site rather than the archive.

Migration: none. The immutable 0.3.0-alpha.1 archive is unchanged.

## 0.3.0-alpha.1 (prepared 10 November 2026, private, experimental)

- Add separate portable documents with stable node IDs, legacy migration and original-free host reconstruction. Existing board/clipboard/draft formats remain unchanged.
- Add bounded Excalidraw Text/freehand conversion with explicit per-object loss reports and a local import lab. Current fixtures are synthetic; broader import fidelity remains unverified.
- Add dmf-ui token fallbacks (`--primary`, `--foreground`, `--background`, `--border`) behind every `--dmf-color-*` Canvas variable, including the primary Pencil ink, so selection, handles, halos and new strokes render in hosts that only load dmf-ui. Hosts that define `--dmf-color-*` render unchanged.
- Remove fixed 36px and 44px minimum heights from inspector fields and buttons, the Done editing button, draft, settings, appearance and image-description controls; padding and content now set their size. Focus outlines and keyboard behaviour are unchanged.
- Standardize every toolbar on the [toolbar, icon and action menu standard](docs/design/TOOLBAR.md): floating tool rail, history, selection actions and help, modelled on feisal.id. `createCanvasToolbar` gains opt-in `orientation:'vertical'` and a More menu (`menu:true` actions, `moreLabel`); `toolbar.css` adds menu styles and optional `.canvas-embed-chrome` slots. Existing calls render as before.
- Fix toolbar icon conflicts: Paste now uses `clipboard-paste` (it shared `sticky-note` with Add note) and Bring forward/Send backward use `arrow-up`/`arrow-down` (they shared `layers`). Add Lucide 1.60.0 `type`, `clipboard-paste`, `ellipsis`, `circle-question-mark`, `download`, `folder-open`, `arrow-up`, `arrow-down`, `palette` and `image-plus`.
- The embed configurator, playground and generated integrations use the floating chrome with Add text in the rail; Arrange, Paper colour and Save/Open board move into More. The import lab and shared custom host adopt the same groups and icons.
- Add the Highlighter (0.3.0 milestone item, landed early in this prerelease): Shift+P or the rail button draws translucent 12/20/32px strokes in yellow, pink or blue at 32% opacity, matching feisal.id. One `createPencil` controller now serves both tools (`setTool`, `getState().tool`); highlights are Drawing owners named "Highlight" with full geometry, history, clipboard and file support. The existing `pencil` permission covers both tools.
- Add the stroke Eraser (0.3.0 milestone item): E or the rail button; dragging fades touched strokes and release removes them as one Undo step via the new `execute('erase', elements)` command. Locked, grouped and authored objects are kept. Needs the `pencil` and `delete` permissions. No board-format change.
- Add a tool options bar beside the rail while Pencil or Highlighter is armed: that tool's ink swatches and Thin/Medium/Bold widths, with the current choice pressed. `dmf-canvas/pencil` exports `drawingPalettes` for host swatches. Adds Lucide 1.60.0 `eraser`, `circle` and `minus`.

- Fix the Selection inspector overflowing short viewports when its content grows while open (for example after Text options change): it now re-contains itself on resize. Found by the browser suites on 320px mobile.

Migration: boards and transfers containing highlights use schema 3, and portable documents use version 2; readers accept 1–3 and 1–2, and reject older schemas that claim highlights. 0.2.0 and earlier alpha.1 readers reject schema 3 instead of drawing highlights as solid ink. Highlight-free files are written exactly as before. See [compatibility](docs/COMPATIBILITY.md#highlighter-schema-3).

Prerelease toward 0.3.0; the 0.3.0 milestone scope (Shapes, Highlighter, stroke Eraser) is unchanged. The immutable 0.2.0 archive is unchanged and does not contain `dmf-canvas/documents`.

## 0.2.0 (prepared 24 October 2026, private)

- Add owner-backed Selection inspector geometry and atomic mixed-selection transforms with Undo/Redo.
- Add optional `createCanvasInspector` through `dmf-canvas/toolbar`, included in configurator previews and generated integrations.
- Preserve native field editing and defer tooltip opening during native popover focus handoffs.
- Keep read-only inspectors open with focus on the enabled Close button when geometry fields are disabled.
- Add owner-backed Text font, 8-320px size, weight, physical alignment, Auto/Fixed wrapping and Reset text styles. Mixed selections share atomic history and preserve local top-left anchors within bounds.
- Use Original and system Sans-serif/Serif/Monospace choices without new font resources. Images, Sticky Notes, Drawings and unsupported custom owners are excluded from text formatting.
- Preserve formatting through Duplicate, Copy/Paste, Save/Open and optional drafts using validated style data.

Migration: styled boards and transfers use schema version 2; ordinary records within the old limits continue to use version 1. Both versions remain readable. Version 1 cannot carry typography or font sizes above 200px. A 0.1.0 reader rejects version 2 rather than silently losing formatting. Draft envelopes/keys remain version 1 and carry the explicit board version. Pin consumers to the matching archive. The immutable v0.1.0 baseline is unchanged; this private release preparation does not publish to a registry.

## 0.1.0 — 23 October 2026

First private versioned baseline of the existing standalone extraction. No new canvas interaction or board-schema change.

- Document supported import boundaries, owner/instance lifecycle, command results and compatibility limits.
- Retain native ESM, typed exports, explicit CSS and zero runtime dependencies.
- Include existing HTML/Astro/React/Vue recipes and the independent embed configurator.
- Add a release checklist and distribute API/compatibility documentation with the archive.

Board-file and clipboard schemas remain version 1. Package stays private; licensing, public publication and stable 1.0 compatibility remain unresolved. Earlier development snapshots used `0.0.0`.
