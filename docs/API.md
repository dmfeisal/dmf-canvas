# Private 0.1.0 API contract

The package export map and installed TypeScript declarations define supported names and payloads. Deep imports under `js/`, example helper properties and portfolio globals are implementation details, not supported consumer APIs. This is an initial development contract; it is not a stable 1.0 promise.

## Entry points

| Import | Responsibility |
| --- | --- |
| `dmf-canvas` | `createCanvas`, `resolveSettings`, `canvasToolNames`, instance and owner types |
| `dmf-canvas/owners` | Text, Sticky Note, Drawing and Image owners; document adapter |
| `dmf-canvas/pencil` | Optional scoped Pencil input controller |
| `dmf-canvas/clipboard` | Explicitly shared page-local object clipboard |
| `dmf-canvas/toolbar` | Optional action toolbar |
| `dmf-canvas/theme` | Scoped System/Light/Dark/Inherit theme adapter |
| `dmf-canvas/drafts` | Optional host-injected local draft storage |
| `dmf-canvas/images` | Raster validation, dimensions and encoding helpers |
| `dmf-canvas/canvas.css` | Object, selection, handles and cursor styles |
| `dmf-canvas/toolbar.css` | Optional toolbar styles |

## Instance lifecycle

Call `createCanvas(host, options)` with a connected, positioned and sized HTML surface. One live instance owns one surface. Inject document and clipboard adapters explicitly; core does not mount a toolbar, access storage or upload content. Importing entry points does not require a DOM; calling DOM factories does.

Register each element with an explicit owner. `register` returns a disposer; owners implement bounded capture/restore/dispose and optional movement, transform, editing, serialization, presence, paper color or image description capabilities. Capabilities determine command availability. Created-object presence and retained history are instance-scoped. See the installed `CanvasOwner` declaration and owner-adapter guide for exact signatures.

`getState()` returns a read-only snapshot. `subscribe()` has no initial callback: render once yourself. `subscribeChanges()` delivers ordered completed-change notifications after the current stack, with no initial event. Retain and call unsubscribe functions. `markSaved(revision)` acknowledges only the revision persisted by the host.

`configure(patch)` changes read-only/tool policy while preserving omitted values. Policy guards interactions and commands, not merely visible controls. `select`, `selectMany`, `setMultiple` and `focus` return booleans; provisional `beginCreation` may return null. `execute` and other declared command-result methods return `{ok, reason}`; consumers must inspect the result rather than assume success. Invalid schemas and mounting/registration misuse may throw; do not treat every method as a result-only API.

Commands cover movement, editing, selection, locks, grouping, arrangement, layer order, copy/paste, duplicate/delete, history, paper colors, image descriptions, containment and cancellation. Use the installed `CanvasInstance` overloads for command names and payloads. Camera and export commands remain outside this baseline.

`saveDocument()` returns a bounded board document; `loadDocument(unknown)` validates before applying it. Board and clipboard schemas remain version 1 independently of package version. Clipboard sharing is opt-in within a page, not OS clipboard or cross-origin messaging.

Dispose optional draft/Pencil subscriptions before destroying the canvas, then dispose visual adapters. `destroy()` is idempotent and releases instance state; hosts still own their listeners, observers, pending frames, file reads, object URLs and framework lifecycle. Host resize handlers cancel active gestures then contain objects. Native fields and editing retain their own keyboard behavior. Use the tested framework recipes for lifecycle examples.

## Compatibility changes

All modules, CSS and declarations share one package version. Before 1.0, compatible fixes increment patch; features or incompatible contracts increment minor. Breaking changes require migration notes. After 1.0 use Semantic Versioning. Released archives and tags are immutable; file schema changes need explicit validation/migration policy independently of package bumps.

## Unreleased inspector additions toward 0.2.0

`getInspector()` returns visible selection bounds (`x`, `y`, `width`, `height`), `rotation`, `relativeRotation` and `editable`, or null for no selection, unsupported owners, active editing/creation/gestures or destruction. Locked/read-only selections remain measurable but not editable. Values use CSS screen pixels relative to the surface inside its border. Current owners support untransformed host surfaces; no new camera or CSS-transformed-ancestor support is claimed.

`execute('inspect', {field, value})` accepts one of `x`, `y`, `width`, `height` or `rotation`, and a finite numeric value. Width/height scale proportionally around the visible top-left, not text reflow or image stretching. Single rotation is absolute; multiple-object rotation is a relative turn around the combined center and its UI resets to zero. Plans intersect owner scale/bounds limits; translation and size clamp to applicable limits. Rotation that cannot fit is rejected. Successful batches create one history step, failures restore every captured owner, and subpixel no-ops create no history. Read actual values after applying. Existing serialization captures the geometry without a file-schema change.

Custom owners opt in through `geometry.read()` and `geometry.prepare(target)`. Read returns a finite `CanvasGeometry` with center, unscaled border-box dimensions, scale, angle, permitted scale range and bounds in the same surface coordinate space. Prepare must not mutate; it returns one apply closure or null. The closure applies geometry only, preserving content, metadata and style capabilities. Core captures/restores owner snapshots and owns the batch/history. One unsupported or locked member prevents the whole batch. There is no DOM fallback for unknown owners.

`createCanvasInspector(container, {canvas, trigger})` from `dmf-canvas/toolbar` mounts one optional native popover for a contained HTML button. Call its `toggle()` from the trigger's existing dispatcher, load `toolbar.css`, and dispose it before the canvas/toolbar. It restores trigger attributes and disabled state. The caller owns trigger dispatch; the inspector owns fields, subscriptions and dismissal listeners. No storage, persistence service or publication is added. See the configurator for the complete host recipe.
