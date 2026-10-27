---
title: "Product strategy"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Product strategy

## Direction

Prioritize creators who already own a website and have a board worth explaining. Position Canvas around an editable, interactive artifact that travels with their site. The [benchmark](../research/COMPETITOR-BENCHMARK.md) supports a **whitespace hypothesis**, not proof of unmet demand or a competitor-free category.

The existing native ESM core, explicit owners and host lifecycle recipes reduce integration work. Host-dependent original identity, bounded object types and the missing viewer/importer are the main delivery risks. Licensing is a distribution dependency.

## Proposed choices and tradeoffs

Excalidraw first gives a concrete local-file workflow without OAuth; it requires new shape/connector semantics or honest conversion losses. An iframe-first viewer offers isolation but needs explicit focus, resizing and origin contracts. A document independent of editor DOM improves portability at the cost of migrations and a second renderer. Prefer those investments over expanding generic drawing tools without a demonstrated import need.

GTM experiments: a real Astro case study, an import tutorial with fidelity report, then HTML integration and a creator gallery. No channel conversion or demand has been measured. Pricing and hosting are [hypotheses](BUSINESS-MODEL.md); validate with [creator sessions](VALIDATION-PLAN.md) before billing work.

Product owner must approve milestone scope and licensing direction; [decisions](DECISION-REGISTER.md) records unresolved choices.
