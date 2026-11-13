---
title: "Documentation index"
status: draft
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - README.md
---

# Documentation index

Current private implementation contracts remain in the existing root guides. Product proposals below describe the intended interactive publishing workflow and do not imply those features have shipped.

## Read first

New to the vocabulary? The [glossary](GLOSSARY.md) names every Canvas part, from the stage and handles to toolbar groups and command results, with a labelled diagram.

Latest recorded review: [private 0.2.0 change review](engineering/PREEXISTING-CHANGE-REVIEW.md). The current package is private `0.3.0-alpha.2`; see the [changelog](../CHANGELOG.md) for what changed since that review.

[Repository assessment](engineering/REPOSITORY-ASSESSMENT.md) → [feature evidence](product/FEATURE-INVENTORY.md) → [roadmap and next sprint](product/PRODUCT-ROADMAP.md). [Vision](product/PRODUCT-VISION.md), [MVP](prd/MVP-PRD.md) and [architecture](architecture/ARCHITECTURE.md) define the proposed direction. [Research provenance](research/PROVENANCE.md) explains the imported benchmark's limits.

## Existing document reconciliation

| Existing source | Canonical home / decision |
|---|---|
| Root README | Retain integration quickstart; product direction links here |
| API.md | Retain current private API; architecture specs link to it |
| COMPATIBILITY.md | Retain versioned 0.1.0 compatibility history; no new browser certification |
| GLOSSARY.md | Canonical names for Canvas parts, code names and not-yet-available terms |
| INSPECTOR.md / TEXT-FORMATTING.md | Retain current local feature contracts and in-progress work |
| EXTRACTION.md / SOURCE-MANIFEST.json | Retain provenance and historical validation; not fresh results |
| CANVAS-OWNER-ADAPTERS.md | Canonical (dmf-web links here); retain owner rationale; current declarations/API win for exported contract |
| CANVAS-PACKAGE-BOUNDARY.md | Canonical (dmf-web links here); retain historical proposal and implementation checkpoints; current package/API establish implementation |
| CANVAS-EXTRACTION-REHEARSAL.md | Canonical (dmf-web links here); retain historical portfolio rehearsal; portfolio-only CANVAS-ROADMAP.md and CANVAS-PRD.md links are unresolved here; use product roadmap/MVP for current proposals |
| ROADMAP-AND-REFERENCES.md | Retain version policy/reference history; product/PRODUCT-ROADMAP.md owns proposed product sequencing |
| RELEASE-CHECKLIST.md | Retain detailed release gates; engineering/RELEASE-PROCESS.md explains context |
| Root CHANGELOG.md | Retain version record; no duplicated changelog |
| Example README files | Retain host-specific recipes; public/README.md indexes them |

No files were moved or replaced. Historical portfolio-only references are recorded rather than rewritten as if local evidence existed. The [Astro/Starlight website](../site/README.md) generates pages from these portable Markdown sources; generated content is not a second source of truth. Lower-priority standalone public guides are reconciled in public/README.md instead of empty duplicate files.

## Documentation navigation

- [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)
- [architecture/CANVAS-DOCUMENT-SPEC.md](architecture/CANVAS-DOCUMENT-SPEC.md)
- [architecture/EDITOR-STATE.md](architecture/EDITOR-STATE.md)
- [architecture/FRONTEND-ADAPTER-SPEC.md](architecture/FRONTEND-ADAPTER-SPEC.md)
- [architecture/IMPORTER-SPEC.md](architecture/IMPORTER-SPEC.md)
- [architecture/INTERACTION-SPEC.md](architecture/INTERACTION-SPEC.md)
- [architecture/VIEWER-EMBED-SPEC.md](architecture/VIEWER-EMBED-SPEC.md)
- [architecture/decisions/README.md](architecture/decisions/README.md)
- [design/ACCESSIBILITY.md](design/ACCESSIBILITY.md)
- [design/DESIGN-SYSTEM.md](design/DESIGN-SYSTEM.md)
- [design/TOOLBAR.md](design/TOOLBAR.md)
- [design/EDITOR-UX.md](design/EDITOR-UX.md)
- [engineering/CONTRIBUTING.md](engineering/CONTRIBUTING.md)
- [engineering/RELEASE-PROCESS.md](engineering/RELEASE-PROCESS.md)
- [engineering/REPOSITORY-ASSESSMENT.md](engineering/REPOSITORY-ASSESSMENT.md)
- [engineering/SECURITY.md](engineering/SECURITY.md)
- [engineering/TEST-STRATEGY.md](engineering/TEST-STRATEGY.md)
- [prd/EMBED-VIEWER.md](prd/EMBED-VIEWER.md)
- [prd/IMPORT-EXCALIDRAW.md](prd/IMPORT-EXCALIDRAW.md)
- [prd/IMPORT-FIGJAM.md](prd/IMPORT-FIGJAM.md)
- [prd/INTERACTIVE-STORIES.md](prd/INTERACTIVE-STORIES.md)
- [prd/LIVE-FRONTEND-EDITING.md](prd/LIVE-FRONTEND-EDITING.md)
- [prd/MVP-PRD.md](prd/MVP-PRD.md)
- [product/BUSINESS-MODEL.md](product/BUSINESS-MODEL.md)
- [product/DECISION-REGISTER.md](product/DECISION-REGISTER.md)
- [product/FEATURE-INVENTORY.md](product/FEATURE-INVENTORY.md)
- [product/METRICS.md](product/METRICS.md)
- [product/PRODUCT-ROADMAP.md](product/PRODUCT-ROADMAP.md)
- [product/PRODUCT-STRATEGY.md](product/PRODUCT-STRATEGY.md)
- [product/PRODUCT-VISION.md](product/PRODUCT-VISION.md)
- [product/VALIDATION-PLAN.md](product/VALIDATION-PLAN.md)
- [public/README.md](public/README.md)
- [research/COMPETITIVE-LANDSCAPE.md](research/COMPETITIVE-LANDSCAPE.md)
- [research/COMPETITOR-BENCHMARK.md](research/COMPETITOR-BENCHMARK.md)
- [research/PROVENANCE.md](research/PROVENANCE.md)
- [research/USABILITY-TESTS.md](research/USABILITY-TESTS.md)
- [research/USER-INTERVIEWS.md](research/USER-INTERVIEWS.md)
