# Changelog

## 0.3.0-alpha.1 (prepared 10 November 2026, private, experimental)

- Add separate portable documents with stable node IDs, legacy migration and original-free host reconstruction. Existing board/clipboard/draft formats remain unchanged.
- Add bounded Excalidraw Text/freehand conversion with explicit per-object loss reports and a local import lab. Current fixtures are synthetic; broader import fidelity remains unverified.
- Add dmf-ui token fallbacks (`--primary`, `--foreground`, `--background`, `--border`) behind every `--dmf-color-*` Canvas variable, including the primary Pencil ink, so selection, handles, halos and new strokes render in hosts that only load dmf-ui. Hosts that define `--dmf-color-*` render unchanged.
- Remove fixed 36px and 44px minimum heights from inspector fields and buttons, the Done editing button, draft, settings, appearance and image-description controls; padding and content now set their size. Focus outlines and keyboard behaviour are unchanged.
- Standardize every toolbar on the [toolbar, icon and action menu standard](docs/design/TOOLBAR.md): floating tool rail, history, selection actions and help, modelled on feisal.id. `createCanvasToolbar` gains opt-in `orientation:'vertical'` and a More menu (`menu:true` actions, `moreLabel`); `toolbar.css` adds menu styles and optional `.canvas-embed-chrome` slots. Existing calls render as before.
- Fix toolbar icon conflicts: Paste now uses `clipboard-paste` (it shared `sticky-note` with Add note) and Bring forward/Send backward use `arrow-up`/`arrow-down` (they shared `layers`). Add Lucide 1.60.0 `type`, `clipboard-paste`, `ellipsis`, `circle-question-mark`, `download`, `folder-open`, `arrow-up`, `arrow-down`, `palette` and `image-plus`.
- The embed configurator, playground and generated integrations use the floating chrome with Add text in the rail; Arrange, Paper colour and Save/Open board move into More. The import lab and shared custom host adopt the same groups and icons.

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
