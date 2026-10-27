---
title: "Future frontend adapters"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Future frontend adapters

Later-only proposal: Canvas DOM-backed owners currently edit registered canvas objects, not arbitrary application frontends. Do not equate the existing geometry inspector with source-aware editing.

M6 should opt into explicit injection or an extension, target elements with reviewed stable identifiers and apply session-only overrides. Preserve host events, accessibility and navigation; teardown must remove every override/listener. No arbitrary code execution from imported documents.

M7 requires source mapping to an authorized Astro/React project, bounded supported properties, reviewable diffs, tests and rollback. Do not infer source locations from CSS selectors or minified runtime DOM alone. Host secrets and source files must not enter public artifacts or MCP requests without scoped authorization.

Alternative: export manual change suggestions before writeback, reducing mapping risk. Acceptance: a session can be cancelled without source changes; an approved source edit produces a scoped diff and can be reverted; unrelated host behavior passes regressions. Mapping fidelity, component ownership and permission UX remain unresolved. See [future PRD](../prd/LIVE-FRONTEND-EDITING.md).
