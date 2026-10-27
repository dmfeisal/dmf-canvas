---
title: "Live frontend editing: later track"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Live frontend editing: later track

Current state: Planned and explicitly outside MVP. First validate non-destructive session changes on a running host; only later consider source-backed Astro/React changes.

Acceptance for overlay trial: user opts in, element targeting is explicit, host navigation/forms remain functional and cancel restores all overrides. Acceptance for source writeback: authorized source mapping, limited properties, reviewable diff, regression check and rollback. Unsupported components receive a clear explanation rather than guessed edits.

Open: mapping reliability, permissions, host framework boundaries and whether creators need this second track. [Frontend adapter](../architecture/FRONTEND-ADAPTER-SPEC.md) owns technical constraints. No arbitrary imported code injection or autonomous source mutation is included.
