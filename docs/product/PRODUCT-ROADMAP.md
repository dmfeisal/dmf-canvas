---
title: "Product roadmap"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Product roadmap

This is the proposed dependency order for the product vision, not a release schedule or an approved reassignment of versions. Engineering owns implementation gates; product owns scope approval; no individual assignees or delivery dates have been agreed.

| Stage | Current state | Outcome / exit gate | Dependency / blocker |
|---|---|---|---|
| M0 baseline | Partial | Reproducible unit/types/package checks plus browser regressions, accurate inventory | Browser rerun; historical mobile-navigation issue unresolved |
| M1 portable document + Excalidraw | Partial; experimental portable IDs/migrations and Text/freehand adapter exist locally | Representative supported objects import/edit/save/reload; stable IDs; deterministic loss report; old files remain readable | Schema/migration approval; shape/connector mapping; bounds policy |
| M2 independent viewer/embed | Planned; editor embeds exist | Separate visitor runtime renders portable artifact on real Astro iframe host; keyboard, resize and origin tests pass | M1; asset policy; measured runtime budget |
| M3 stories | Planned | Hotspots/reveals/scenes operate by keyboard and pointer with reduced motion | M2 plus declarative interaction contract |
| M4 interoperability | Planned | Authorized FigJam and later JSON/SVG ingestion with explicit fidelity report | M1 adapter interface; permissions and license review |
| M5 hosted experiment | Planned | Reliable publish/update and ownership controls validated with creators | M2/M3 and demand, cost/privacy evidence |
| M6 frontend overlay | Planned | Opt-in session overrides preserve host function and revert cleanly | Publishing workflow validated; DOM targeting model |
| M7 source-aware edits | Planned | Scoped Astro/React changes have diff, test gate and rollback | M6; mapping and filesystem permission contracts |

## Reconciliation with existing release planning

The [older release plan](../ROADMAP-AND-REFERENCES.md) proposes 0.3 shapes/Highlighter/Eraser, 0.4 touch/camera/snapping and 0.5 PNG export. Retain those proposals as a capability backlog, not a second authoritative product sequence. Do not automatically map M1 to 0.3 or declare the old plan cancelled. Prioritize shapes/connectors needed by real import fixtures; defer snapping and PNG unless validation establishes a dependency. (Highlighter and stroke Eraser have since landed early in the private 0.3.0-alpha.1 prerelease; Shapes remain open.) Camera work may become necessary for large imported boards and visitor navigation.

Use user-outcome dependency first, verified regression/security severity second, then evidence of demand and implementation cost. No numeric opportunity score or velocity estimate is available.

## Recommended next sprint: close M0, advance bounded M1

The local portable experiment now provides a Text/freehand import → edit → independent save/reload proof with synthetic fixtures. The full M1 gate remains open: obtain permitted creator boards, evaluate real conversion losses, define native shape/connector support and review larger-board/camera constraints. No delivery date or publication is implied.

1. Rerun the installed-package check and browser suites covering Text formatting, inspector, configurator, framework navigation and mobile RTL. Reproduce text-size edit followed by Astro navigation and React/Vue hide/show. Track observed result and preserve existing uncommitted work.
2. Agree a portable identity/migration RFC with schema-1/schema-2 fixtures. Decide coordinate/camera semantics and original-object reconstruction before changing serialization.
3. Implement a narrow Excalidraw adapter only after that decision: text plus one approved geometry type, explicit unsupported reports, malformed-input fixtures and roundtrip acceptance. Expand mappings from representative boards rather than silently flattening content.

Sprint gate: M0 evidence recorded; migration fixtures approved; vertical import slice demonstrably editable after save/reload. An independent viewer spike follows document stability. Runtime work is a separate task; this assessment implements documentation only.
