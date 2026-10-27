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

## Proposed portable contract; not implemented

Decide whether a future `schemaVersion` replaces `version` or whether the existing field evolves; do not accept both ambiguously. Introduce stable immutable node IDs independent of registration order, explicit scene coordinate space, transforms/geometry, ordered nodes, group membership, typography, bounded asset references, connectors with endpoint IDs, scenes, declarative interactions, import provenance and publication metadata. Host permissions/theme/selection and functions remain outside the document.

Proposed illustrative structure, **not accepted by the current loader**:

```json
{"format":"dmf-canvas-portable","schemaVersion":1,"id":"doc-example","nodes":[{"id":"node-1","type":"text","text":"An idea","geometry":{"x":0,"y":0,"width":160,"height":40,"rotation":0}}],"order":["node-1"],"assets":[],"scenes":[],"interactions":[],"provenance":[]}
```

The format marker, field names and defaults require an RFC. Alternatives: migrate the existing board envelope, or introduce a distinct portable document with a legacy adapter. The latter separates host restoration from publication but adds conversion complexity.

## Migration and acceptance gates

Preserve schema-1/schema-2 readers with golden fixtures. Convert originals into independently reconstructible nodes with stable IDs; do not infer external identity from transient registration IDs. Validate unique IDs, graph references, finite transforms, asset limits and group cycles. Reject unknown major versions before mutation; explicitly report unknown node types instead of silently discarding them. Test deterministic migrations and import/save/reload with groups, layers, typography and asset descriptions.

Engineering owns the RFC. Open: bounds above 50 objects/1 MiB, font substitution, connector model, unknown-field retention and asset packaging. [M1](../product/PRODUCT-ROADMAP.md) cannot close until these are resolved for its supported slice.
