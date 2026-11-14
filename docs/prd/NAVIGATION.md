---
title: "Navigation"
status: accepted
owner: product
last_reviewed: 2026-11-14
source_of_truth: true
related:
  - DMF-WEB-PARITY.md
  - EDITING-PRECISION.md
  - ../design/TOOLBAR.md
  - ../API.md
  - ../COMPATIBILITY.md
  - ../GLOSSARY.md
---

# Navigation

Phase 2 of [dmf-web parity](DMF-WEB-PARITY.md), targeting 0.5.0: a camera (Hand, pan, zoom, Fit all, Zoom to selection), two-finger touch and full screen. The reference design is the Sticky Notes gallery and Guestbook board on feisal.id (dmf-web `docs/CANVAS.md`, "Camera pan/zoom and dotted-grid behavior" and "Select and Hand tools", and `canvas-touch.js`), adapted to the package's host, owner and settings model. All seven steps are built in 0.5.0-alpha.1; the device check and promotion are pending. The five decisions below were accepted on 14 November 2026 with the recommended answers.

This is the largest change on the roadmap. Today every owner positions itself in the host's untransformed coordinates, and containment, the inspector, snapping, guides, labels, drawing input and Duplicate all assume one screen pixel is one canvas pixel. A camera breaks that assumption everywhere at once, so this proposal settles the model before code.

## What the camera is

- **World and screen.** Objects live in world coordinates. The camera is `{x, y, scale}`: the world point at the host's top-left and the zoom factor. A screen point maps to the world as `world = camera + screen / scale`.
- **One transformed layer.** The camera is a single CSS transform (`translate` then `scale`) on one world element inside the host. Owners keep their own transforms unchanged inside it, so the camera never rewrites object state. Toolbars, guides, labels, the status, the Done button and transform handles stay outside the world, in screen space.
- **Opt-in.** Hosts without a camera behave exactly as today. Bounded surfaces (heroes, specimens, embeds sized to their content) keep Select only and their containment rules, as on feisal.id.
- **Outside data.** The camera is a host preference like snapping: it never enters board, clipboard or draft files (see decision 3), never enters history, and never fires `subscribeChanges()`. Pan and zoom are not undoable.

## Behaviour, matching dmf-web

- **Hand tool:** H arms a persistent Hand; holding Space gives a temporary Hand that ends on release. Hand pans even when the drag starts over an object, and never moves it. V returns to Select. Select, Hand, Pencil, Highlighter, Eraser and Shapes stay mutually exclusive, and switching never changes geometry or history. Tool keys ignore native fields, editing, menus, and modified or repeated keys, and never switch during an active gesture.
- **Wheel and trackpad:** an ordinary wheel or two-finger trackpad scroll pans. Pinch, or Ctrl/⌘ with the wheel, zooms around the pointer so the world point under it stays put. The canvas consumes the wheel only while the pointer is over a camera host, and never scrolls the page as well.
- **Zoom limits and steps:** explicit zoom clamps to 0.2–4×. `+`/`=` and `-` (canvas focused) and the zoom buttons step by 1.2×, centred on the viewport. `0` returns to 100% around the viewport centre. Shift+1 is Fit all and Shift+2 is Zoom to selection, which may go below 0.2× only so that everything fits (dmf-web's initial fit does the same).
- **Movement stays world-accurate:** pointer drags divide screen movement by the scale, so objects follow the pointer at any zoom. Keyboard nudges stay 1 or 10 screen pixels (dmf-web's rule), so they move 1/scale world units. With nothing selected, arrow keys on a focused camera canvas pan by 50 screen pixels.
- **Dotted grid:** dot spacing follows the camera from the 24px world gap, dots stay 1 screen pixel, and their offset follows the pan. Grid snapping uses the same world gap, so snaps and dots stay aligned.
- **Snapping, guides and labels:** snapping already takes a camera scale (Phase 1). The 6px snap distance stays in screen pixels, guides are drawn in screen space, and gap labels show screen pixels as today. Selection labels keep showing world size, excluding zoom, as Phase 1 promised.
- **Drawing:** Pencil, Highlighter, Eraser and Shapes cache the inverse camera matrix at pointer-down, sample at least 0.5 world units apart and commit world coordinates. A camera change cancels unfinished ink.
- **Inspector:** X, Y, W and H show and accept world units. Camera changes close the inspector and More, like a viewport change does today.
- **Creation and paste:** new objects and pasted copies go to the centre of the visible world without moving the camera. Duplicate keeps its 24 world-unit offset.
- **Status:** the polite status announces zoom changes ("Zoom 150%") and Fit all or Zoom to selection results, coalesced so a pinch announces once at the end.

## Two-finger touch

Matching `canvas-touch.js`: two non-control touches anywhere on the host take camera ownership before selection or object gestures. The handoff:

- finishes the object transform already applied as its normal Undo step;
- cancels a touch marquee;
- releases pointer capture.

Pinch keeps the world point under the moving midpoint, equal finger movement pans, a third finger or a replaced pair rebases without a jump, and lifting to one finger keeps panning until every finger is up. One finger on empty space pans on a camera host (touch has no Hand key) and keeps today's one-finger object dragging, which needs more than 4px of movement. Native fields, links and toolbars never start camera gestures. Up to ten contacts are tracked, and camera writes are coalesced into one animation frame. Browser emulation is not enough to sign off touch; release notes must say which physical devices were checked.

## Full screen

A Full screen action (`maximize` / `minimize`, F) puts the host's chrome container, not just the canvas, into native full screen, so toolbars, menus, the inspector and help stay visible and contained. Escape and the browser's own exit leave full screen; the camera keeps its position, and Fit all is one key away. Hosts without the Fullscreen API, or inside an iframe without permission, hide the action rather than show a disabled one.

## Decisions (accepted 14 November 2026)

1. **Who provides the world element — accepted:** **the host marks one** (`camera: {world: element}`), and the package never moves authored nodes. Wrapping the host's children ourselves would break host CSS selectors, layout and framework ownership of those nodes. Created objects are appended to the world element.
2. **Opt-in shape — accepted:** a `camera` setting on `createCanvas` and `configure()`, `false` by default, or `{world, minScale: 0.2, maxScale: 4}` to enable it, reported in `getState().settings`. `getState().camera` reports `{x, y, scale}`, and `execute('camera', {x, y, scale})`, `execute('zoom', {by|to, around})`, `execute('fit')` and `execute('zoom-to-selection')` drive it. Hand is a core tool, not a new tool permission, because it never changes content; hosts hide it by leaving the camera off.
3. **Is the camera saved? — accepted:** **no**, matching dmf-web. Board, clipboard and draft formats stay as they are, so there is no schema bump. Hosts that want to restore a view read `getState().camera` and call `execute('camera', …)` themselves, for example from their own storage. Saving it would add an optional board field, a schema 5 and reader rules, for a value most hosts reset anyway.
4. **Containment on camera hosts — accepted:** **an unbounded world**. Dragging, paste, Duplicate and the inspector stop clamping to the host on camera hosts, and objects can sit anywhere in the world. Fit all is the way back. Bounded hosts keep today's containment. Optional world bounds (`camera: {bounds}`) that keep clamping can be added later without breaking this.
5. **Where full screen lives — accepted:** **the toolbar entrypoint** (`dmf-canvas/toolbar`), because it needs the chrome container and a `fullscreenchange` listener on the document, which core must not register. Core exposes nothing new for it beyond tolerating host resizes. Custom hosts call the Fullscreen API themselves.

## Delivery

1. Camera model in core: world element, `camera` setting, `getState().camera`, the camera commands, world-accurate pointer drags, nudges and the dotted grid, behind the opt-in. Unbounded containment on camera hosts. **Done in 0.5.0-alpha.1**, with transform handles kept at 24 screen pixels and resize and rotate converted to world units as well.
2. Coordinates everywhere else: inspector world units, creation and paste at the visible centre, snapping and guides at scale, labels showing world size, drawing input through the inverse matrix. **Done in 0.5.0-alpha.1**; the inspector panel closes on camera changes, and an unfinished stroke, shape or erase is cancelled.
3. Hand tool, Space, wheel pan, pinch and Ctrl/⌘ zoom, `+`/`-`/`0`, Fit all and Zoom to selection, with zoom buttons in the toolbar standard and status announcements. **Done in 0.5.0-alpha.1**; Zoom to selection is keyboard-only (Shift+2), since no vendored icon fits it.
4. Two-finger touch handoff and one-finger empty-space pan. **Done in 0.5.0-alpha.1**, with one-finger object dragging on camera hosts (bounded hosts still ignore touch), checked with emulated multi-touch; the physical-device check remains for promotion.
5. Full screen in the toolbar entrypoint. **Done in 0.5.0-alpha.1** as `createCanvasFullscreen`.
6. Hosts and docs: configurator, playground and the shared custom host get a camera option; API, toolbar standard, glossary, compatibility and changelog. **Done in 0.5.0-alpha.1**: the configurator's Zoom and pan setting (which the homepage playground inherits but leaves off, so the wheel still scrolls the page) and `mountConsumer(..., {camera: true})`.
7. A navigation browser suite (pan, zoom around the pointer, limits, Fit all, Zoom to selection, drags and snaps at 0.5× and 2×, inspector values at zoom, drawing at zoom, two-finger handoff in emulation, full screen, mobile RTL, teardown) in CI, plus a recorded physical-device touch check before 0.5.0. **Built in 0.5.0-alpha.1**: the suite has 42 checks, covering snapping at 0.5× and 2×, the world grid at 2×, mobile RTL camera controls and camera teardown in the configurator. The device check is in [NAVIGATION-DEVICE-CHECK.md](NAVIGATION-DEVICE-CHECK.md) and is still pending.

Land as `0.5.0-alpha.n` and promote to `0.5.0` when the suite passes in CI, touch has been checked on a physical device, and dmf-web can move one camera surface (the Sticky Notes gallery or Guestbook board) onto the package.

## Acceptance

- A host without the camera setting renders and behaves exactly as in 0.4.0, and every existing browser suite still passes.
- At any zoom, a dragged object stays under the pointer, the world point under the pointer or pinch midpoint stays fixed while zooming, and keyboard nudges move whole screen pixels.
- Camera changes never enter history, change events, board, clipboard or draft data.
- Drawing, snapping, guides, labels and the inspector agree with each other at 0.5×, 1× and 2×.
- Two fingers always take the camera, finishing any object gesture as one Undo step, and no gesture leaves capture, frames or listeners behind after cancel or `destroy()`.
- No runtime dependency, no layout reads inside pointer-move or wheel handlers, 24px handles in screen space at every zoom, keyboard and RTL support.
