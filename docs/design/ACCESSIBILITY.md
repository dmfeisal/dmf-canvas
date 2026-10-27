---
title: "Accessibility requirements"
status: proposed
owner: design
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Accessibility requirements

Current docs and browser scenarios describe native controls, scoped announcements and keyboard exclusion guards. These are implementation evidence, not WCAG certification or a spoken screen-reader audit. [Compatibility](../COMPATIBILITY.md) records coverage limits.

Required acceptance: complete author and visitor workflows by keyboard; visible focus; no keyboard trap; correct labels and errors; equivalent focus/click for hover reveals; meaningful image descriptions; readable text alternatives for visual boards; reduced-motion transitions; sufficient text/control contrast; zoom/reflow and RTL checks. Drag-only actions need a keyboard or numeric alternative. Scene changes must announce context and place focus predictably.

Before claiming conformance, choose the WCAG target/version, map criteria to tests and run assistive-technology checks on supported browsers. Numerical contrast/touch target claims need measured evidence. Design owns task-level acceptance with engineering; no certification is claimed by this assessment.
