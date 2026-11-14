# Changelog

## 0.6.0-alpha.1 (prepared 14 November 2026, private, experimental)

Starts [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 3, [organisation](docs/prd/ORGANISATION.md), with steps 1–6: the Layers panel, rename and search, reset, the context menu, the host examples, then browser coverage.

- Add `getLayers()`: every present object, front to back, with its id, type name, lock and group state, selection, and the element to pass to `select()`. It is visit-local and never saved or in history.
- Add `createCanvasLayers(container, {canvas, trigger})` in `dmf-canvas/toolbar`: a native popover, opened from a contained button, that lists objects front to back with their type icon and name. Choosing a row selects that object. It follows changes while open. Escape closes it and returns focus to the button.
- The navigation browser suite grows to 45 checks, including Layers order against z-index, bring-to-front and send-back, row selection, and Escape.

- Organisation step 2, rename and search: `execute('rename', {id, name})` sets a visit-local display name for one object (null or empty restores the type name). Names are plain text, normalised and limited to 100 characters, and refused on read-only canvases and locked objects. A rename is one Undo step and never dirties the board. The Layers panel gains search (names and types), and Rename or F2 on a row opens an inline field, where Enter saves and Escape cancels.

- Organisation step 3, reset: `execute('reset-object')` returns the selection to its start state (owner content, lock, layer and visit-local name), and `execute('reset-canvas')` removes visit-local objects that are not locked and returns the rest to their start states. Start states are recorded at registration. Each reset is one Undo step. Because a reset changes owner state and removes objects, it changes the board (it is recorded through the change tracker). The Layers panel gains Reset selected and Reset canvas edits.

- Organisation step 5, hosts: the configurator's preview and the shared custom host get a Layers action in their History group, and a context menu over every toolbar's actions. The custom host disposes both with its canvas on stop and dispose. The navigation browser suite is 55 checks.

Migration: no format change. Names are visit-local and are never saved.

## 0.5.0 (prepared 14 November 2026, private)## 0.5.0 (prepared 14 November 2026, private)

Completes [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 2, [navigation](docs/prd/NAVIGATION.md). Promotes 0.5.0-alpha.1 with no runtime change; the alpha entries below hold the details.

- **Camera (opt-in):** `createCanvas(host, {camera: {world, minScale, maxScale}})` with a host-marked world element. `getState().camera` and `getState().hand` report the view; `execute('camera' | 'zoom' | 'fit' | 'zoom-to-selection' | 'hand')` drives it. Limits default to 0.2–4× and the world is kept within ±100,000 world units.
- **Coordinates at zoom:** the inspector, new Sticky Notes and images, paste, Pencil, Highlighter, Eraser and Shapes work in world units, and cancel unfinished input when the camera moves.
- **Input:** Hand (H, Space held), wheel pan, pinch and Ctrl/⌘ zoom around the pointer, `+`/`-`/`0`, Shift+1 Fit all, Shift+2 Zoom to selection, and arrows pan with nothing selected.
- **Touch (camera hosts):** one finger drags objects or pans; two fingers pinch and pan, handing off an applied drag as one Undo step.
- **Full screen:** `createCanvasFullscreen` in `dmf-canvas/toolbar`.
- **Hosts:** the configurator's Zoom and pan setting and `mountConsumer(..., {camera: true})`.
- **Verification:** the navigation browser suite has 42 checks in CI. The physical-device touch checklist (`docs/prd/NAVIGATION-DEVICE-CHECK.md`) was not run for this release.

Migration from 0.4.0: hosts without `camera` are unchanged. No board, clipboard, draft or portable format change.

## 0.5.0-alpha.1 (prepared 14 November 2026, private, experimental)


Starts [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 2, [navigation](docs/prd/NAVIGATION.md), with step 1: the camera model in core.

- Add an opt-in camera: `createCanvas(host, {camera: {world, minScale, maxScale}})` with a host-marked world element that holds the objects and takes one CSS transform. `getState().camera` reports `{x, y, scale}`, and `getState().settings.camera` reports the zoom limits (default 0.2–4×), or `false` on hosts without a camera. `configure({camera})` changes the limits.
- Add `execute('camera')`, `execute('zoom')` (by or to, around a point), `execute('fit')` (Fit all) and `execute('zoom-to-selection')`. They work read-only and while editing, never enter history, change events or saved data, and announce zoom changes.
- At any zoom, pointer drags follow the pointer and keyboard nudges move whole screen pixels. Snapping keeps its 6px screen distance and the 24px world grid, transform handles stay 24px, and the host's dotted background follows the camera.
- On camera hosts the world is unbounded: dragging, transforms, Duplicate and paste never clamp objects to the host. Built-in owners convert screen-pixel deltas to world units inside a camera world.
- Owners may implement `cameraChanged()`, called after each zoom change; built-in owners use it so handle spacing and small-box handle hiding follow the drawn size. Text editing anchors are kept in world coordinates, so panning or zooming while editing never moves the text.

- Navigation step 2, coordinates at zoom. On camera hosts:
  - the inspector reports and applies world units, and its panel closes on any pan or zoom;
  - new Sticky Notes and images go to the visible centre, and paste centres the copies there;
  - Pencil, Highlighter, Eraser and Shapes map input into the world, draw previews there, commit world coordinates without containment, and cancel unfinished input when the camera changes.
- Navigation step 3, camera input on camera hosts:
  - Hand (H, `execute('hand')`, `getState().hand`) and Space held pan on drag without moving objects, and Hand and Pencil disarm each other;
  - the wheel pans, and pinch or Ctrl/⌘ with the wheel zooms around the pointer;
  - keys: `+`/`-` zoom, `0` returns to 100%, Shift+1 is Fit all, Shift+2 is Zoom to selection, and arrows pan with nothing selected;
  - writes are coalesced per animation frame, and wheel zoom announces once it settles; a key or command zoom drops a pending wheel announcement, so it never names an old scale;
  - the toolbar standard adds Hand and a Camera group (Zoom out, Zoom in, Fit all), with Lucide `hand`, `zoom-in`, `zoom-out` and `focus`.
- Navigation step 4, touch on camera hosts:
  - one finger drags an object after 4px, or pans from empty space;
  - two fingers take the camera, finishing an applied drag as its Undo step, then pinch around the midpoint and pan;
  - a third finger or a replaced pair rebases without a jump, and the remaining finger keeps panning;
  - camera hosts set `touch-action: none`;
  - checked with emulated multi-touch so far.
- Navigation step 5, full screen: `createCanvasFullscreen(target, {canvas, onChange})` in `dmf-canvas/toolbar` puts the chrome container into native full screen. It offers `supported`, `active` and `pending` state, toggle, enter and exit, F on the focused target, and dispose. The toolbar standard adds a Full screen action (Lucide `maximize` and `minimize`, hidden when unsupported).
- Navigation step 6, hosts:
  - the configurator gains a **Zoom and pan** setting (`camera`, off by default) that remounts its preview with a camera world, Hand, the Camera group (Zoom out, Zoom in, Fit all, Full screen), camera rows in keyboard help, and new objects at the visible centre; generated code passes it;
  - the shared custom host takes `mountConsumer(parent, name, {camera: true})`;
  - the toolbar swaps the Full screen icon (Maximize and Minimize) like Lock;
  - the homepage playground keeps zoom and pan off, so the wheel still scrolls the page.
- Navigation step 7, coverage: the navigation suite grows to 42 checks, adding snapping at 0.5× and 2×, the world grid at 2×, mobile RTL camera controls and camera teardown in the configurator. A physical-device checklist is in `docs/prd/NAVIGATION-DEVICE-CHECK.md`.
- Keep camera worlds within the ±100,000 world-unit range board files accept: the visible centre, owner positions, new objects, pastes and drawings stay inside it, so a far pan never makes a board unsaveable. On camera hosts, copy records clipboard bounds in world units.

Migration: hosts without `camera` are unchanged. No board, clipboard, draft or portable format change.

## 0.4.0 (prepared 14 November 2026, private)

Completes [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 1, [editing precision](docs/prd/EDITING-PRECISION.md). Promotes 0.4.0-alpha.1 with no runtime change; the alpha entry below holds the details.

- **Snapping and guides:** pointer drags snap a selection's edges and centres to other objects within 6px, and optionally to the 24px grid, with alignment lines and pink gap labels. Alt bypasses snapping; Shift after a drag starts locks one axis. Keyboard nudges, resize and rotate never snap.
- **Alt-drag duplicate:** Alt/Option before a mouse or pen drag drops a copy where the drag ends, as one Undo step.
- **`[`/`]` navigation:** select the previous or next object in reading order, wrapping at the ends.
- **Selection labels:** the selection's name above it and width × height below it, live during moves, resizes and rotation.
- **Settings:** `snapping: {align, grid}` (default `{align: true, grid: false}`) and `labels` (default `true`) on `createCanvas` and `configure()`. Both are host preferences and never enter saved data.
- **Verification:** `npm run test:editing:browser` (17 checks) runs in CI with the other browser suites. dmf-web vendors the alpha and uses the package's snapping on its `/ui/` Canvas specimens.

Migration from 0.3.0: no board, clipboard, draft or portable format change. Snapping and labels are on by default, so pointer drags near another object's edge now land on it and selections show labels; pass `snapping: {align: false}` or `labels: false` to keep 0.3.0 behaviour. `[` and `]` are now handled on a focused canvas.

## 0.4.0-alpha.1 (prepared 13 November 2026, private, experimental)

Delivers [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 1, [editing precision](docs/prd/EDITING-PRECISION.md): snapping and guides, the Shift axis lock, Alt-drag duplicate, `[`/`]` navigation and selection labels. It becomes 0.4.0 once dmf-web moves one surface onto the package's snapping.

- Add pointer-drag snapping, modelled on feisal.id: a selection's left, centre and right (and top, middle and bottom) edges snap within 6px to other objects' edges and centres (up to 80 peers), and, when nothing aligns, its top-left can snap to the 24px background dots. Alt/Option held during a drag bypasses it. Keyboard nudges, resize and rotate never snap, and snaps never leave the containment area.
- New `snapping: {align, grid}` setting on `createCanvas` and `configure()`, default `{align: true, grid: false}`, reported in `getState().settings`. It is a host preference and never enters board, clipboard, draft or portable data.
- More gains a Snapping section with checked "Align to objects" (`magnet`) and "Snap to grid" (`grid-2x2`) rows in the configurator embed (so the playground and generated integrations) and the shared custom host. Adds Lucide 1.60.0 `magnet` and `grid-2x2`.
- Add the editing precision browser suite, `npm run test:editing:browser`, in CI.
- Keep selection labels inside the host: near an edge a label flips inside the selection and shifts back horizontally.
- Complete the editing precision browser suite (step 7): 17 checks in CI, adding multi-selection snapping, labels during resize and rotation, mobile RTL navigation and labels, and teardown leaving no overlay nodes.
- Add selection labels (step 6): the selection's name above its top-left and width × height below its centre, live during moves, resizes and rotation, and hidden while editing or creating. A multi-selection shows its count and combined size. New `labels` setting (default on). They use the theme's toolbar surface, ink and line for contrast in light and dark, are pointer-inert and `aria-hidden`, and update at most once per animation frame.
- Add `[`/`]` object navigation (step 5): with the canvas focused, `]` and `[` select and focus the next or previous object in reading order, like Tab. Groups count as one stop, both wrap at the ends, and the status announces the position. Text editing and native fields keep the keys. The keyboard help lists them.
- Add Alt-drag duplicate (step 4): Alt/Option held before a mouse or pen drag copies the selection in place after 4px and drags the copies, with snapping still on. Eligibility follows Duplicate. Creation and placement are one Undo step; an Alt-click, Escape or cancellation leaves nothing behind. `duplicate` is unchanged for the command and Duplicate button (24px offset).
- Add the Shift axis lock (step 3): Shift pressed after a drag starts locks movement to the dominant axis after 4px, anchored at the last applied position, until Shift is released. Snapping and its guide then apply only along that axis, and the canvas status announces the lock. Shift at pointer-down still toggles selection.
- Add snapping guides (step 2): while snapping, a selection-coloured line marks each axis's snapped edge, centre or grid line, and pink gap guides label the nearest distance to a neighbour on the same row or column, in screen pixels to a tenth (white on `#d6336c`, 4.8:1). They are pointer-inert, `aria-hidden` and hidden on drop, Alt and cancellation.

Migration: no format change. Snapping is on by default, so pointer drags near another object's edge now land on it; pass `snapping: {align: false}` to keep free movement.

## 0.3.0 (prepared 13 November 2026, private)

Completes the 0.3.0 milestone (Shapes, Highlighter, stroke Eraser). Promotes 0.3.0-alpha.3 with no runtime change; the alpha entries below hold the details.

- **Shapes:** rectangle, ellipse, diamond, line and arrow. Draw them with the Shapes tool (R, O, D, L, A, Shift constraints, click or Enter placement), resize them freely with eight handles, and restyle the selection with More › Shape style. They follow the new `shapes` tool permission. `createShape` and `execute('shape-style')` serve custom hosts.
- **Highlighter and stroke Eraser:** translucent 12/20/32px strokes, and an Eraser that removes whole Pencil and Highlighter strokes as one Undo step.
- **Portable documents and Excalidraw import:** stable node IDs, legacy migration, and an experimental adapter (version 2) that converts Text, freehand, basic shapes and two-point lines/arrows, with a loss report for every object.
- **Toolbar standard:** floating rail, tool options bar, history, selection actions with a More menu, and help, with one Lucide icon per action. The chrome now always stays above canvas objects.
- **dmf-ui token fallbacks** behind every `--dmf-color-*` variable, and natural sizing for inspector and editor controls.
- **Verification:** the browser suites run headless in CI through Playwright, including the new Shapes suite.

Migration from 0.2.0: boards and clipboard transfers use schema 3 when they contain a highlight and schema 4 when they contain a shape; portable documents use version 2 and 3 for the same content. Readers accept board schemas 1–4 and portable versions 1–3, and 0.2.0 readers reject the newer schemas instead of dropping content. Files without highlights or shapes are written exactly as before. See [compatibility](docs/COMPATIBILITY.md). `TransformHandle` adds `n`/`s`, `PencilTool` adds `shape`, and `canvasToolNames` adds `shapes`, so hosts that switch exhaustively on these see new cases.

## 0.3.0-alpha.3 (prepared 13 November 2026, private, experimental)

- Add Shapes delivery step 1 ([proposal](docs/prd/SHAPES.md)): `createShape` and `shapeKinds` from `dmf-canvas/owners` create geometry-only `rectangle`, `ellipse`, `diamond`, `line` and `arrow` owners drawn as local SVG from semantic keys: Pencil `ink` and `strokeWidth`, `fill` `none`/`tint`, rectangle `corners` `sharp`/`round`, and two points for lines and arrows. Shapes share geometry, locks, layers, grouping, Duplicate, Copy/Paste, Save/Open and history; the stroke Eraser never removes them.
- Add free resize for shapes (step 2): eight handles plus rotate; sides change one dimension and corners both (Shift keeps the ratio), keeping the opposite edge or corner fixed even when rotated. The artwork is redrawn, so strokes keep their width and line points stretch. `TransformHandle` adds `n`/`s`, `createTextOwner` takes `freeResize` and `onBox`, and shape records keep `state.height`. Side handles hide on boxes under 48px in that direction. Text handles are unchanged.
- Add the Shapes tool (step 3): `createPencil` arms `setTool('shape')` with `setShape`, `setFill` and `setCorners`, and reports `shape`, `fill` and `corners`. Drag to draw (Shift keeps a square or circle, or snaps lines to 45°), click for a 120 × 80px default, or press Enter to place one at the centre; R, O, D, L and A arm each kind. The new `shapes` tool permission (default on) governs it. The rail gains Shapes, and its options bar gains the kinds, inks, widths, Fill and Round corners. Adds Lucide 1.60.0 `shapes`, `square`, `diamond`, `slash`, `move-up-right`, `paint-bucket` and `square-round-corner`, plus a local `ellipse`. The configurator, playground, import lab and shared custom host include it.
- Add Shape style (step 4): `execute('shape-style', {ink, strokeWidth, fill, corners})` restyles every selected shape as one Undo step, applying only the keys each kind supports; `getState().shapeStyle` reports the shared style. More gains a contextual Shape style section. Shape captures include their style, and records mirror it in `state.style` so Open restores authored shapes.
- Fix `canCreate` ignoring the `shapes` permission, so a host that allows only Shapes can create them.
- Fix `loadPortableDocument` rejecting portable documents that contain shapes: its internal board now uses schema 4.
- Fix objects covering the floating toolbar: from the fourth object, layer z-indexes rose above the toolbar slots, so a shape, note or drawing moved under the rail blocked its buttons. `toolbar.css` now isolates the host's stacking context. Found by the new Shapes browser suite on mobile RTL.
- Add the Shapes browser suite (step 6): `npm run test:shapes:browser`, headless in CI, covers drawing, Shift constraints, placement, free resize, Shape style, Save/Open, the `shapes` permission and mobile RTL.
- Add Excalidraw shape import (step 5, adapter version 2): rectangles, ellipses, diamonds and unbound two-point lines and arrows convert to editable shapes with the nearest ink and width; backgrounds become a tint and rounded rectangles keep round corners. Each row reports roughness, fill style, dash, opacity, arrowhead style and bound text. A start-only arrowhead swaps the endpoints. Bound and multi-point arrows stay Unsupported. Imports containing shapes are portable version 3. The import lab converts them too.
- Development: the browser suites (`test:browser`, `test:*:browser`) now run in headless Chromium through Playwright 1.64.1, a development dependency only, and a new CI job runs all six on every push and pull request. `CANVAS_TEST_SPACE_ID` still selects Ego Browser. Runtime code and shipped behaviour are unchanged.

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
## 0.5.0-alpha.1 (prepared 14 November 2026, private, experimental)

Starts [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 2, [navigation](docs/prd/NAVIGATION.md), with step 1: the camera model in core.

- Add an opt-in camera: `createCanvas(host, {camera: {world, minScale, maxScale}})` with a host-marked world element that holds the objects and takes one CSS transform. `getState().camera` reports `{x, y, scale}`, and `getState().settings.camera` reports the zoom limits (default 0.2–4×), or `false` on hosts without a camera. `configure({camera})` changes the limits.
- Add `execute('camera')`, `execute('zoom')` (by or to, around a point), `execute('fit')` (Fit all) and `execute('zoom-to-selection')`. They work read-only and while editing, never enter history, change events or saved data, and announce zoom changes.
- At any zoom, pointer drags follow the pointer and keyboard nudges move whole screen pixels. Snapping keeps its 6px screen distance and the 24px world grid, transform handles stay 24px, and the host's dotted background follows the camera.
- On camera hosts the world is unbounded: dragging, transforms, Duplicate and paste never clamp objects to the host. Built-in owners convert screen-pixel deltas to world units inside a camera world.
- Owners may implement `cameraChanged()`, called after each zoom change; built-in owners use it so handle spacing and small-box handle hiding follow the drawn size. Text editing anchors are kept in world coordinates, so panning or zooming while editing never moves the text.

- Navigation step 2, coordinates at zoom. On camera hosts:
  - the inspector reports and applies world units, and its panel closes on any pan or zoom;
  - new Sticky Notes and images go to the visible centre, and paste centres the copies there;
  - Pencil, Highlighter, Eraser and Shapes map input into the world, draw previews there, commit world coordinates without containment, and cancel unfinished input when the camera changes.
- Navigation step 3, camera input on camera hosts:
  - Hand (H, `execute('hand')`, `getState().hand`) and Space held pan on drag without moving objects, and Hand and Pencil disarm each other;
  - the wheel pans, and pinch or Ctrl/⌘ with the wheel zooms around the pointer;
  - keys: `+`/`-` zoom, `0` returns to 100%, Shift+1 is Fit all, Shift+2 is Zoom to selection, and arrows pan with nothing selected;
  - writes are coalesced per animation frame, and wheel zoom announces once it settles; a key or command zoom drops a pending wheel announcement, so it never names an old scale;
  - the toolbar standard adds Hand and a Camera group (Zoom out, Zoom in, Fit all), with Lucide `hand`, `zoom-in`, `zoom-out` and `focus`.
- Navigation step 4, touch on camera hosts:
  - one finger drags an object after 4px, or pans from empty space;
  - two fingers take the camera, finishing an applied drag as its Undo step, then pinch around the midpoint and pan;
  - a third finger or a replaced pair rebases without a jump, and the remaining finger keeps panning;
  - camera hosts set `touch-action: none`;
  - checked with emulated multi-touch so far.
- Navigation step 5, full screen: `createCanvasFullscreen(target, {canvas, onChange})` in `dmf-canvas/toolbar` puts the chrome container into native full screen. It offers `supported`, `active` and `pending` state, toggle, enter and exit, F on the focused target, and dispose. The toolbar standard adds a Full screen action (Lucide `maximize` and `minimize`, hidden when unsupported).
- Navigation step 6, hosts:
  - the configurator gains a **Zoom and pan** setting (`camera`, off by default) that remounts its preview with a camera world, Hand, the Camera group (Zoom out, Zoom in, Fit all, Full screen), camera rows in keyboard help, and new objects at the visible centre; generated code passes it;
  - the shared custom host takes `mountConsumer(parent, name, {camera: true})`;
  - the toolbar swaps the Full screen icon (Maximize and Minimize) like Lock;
  - the homepage playground keeps zoom and pan off, so the wheel still scrolls the page.
- Navigation step 7, coverage: the navigation suite grows to 42 checks, adding snapping at 0.5× and 2×, the world grid at 2×, mobile RTL camera controls and camera teardown in the configurator. A physical-device checklist is in `docs/prd/NAVIGATION-DEVICE-CHECK.md`.
- Keep camera worlds within the ±100,000 world-unit range board files accept: the visible centre, owner positions, new objects, pastes and drawings stay inside it, so a far pan never makes a board unsaveable. On camera hosts, copy records clipboard bounds in world units.

Migration: hosts without `camera` are unchanged. No board, clipboard, draft or portable format change.

## 0.4.0 (prepared 14 November 2026, private)

Completes [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 1, [editing precision](docs/prd/EDITING-PRECISION.md). Promotes 0.4.0-alpha.1 with no runtime change; the alpha entry below holds the details.

- **Snapping and guides:** pointer drags snap a selection's edges and centres to other objects within 6px, and optionally to the 24px grid, with alignment lines and pink gap labels. Alt bypasses snapping; Shift after a drag starts locks one axis. Keyboard nudges, resize and rotate never snap.
- **Alt-drag duplicate:** Alt/Option before a mouse or pen drag drops a copy where the drag ends, as one Undo step.
- **`[`/`]` navigation:** select the previous or next object in reading order, wrapping at the ends.
- **Selection labels:** the selection's name above it and width × height below it, live during moves, resizes and rotation.
- **Settings:** `snapping: {align, grid}` (default `{align: true, grid: false}`) and `labels` (default `true`) on `createCanvas` and `configure()`. Both are host preferences and never enter saved data.
- **Verification:** `npm run test:editing:browser` (17 checks) runs in CI with the other browser suites. dmf-web vendors the alpha and uses the package's snapping on its `/ui/` Canvas specimens.

Migration from 0.3.0: no board, clipboard, draft or portable format change. Snapping and labels are on by default, so pointer drags near another object's edge now land on it and selections show labels; pass `snapping: {align: false}` or `labels: false` to keep 0.3.0 behaviour. `[` and `]` are now handled on a focused canvas.

## 0.4.0-alpha.1 (prepared 13 November 2026, private, experimental)

Delivers [dmf-web parity](docs/prd/DMF-WEB-PARITY.md) phase 1, [editing precision](docs/prd/EDITING-PRECISION.md): snapping and guides, the Shift axis lock, Alt-drag duplicate, `[`/`]` navigation and selection labels. It becomes 0.4.0 once dmf-web moves one surface onto the package's snapping.

- Add pointer-drag snapping, modelled on feisal.id: a selection's left, centre and right (and top, middle and bottom) edges snap within 6px to other objects' edges and centres (up to 80 peers), and, when nothing aligns, its top-left can snap to the 24px background dots. Alt/Option held during a drag bypasses it. Keyboard nudges, resize and rotate never snap, and snaps never leave the containment area.
- New `snapping: {align, grid}` setting on `createCanvas` and `configure()`, default `{align: true, grid: false}`, reported in `getState().settings`. It is a host preference and never enters board, clipboard, draft or portable data.
- More gains a Snapping section with checked "Align to objects" (`magnet`) and "Snap to grid" (`grid-2x2`) rows in the configurator embed (so the playground and generated integrations) and the shared custom host. Adds Lucide 1.60.0 `magnet` and `grid-2x2`.
- Add the editing precision browser suite, `npm run test:editing:browser`, in CI.
- Keep selection labels inside the host: near an edge a label flips inside the selection and shifts back horizontally.
- Complete the editing precision browser suite (step 7): 17 checks in CI, adding multi-selection snapping, labels during resize and rotation, mobile RTL navigation and labels, and teardown leaving no overlay nodes.
- Add selection labels (step 6): the selection's name above its top-left and width × height below its centre, live during moves, resizes and rotation, and hidden while editing or creating. A multi-selection shows its count and combined size. New `labels` setting (default on). They use the theme's toolbar surface, ink and line for contrast in light and dark, are pointer-inert and `aria-hidden`, and update at most once per animation frame.
- Add `[`/`]` object navigation (step 5): with the canvas focused, `]` and `[` select and focus the next or previous object in reading order, like Tab. Groups count as one stop, both wrap at the ends, and the status announces the position. Text editing and native fields keep the keys. The keyboard help lists them.
- Add Alt-drag duplicate (step 4): Alt/Option held before a mouse or pen drag copies the selection in place after 4px and drags the copies, with snapping still on. Eligibility follows Duplicate. Creation and placement are one Undo step; an Alt-click, Escape or cancellation leaves nothing behind. `duplicate` is unchanged for the command and Duplicate button (24px offset).
- Add the Shift axis lock (step 3): Shift pressed after a drag starts locks movement to the dominant axis after 4px, anchored at the last applied position, until Shift is released. Snapping and its guide then apply only along that axis, and the canvas status announces the lock. Shift at pointer-down still toggles selection.
- Add snapping guides (step 2): while snapping, a selection-coloured line marks each axis's snapped edge, centre or grid line, and pink gap guides label the nearest distance to a neighbour on the same row or column, in screen pixels to a tenth (white on `#d6336c`, 4.8:1). They are pointer-inert, `aria-hidden` and hidden on drop, Alt and cancellation.

Migration: no format change. Snapping is on by default, so pointer drags near another object's edge now land on it; pass `snapping: {align: false}` to keep free movement.

## 0.3.0 (prepared 13 November 2026, private)

Completes the 0.3.0 milestone (Shapes, Highlighter, stroke Eraser). Promotes 0.3.0-alpha.3 with no runtime change; the alpha entries below hold the details.

- **Shapes:** rectangle, ellipse, diamond, line and arrow. Draw them with the Shapes tool (R, O, D, L, A, Shift constraints, click or Enter placement), resize them freely with eight handles, and restyle the selection with More › Shape style. They follow the new `shapes` tool permission. `createShape` and `execute('shape-style')` serve custom hosts.
- **Highlighter and stroke Eraser:** translucent 12/20/32px strokes, and an Eraser that removes whole Pencil and Highlighter strokes as one Undo step.
- **Portable documents and Excalidraw import:** stable node IDs, legacy migration, and an experimental adapter (version 2) that converts Text, freehand, basic shapes and two-point lines/arrows, with a loss report for every object.
- **Toolbar standard:** floating rail, tool options bar, history, selection actions with a More menu, and help, with one Lucide icon per action. The chrome now always stays above canvas objects.
- **dmf-ui token fallbacks** behind every `--dmf-color-*` variable, and natural sizing for inspector and editor controls.
- **Verification:** the browser suites run headless in CI through Playwright, including the new Shapes suite.

Migration from 0.2.0: boards and clipboard transfers use schema 3 when they contain a highlight and schema 4 when they contain a shape; portable documents use version 2 and 3 for the same content. Readers accept board schemas 1–4 and portable versions 1–3, and 0.2.0 readers reject the newer schemas instead of dropping content. Files without highlights or shapes are written exactly as before. See [compatibility](docs/COMPATIBILITY.md). `TransformHandle` adds `n`/`s`, `PencilTool` adds `shape`, and `canvasToolNames` adds `shapes`, so hosts that switch exhaustively on these see new cases.

## 0.3.0-alpha.3 (prepared 13 November 2026, private, experimental)

- Add Shapes delivery step 1 ([proposal](docs/prd/SHAPES.md)): `createShape` and `shapeKinds` from `dmf-canvas/owners` create geometry-only `rectangle`, `ellipse`, `diamond`, `line` and `arrow` owners drawn as local SVG from semantic keys: Pencil `ink` and `strokeWidth`, `fill` `none`/`tint`, rectangle `corners` `sharp`/`round`, and two points for lines and arrows. Shapes share geometry, locks, layers, grouping, Duplicate, Copy/Paste, Save/Open and history; the stroke Eraser never removes them.
- Add free resize for shapes (step 2): eight handles plus rotate; sides change one dimension and corners both (Shift keeps the ratio), keeping the opposite edge or corner fixed even when rotated. The artwork is redrawn, so strokes keep their width and line points stretch. `TransformHandle` adds `n`/`s`, `createTextOwner` takes `freeResize` and `onBox`, and shape records keep `state.height`. Side handles hide on boxes under 48px in that direction. Text handles are unchanged.
- Add the Shapes tool (step 3): `createPencil` arms `setTool('shape')` with `setShape`, `setFill` and `setCorners`, and reports `shape`, `fill` and `corners`. Drag to draw (Shift keeps a square or circle, or snaps lines to 45°), click for a 120 × 80px default, or press Enter to place one at the centre; R, O, D, L and A arm each kind. The new `shapes` tool permission (default on) governs it. The rail gains Shapes, and its options bar gains the kinds, inks, widths, Fill and Round corners. Adds Lucide 1.60.0 `shapes`, `square`, `diamond`, `slash`, `move-up-right`, `paint-bucket` and `square-round-corner`, plus a local `ellipse`. The configurator, playground, import lab and shared custom host include it.
- Add Shape style (step 4): `execute('shape-style', {ink, strokeWidth, fill, corners})` restyles every selected shape as one Undo step, applying only the keys each kind supports; `getState().shapeStyle` reports the shared style. More gains a contextual Shape style section. Shape captures include their style, and records mirror it in `state.style` so Open restores authored shapes.
- Fix `canCreate` ignoring the `shapes` permission, so a host that allows only Shapes can create them.
- Fix `loadPortableDocument` rejecting portable documents that contain shapes: its internal board now uses schema 4.
- Fix objects covering the floating toolbar: from the fourth object, layer z-indexes rose above the toolbar slots, so a shape, note or drawing moved under the rail blocked its buttons. `toolbar.css` now isolates the host's stacking context. Found by the new Shapes browser suite on mobile RTL.
- Add the Shapes browser suite (step 6): `npm run test:shapes:browser`, headless in CI, covers drawing, Shift constraints, placement, free resize, Shape style, Save/Open, the `shapes` permission and mobile RTL.
- Add Excalidraw shape import (step 5, adapter version 2): rectangles, ellipses, diamonds and unbound two-point lines and arrows convert to editable shapes with the nearest ink and width; backgrounds become a tint and rounded rectangles keep round corners. Each row reports roughness, fill style, dash, opacity, arrowhead style and bound text. A start-only arrowhead swaps the endpoints. Bound and multi-point arrows stay Unsupported. Imports containing shapes are portable version 3. The import lab converts them too.
- Development: the browser suites (`test:browser`, `test:*:browser`) now run in headless Chromium through Playwright 1.64.1, a development dependency only, and a new CI job runs all six on every push and pull request. `CANVAS_TEST_SPACE_ID` still selects Ego Browser. Runtime code and shipped behaviour are unchanged.

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
