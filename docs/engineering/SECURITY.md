---
title: "Security boundaries"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Security boundaries

Current validators whitelist bounded plain records, raster assets and typography: [document adapter](../../js/canvas-instance-document.js), [image validator](../../js/canvas-instance-image-data.js), [text style validator](../../js/canvas-instance-text-style.js). These checks do not constitute a full security audit. Trusted host code still supplies owner functions and lifecycle adapters.

Proposed importer/viewer requirements: validate byte/object/point/pixel limits before allocation; render text as text; reject active HTML, script URLs and arbitrary SVG markup; bound graph traversal and decoded assets. Treat remote assets as privacy/network inputs, not merely visual URLs. Preserve current atomic rejection behavior and test hostile content fixtures.

Iframe messages must validate exact origin, source window, version and payload; use exact target origins. Establish CSP/sandbox capabilities from tested runtime needs. Keep editor storage and source credentials out of published artifacts. OAuth/MCP tokens require scoped access and host-side storage; local files need neither.

No telemetry or hosted privacy promise is established. Decide consent, retention/deletion and ownership before collecting visitor events. Live source editing needs explicit filesystem/project authorization, diff review and rollback. Engineering owns threat-model updates before M1/M2; source/asset license and public distribution approval remain open.
