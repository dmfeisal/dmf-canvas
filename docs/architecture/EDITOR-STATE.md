---
title: "Editor state and history"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Editor state and history

Current behavior is defined by [instance source](../../js/canvas-instance.js), [change tracker](../../js/canvas-instance-changes.js) and [API](../API.md). Selection, focused state, editing, provisional creation, gestures, undo/redo and policy belong to one instance. Native text fields keep their own editing/clipboard behavior. History batches preflight owners, capture state and roll back failed operations; inspector plans are separate from UI fields.

Permanent board records include object content/geometry, groups, locks and layer order. Selection, tools, host UI and theme are not saved. Drafts are opt-in with injected storage, revision tracking and explicit restore/discard; a local write is not a published artifact. `markSaved(revision)` acknowledges the exact saved revision.

Current core has no camera. Proposed pan/zoom must distinguish viewport transforms from node geometry, compose pointer coordinates explicitly and avoid polluting document history with navigation. Acceptance: independently undo authoring commands, cancel provisional work on lifecycle changes, preserve focus and native field shortcuts, and restore portable documents without restoring stale editor selection. Camera keyboard/touch behavior remains an open design decision.
