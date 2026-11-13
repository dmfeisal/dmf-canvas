---
title: "Editing precision"
status: proposed
owner: product
last_reviewed: 2026-11-13
source_of_truth: true
related:
  - DMF-WEB-PARITY.md
  - ../design/TOOLBAR.md
  - ../API.md
  - ../GLOSSARY.md
---

# Editing precision

Phase 1 of [dmf-web parity](DMF-WEB-PARITY.md), targeting 0.4.0: snapping and guides, Alt-drag duplicate, `[`/`]` object navigation and selection labels. The reference design is feisal.id's own Canvas (dmf-web `docs/CANVAS.md`, `docs/CANVAS-RULES.md` and `beginSnap` in `public/js/canvas-tools.js`), adapted to the package's host, owner and settings model. Nothing here is implemented yet. The five decisions below were accepted on 13 November 2026 with the recommended answers.

None of this changes board, clipboard, draft or portable formats. Snapping and label preferences are host settings, like tool permissions, and never enter saved data.

## Snapping and guides

Behaviour, matching dmf-web:

- **Align (on by default):** while a pointer drags a selection, its left, centre and right edges snap to the left, centre and right edges of up to 80 other visible objects in the same host, and likewise top, middle and bottom. The snap distance is 6 screen pixels. Selected objects and their group members are never snap targets.
- **Grid (off by default):** when nothing aligns on an axis, the selection's top-left snaps to the 24px canvas grid, on the same dots as the dotted background.
- **Guides:** one horizontal and one vertical line show the active snap. When the selection sits beside a peer, a pink gap guide and label show the distance to the nearest non-overlapping neighbour on each axis, in screen pixels to a tenth, up to 1000px.
- **Alt/Option** held during a drag bypasses snapping for that moment.
- **Shift pressed after a drag starts** locks movement to the dominant axis once it has moved 4px, and snapping then applies only along that axis. Shift held at pointer-down still toggles selection, as today.
- **Exact by design:** keyboard nudges (arrow keys, 1/10px) never snap. Resize and rotate do not snap positions; rotation keeps its existing Shift 15° steps.
- Bounds still win: a snap that would leave the containment area is skipped.

Implementation shape: a snapping step inside core's pointer-move path, before the existing clamp. It caches the selection's combined bounds and peer bounds once at drag start (no layout reads while moving), and takes a camera scale so Phase 2 zoom does not rework it. Guides are pointer-inert, `aria-hidden` overlay nodes inside the host, above objects, reused across gestures and removed on teardown. A status announcement says when movement is constrained to one axis.

## Alt-drag duplicate

Alt/Option held before a mouse or pen drag starts drops a copy of the selection where the drag ends, leaving the original in place. The copy is created through the same path as Duplicate, so eligibility, permissions (`duplicate`), the 50-object limit and groups behave the same; locked or ineligible selections drag normally. It activates after 4px, snaps like any drag, and creation plus placement is one Undo step. Escape or pointer cancellation leaves no copy and no history. Touch is ignored.

## Keyboard object navigation

With the canvas, an object or a handle focused, `]` selects and focuses the next object and `[` the previous one, in reading (DOM) order like Tab, wrapping at the ends with a status announcement. Native fields, editing and menus keep their keys; modified or repeated keys are ignored.

## Selection labels

While something is selected, a small label above its top-left shows its name (the owner's `name`: Text, Sticky Note, Rectangle, Highlight…) and one below its centre shows width × height in pixels, rounded, excluding any future camera zoom. A multi-selection shows its object count and combined size. Labels follow moves, resizes and rotation live, hide during text editing and drawing, are theme-aware, pointer-inert and `aria-hidden` (status and the inspector already announce the same information), and stay inside the host.

## Decisions (accepted 13 November 2026)

1. **Settings API — accepted:** a new `snapping` setting, `{align: boolean, grid: boolean}` (default `{align: true, grid: false}`), on `createCanvas` and `configure()`, reported in `getState().settings`. Hosts show it as two checked More rows, "Align to objects" (`magnet`) and "Snap to grid" (`grid-2x2`). `align-center-horizontal` already means Align middle in the toolbar standard, so dmf-web's icon cannot be reused.
2. **Gap guides — accepted:** dmf-web's distance labels ship in 0.4.0 with edge alignment.
3. **Labels — accepted:** rendered by core with a `labels` setting (default on) so hosts can turn them off.
4. **Alt-drag eligibility — accepted:** exactly what Duplicate allows, including authored originals where Duplicate supports them.
5. **Navigation order — accepted:** reading order like Tab, matching dmf-web.

## Delivery

1. Snapping core (align and grid), settings and More toggles in the configurator, playground and custom host. **Done in 0.4.0-alpha.1.**
2. Guides and gap labels. **Done in 0.4.0-alpha.1.**
3. Shift axis lock and Alt bypass. **Done in 0.4.0-alpha.1** (Alt bypass already landed with step 1).
4. Alt-drag duplicate. **Done in 0.4.0-alpha.1.**
5. `[`/`]` navigation. **Done in 0.4.0-alpha.1.**
6. Selection labels.
7. Docs (API, toolbar standard, glossary, changelog) and browser scenarios in a new suite: align and grid snaps, guides appear and clear, Alt bypass, Shift axis lock, Alt-drag copy with one Undo, `[`/`]` order and wrap, labels during resize and rotation, mobile RTL.

Land as `0.4.0-alpha.n` and promote to `0.4.0` when the browser suites pass in CI and dmf-web can move one surface (for example the playground specimens) onto the package's snapping.

## Acceptance

- Dragging a single object or a multi-selection snaps to peers within 6px and to the grid when enabled; Alt bypasses; keyboard nudges never snap.
- Guides and labels never block pointer input, never appear in saved data, and leave no nodes behind after teardown.
- Alt-drag creates exactly one copy per selected object as one Undo step, and cancelling creates nothing.
- `[`/`]` reach every object in reading order and wrap, including RTL.
- No runtime dependency, no layout reads during pointer moves, 24px handles unchanged, and existing browser suites still pass.
