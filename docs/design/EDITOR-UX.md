---
title: "Editor UX"
status: proposed
owner: design
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Editor UX

Current tools and optional inspector are described by [README](../../README.md), [inspector](../INSPECTOR.md) and [Text formatting](../TEXT-FORMATTING.md). Existing controls use owner capabilities and read-only/tool policy; do not make disabled commands merely look unavailable while allowing mutation.

Proposed author journey: choose file → review fidelity/errors → apply → select/edit → attach explanation → preview visitor mode → save/export embed. Keep imported-object losses visible before application. Empty state should offer a local file or a small editable example; failure state preserves current work and provides actionable object-level errors. Busy parsing must be cancellable before replacement.

Publish UX must distinguish a local downloaded document from a hosted public URL. Visitor UI should expose navigation and explanations without authoring controls. Acceptance: keyboard-complete path, predictable focus after dialogs/errors, visible saving/publication state and recoverable missing assets. Import/publish UX is not implemented. See [accessibility](ACCESSIBILITY.md) and [MVP](../prd/MVP-PRD.md).
