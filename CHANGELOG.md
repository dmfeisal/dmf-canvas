# Changelog

## Unreleased

- Add owner-backed Selection inspector geometry and atomic mixed-selection transforms with Undo/Redo.
- Add optional `createCanvasInspector` through `dmf-canvas/toolbar`, included in configurator previews and generated integrations.
- Preserve native field editing and defer tooltip opening during native popover focus handoffs.

These changes target the 0.2.0 milestone. Package metadata and the immutable v0.1.0 baseline remain unchanged; text formatting is still planned.

## 0.1.0 — 23 October 2026

First private versioned baseline of the existing standalone extraction. No new canvas interaction or board-schema change.

- Document supported import boundaries, owner/instance lifecycle, command results and compatibility limits.
- Retain native ESM, typed exports, explicit CSS and zero runtime dependencies.
- Include existing HTML/Astro/React/Vue recipes and the independent embed configurator.
- Add a release checklist and distribute API/compatibility documentation with the archive.

Board-file and clipboard schemas remain version 1. Package stays private; licensing, public publication and stable 1.0 compatibility remain unresolved. Earlier development snapshots used `0.0.0`.
