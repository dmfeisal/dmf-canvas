---
title: "Excalidraw import"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Excalidraw import

Accept local `.excalidraw` JSON through a dedicated adapter; no upstream account or MCP is required. Current implementation: **Experimental local slice** for Text, freehand strokes and, since 0.3.0-alpha.3 (adapter version 2), rectangles, ellipses, diamonds and unbound two-point lines and arrows, with a deterministic report for every source object. The import lab previews before applying. All supported mappings are marked Converted because typography, colors, stroke pressure, roughness, fill style and destination containment can change appearance. Connectors (bound or multi-point arrows), images and groups remain unsupported.

| Source content | Proposed handling | Open issue |
|---|---|---|
| Text | Editable text with explicit font substitution report | Metrics, line breaks and anchors |
| Rectangle / ellipse / diamond | **Converted** to Canvas shapes: nearest ink and width, background → tint, rounded rectangles keep round corners | Roughness, fill style, dash and opacity are reported, not kept |
| Arrows / lines / bindings | **Converted** when straight, two-point and unbound (one arrowhead, at the end) | Bindings and multi-point paths need a connector schema |
| Free draw | Convert to supported drawing when representable | Stroke fidelity and point limits |
| Images | Validate bounded raster data and descriptions | Embedded files map and resource limits |
| Groups / frames / deleted elements | Explicit mapping or reported exclusion | Scene/group semantics |

The table records the target mapping; Text, freehand and the shape rows marked Converted are implemented in the local experiment. The adapter follows the [official JSON envelope](https://docs.excalidraw.com/docs/codebase/json-schema/). Current fixtures are hand-authored synthetic data; obtain representative creator boards before claiming real-board fidelity. Never silently convert a supported-looking object into a screenshot.

Acceptance: known supported fixture imports as editable objects, edits survive save/reload, unsupported objects get stable source IDs/reasons in the report, corrupt/oversized files leave the board unchanged, and repeated import gives deterministic reports. Dependencies: [importer](../architecture/IMPORTER-SPEC.md), portable IDs, geometry ownership and limit policy. M1 should start with a small declared subset; decide the subset from real boards.
