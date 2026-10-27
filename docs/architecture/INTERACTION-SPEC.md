---
title: "Declarative interactions proposal"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Declarative interactions proposal

No visitor interaction authoring/interpreter exists. Define a versioned data model for `trigger → target → action → transition`, independent of DOM event handler strings. Candidate triggers: click, focus, hover and viewport entry. Candidate actions: reveal/hide explanation, focus node, navigate scene or open a validated URL.

Each reference must resolve to stable document/node/scene IDs. The viewer interprets an allowlisted action set; never evaluate scripts or accept arbitrary CSS/selectors. Reject invalid links and cycles or bound repeated state transitions. Specify initial state, reset/navigation behavior and deterministic conflict ordering before implementation.

Acceptance: every hover outcome also works with focus/click, native keyboard activation works, focus moves predictably on scene changes, reduced motion removes nonessential animation, explanations have readable text alternatives, and malformed actions cannot escape the viewer boundary. Timeline editing and arbitrary frontend animation code are outside M3. Open: interaction state persistence and scene URL semantics. Depends on [document](CANVAS-DOCUMENT-SPEC.md), [viewer](VIEWER-EMBED-SPEC.md) and [stories PRD](../prd/INTERACTIVE-STORIES.md).
