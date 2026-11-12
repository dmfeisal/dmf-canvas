---
title: "Design system boundaries"
status: draft
owner: design
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Design system boundaries

Existing visual source is [core CSS](../../css/canvas-instance.css), [toolbar CSS](../../css/canvas-instance-toolbar.css) and [theme adapter](../../js/canvas-instance-theme.js), not an invented new component library. Six theme roles are surface, grid, selection, toolbar, ink and line; scoped `--dmf-*` aliases retain compatibility. Host dimensions and original-object layout remain host-owned.

Toolbar groups, the action-to-icon table, sizes and the More menu are defined in the [toolbar, icon and action menu standard](TOOLBAR.md). Existing primitives include selection/transform handles, toolbar actions, native popovers/fields, inspector and status announcements. Text choices are authored Original plus system font families; no web-font service is introduced. Lucide assets retain their [notice](../../LICENSES/lucide.txt).

Future import report, visitor navigation, hotspot and publication states should reuse these primitives where appropriate, with semantic names, keyboard/focus states and contrast review. No visual redesign, token rename or component implementation occurs here. Validate light/dark, RTL, narrow hosts, disabled/invalid/busy states and reduced motion before adding public claims.
