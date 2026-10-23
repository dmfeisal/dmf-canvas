# Canvas package boundary and API proposal

Recorded: 23 October 2026. Status: proposed extraction contract, not an implemented public package API. Destination supplied by the owner: [dmfeisal/dmf-canvas](https://github.com/dmfeisal/dmf-canvas). The portfolio remains on its existing runtime until a separately verified migration.

## Entry points

The following import paths are proposed; package availability, registry name and exports are not promised yet.

| Proposed entry | Responsibility | Current source |
| --- | --- | --- |
| `dmf-canvas` | `createCanvas`, settings validation and public core types | `canvas-instance.js`, pure part of `canvas-instance-settings.js`, declarations |
| `dmf-canvas/owners` | Text, Sticky Note, Image and Drawing factories plus document adapter | instance text/sticky/image/pencil/document modules |
| `dmf-canvas/clipboard` | Explicit host-shared, page-local object clipboard | instance clipboard module |
| `dmf-canvas/pencil` | Optional input controller, separate from drawing records | controller part of instance pencil module |
| `dmf-canvas/toolbar` | Optional generic action toolbar | instance toolbar and icon modules |
| `dmf-canvas/theme` | Scoped theme adapter | instance theme module |
| `dmf-canvas/drafts` | Opt-in draft adapter requiring host storage | instance drafts module |
| `dmf-canvas/canvas.css` | Object/selection/handle styling | instance stylesheet |
| `dmf-canvas/toolbar.css` | Optional toolbar styling | instance toolbar stylesheet |

Settings/demo panels, file pickers, downloads, image import progress fields, example markup and navigation belong in examples or host adapters. Core must not import toolbar icons, demo controls, themes, browser storage, portfolio globals or fonts. Importing core must not mount UI, register listeners or require a browser document; calling DOM factories requires a live HTMLElement. This is an extraction acceptance requirement, not a claim that the current module graph already meets it.

Move `resolveSettings` and tool names out of the demo settings module. Split drawing data/owner creation from the Pencil input controller. Normalize all internal import URLs to one relative module identity, without website `?v=` suffixes. Use native ESM and relative assets; do not add a bundler or framework to establish these boundaries.

## Mounting, configuration and destruction

Keep `createCanvas(host, options)` as the proposed low-level entry. Options explicitly inject documents and an optional shared clipboard, with `readOnly` and tool policy. Theme, toolbar, persistence and camera remain separate. One live instance owns one surface; reject duplicate mounting instead of silently sharing listeners.

`configure(patch)` validates before applying, preserves omitted values and reports unavailable changes through the documented result contract. Permissions must guard commands and direct interactions, not just toolbar visibility. Settings and themes never enter board files.

`destroy()` must be idempotent, cancel provisional work, finish or roll back editor/gesture state according to the interaction contract, release listeners/subscribers and dispose owned registrations. It must not clear host storage or delete authored markup. Each optional adapter exposes its own idempotent disposal. Hosts dispose draft/Pencil subscriptions before the instance, and visual adapters afterward; they cancel outstanding file reads and revoke download URLs themselves.

Hosts observe actual surface-size changes, coalesce one frame, cancel active gestures and issue containment before further interaction. Provide this recipe in plain HTML and framework lifecycle examples. Camera coordinates are a future explicit adapter boundary, not an implicit global dependency.

## Commands, state and events

Preserve the existing `getState()`, `execute()`, `subscribe()` and `subscribeChanges()` model. Publish immutable snapshots; never expose mutable history or registration collections. `subscribe()` has no initial callback: hosts render `getState()` once after subscribing; change events are queued after the current stack, ordered, and have no initial event. Unsubscribe and destruction prevent future delivery.

Use a typed command-to-payload mapping instead of an untyped command string. Inventory every existing command against runtime before declaring compatibility:

| Family | Commands / payload |
| --- | --- |
| Selection/editor | select-all, cancel, edit, finish-edit; element selection remains explicit methods |
| Geometry | move `{dx, dy}` in screen pixels; contain |
| Appearance | paper-color string; image-description string |
| Presence/transfer | copy, paste, duplicate, delete |
| Groups/arrangement | group, ungroup, six align commands, horizontal/vertical distribute |
| Stacking/locks | bring-forward, bring-front, send-backward, send-back; lock optional boolean |
| History | undo, redo |

Creation remains owner-backed registration/provisional creation, not a generic command that secretly creates host markup. Save/Open remain document methods, not network operations. Result typing must include every actual runtime failure reason; invalid programmer input may throw only where documented. Disabled/busy/read-only commands must not mutate history or partially change a selection.

Change events include revision, dirty state and source. `markSaved(revision)` acknowledges only the exact revision persisted by the host; stale acknowledgements cannot clear newer edits. Draft writes and successful download initiation do not establish remote durability.

## Owners and documents

Retain the explicit capture/restore/dispose contract and optional move, transform, edit, presence, color and image-description capabilities described in [owner adapters](CANVAS-OWNER-ADAPTERS.md). Capabilities determine availability; object labels or CSS selectors must not grant permissions. Captures are bounded finite JSON without DOM/shared mutable references. Batch operations preflight all owners and commit one history action or roll back the entire plan.

Initial owners use positioned direct children in one untransformed surface coordinate system. Document original IDs currently depend on deterministic registration order: hosts must recreate the same originals in the same order before loading. Do not promise identity across changed authored content; stable external IDs require a separate format decision. Never serialize owner functions, tool settings, theme, selection or host UI.

Keep the existing `dmf-canvas` board format version 1 and clipboard format version 1 during rehearsal. Validate unknown input and resource limits before mutation; preserve original/created distinctions, groups, locks, image descriptions and local history semantics. Clipboard is opt-in sharing between instances on the same page, not the OS clipboard or cross-origin messaging. Persistence is opt-in and host-owned; core performs no storage reads, uploads or publication.

## CSS and accessibility

Ship core and toolbar CSS independently, with required local cursor assets and attribution. Define documented scoped theme variables using the existing six theme roles: surface, grid, selection, toolbar, ink and line. Inventory `--dmf-*` aliases and retain compatibility fallbacks during migration; do not silently rename tokens or copy portfolio fonts/global styles. Remove demo-only selectors from distributed core CSS after equivalent examples pass.

Preserve accessible names, native fields, focus return, keyboard exclusion guards, read-only behavior, scoped status announcements, mobile/RTL containment and fullscreen popovers. The browser baseline must explicitly cover native Popover, ResizeObserver and input behavior before release. No iframe or real-touch compatibility claim is established by the current rehearsal.

## Types and verification gate

All exported functions and return values need declarations: core, owners, clipboard, Pencil, toolbar, theme, drafts and document validation. Current core declarations are internal and incomplete (for example, the implemented image-description command lacks an execute overload). Complete them beside the extracted implementation, with consumer compile checks for valid calls and expected failures. No TypeScript compiler dependency is added to this portfolio solely for a proposed API.

The standalone implementation is ready for review only when:

- Both plain HTML consumers use the proposed export paths and pass the eight rehearsal scenarios.
- Core import works without DOM side effects or optional UI imports; each runtime module has a single identity.
- Public type consumer checks cover command payloads, owner capabilities, lifecycle, events and adapter return values.
- Two instances preserve isolation, exact revision acknowledgements, read-only policy, cancellation, file round trips and image descriptions.
- Repeated mount/dispose, resized hosts, mobile/RTL and fullscreen checks pass with no retained UI/listeners or cross-instance mutations.
- A clean checkout runs structural/browser checks without portfolio files or services; package-install checks precede publication.

Repository implementation order: copy the verified rehearsal with provenance; establish the entrypoints and pure settings split; split optional controllers/UI; complete types and consumer checks; rerun both hosts. Licensing, registry name, release version and publishing remain explicit unresolved choices. Creating or publishing a package is outside this change.
