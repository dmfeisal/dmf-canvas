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

Accept local `.excalidraw` JSON through a dedicated adapter; no upstream account or MCP is required. Current implementation: Planned.

| Source content | Proposed handling | Open issue |
|---|---|---|
| Text | Editable text with explicit font substitution report | Metrics, line breaks and anchors |
| Rectangle / ellipse / diamond | Native geometry only once a matching owner exists | No current general-shape owner |
| Arrows / lines / bindings | Preserve endpoint relations when supported | Connector schema absent |
| Free draw | Convert to supported drawing when representable | Stroke fidelity and point limits |
| Images | Validate bounded raster data and descriptions | Embedded files map and resource limits |
| Groups / frames / deleted elements | Explicit mapping or reported exclusion | Scene/group semantics |

These are candidate mappings, not verified Excalidraw format support. Inspect the upstream format and obtain representative fixtures before implementing. Never silently convert a supported-looking object into a screenshot.

Acceptance: known supported fixture imports as editable objects, edits survive save/reload, unsupported objects get stable source IDs/reasons in the report, corrupt/oversized files leave the board unchanged, and repeated import gives deterministic reports. Dependencies: [importer](../architecture/IMPORTER-SPEC.md), portable IDs, geometry ownership and limit policy. M1 should start with a small declared subset; decide the subset from real boards.
