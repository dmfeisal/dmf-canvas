---
title: "Contribution workflow"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Contribution workflow

Inspect `git status --short --branch` before changes and preserve existing work. This assessment began with 23 modified tracked files and 5 untracked files; do not reset or clean them. Run existing local `npm test` and `npm run test:types` for contract changes; full release validation is in [test strategy](TEST-STRATEGY.md). Dependency installation requires separate authorization for this documentation task.

Keep core independent of optional UI, framework code, storage and portfolio globals. Use explicit owners and host lifecycle cleanup as documented in [API](../API.md). An importer should have a bounded parser, deterministic compatibility report, fixtures and no implicit live-board mutation.

Documentation: use portable Markdown and relative links; label observed facts, proposals and unknowns. New canonical pages carry title/status/owner/last_reviewed/source_of_truth/related metadata. Update the [inventory](../product/FEATURE-INVENTORY.md) when evidence changes. Use ADRs for consequential actual decisions; no duplicate API spec.

A review description should state problem, final behavior, evidence and limitations. No repository PR template or docs framework is introduced here. Do not commit, push, tag or publish without explicit user instruction.
