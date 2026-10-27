---
title: "Test strategy and evidence"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Test strategy and evidence

## Executed in this documentation assessment

- `npm test`: **36 passed, 0 failed** on 2026-10-27.
- `npm run test:types`: passed using the existing local compiler.
- Documentation validation: see [assessment](REPOSITORY-ASSESSMENT.md) for the final relative-link, coverage and preservation checks.

No package installation, dependency upgrade, runtime edit or new browser run was performed. `npm run test:package` packs and installs into a scratch consumer, so it was not run in this documentation-only pass. Its existing implementation was inspected; do not imply this run completed all of `npm run check`.

## Existing supported commands

[Package scripts](../../package.json) define `check` (unit/types/package), Astro, framework and configurator build checks plus browser suites for core, Astro, frameworks, configurator, inspector and text. [CI](../../.github/workflows/validate.yml) should be consulted for the actual configured workflow; filenames and matrix must match the repository. Browser scripts require an agent-owned Ego Browser space via `CANVAS_TEST_SPACE_ID`; do not reuse someone else's session. Prior recorded results in [extraction](../EXTRACTION.md) are historical evidence.

## Required next verification

Rerun Text/inspector and generated integration regressions, specifically text-size editing followed by mobile navigation. Record reproduction steps, expected/actual result, browser/build/viewport and evidence. Existing mobile/RTL assertions do not by themselves establish that the historical issue is fixed. Cross-engine, real-touch, spoken screen-reader and cross-origin iframe coverage remain uncertified.

For M1 add fixture-based parsing, invalid/oversized inputs, graph/reference validation, deterministic loss reports, migrations and import/edit/save/reload. For M2 test a real cross-origin Astro host, malicious messages, focus/keyboard, reduced motion, resizing, missing assets and measured runtime size/loading. For M3 test equivalent pointer/keyboard actions and state reset. Release gates follow [release process](RELEASE-PROCESS.md).
