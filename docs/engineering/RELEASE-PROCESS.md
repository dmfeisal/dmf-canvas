---
title: "Release process"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Release process

Current [package](../../package.json) is private 0.6.0 (dmf-web parity phase 3, organisation, after the recorded 0.5.0 archive); [changelog](../../CHANGELOG.md) calls it prepared, while v0.1.0 is the recorded private baseline. A prepared working tree is not a new release. Existing [release checklist](../RELEASE-CHECKLIST.md) remains canonical for detailed archive/tag checks.

The [version policy](../ROADMAP-AND-REFERENCES.md) uses one package version across runtime/CSS/declarations. Before 1.0: patch for compatible fixes, minor for features/incompatible changes with migration notes. Stable 1.0 uses SemVer. File/clipboard/draft schemas evolve independently. Never replace released tags or archives.

Before any separately authorized release: review the working diff, pass `check`, integration builds and scoped browser suites, document schema compatibility and unresolved browser limits, reconcile changelog and exact archive, and settle licensing/distribution. Future viewer releases add cross-origin, accessibility and hostile-import gates.

No hosted deployment/rollback mechanism exists in the inspected product. Proposed rollback is pinning a previously validated immutable artifact while retaining readable document formats; test downgrade behavior before promising rollback. This task authorizes no commit, tag, package installation or publication.
