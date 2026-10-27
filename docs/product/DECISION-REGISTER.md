---
title: "Decision register"
status: draft
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Decision register

Product approver is the repository owner; individual approval dates are unknown unless recorded below. Documentation does not turn recommendations into accepted implementation decisions.

| ID | State | Decision / question | Basis / approver / date |
|---|---|---|---|
| D01 | Accepted scope direction | Embeddable interactive canvas; preserve existing work; no commit/push/tag/publish | User request, 2026-10-27; repository owner |
| D02 | Observed architecture | Framework-neutral native ESM, explicit owners, optional adapters | [package](../../package.json), [API](../API.md); historical implementation author/date not established here |
| D03 | Proposed | Excalidraw → portable document → viewer → stories dependency order | [roadmap](PRODUCT-ROADMAP.md); approval pending |
| D04 | Proposed | Iframe-first public viewer with self-hostable files | [viewer spec](../architecture/VIEWER-EMBED-SPEC.md); approval pending |
| D05 | Open | Stable ID and migration design, bounds and connectors | [document spec](../architecture/CANVAS-DOCUMENT-SPEC.md); engineering proposal needed |
| D06 | Open | Public license and distribution policy | [release checklist](../RELEASE-CHECKLIST.md); repository owner; no license selected |
| D07 | Proposed | Free/self-hostable core; paid hosting experiments later | [business hypotheses](BUSINESS-MODEL.md); no billing approval |
| D08 | Open | Prioritize product milestones against legacy version proposals | [roadmap reconciliation](PRODUCT-ROADMAP.md); repository owner |

Record consequential architecture choices in [ADRs](../architecture/decisions/README.md) when an actual decision is made. No accepted ADR is invented for this documentation pass.
