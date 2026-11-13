---
title: "Shapes"
status: proposed
owner: product
last_reviewed: 2026-11-13
source_of_truth: true
related:
  - ../ROADMAP-AND-REFERENCES.md
  - IMPORT-EXCALIDRAW.md
  - ../COMPATIBILITY.md
  - ../design/TOOLBAR.md
  - ../GLOSSARY.md
---

# Shapes

Shapes are the last open item of the 0.3.0 milestone (Shapes, Highlighter, stroke Eraser). They also unblock the next Excalidraw import step: rectangles, ellipses, diamonds, lines and arrows are currently reported as unsupported because no general-shape owner exists. This page proposes the first slice. Nothing here is implemented yet. The five decisions below were accepted on 13 November 2026 with the recommended answers; the board format is the part that is hard to undo, so change it only through this page.

## Goals and non-goals

Goals:

- Draw, select, move, resize, rotate, duplicate, copy, lock, group, arrange, undo and save basic shapes like every other object.
- Keep the data semantic: shape kind, ink, width and fill are named keys, never resolved CSS colours or SVG markup.
- Map the matching Excalidraw elements to editable shapes with honest per-object loss reports.
- Keep keyboard creation, visible focus, RTL placement and read-only behaviour on par with notes and drawings.

Non-goals for this slice: connectors that stay attached to objects (bindings), text inside shapes, editable endpoint handles, dashed or sketchy strokes, custom colours, snapping and guides (0.4.0), and touch drawing (0.4.0).

## Proposed shape set

| Kind | Code name | Drawn as | Excalidraw source |
|---|---|---|---|
| Rectangle | `rectangle` | Box with optional rounded corners | `rectangle` |
| Ellipse | `ellipse` | Ellipse filling the box | `ellipse` |
| Diamond | `diamond` | Rhombus touching the box midpoints | `diamond` |
| Line | `line` | Straight segment between two points | `line` (two points only) |
| Arrow | `arrow` | Line with an arrowhead at the end | `arrow` (two points, no bindings) |

**Decided 1 — shape set:** all five. Rectangle, ellipse and line alone are the minimum; diamond and arrow are cheap once the owner exists and cover common diagram boards. Multi-point lines and elbow arrows stay out of scope.

## Style

| Property | Values | Notes |
|---|---|---|
| Ink | `primary`, `blue`, `red` | The Pencil palette, so one swatch set serves both tools. |
| Width | 2, 4, 8 px | Thin, Medium, Bold, matching Pencil. |
| Fill | `none`, `tint` | `tint` is the ink at low opacity (about 12%), theme-aware like the marquee. Closed shapes only. |
| Corners | `sharp`, `round` | Rectangle only. |
| Arrowhead | `end` | Fixed for `arrow`; `start`/`both` can follow later. |

**Decided 2 — fill:** `none` and `tint` only. A solid fill would hide content beneath and needs a contrast rule for the stroke; it can be added later as a new key without breaking files.

## Interaction

- **Rail:** one Shapes button (Lucide `shapes`) after Highlighter. Arming it shows the tool options bar with the five kinds, then ink, width, fill and corners. Proposed icons: `square`, `diamond`, `slash` (line) and `move-up-right` (arrow). `circle` and `minus` already mean ink swatch and stroke width in the sprite, and the [toolbar standard](../design/TOOLBAR.md) allows one meaning per icon, so the ellipse needs its own glyph (Lucide has no ellipse; a local outline ellipse drawn in Lucide style is the likely answer). None of these are in the sprite yet; the toolbar standard table gains a row for each.
- **Shortcuts (Decided 3):** R rectangle, O ellipse, D diamond, L line, A arrow, matching common editors. Bare D is free (Duplicate is ⌘/Ctrl D); E stays the Eraser.
- **Pointer:** drag on empty space to draw. Shift constrains to a square or circle, or to 45° steps for lines and arrows. A click without a drag places a 120 × 80px default. Escape cancels; V returns to Select. Like Pencil, the editor returns to Select after each shape, with the new shape selected (corrected during step 3: Pencil does not stay armed; only the Eraser does).
- **Keyboard:** with the tool armed and the canvas focused, Enter places the default shape at the centre of the visible surface and selects it, so creation never needs a pointer.
- **Selection:** shapes use the existing outline, halo and rotate handle. Arrows and lines keep their box handles in this slice; endpoint handles come with connectors.
- **Changing style later:** a contextual More › Shape style section (ink, width, fill, corners) applies to every selected shape as one Undo step, mirroring Paper color.
- **Eraser:** the stroke Eraser keeps erasing Pencil and Highlighter strokes only; shapes are removed with Delete. Recommended because a stray erase pass over a diagram is costly.

### Free resize (Decided 4)

Today corner handles scale proportionally (0.5–1.8×) and the side handles reflow Text width. Shapes need independent width and height. Shapes get eight handles (`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`) plus rotate. Corners resize freely and Shift keeps the ratio; stroke width does not scale with the box. This adds `'n' | 's'` to the exported `TransformHandle` type and a non-proportional geometry path in core, so it is an API change recorded in `API.md` and the type tests. The rejected alternative, proportional-only shapes, avoided the API change but made rectangles nearly useless.

## Data and compatibility

Proposed record, validated like every other object (no SVG, no CSS):

```json
{"type":"shape","shape":"rectangle","ink":"blue","strokeWidth":4,"fill":"tint","corners":"round",
 "layout":{"left":120,"top":80,"width":200,"height":120},"state":{"x":0,"y":0,"angle":0},"locked":false}
```

Lines and arrows add `"points":[{"x":0,"y":0},{"x":200,"y":120}]`, two points inside the box.

- Boards and clipboard transfers that contain a shape use **schema 4**; portable documents use **version 3**. Files without shapes are written exactly as before.
- Readers accept schemas 1–4 and portable versions 1–3. Older readers (0.3.0-alpha.2 and earlier) already reject the unknown `shape` type; the version bump makes that rejection explicit instead of incidental. Draft envelopes stay version 1.
- Record the change in [compatibility](../COMPATIBILITY.md), the changelog and the type tests, with schema 1–4 fixtures.

**Decided 5 — permission key:** a new `shapes` tool permission (default on), so hosts can offer drawing without diagrams or the reverse. Reusing `pencil` was rejected because it ties two unrelated features together.

## Excalidraw import

| Source | Result | Reported loss |
|---|---|---|
| `rectangle`, `ellipse`, `diamond` | Shape with nearest ink and width | Roughness, fill style (hachure/cross-hatch become `tint`), opacity, custom colours |
| `line`, `arrow` with two points | Line or arrow | Same, plus arrowhead style |
| `line`, `arrow` with more points or bindings | Unsupported | Multi-point paths and bindings need connectors |
| Text bound to a shape | Imported as separate Text | Container relationship is not kept |

Fixtures stay synthetic until representative creator boards are available, as the [Excalidraw import](IMPORT-EXCALIDRAW.md) page requires.

## Delivery

1. Shape owner, renderer and validation, with unit tests and schema 1–4 fixtures. **Done in 0.3.0-alpha.3.**
2. Free-resize handles and the `TransformHandle` addition, with geometry and inspector tests. **Done in 0.3.0-alpha.3.**
3. Rail button, options bar, shortcuts, keyboard placement and the `shapes` permission in the configurator. **Done in 0.3.0-alpha.3.**
4. More › Shape style and clipboard/duplicate/group coverage.
5. Excalidraw mapping and import-lab report rows.
6. Docs: API, compatibility, toolbar standard, glossary and changelog; browser suite scenarios for drawing, resizing, styling, Save/Open and mobile RTL.

Release: land as `0.3.0-alpha.3`. Promote to `0.3.0` only after the browser suites pass in an agent-owned space and the archive checks in the [release checklist](../RELEASE-CHECKLIST.md) run.

## Acceptance

- Each kind can be created by pointer and by keyboard, styled, resized freely, rotated, duplicated, copied between connected instances, grouped, locked and undone, in light and dark themes and in RTL.
- Save/Open and portable round-trips preserve every shape exactly; shape-free files are byte-for-byte unchanged in schema.
- Older readers reject schema 4 and portable version 3 instead of dropping shapes.
- Supported Excalidraw elements import as editable shapes, and every other element keeps a report row with a reason.
- No new runtime dependency; transform handles stay 24px; 50-object and history limits are unchanged.
