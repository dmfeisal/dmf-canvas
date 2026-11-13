---
title: "dmf-web parity"
status: proposed
owner: product
last_reviewed: 2026-11-14
source_of_truth: true
related:
  - ../ROADMAP-AND-REFERENCES.md
  - ../product/PRODUCT-ROADMAP.md
  - SHAPES.md
  - EDITING-PRECISION.md
  - NAVIGATION.md
  - ../GLOSSARY.md
---

# dmf-web parity

**Priority set on 13 November 2026:** bring the package up to the Canvas that already runs on feisal.id (dmf-web's own runtime) before other new work. Each phase ends with a slice of dmf-web able to drop its built-in code for the package, so the two stop drifting apart. This page orders the gaps, maps them to milestones and records what each one needs from the package. Phase 1 is built in 0.4.0-alpha.1; the later phases are not implemented yet.

dmf-web's behaviour is documented in its `docs/CANVAS.md` and `docs/CANVAS-RULES.md`; treat those as the reference design and adapt it to the package's host, owner and permission model instead of copying portfolio code.

## What dmf-web has that the package does not

| Gap | In dmf-web today |
|---|---|
| Snapping and guides | Align snapping to other objects' edges and centres (on by default), optional 24px grid snapping, pink gap guides and labels to nearby objects, Alt to bypass, Shift after a drag starts to lock one axis, toggles in More |
| Alt-drag duplicate | Alt held before a drag drops a copy; one Undo removes it |
| Keyboard object navigation | `[` and `]` select the previous or next object in reading order |
| Selection labels | Name above the selection and width × height below, kept visible while resizing |
| Camera | Hand tool (H, or hold Space), wheel pan, pinch or Ctrl/⌘+wheel zoom 0.2–4×, `+`/`−` keys, Fit all, Zoom to selection |
| Touch | Two-finger pan and pinch take over from object gestures |
| Full screen | The canvas can enter native full screen with its chrome |
| Layers panel | Every object listed with a type name (Text, Drawing, Sticky Note…), rename with F2, search |
| Reset | Reset canvas edits and Reset object in the selection bar |
| Context menu | Right-click opens the same actions as More |
| Text formatting | Text ink, line height (0.8–3×) and letter spacing (−0.08–0.3em), beyond the package's font, size, weight, alignment and wrapping |
| Sticky notes | 16 colour swatches (the package has 3 paper colours) and S/M/L text-size presets |
| PNG export | Selection or visible canvas, up to 2×, 4096px and 12 megapixels |

The package already has things dmf-web's pages do not use yet: Shapes, Excalidraw import, portable documents and host tool permissions. dmf-web vendors them since dmfeisal/dmf-web#22.

## Proposed order

### Phase 1 — editing precision (0.4.0)

Snapping and guides, Alt-drag duplicate, `[`/`]` navigation and selection labels.

Why first: these are the gaps users feel on every drag, they stay inside today's bounded surface, they need no board-format change and no dependency, and dmf-web's design is already settled. Build snapping so it takes a camera scale (dmf-web's `beginSnap` already does) so Phase 2 does not rework it. Snapping toggles become host settings, not board data.

### Phase 2 — navigation (0.5.0)

Camera (Hand, Space, wheel pan, zoom, Fit all, Zoom to selection), two-finger touch and full screen.

Why second: it is the largest architectural change. A transformed world affects every owner's coordinates, the inspector, containment, guides, labels and drawing input, so it needs its own proposal (camera state, whether the camera is saved, how bounded hosts opt out) before code. That proposal is [navigation](NAVIGATION.md), proposed on 14 November 2026 with five open decisions. Touch was planned for 0.4.0 and moves here because it depends on the camera.

### Phase 3 — organisation (0.6.0)

Layers panel (type names, rename, search), Reset canvas edits / Reset object, and the context menu.

Needs a decision: whether custom layer names are saved in board files. Saving them is a new optional record field and a schema bump; keeping them visit-local matches dmf-web today.

### Phase 4 — styling and export (0.7.0)

Text ink, line height and letter spacing; the 16 sticky-note swatches and S/M/L presets; PNG export.

Needs decisions:
- Text ink, line height and letter spacing extend the typography record, and more paper colours extend the sticky-note keys. Both are schema changes with the usual reader/writer rules.
- PNG export cannot use dmf-web's `html-to-image`, because the package has no runtime dependencies. Options: a host-supplied exporter hook (the host brings its own library), or a built-in SVG-to-canvas capture limited to the package's own owners.

The PNG export previously planned for 0.5.0 moves here.

## Decisions to confirm

1. **Order:** accepted on 13 November 2026 as the four phases above. Phase 1 starts with its own proposal, [editing precision](EDITING-PRECISION.md), built in 0.4.0-alpha.1; Phase 2's is [navigation](NAVIGATION.md).
2. **Layer names:** saved in board files, or visit-local like dmf-web.
3. **PNG export:** host-supplied exporter hook, or built-in capture.
4. **Sticky colours:** adopt dmf-web's 16 swatches as package keys, or keep 3 built-in keys and let hosts add more.

## How each phase lands

Each phase gets its own proposal (like [Shapes](SHAPES.md)) before code, lands as prereleases (`0.4.0-alpha.n`) until its browser coverage passes, and ends with a dmf-web change that moves the matching surfaces onto the package. Keep the package rules: no runtime dependencies, host-owned chrome and appearance, semantic keys in saved data, 24px handles, keyboard and RTL support.
