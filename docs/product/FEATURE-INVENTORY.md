---
title: "Feature inventory and evidence register"
status: draft
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Feature inventory and evidence register

Assessed 2026-10-27 against the dirty working tree, not just HEAD. **Implemented** means present locally with identified evidence, not publicly released. **Partial** means only part of the intended workflow exists; **Experimental** is a trial capability; **Planned** has no implementation found; **Unknown** lacks sufficient verification.

| Area / claim | Status | Source and test evidence | Limits |
|---|---|---|---|
| Core: native ESM, optional adapters, DOM-free import | Implemented | [package](../../package.json), [entry](../../index.js), [structure tests](../../tests/structure.test.mjs) | Private package; no public registry claim |
| Studio: text, sticky, raster image, drawing owners | Implemented | [document adapter](../../js/canvas-instance-document.js), [owner contract](../CANVAS-OWNER-ADAPTERS.md), [record tests](../../tests/canvas-clipboard.test.mjs) | 50 objects; no general shapes/connectors |
| Selection, transforms, groups, locks, layers, undo/redo | Implemented | [instance](../../js/canvas-instance.js), [API](../API.md), [browser scenarios](../../tests/browser.mjs) | Browser scenarios inspected, not rerun in this assessment |
| Selection inspector and Text formatting | Implemented | [inspector](../../js/canvas-instance-inspector.js), [style validation tests](../../tests/text-style.test.mjs), [format contract](../TEXT-FORMATTING.md) | Uncommitted private 0.2.0 preparation; DOM behavior needs browser rerun |
| Local board files / schema 1 and 2 | Implemented | [save/load](../../js/canvas-instance.js), [record validator](../../js/canvas-instance-document.js), [draft tests](../../tests/canvas-drafts.test.mjs) | Original IDs depend on registration; not independent portable publishing |
| Drafts and page-local clipboard | Implemented | [draft adapter](../../js/canvas-instance-drafts.js), [clipboard](../../js/canvas-instance-clipboard.js), associated unit tests | Host-injected storage; no collaboration or cloud save |
| HTML/Astro/React/Vue editor integration | Implemented | [examples](../../README.md), [framework build script](../../scripts/test-frameworks.mjs), [configurator tests](../../tests/configurator.test.mjs) | Existing recipes; builds/browser suites not rerun here |
| Read-only authoring policy | Implemented | [settings tests](../../tests/canvas-settings.test.mjs), [instance guards](../../js/canvas-instance.js) | Not an independent visitor runtime; load rejects read-only |
| Embed product workflow | Partial | [configurator](../../examples/configurator/README.md) | Embeddable editor exists; viewer, cross-origin messaging and publishing absent |
| Portable document with stable IDs and migrations | Experimental | [adapter](../../documents.js), [pure tests](../../tests/portable-document.test.mjs), [browser regression](../../site/tests/import-browser.mjs) | Local slice; original-free destination required; no scenes/connectors/camera |
| Excalidraw ingestion | Experimental | [adapter](../../js/canvas-import-excalidraw.js), [synthetic fixture](../../tests/fixtures/portable-excalidraw.excalidraw), [browser regression](../../site/tests/import-browser.mjs) | Text/freehand conversion only; synthetic fixture, not real-board fidelity certification |
| FigJam / generic SVG ingestion | Planned | [importer proposal](../architecture/IMPORTER-SPEC.md) | Not implemented |
| Hotspots, scenes, declarative actions | Planned | [interaction proposal](../architecture/INTERACTION-SPEC.md) | Editor selection is not visitor interaction authoring |
| Hosted publishing, analytics, billing | Planned | [roadmap](PRODUCT-ROADMAP.md) | No product baselines measured |
| Live DOM overlay / source-aware writeback | Planned | [future adapter](../architecture/FRONTEND-ADAPTER-SPEC.md) | DOM-backed canvas owners do not establish arbitrary frontend editing |
| Historical mobile navigation after text-size edit | Unknown | [framework scenarios](../../tests/frameworks-browser.mjs), [text scenarios](../../tests/text-browser.mjs) | Historical report; neither reproduced nor cleared in this run |

## Evidence policy

Unit checks verify bounded data and pure contracts; they do not prove mounted browser behavior. Test execution and outstanding verification are recorded in the [assessment](../engineering/REPOSITORY-ASSESSMENT.md). This table is the source-to-claim register for current product claims. Future spec pages describe proposals unless they explicitly cite this inventory.
