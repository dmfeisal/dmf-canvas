---
title: "Interactive stories"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Interactive stories

Current state: Planned. Authors attach an explanation to a node, preview focus/click behavior and arrange scenes. Visitors reveal content, move between scenes and reset exploration.

Acceptance: each hotspot is named and keyboard operable, focus and hover have equivalent readable outcomes, scene navigation preserves sensible focus, reduced-motion presentation is usable, and interaction definitions roundtrip without executable handlers. Define selected-hotspot, missing-target and invalid-action states before authoring UI implementation.

Dependencies: stable IDs and independent viewer. Open: scene ordering, URL deep links, default transition and transient state reset. Professional timeline/rigging is excluded. [Interaction contract](../architecture/INTERACTION-SPEC.md) owns the data model.
