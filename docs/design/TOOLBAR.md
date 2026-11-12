---
title: "Toolbar, icon and action menu standard"
status: accepted
owner: design
last_reviewed: 2026-11-12
source_of_truth: true
related:
  - DESIGN-SYSTEM.md
  - ACCESSIBILITY.md
  - ../API.md
---

# Toolbar, icon and action menu standard

Every Canvas toolbar in this repository follows one standard: the same groups, the same Lucide icon for each action, the same sizes, and one More menu for secondary actions. It is modelled on the feisal.id (dmf-web) canvas chrome so that both products feel like one editor. Hosts outside this repository should follow it too; the library only supplies the parts (`createCanvasToolbar`, `toolbar.css`), and layout stays host-owned.

Applies to: the playground at `/` and the embed configurator (`examples/configurator/canvas-embed.js`, which also ships in every generated integration), the import lab (`/labs/import/`), and the shared custom host behind the HTML, Astro, React and Vue recipes (`examples/shared/custom-host.js`). The authored controls specimen (`examples/canvas/`) decorates its existing buttons, so it gets the standard icons, labels, groups and tooltips but deliberately keeps every control visible instead of using floating chrome or More.

## Layout

Editor surfaces use **floating chrome**: four groups placed over the canvas stage.

| Group | Position | Orientation | Actions, in order |
|---|---|---|---|
| Tools | Top, inline start | Vertical rail | Select, Add text, Add note, Add image, Pencil |
| History | Bottom, inline start | Horizontal | Undo, Redo |
| Selection actions | Bottom, centre | Horizontal | Selection inspector, Duplicate, Delete, More |
| Help | Bottom, inline end | Horizontal | Keyboard help |

- Positions are logical (`inline-start`/`inline-end`), so the rail and history move to the right and help to the left in right-to-left pages.
- On stages narrower than 560px, the selection group lifts above the corner groups instead of overlapping them.
- Status text that core announces (`.canvas-instance-status`) sits top, inline end, clear of every group.
- Original content starts at least 72px from the inline-start edge so the rail does not cover it on first load. Objects may be moved under the rail later, as on feisal.id.

**Compact hosts** (test fixtures and recipe consumers with their own surrounding controls) may render the same groups, in the same order, as one inline horizontal toolbar, with secondary actions in the same More menu. `examples/shared/custom-host.js` is the reference. Never invent a different grouping.

Hide an action whose tool permission is off (`settings.tools`), and disable an action that is permitted but not possible right now (for example Undo with nothing to undo). Empty groups hide themselves.

## Icons

All artwork is local [Lucide](https://lucide.dev) from `js/canvas-instance-toolbar-icons.js`, with the ISC notice kept in that file and in [LICENSES/lucide.txt](../../LICENSES/lucide.txt). No network icon requests and no icon fonts. **One icon means one thing:** never reuse an icon for a different action, and never give one action two icons in different places.

| Action id | Label | Lucide icon | Shortcut | Placement |
|---|---|---|---|---|
| `select` | Select | `mouse-pointer-2` | V | Tools |
| `text` | Add text | `type` |  | Tools |
| `sticky` | Add note | `sticky-note` |  | Tools |
| `image` | Add image | `image` |  | Tools |
| `pencil` | Pencil | `pencil` | P | Tools |
| `multiple` | Select multiple | `lasso-select` |  | Tools (authored specimen) |
| `undo` | Undo | `undo-2` | ⌘/Ctrl Z | History |
| `redo` | Redo | `redo-2` | ⌘/Ctrl Shift Z | History |
| `inspect` | Selection inspector | `sliders-horizontal` |  | Selection |
| `duplicate` | Duplicate | `copy-plus` | ⌘/Ctrl D | Selection |
| `delete` | Delete | `trash` | Delete | Selection |
| `more` | More actions | `ellipsis` |  | Selection (generated) |
| `copy` | Copy | `copy` | ⌘/Ctrl C | More › Clipboard |
| `paste` | Paste | `clipboard-paste` | ⌘/Ctrl V | More › Clipboard |
| `group` | Group | `group` | ⌘/Ctrl G | More › Group and lock |
| `ungroup` | Ungroup | `ungroup` | ⌘/Ctrl Shift G | More › Group and lock |
| `lock` | Lock / Unlock | `lock-keyhole` / `lock-keyhole-open` |  | More › Group and lock |
| `bring-forward` | Bring forward | `arrow-up` |  | More › Layer order |
| `send-backward` | Send backward | `arrow-down` |  | More › Layer order |
| `bring-front` | Bring to front | `bring-to-front` |  | More › Layer order |
| `send-back` | Send to back | `send-to-back` |  | More › Layer order |
| `align-left` … `align-bottom` | Align left/center/right/top/middle/bottom | `align-start-vertical`, `align-center-vertical`, `align-end-vertical`, `align-start-horizontal`, `align-center-horizontal`, `align-end-horizontal` |  | More › Arrange |
| `distribute-horizontal` / `distribute-vertical` | Equal horizontal/vertical gaps | `align-horizontal-space-between` / `align-vertical-space-between` |  | More › Arrange |
| `paper-yellow` / `-blue` / `-pink` | Yellow/Blue/Pink paper | `palette` (checked when current) |  | More › Paper color |
| `save` | Save board | `download` |  | More › Board |
| `open` | Open board | `folder-open` |  | More › Board |
| `help` | Keyboard help | `circle-question-mark` |  | Help |

The sprite also carries `image-plus` and `layers` for hosts that need them. To add an action, pick a Lucide icon that is not already in this table, copy its path data from a pinned Lucide release (record the version in the sprite's header comment), add a row here, and keep the label identical to the accessible name.

## Sizes and states

- Toolbar buttons are 36 × 36px with 18px icons, 4px group padding and a 1px group divider. This matches feisal.id; it is the toolbar's own size, not a blanket minimum for other controls.
- Floating groups use a 12px radius and a soft shadow; inline toolbars use a 10px radius and no shadow.
- Menu rows have a 16px icon, a 13px label and an 11px monospace shortcut, sized by padding rather than a fixed height.
- Bar buttons are icon-only. Their name and real shortcut appear in one shared hover/focus tooltip ("Duplicate · ⌘ D") and in the accessible name. Never show a shortcut the canvas does not implement.
- Pressed tools (Select or Pencil) and checked menu rows use the selection colour. Disabled controls stay visible at reduced opacity and are skipped by arrow-key navigation.
- Colours come from the six theme roles (toolbar, ink, line, selection, surface, grid) with dmf-ui and system fallbacks; see [design system boundaries](DESIGN-SYSTEM.md).

## More menu

- One manual native popover (`role="menu"`) owned by the selection toolbar. The More button has `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.
- Sections, in order: Clipboard, Group and lock, Layer order, Arrange, Paper color, Board. **Contextual sections** (Group and lock, Layer order, Arrange, Paper color) show only when they apply to the current selection; Clipboard and Board always show, disabled when unavailable. The More button disables itself when every visible row is disabled and hides when no row is visible.
- It opens toward the side of the trigger with more room, stays inside the viewport, and scrolls if it is still too tall.
- Keyboard: Enter, Space or ArrowDown on More opens it on the first enabled row (ArrowUp opens on the last); ArrowUp/ArrowDown move with wrap-around, Home/End jump; Enter runs the row and closes the menu; Escape closes it and returns focus to More; Tab closes it and continues normally.
- Pointer: clicking More again, pressing outside, or scrolling the page closes it. Running a row keeps the canvas selection.

## Help

The Help button toggles a small non-modal panel above it listing the shortcuts the canvas actually supports. Close and Escape return focus to the Help button. The button shows as pressed while the panel is open.

## Building it

```js
import {createCanvasToolbar,createCanvasInspector} from 'dmf-canvas/toolbar';
// Load dmf-canvas/canvas.css and dmf-canvas/toolbar.css.
// <div class="canvas-embed-chrome">
//   <div data-host>…</div>
//   <div class="canvas-embed-chrome__slot" data-chrome-slot="tools"></div>
//   <div class="canvas-embed-chrome__slot" data-chrome-slot="history"></div>
//   <div class="canvas-embed-chrome__slot" data-chrome-slot="selection"></div>
//   <div class="canvas-embed-chrome__slot" data-chrome-slot="help"></div>
// </div>
const tools=createCanvasToolbar(slot('tools'),{label:'Tools',orientation:'vertical',actions:[
  {id:'select',label:'Select',icon:'mouse-pointer-2',shortcut:'V',run:selectTool},
  {id:'pencil',label:'Pencil',icon:'pencil',shortcut:'P',run:togglePencil}]});
const selection=createCanvasToolbar(slot('selection'),{label:'Selection actions',moreLabel:'More actions',actions:[
  {id:'duplicate',label:'Duplicate',icon:'copy-plus',shortcut:'D',run:()=>canvas.execute('duplicate')},
  {id:'paste',label:'Paste',icon:'clipboard-paste',shortcut:'V',menu:true,group:'Clipboard',run:()=>canvas.execute('paste')}]});
```

- `orientation:'vertical'` builds the rail: arrow Up/Down roving focus and side tooltips.
- `menu:true` moves an action into the More menu; its `group` names the menu section. `update(id, {disabled, hidden, pressed, label})` works the same for bar and menu actions; `pressed` on a menu action renders a checked row.
- Every generated button and menu row carries `data-toolbar-action="<id>"`, a stable hook for host code and tests.
- `.canvas-embed-chrome` and its slots are optional layout helpers in `toolbar.css`. Hosts may position the same toolbars themselves.
- The complete reference implementation is `examples/configurator/canvas-embed.js`.

## Differences from feisal.id

feisal.id also has Highlighter and Stroke eraser in the rail, a direct Reset canvas edits (`brush-cleaning`) button in the selection group, a Layers panel, and camera controls (Fit all, Zoom to selection). The library does not provide those capabilities yet, so they are not in this standard; add them here with their icons when they ship (Highlighter and Eraser are planned for 0.3.0).
