---
title: "Canvas document contract"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Canvas document contract

## Verified local contract

The implementation uses `format: "dmf-canvas"` with **`version`**, not `schemaVersion`. [save/load](../../js/canvas-instance.js) accepts versions 1 and 2, bounds serialized files to 1 MiB and total objects/originals to 50, and requires matching host original registrations. [Object validation](../../js/canvas-instance-document.js) supports text, sticky, drawing and image, with bounded geometry, layers/groups and whitelisted typography. Records are at most 64 KiB. Clipboard versions and draft envelope versions are separate contracts.

Schema 2 is emitted for typography or font sizes above 200px; ordinary compatible data can remain schema 1. Schema 1 rejects those additions. Draft envelope/key version remains 1. These are current formats, not the future portable format.

Minimal existing-format empty board (requires a host with zero registered originals):

```json
{"format":"dmf-canvas","version":1,"originals":[],"objects":[]}
```

## Experimental portable contract implemented locally

The first slice uses a separate marker: `format: "dmf-canvas-portable"`, **`version: 1`**, and `nodes: [{id, data, source?}]`. `data` uses the existing bounded object records. This supersedes the earlier illustrative `schemaVersion` sketch for this local experiment; no released format is changed.

```json
{"format":"dmf-canvas-portable","version":1,"nodes":[]}
```

`savePortableDocument()` serializes every visible original/created object into independently reconstructible records with stable node IDs. `loadPortableDocument()` preserves IDs and optional Excalidraw provenance across editing/save/reload. New objects and duplicates receive distinct IDs. Loading requires an original-free host; original-backed hosts explicitly return `unsupported` without replacing authored markup. The separate import lab provides that host.

`dmf-canvas/documents` exports `validatePortableDocument`, `migrateLegacyDocument` and the experimental `importExcalidraw`. Legacy migration deterministically assigns IDs to originals/created objects; it does not establish an identity relationship with changed external authored content. Existing schema-1/schema-2 file methods and draft/clipboard formats remain unchanged. Legacy external CSS/font-family baselines are not fully represented by these object records, so independent reconstruction can substitute typography; it is not an exact visual-fidelity guarantee.

Validation rejects unsupported versions, duplicate/unsafe IDs, invalid records, invalid group/layer relationships, more than 50 nodes and files over 1 MiB. Provenance is bounded plain data. No imported HTML, functions, arbitrary CSS or source URLs are executed.

## Future contract scope

Scenes, interactions, connectors, external asset packages, publication metadata, document-level identity and a camera coordinate model remain unimplemented. The current slice keeps legacy geometry and integer groups/layers; it is not the complete proposed long-term schema. Independent viewer and larger-board support require further decisions. Source: [portable validation](../../js/canvas-portable-data.js), [public adapter](../../documents.js), [instance methods](../../js/canvas-instance.js).

## Migration and acceptance gates

Preserve schema-1/schema-2 readers with golden fixtures. Convert originals into independently reconstructible nodes with stable IDs; do not infer external identity from transient registration IDs. Validate unique IDs, graph references, finite transforms, asset limits and group cycles. Reject unknown major versions before mutation; explicitly report unknown node types instead of silently discarding them. Test deterministic migrations and import/save/reload with groups, layers, typography and asset descriptions.

Engineering owns further format review. This experiment does not close the full M1 gate. Open: bounds above 50 objects/1 MiB, font substitution, connector model, unknown-field retention and asset packaging. [M1](../product/PRODUCT-ROADMAP.md) cannot close until these are resolved for its supported slice.
