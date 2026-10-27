---
title: "Private 0.2.0 change review"
status: draft
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - TEST-STRATEGY.md
  - ../TEXT-FORMATTING.md
---

# Private 0.2.0 change review

Follow-up to the documentation assessment: the repository owner authorized reviewing, committing and pushing the pre-existing changes if safe. This review covers the Text-formatting owners/commands/inspector, schema-2 boards and clipboard transfers, draft compatibility, toolbar focus scrolling, package metadata and integration tests. No dependency versions changed; package and root lockfile remain aligned at private 0.2.0. No tag, release archive replacement or registry publication is included.

## Review findings and corrections

The read-only inspector attempted to focus a disabled geometry field. Focus stayed on the toolbar and a pending scroll event could close the popover. It now focuses the enabled Close button; the browser regression verifies that the panel stays open, focus is inside it and disabled fields cannot mutate the board.

The viewport-dismissal test asserted immediately after a device-metrics change. It now waits for the resize-driven dismissal before checking that the revision is unchanged.

## Validation evidence

Local environment: Node 26.11.1, npm 11.20.0, installed Ego Lite/Chromium. Configured CI Node 22/24 jobs were not executed locally. Temporary integration consumers use their existing locked dependencies; the repository dependencies were not upgraded.

| Check | Result |
|---|---|
| `npm run check` | Pass: 36 unit tests, consumer types and clean archive installation/import/CSS checks |
| `npm run test:astro` | Pass |
| `npm run test:frameworks` | Pass: React and Vue production builds |
| `npm run test:configurator` | Pass: generated HTML/Astro/React/Vue installs/builds |
| `npm run test:text:browser` | Pass: 17 scenarios |
| `npm run test:inspector:browser` | Pass: 18 scenarios after corrections |
| `npm run test:browser` | Pass: 8 independent-consumer scenarios |
| `npm run test:astro:browser` | Pass: 8 installed-package/navigation scenarios |
| `npm run test:frameworks:browser` | Pass: 22 development/production lifecycle scenarios |
| `npm run test:configurator:browser` | Pass: 19 configurator/generated-output scenarios |

All completed browser runners reported zero server writes. Text and inspector disposal checks reported zero retained listener delta. Initial restricted-process failures accessing the npm cache and binding local test servers were environment restrictions, not product-test results; checks were rerun successfully with temporary fixtures/cache and the required local-server access.

An extra mobile Text-size/navigation regression could not run because the browser task space no longer existed when the follow-up started. The unrun additional test was excluded; the earlier successful Astro suite remains the recorded coverage. These checks do not certify other browser engines, real touch hardware, spoken screen readers or cross-origin iframes. The historical mobile report had no complete reproduction recipe; passing this named regression narrows coverage without proving every possible mobile-navigation sequence.

Current behavior remains a private embeddable editor. The portable importer, independent viewer and storytelling milestones remain future work; see the [roadmap](../product/PRODUCT-ROADMAP.md). Earlier [assessment](REPOSITORY-ASSESSMENT.md) results remain a historical snapshot of the documentation-only pass.
