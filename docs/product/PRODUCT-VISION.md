---
title: "Product vision"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Product vision

Make your ideas interactive on the web. The MVP category is **Embeddable Interactive Canvas for the Web**; the longer-term direction is portable visual thinking and a frontend interaction layer.

The primary user is a designer/developer publishing a portfolio, case study, documentation or technical blog. Their job is to explain their thinking through an artifact visitors can explore, without requiring an upstream whiteboard account.

The intended workflow is **Import / Create → Curate → Interact → Publish / Embed → later connect to frontend**. The demonstration should import an editable Excalidraw board, add accessible explanations, save an independent document and embed its viewer in an Astro portfolio.

## Scope and principles

- Keep documents creator-owned and independently renderable; preserve a self-hostable path.
- Keep the runtime framework-neutral, with Astro as the first demonstration host.
- Report conversion loss explicitly. Never imply screenshots are editable objects.
- Treat keyboard operation, readable alternatives and reduced motion as product requirements.
- Keep live frontend experimentation as a second track after the publishing workflow works.

Full website building/CMS, enterprise realtime whiteboarding, native 3D editing and a professional animation timeline are outside the MVP. Optional MCP adapters must not become a requirement for local imports.

The current editor is a foundation, not completion of this workflow: see [inventory](FEATURE-INVENTORY.md), [MVP requirements](../prd/MVP-PRD.md) and [roadmap](PRODUCT-ROADMAP.md). Public license and monetization remain undecided.
