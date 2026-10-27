---
title: "MVP requirements"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# MVP requirements

## Problem and user job

A designer/developer has an existing visual board and a website, but needs visitors to explore explanations without redrawing the work or requiring a whiteboard login. Proposed job: import, curate and publish a portable interactive artifact on an Astro case-study page.

## Required workflow

1. Choose a local Excalidraw file; inspect an explicit compatibility/loss report before applying.
2. Edit supported objects with existing selection/history controls; preserve content and relationships covered by the approved mapping.
3. Add keyboard-accessible explanations and scene navigation using bounded declarative actions.
4. Save and reload a versioned independent document; embed it with a separate visitor viewer.
5. Open the real host page as a visitor without an upstream account.

Functional gates: deterministic import report, editable supported objects, atomic failed import, stable IDs, roundtrip fidelity, independently rendered viewer, responsive iframe and accessible visitor interaction. Nonfunctional gates: validation before mutation, no imported scripts, no silent object loss, cleanup on host navigation, reduced motion and measured loading/size budgets. Numeric performance thresholds need fixture measurements and approval.

Full site builder/CMS, collaboration, cloud billing, native 3D, timeline editing and source writeback are excluded. Framework-neutral core and local self-hostable artifacts remain constraints.

## Acceptance and evidence

Use a representative real board plus hostile/unsupported fixtures. Demonstrate import → edit → explanation → save/reload → Astro embed with keyboard-only and reduced-motion runs. Record loss, failures, duration and viewer payload; no activation baseline is available. [Metrics](../product/METRICS.md) defines measurement; [validation](../product/VALIDATION-PLAN.md) tests demand.

Current foundation is [partial](../product/FEATURE-INVENTORY.md). M1/M2/M3 gates in the [roadmap](../product/PRODUCT-ROADMAP.md) sequence delivery; completion of M1 alone is not MVP completion. Product owns scope, engineering owns feasibility and design owns visitor accessibility acceptance.
