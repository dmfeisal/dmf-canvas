# Selection inspector, unreleased toward 0.2.0

The optional inspector is available through `dmf-canvas/toolbar` and used by `examples/configurator/`. It adds no runtime framework dependency, storage access or release tag. The immutable 0.1.0 baseline remains unchanged. Text formatting is the next part of the proposed 0.2.0 milestone.

## Interaction contract

- X/Y represent visible axis-aligned bounds in CSS pixels inside the surface border. Width/Height proportionally scale those bounds about their top-left without reflowing text or stretching images/paper.
- Single Rotation is absolute degrees. Multi-selection Turn is a relative turn about the combined center; its field returns to zero after application.
- Every owner must explicitly expose geometry. Mixed supported objects and whole groups use a preflighted batch. One lock or unsupported owner prevents mutation. Read-only/locked selections can be inspected with disabled fields.
- Geometry plans intersect scale and bounds limits. Movement and size clamp to supported values; impossible rotations are rejected. Read back actual applied values. A changed field produces one Undo action, with the existing 50-action history and bounded snapshots. Negligible floating-point no-ops do not consume history.
- Enter or leaving a changed field commits. Blank, invalid or nonpositive sizes do not mutate. Escape discards unfinished typing, closes and restores focus. Number-field arrows, selection and Undo remain native until commit.
- Selection loss, editing/creation/gestures, page hiding, viewport scrolling/resizing and full-screen transitions dismiss the popover. The panel stays within the visual viewport and inside its full-screen host. It has no polling, new observer or pointer-move measurement loop.
- Dispose the inspector before its canvas and toolbar. Disposal removes its DOM, subscriptions and listeners, and restores the original trigger attributes/disabled state. The toolbar defers tooltip opening to avoid reentrant native popover operations during focus return.

Custom owners implement the optional geometry capability described in `API.md`. Prepare must be mutation-free and return an apply closure or null. Captures and restores must include every property needed for rollback; core never infers geometry from arbitrary DOM or object names. Current owners use untransformed-host coordinates; this is not camera or transformed-ancestor support.

## Design direction

Reading this as a precision tool for embedded Canvas users, following the existing neutral Canvas chrome and blue selection/focus language. ENERGY 1 / RHYTHM 1 / MOTION 1: predictable numeric controls and focus feedback keep attention on the selected content.

The five-field grid separates position, size and rotation without introducing a sidebar. Inherited system typography keeps the optional adapter compatible with host text; 13px labels and 44px fields follow the existing inspector contract. A solid theme-aware popover separates controls from the board. The local Lucide Sliders Horizontal glyph identifies adjustable properties and matches the established toolbar set; its artwork comes from the portfolio's `public/assets/icons/lucide-sliders-horizontal.svg`, retaining the existing Lucide license notice. No new decorative assets, typefaces, gradients or motion are introduced. The existing dotted board is a spatial workspace reference, not decoration added by this change.

## Verification

`npm run check` includes pure geometry regressions and installed public-type checks. `CANVAS_TEST_SPACE_ID=<existing-agent-space> npm run test:inspector:browser` exercises the real configurator; the caller owns the isolated browser space lifecycle. The standard configurator browser suite also opens and uses the inspector in generated HTML/Astro/React/Vue consumers.

Focused click-through coverage: Selection inspector opens five populated fields; X/Y apply independent moves; Width/Height scale proportionally; Rotation changes angle; Undo/Redo restore one field at a time; invalid fields explain rejection; Escape discards pending edits; Close returns focus. Read-only/locks disable fields, unsupported mixed owners disable inspection, owner failures roll back batches, groups remain whole, native fields retain their keyboard behavior, and active editors/gestures block inspection. Mobile RTL, light/dark styles, viewport dismissal and actual full-screen opening are checked. Fifty repeated host disposals check for retained DOM/listeners. Existing core scenarios and complete generated integration checks run separately. These are local Chromium checks, not certification of other engines or real touch hardware.
