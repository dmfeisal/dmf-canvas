# Repository instructions

DMF Canvas is a private, framework-free, embeddable DOM Canvas (Text, Sticky Notes, Drawings, Images). It ships as native ESM with typed entrypoints, explicit CSS and zero runtime dependencies. dmf-web consumes it only through a pinned archive in its `vendor/` folder; dmf-ui supplies the shared design tokens that hosts may load.

## Read before you change

| Area | Read first |
| --- | --- |
| Public API, commands, events, results | `docs/API.md`, the `*.d.ts` entrypoints |
| Entrypoints, module boundaries, lifecycle | `docs/CANVAS-PACKAGE-BOUNDARY.md`, `docs/CANVAS-OWNER-ADAPTERS.md` |
| Board, clipboard, draft or portable formats | `docs/COMPATIBILITY.md`, `docs/TEXT-FORMATTING.md`, `CHANGELOG.md` |
| Inspector | `docs/INSPECTOR.md` |
| Versions, archives, tags | `docs/RELEASE-CHECKLIST.md`, `docs/engineering/RELEASE-PROCESS.md`, `docs/ROADMAP-AND-REFERENCES.md` |
| Documentation layout and canonical homes | `docs/README.md`, `site/README.md` |

## Confidential naming

Use only these public preset labels and identifiers:

- HUI: `hui` identifiers and `hui-` prefixes; H App/H Company are acceptable prose alternatives.
- QDI: `qdi` identifiers and `qdi-` prefixes; Q App/Q Company are acceptable prose alternatives.
- CB: `cb-ui` preset identifier and `cb-` prefixes; C App/C Company are acceptable prose alternatives.

Never expand these abbreviations into client or company identities. Apply this rule to source, scripts, comments, documentation, fixtures, examples, filenames, assets and generated output. Do not copy private guideline PDFs or identifying filenames into the repository. Preserve required third-party license text (`LICENSES/lucide.txt`). Do not rewrite Git history without an explicit request.

## Package boundary

- Keep native ESM, relative imports and relative assets. Node >=22.12.0 is the minimum (`engines`); CI covers Node 22 and 24. Do not add a bundler, framework or runtime dependency.
- Importing any entrypoint must not mount UI, register listeners, touch storage or require a browser document. Core must not import toolbar icons, themes, demo controls, browser storage, portfolio globals or fonts.
- A new or renamed entrypoint updates `package.json` `exports` and `files`, its `.d.ts`, `docs/API.md` and the type tests together. Demo panels, file pickers and downloads stay in `examples/` or host adapters.

## Versions and releases

- Once an archive exists for a version, that version is immutable. Any later change to runtime code, exports, styles or shipped files needs a new version in `package.json` and the root `package-lock.json`, plus a `CHANGELOG.md` entry.
- Milestone scope lives in `docs/ROADMAP-AND-REFERENCES.md`. Work that lands ahead of its milestone uses a prerelease (for example `0.3.0-alpha.1`) instead of claiming the milestone.
- Keep `private: true`. Packing into `releases/`, tagging, pushing, hosted releases, registry publication and updating dmf-web's vendored archive are separate steps; do each only when asked. Follow `docs/RELEASE-CHECKLIST.md` for them.

## Data compatibility

- Board, clipboard and draft schemas are versioned. Readers keep accepting older versions; older readers must reject newer schemas instead of silently dropping data. Document every schema change in `docs/COMPATIBILITY.md` and the changelog.
- Persist semantic keys (such as ink `primary`), never resolved CSS values. Themes, settings and host appearance never enter board files, history or drafts.

## Theming and tokens

- Appearance is host-owned. Styles read `--dmf-color-*` variables (defined by dmf-web) and `--canvas-embed-*` variables (written by `dmf-canvas/theme`).
- Every `--dmf-color-*` read, in CSS and in JS-set values, falls back to the matching dmf-ui token and then a system colour, so hosts that load only dmf-ui still render correctly:
  - text and ink → `--foreground` → `CanvasText`
  - lines → `--border` → `GrayText`
  - paper, handles, halos → `--background` → `Canvas`
  - selection → `--primary` → `Highlight` (Neutral `--ring` is too light for 1px outlines)
- Hosts that define `--dmf-color-*` must render unchanged. Maintain WCAG 2.2 AA contrast for the built-in light and dark palettes.

## Natural sizing and accessibility

Do not impose a blanket 44px (or other fixed) minimum width or height on controls. Size controls from content, padding and font. Transform handles stay 24px (browser tests assert their hit areas). Preserve keyboard operation, visible `:focus-visible` outlines and RTL containment.

## Verification

- Run `npm run check` (unit tests, public types, installed archive) for every change. Packaging or integration changes also run `npm run test:astro`, `npm run test:frameworks` and `npm run test:configurator`; documentation, example or site changes also run `npm run build --prefix site`. These match CI. CI ends with `git diff --exit-code`; checks must not modify tracked files.
- Browser suites (`test:browser`, `test:*:browser`) require an existing agent-owned `CANVAS_TEST_SPACE_ID`. Run them only when one is supplied, one at a time, and never start an overlapping run.
- Never report a browser, CI or hosted run that did not actually happen in this change; reused results must be labelled as reused.

## Documentation

This repository is the canonical home for shared Canvas documentation (API, compatibility, package boundary, owner adapters, release process). dmf-web keeps only host-specific Canvas rules and links here. The Starlight site in `site/` generates pages from `docs/`; it is not a second source of truth.
