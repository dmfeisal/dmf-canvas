---
title: "Glossary"
status: accepted
owner: design
last_reviewed: 2026-11-13
source_of_truth: true
related:
  - API.md
  - design/TOOLBAR.md
  - INSPECTOR.md
  - COMPATIBILITY.md
---

# Glossary

The names used for DMF Canvas parts, in the editor, the code and these docs. Every object is a real HTML element on a host surface; the library adds selection, handles, history and commands around it. Code names (`like-this`) are the class, attribute, type or action id you will meet in `canvas.css`, `toolbar.css`, the `*.d.ts` entrypoints and the [toolbar standard](design/TOOLBAR.md).

## Anatomy

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="glossary-anatomy-title glossary-anatomy-desc" style="width:100%;height:auto;color:currentColor">
<title id="glossary-anatomy-title">Anatomy of a Canvas editor</title>
<desc id="glossary-anatomy-desc">A dotted stage with the tool rail at the top left, the tool options bar beside it and the status at the top right. A selected Text object in the middle shows its selection outline, four corner handles, two side handles and the rotate handle above. A dashed marquee on the right covers two objects. A yellow sticky note and a translucent highlight stroke sit lower down. History is at the bottom left, selection actions with More at the bottom centre and Help at the bottom right. Numbered markers match the list below.</desc>
<style>
 .gl-line{fill:none;stroke:currentColor;stroke-opacity:.35}
 .gl-bar{fill:currentColor;fill-opacity:.06;stroke:currentColor;stroke-opacity:.3}
 .gl-btn{fill:currentColor;fill-opacity:.18}
 .gl-sel{stroke:#1677ff}.gl-selfill{fill:#1677ff}
 :root[data-theme="dark"] .gl-sel{stroke:#70adff}:root[data-theme="dark"] .gl-selfill{fill:#70adff}
 .gl-handle{fill:var(--background,Canvas);stroke-width:1}
 .gl-text{fill:currentColor;font:12px system-ui,sans-serif}
 .gl-mark circle{fill:currentColor}.gl-mark text{fill:var(--background,Canvas);font:600 11px system-ui,sans-serif;text-anchor:middle;dominant-baseline:central}
</style>
<defs><pattern id="gl-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1" fill="currentColor" fill-opacity=".28"/></pattern></defs>
<rect x="10" y="10" width="700" height="400" rx="12" fill="url(#gl-grid)" class="gl-line"/>
<!-- Tool rail and tool options -->
<rect x="26" y="26" width="40" height="226" rx="10" class="gl-bar"/>
<rect x="34" y="34" width="24" height="24" rx="6" class="gl-selfill" fill-opacity=".25"/>
<rect x="34" y="65" width="24" height="24" rx="6" class="gl-btn"/><rect x="34" y="96" width="24" height="24" rx="6" class="gl-btn"/><rect x="34" y="127" width="24" height="24" rx="6" class="gl-btn"/><rect x="34" y="158" width="24" height="24" rx="6" class="gl-btn"/><rect x="34" y="189" width="24" height="24" rx="6" class="gl-btn"/><rect x="34" y="220" width="24" height="24" rx="6" class="gl-btn"/>
<rect x="76" y="26" width="176" height="40" rx="10" class="gl-bar"/>
<circle cx="96" cy="46" r="7" fill="currentColor"/><circle cx="120" cy="46" r="7" fill="#2563eb"/><circle cx="144" cy="46" r="7" fill="#dc2626"/>
<path d="M168 46h16M196 46h16M224 46h16" stroke="currentColor" stroke-linecap="round" fill="none"/><path d="M196 46h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M224 46h16" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
<text x="694" y="44" class="gl-text" text-anchor="end">Canvas ready</text>
<!-- Selected Text object with handles -->
<text x="380" y="196" class="gl-text" text-anchor="middle" style="font-size:20px">Move this text</text>
<rect x="300" y="160" width="160" height="60" fill="none" class="gl-sel"/>
<g class="gl-sel"><rect x="296" y="156" width="8" height="8" class="gl-handle"/><rect x="456" y="156" width="8" height="8" class="gl-handle"/><rect x="296" y="216" width="8" height="8" class="gl-handle"/><rect x="456" y="216" width="8" height="8" class="gl-handle"/>
<path d="M460 190h12M300 190h-12" fill="none"/><rect x="472" y="186" width="8" height="8" class="gl-handle"/><rect x="280" y="186" width="8" height="8" class="gl-handle"/>
<circle cx="380" cy="134" r="4.5" class="gl-handle"/></g>
<!-- Marquee over two objects -->
<path d="M546 140c18-22 40 10 62-8s30 4 40-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
<rect x="572" y="176" width="64" height="44" rx="2" fill="#bfdbfe" fill-opacity=".75"/>
<rect x="526" y="116" width="150" height="122" class="gl-sel gl-selfill" fill-opacity=".08" stroke-dasharray="4 3"/>
<path d="M676 238l0 14l4-4l5 8l3-2l-5-8l6 0z" fill="currentColor"/>
<!-- Sticky note and highlight -->
<rect x="112" y="272" width="96" height="66" rx="2" fill="#fde68a" fill-opacity=".9"/>
<text x="124" y="296" class="gl-text" style="fill:#1f2937">Note</text>
<path d="M248 304c40-14 120-16 210-4" fill="none" stroke="#facc15" stroke-opacity=".45" stroke-width="18" stroke-linecap="round"/>
<!-- History, selection actions, help -->
<rect x="26" y="356" width="84" height="40" rx="10" class="gl-bar"/><rect x="34" y="364" width="24" height="24" rx="6" class="gl-btn"/><rect x="78" y="364" width="24" height="24" rx="6" class="gl-btn"/>
<rect x="268" y="356" width="184" height="40" rx="10" class="gl-bar"/><rect x="276" y="364" width="24" height="24" rx="6" class="gl-btn"/><rect x="320" y="364" width="24" height="24" rx="6" class="gl-btn"/><rect x="364" y="364" width="24" height="24" rx="6" class="gl-btn"/><rect x="420" y="364" width="24" height="24" rx="6" class="gl-btn"/><path d="M408 364v24" class="gl-line"/>
<circle cx="432" cy="376" r="1.6" fill="currentColor"/><circle cx="426" cy="376" r="1.6" fill="currentColor"/><circle cx="438" cy="376" r="1.6" fill="currentColor"/>
<rect x="654" y="356" width="40" height="40" rx="10" class="gl-bar"/><rect x="662" y="364" width="24" height="24" rx="12" class="gl-btn"/>
<!-- Numbered markers -->
<g class="gl-mark">
<circle cx="488" cy="34" r="10"/><text x="488" y="34">1</text>
<circle cx="46" cy="268" r="10"/><text x="46" y="268">2</text>
<circle cx="268" cy="46" r="10"/><text x="268" y="46">3</text>
<circle cx="596" cy="40" r="10"/><text x="596" y="40">4</text>
<circle cx="380" cy="240" r="10"/><text x="380" y="240">5</text>
<circle cx="478" cy="148" r="10"/><text x="478" y="148">6</text>
<circle cx="498" cy="206" r="10"/><text x="498" y="206">7</text>
<circle cx="404" cy="128" r="10"/><text x="404" y="128">8</text>
<circle cx="692" cy="128" r="10"/><text x="692" y="128">9</text>
<circle cx="222" cy="280" r="10"/><text x="222" y="280">10</text>
<circle cx="476" cy="306" r="10"/><text x="476" y="306">11</text>
<circle cx="124" cy="352" r="10"/><text x="124" y="352">12</text>
<circle cx="466" cy="352" r="10"/><text x="466" y="352">13</text>
<circle cx="640" cy="352" r="10"/><text x="640" y="352">14</text>
</g>
</svg>
</figure>

1. **Stage** over the **host surface**, with the dotted **grid**.
2. **Tool rail**: Select (pressed), Add text, Add note, Add image, Pencil, Highlighter, Stroke eraser.
3. **Tool options bar**: the armed tool's three inks and Thin, Medium and Bold widths.
4. **Status**: live announcements from core.
5. **Selection outline** around the selected object.
6. **Corner handles** (`nw`, `ne`, `sw`, `se`): proportional scale.
7. **Side handles** (`w`, `e`): width, joined to the object by a short line.
8. **Rotate handle**, above the object.
9. **Marquee**: drag on empty space to select every object it touches.
10. **Sticky note** on yellow **paper**.
11. **Highlight**: a translucent Highlighter stroke, a Drawing object.
12. **History**: Undo, Redo.
13. **Selection actions**: Selection inspector, Duplicate, Delete, then **More**.
14. **Help**: the keyboard shortcut panel.

## Surface and structure

| Term | Code name | Meaning |
|---|---|---|
| Host, surface | `data-host` | The positioned element a canvas mounts on. Objects are its direct children and the host owns its size. |
| Stage | `.canvas-embed-chrome`, `data-stage` | Optional wrapper around the host that the floating toolbars are placed over. |
| Grid | `--canvas-embed-grid` | The dotted background, one of the six theme roles. |
| Instance | `createCanvas()` | One editor. Instances on the same page are independent: selection, history and settings never leak between them. |
| Owner | `CanvasOwner` | The adapter that gives one element its abilities: capture/restore, move, transform, edit, geometry, text style and serialize. See [owner adapters](CANVAS-OWNER-ADAPTERS.md). |
| Registration | `register()` | Attaching an owner to an element so the canvas can select and change it. |
| Original, authored object | `data-original` | Content that was already in the page before the editor ran. It can be moved, transformed and restored, and is never erased. |
| Created object | `beginCreation()` | Anything added in the editor: Text, notes, images and strokes. |
| Board, document | `saveDocument()` | The JSON record of every object. Board files use schema 1–3. |
| Portable document | `savePortableDocument()` | An original-free document with stable node IDs, version 1–2. See [compatibility](COMPATIBILITY.md). |

## Objects

| Term | Code name | Meaning |
|---|---|---|
| Text | `.canvas-instance-local-text` | Editable text with font, size (8–320px), weight, alignment and Auto/Fixed wrapping. See [Text formatting](TEXT-FORMATTING.md). |
| Sticky note | `.canvas-instance-note` | Editable text on coloured paper. |
| Paper | `paperColor` | A note's yellow, blue or pink background, stored as a semantic key. |
| Image | `.canvas-instance-image` | A local PNG, JPEG or WebP. Nothing is uploaded. |
| Image description | `description` | The image's alt text, edited after selecting it. |
| Drawing | `.canvas-instance-drawing` | A freehand stroke. Drawings can be moved, scaled and rotated but not edited. |
| Pencil stroke | `tool: 'pencil'` | A drawing in 2, 4 or 8px with primary, blue or red ink. |
| Highlight | `tool: 'highlighter'` | A drawing in 12, 20 or 32px, yellow, pink or blue at 32% opacity. Owners are named "Highlight". |
| Shape | `.canvas-instance-shape`, `createShape()` | A rectangle, ellipse, diamond, line or arrow with ink, width, `none`/`tint` fill and, for rectangles, sharp or round corners. Geometry-only, like a Drawing. Saved as schema 4. |
| Ink | `primary`, `blue`, `yellow` … | A stroke colour, saved as its semantic key, never as a resolved CSS value. |

## Selection and transform

| Term | Code name | Meaning |
|---|---|---|
| Selection | `data-canvas-instance-selected` | The selected object, outlined in the selection colour. |
| Multi-selection | `data-canvas-instance-multiple` | Several selected objects. Moves and transforms apply to all of them as one Undo step. |
| Marquee | `.canvas-instance-marquee` | The rectangle dragged on empty space to select several objects. |
| Transform handle | `.canvas-instance-handle` | A 24px hit area around the selection. Hidden while an object is locked or being edited. |
| Corner handle | `nw` `ne` `sw` `se` | Scales the object proportionally. |
| Side handle | `w` `e` | Changes a Text object's width; the text rewraps instead of stretching. Drawings have corner and rotate handles only. |
| Rotate handle | `rotate` | Turns the object around its centre. Shift snaps to 15°; with the handle focused, arrow keys turn 5° (15° with Shift). |
| Halo | `--dmf-color-canvas-halo` | The paper-coloured ring around each handle that keeps it visible on any background. |
| Group, ungroup | `group`, `ungroup` | A group is selected, moved and transformed as one unit. |
| Lock | `data-canvas-instance-locked` | A locked object can still be selected, but not moved, transformed, edited, recoloured, duplicated, copied or deleted. |
| Editing | `data-canvas-instance-editing` | Inline text editing, with a dashed outline and a Done editing button (`.canvas-instance-edit-done`). |
| Layer order | `bring-forward`, `send-back` … | Moves objects forward, backward, to the front or to the back. |
| Align, distribute | `align-left` … `distribute-vertical` | Six alignments, plus equal horizontal or vertical gaps. |
| Stroke eraser | `eraser`, `data-canvas-instance-erasing` | Drag across Pencil and Highlighter strokes; touched strokes fade, then are removed together as one Undo step on release. |

## Toolbars and panels

| Term | Code name | Meaning |
|---|---|---|
| Toolbar | `createCanvasToolbar()` | A row or column of icon buttons with one shared tooltip and arrow-key roving focus. |
| Floating chrome | `.canvas-embed-chrome__slot` | The standard layout: toolbar groups placed over the stage in `tools`, `options`, `history`, `selection` and `help` slots. |
| Compact toolbar | `examples/shared/custom-host.js` | The same groups in one inline row, for hosts with their own surrounding controls. |
| Tool rail | `orientation: 'vertical'` | The vertical toolbar for tools. |
| Tool options bar | `drawingPalettes` | Inks and widths for the armed Pencil or Highlighter. |
| Armed tool | `setTool()`, `setActive()` | The drawing tool that the next drag will use. Only one is armed at a time. |
| More menu | `menu: true`, `moreLabel` | One native popover for secondary actions, in sections: Clipboard, Group and lock, Layer order, Arrange, Paper color, Board. |
| Contextual section | `group` | A More section that only shows when it applies to the selection. |
| Tooltip | `.canvas-embed-toolbar` | Shows an action's label and real shortcut on hover or focus. |
| Action id | `data-toolbar-action` | Stable id on every button and menu row, for host code and tests. |
| Selection inspector | `createCanvasInspector()` | A popover with X, Y, Width, Height and Rotation (Turn for several objects) plus Text fields. See [inspector](INSPECTOR.md). |
| Keyboard help | `help` | A small panel listing the shortcuts the canvas actually supports. |
| Status | `.canvas-instance-status` | Polite live announcements, for example "Canvas ready". |

## Settings, theme and data

| Term | Code name | Meaning |
|---|---|---|
| Tool permissions | `settings.tools` | Switches for `text`, `sticky`, `image`, `pencil`, `clipboard`, `group`, `arrange`, `layers`, `lock`, `delete`, `duplicate`, `files`, `history` and `paperColor`. Hidden in the UI and refused by commands when off. |
| Read-only | `readOnly` | Selection, Copy and Save still work; nothing can change. |
| Theme roles | surface, grid, selection, toolbar, ink, line | The six colours a host sets, with dmf-ui and system fallbacks. |
| Theme mode | `system`, `light`, `dark`, `inherit` | How `createCanvasTheme()` picks its palette. |
| Command | `execute()` | One editor action, for example `execute('duplicate')`. |
| Command result | `{ok, reason}` | Every command reports success or a reason such as `read-only`, `busy`, `bounds` or `unsupported`. |
| Change source | `CanvasChangeSource` | Why the board changed, for example `move`, `transform`, `erase`, `paste` or `undo`. |
| Revision, dirty | `revision`, `dirty` | A counter for each change, and whether there is anything unsaved. |
| History | `undo`, `redo` | Up to 50 steps per instance. Opening a board starts new history. |
| Clipboard | `createObjectClipboard()` | Page-local copy and paste of objects, shared by the instances a host connects to the same clipboard. It never touches the system clipboard. |
| Draft | `createLocalDraft()` | Optional local autosave through storage the host injects. |

## Not available yet

These terms come up in other editors and on feisal.id, but this library does not have them yet. See the [roadmap](ROADMAP-AND-REFERENCES.md).

| Term | Status |
|---|---|
| Guide lines, snapping | Proposed for 0.4.0. |
| Camera: zoom, pan, Fit all, Zoom to selection | Proposed for 0.4.0. |
| Touch controls | Proposed for 0.4.0. Pencil, Highlighter and Eraser ignore touch today. |
| Shapes tool, connectors | Shape owners and the schema 4 format exist since 0.3.0-alpha.3 (`createShape`); the drawing tool, free resize and style menu follow the [Shapes proposal](prd/SHAPES.md). Connectors are not scheduled. |
| Layers panel, Reset canvas edits | On feisal.id only. |
| PNG export | Proposed for 0.5.0. |
| Visitor viewer | A proposed embed mode; see the [viewer spec](architecture/VIEWER-EMBED-SPEC.md). |
