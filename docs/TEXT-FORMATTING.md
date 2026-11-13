# Text formatting, private 0.2.0

The optional Selection inspector formats complete eligible Text selections through explicit owner capabilities. It adds no framework, font service, storage service or arbitrary CSS input. Sticky Notes, Images, Drawings and unsupported custom owners remain ineligible.

## Interaction contract

- Font choices are Original plus system Sans-serif, Serif and Monospace. No font files or external requests are introduced.
- Size accepts 8–320 CSS pixels. Weight is the intersection of 400, 500, 600 and 700 supported by every selected owner. Alignment is physical Left, Center or Right; Original restores the authored value. Wrapping is Auto width or Fixed width.
- Mixed Text selections expose native mixed states. One changed field applies atomically to the complete selection and creates one bounded Undo action. One lock, read-only/disabled Text policy, unsupported owner or failed owner plan rejects or rolls back the whole batch.
- Formatting and Reset preserve text content and the current scale/rotation. Reflow compensates in owner-local coordinates to retain the visible top-left anchor; canvas bounds take precedence. Explicit alignment survives editing. Copies use their cloned appearance as their Reset baseline.
- Enter or leaving a changed numeric field commits. Blank and out-of-range values remain in the native control with an accessible error and do not mutate the board. Escape discards unfinished input, closes the inspector and returns focus.
- Mobile keyboard navigation may resize or scroll the visual viewport. A clean inspector is repositioned and remains open while focus stays inside it; a dirty unfinished field is dismissed without committing. Internal panel scrolling never closes the inspector.

Custom owners opt in with `textStyle.read()` and mutation-free `textStyle.prepare(field, value)`. Preparation returns `{apply, finish}` or null. Core captures all owners before preparation, applies the batch, finishes anchor compensation/containment, and restores every capture on failure. See `API.md` for the public type contract.

## Files, clipboard and drafts

Typography is bounded plain data. Boards and clipboard transfers use schema version 2 only when typography or a font size over the version-1 limit must be represented; ordinary compatible records may remain version 1. Both versions are readable by 0.2.0. Version 1 rejects typography, and a 0.1.0 reader rejects version 2 rather than silently dropping formatting.

Draft envelopes and keys remain version 1 and carry the board document unchanged. Duplicate, Copy/Paste, Save/Open and explicit draft restore preserve validated typography. No formatting is written to public data or browser storage unless the host invokes its existing opt-in file, clipboard or draft path.

## Verification

`npm run check` covers validation, serialization, rollback, declarations and the installed archive. `npm run test:text:browser` covers native controls, mixed selections, history, locks, grouped owners, anchored reflow, editing, Duplicate, Copy/Paste, schema 1/2 Save/Open, Reset, mobile RTL and repeated disposal. The inspector, core, configurator-generated HTML/Astro/React/Vue, and framework lifecycle suites run separately. These are local Chromium regressions, not certification of other engines, real touch devices or spoken screen readers.
