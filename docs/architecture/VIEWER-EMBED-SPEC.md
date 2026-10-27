---
title: "Independent viewer and embed proposal"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Independent viewer and embed proposal

There is currently an embeddable editor and read-only policy, **no independent visitor viewer**. The current loader rejects read-only loads; do not document it as a ready-made public viewer. Existing integration recipes are indexed in [README](../../README.md).

Propose a viewer entry/build that reads the portable document without importing editor commands, history, toolbar, Pencil or drafts. Render bounded safe text/raster/vector primitives, pan/zoom, descriptions and declarative interactions. A real Astro host should load an independently served iframe artifact, without upstream source accounts.

## Host contract and release gates

- Define versioned ready/error/resize messages with document/session IDs. Check `event.source`, exact allowlisted origins, message shape and finite bounded sizes; send to an exact `targetOrigin`.
- Select iframe sandbox/CSP permissions from actual viewer needs. Avoid active imported HTML/SVG, arbitrary scripts and unbounded remote assets.
- Provide a titled iframe, visible focus, keyboard entry/exit and a readable alternative; never trap scrolling or keyboard navigation. Respect reduced motion.
- Test resize, mobile viewport, navigation cleanup, malformed documents, cross-origin hosts, failure/retry and offline self-hosted assets.
- Measure transferred/compressed JS, first usable render, asset weight and interaction responsiveness on named hardware/network fixtures. Numeric budgets remain unapproved; set them before calling the viewer lightweight.
- No analytics by default in the proposed viewer. Any telemetry needs a documented consent/privacy decision.

Alternative: read-only editor reuse is a faster prototype but retains authoring code and host identity dependencies. The milestone gate requires evidence of separation. Depends on [portable schema](CANVAS-DOCUMENT-SPEC.md), [interactions](INTERACTION-SPEC.md) and [viewer PRD](../prd/EMBED-VIEWER.md).
