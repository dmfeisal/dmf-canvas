---
title: "Viewer and embed"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Viewer and embed

Current state: editor integration recipes exist; independent visitor runtime is Planned. Author job: save a portable artifact and obtain self-hostable viewer files/embed markup. Visitor job: read, navigate and explore without an authoring account.

Acceptance: real Astro host loads a separate-origin iframe; title/focus and keyboard navigation work; resizing validates origins and source windows; the viewer imports no authoring UI/history; all required assets travel with the artifact; invalid documents fail visibly without executing code. Define loading, unavailable-document, missing-asset and retry states. Open: public artifact URL/version strategy and approved performance budget.

No hosted billing or cloud project service is required for M2. [Viewer contract](../architecture/VIEWER-EMBED-SPEC.md) owns message/security behavior; [MVP](MVP-PRD.md) owns end-to-end scope.
