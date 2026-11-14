---
title: "Organisation"
status: accepted
owner: product
last_reviewed: 2026-11-14
source_of_truth: true
related:
  - DMF-WEB-PARITY.md
  - NAVIGATION.md
  - ../design/TOOLBAR.md
  - ../API.md
  - ../COMPATIBILITY.md
  - ../GLOSSARY.md
---

# Organisation

Phase 3 of [dmf-web parity](DMF-WEB-PARITY.md), targeting 0.6.0: a Layers panel (type names, rename, search), Reset canvas edits and Reset object, and a context menu. The reference design is dmf-web's `docs/CANVAS.md`, "Layer type names and renaming" and the context-menu and reset sections, adapted to the package's host, owner and history model. Nothing here is implemented yet.

Almost everything in this phase is visit-local: it changes how a canvas is shown and controlled, not what it saves. The one decision that could change saved data is marked below.

## What the package already has

Layer order (bring to front, send to back, forward and backward), locks, groups, Duplicate, Delete of created objects and history all exist. The Layers panel and context menu would reuse them. Reset object and Reset canvas edits are new, but they can reuse the same history and owner snapshots.

## Layers panel

- **Rows:** one per object, in layer order from front to back, each starting with the object's type icon and a truncated name.
- **Type names:** `Text`, `Sticky Note`, `Image`, `Drawing`, `Highlight`, `Shape` and `Card`, derived from the owner's kind, never from its content, alt text or visitor data. The same name shows on the canvas's selection label.
- **Selection:** choosing a row selects that object. A group is one row with its members listed beneath, as dmf-web does.
- **Rename:** one reusable inline form, opened by Rename or F2 on a focused row. Enter commits, Escape cancels, and an empty name restores the type name. Names are plain text, limited to 100 characters, with control characters and extra whitespace normalised. Locked objects can't be renamed.
- **Search:** a filter over names and type names. It only hides rows; it never changes selection or order.
- **Behaviour:** Layers opens from the toolbar or with a shortcut, and closing it cancels pending input. Row pooling and history are bounded, and there are no observers, polling or per-move scans.

## Reset

- **Reset object:** clears one object's lock, layer position and name, and its own owner-level reset (for example text formatting, transforms and geometry). It's one Undo step.
- **Reset canvas edits:** removes every visit-local copy and restores the other objects to their authored state. It keeps authored originals, and never touches saved data. It's one Undo step.
- Both use the existing owner snapshots and history, so Undo restores exactly what was reset.

## Context menu

- **Trigger:** right-click on the canvas, an object or a handle, or Shift+F10 or the Context Menu key on a focused object.
- **Content:** the same actions as the More menu for the current selection, reusing the toolbar's dispatcher, availability rules, icons and history. It adds no commands of its own.
- **Behaviour:** one reusable top-layer popover with controlled dismissal. Rows are sized from their content and padding, not a fixed minimum, as AGENTS.md requires. Keyboard navigation follows the More menu. Right-click on a camera host (see [navigation](NAVIGATION.md)) uses the same rules.

## Decisions (accepted 14 November 2026)

1. **Are custom layer names saved in board files? Accepted: no**, matching dmf-web. Names stay visit-local, so board, clipboard and draft formats don't change. The cost is that a named layer loses its name on reload, which dmf-web also does today. The alternative is an optional name field on each record, which means a schema bump, reader rules for older versions and a changelog entry.
2. **Where does the Layers panel live? Accepted: the toolbar entry point** (`dmf-canvas/toolbar`), the same as the inspector and full screen. Core doesn't mount UI.
3. **Does Reset canvas edits remove copies made during the visit? Accepted: yes**. It removes only visit-local copies. Authored originals are restored to their starting state, which matches dmf-web's rule.

## Delivery

1. Layers rows and type names in the toolbar entry point, with selection and order matching the canvas. **Built in 0.6.0-alpha.1**: `getLayers()` and `createCanvasLayers`.
2. Rename (visit-local, one Undo step), and search. **Built in 0.6.0-alpha.1**: `execute('rename')`, with search and an inline field on the Layers panel.
3. Reset object and Reset canvas edits, as Undo steps built on the existing snapshots. **Built in 0.6.0-alpha.1**: each object keeps its start state from registration, and a reset is one history action. It changes the board, because it changes owner state and removes objects; the proposal's note that it is visit-local applies to layer names only.
4. Context menu on right-click and Shift+F10, reusing the toolbar's dispatcher.
5. Hosts: the configurator and the shared custom host get a Layers action and the context menu. Glossary, API, toolbar standard, changelog. **Built in 0.6.0-alpha.1**: both hosts, with teardown tied to the canvas.
6. A browser suite covering: row order against the canvas after moves and layer changes, rename and its Undo, search, Reset object and Reset canvas edits with Undo, the context menu's actions and keys, and RTL. **Built in 0.6.0-alpha.1**: the navigation suite has 57 checks, covering each of these.

It lands as `0.6.0-alpha.n` and is promoted to `0.6.0` when the suite passes in CI and dmf-web can move one surface onto it.

## Acceptance

- Layers order always matches what the canvas shows, and selecting a row selects the same object.
- Names are never saved, and never show content, alt text or visitor data.
- Each reset and each rename is one Undo step.
- The context menu offers the same actions, with the same availability and keys, as the More menu.
- No runtime dependency, no layout reads in pointer or scroll handlers, controls sized from content (no blanket 44px minimum), visible focus, and keyboard and RTL support.
