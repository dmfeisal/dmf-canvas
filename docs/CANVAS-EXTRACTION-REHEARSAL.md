# Canvas extraction rehearsal

Recorded: 23 October 2026. Result: the isolated prototype works outside the portfolio. No standalone repository, public package API or production migration is included.

## Reproduce

From the portfolio root, choose a new absolute directory; the exporter refuses existing destinations:

```sh
node scripts/rehearse-canvas.mjs /private/tmp/my-canvas-rehearsal
cd /private/tmp/my-canvas-rehearsal
npm test
npm start
```

No dependency installation or build is required. Open `/` for the independent host and `/examples/canvas/` for the unchanged reference. Optional browser checks use the installed Ego Browser CLI and an existing agent-owned space: `CANVAS_TEST_SPACE_ID=<space-id> npm run test:browser`. The caller closes that space afterward.

The verified local artifact is `/private/tmp/dmf-canvas-rehearsal-20261023-v3`; temporary artifacts may disappear, so use the exporter to reproduce it. Its 37 files total 234,626 bytes and include 18 runtime modules, two stylesheets, available declarations, the required Pencil cursor and Lucide attribution. Runtime sources are copied byte-for-byte. `EXPORT-MANIFEST.json` records provenance and SHA-256 hashes. The exporter follows the bounded static import closure; it is not a general JavaScript bundler.

## Independence and host responsibilities

The custom consumer uses explicit Text owners, host-created markup, system fonts and native controls. It supports two isolated instances, mixed objects, editing/history, clipboard, board files, themes, permissions and Pencil without portfolio layouts, global scripts, fonts, services or persistent storage. Its optional draft adapter uses an injected in-memory Map. The copied reference retains its separate opt-in browser-local drafts. No production data is read or written.

Mobile review exposed a host integration requirement: narrowing a host must cancel gestures and ask the instance to contain its objects. The fixture now observes size changes with a scoped ResizeObserver, coalesces one animation frame and releases both on disposal. Hosts also own file-read cancellation, download URL cleanup and draft policy. No production runtime changes were needed.

## Validation

- Eight browser scenarios passed across both consumers: instance isolation, history, permissions/themes, mixed objects/groups/locks, clipboard, Save/Open, image descriptions, Pencil, memory drafts, mobile RTL and repeated disposal.
- Three exported structural tests passed, checking file hashes, import closure, assets and the private dependency-free manifest.
- All 34 repository tests passed; the two affected export/server tests were rerun after the final fixture change and passed.
- Desktop (1440px), mobile (390px), RTL and fullscreen containment were reviewed. Mobile hosts had no horizontal overflow and retained object bounds after narrowing.
- Three batches of 100 create/dispose cycles took 56–62ms per batch with no extra DOM nodes. Observed heap size settled near 3.70MB after warmup. These are local observations, not a universal leak or performance guarantee.
- Requests stayed within the exported fixture; the browser run performed zero server writes. The fixture rejects write requests.

This does not certify other browsers, real touch devices, embedded iframe behavior, production camera/export parity or every production object type. The portfolio build was not rerun because production sources and build inputs were unchanged.

## Boundaries to review before a repository/package

1. Define a stable entrypoint and complete public type coverage; consumers currently import individual modules.
2. Normalize website `?v=` module URLs before packaging to avoid duplicate module identities.
3. Split pure settings resolution from optional demo settings/theme UI.
4. Document positioned direct-child owner geometry and deterministic original registration IDs required for board restoration.
5. Define the CSS/theme boundary: existing `--dmf-*` aliases and demo selectors remain, although scoped adapters and fallbacks work without portfolio tokens.
6. Make host lifecycle responsibilities explicit: resize/containment, disposal, files, asynchronous cancellation and draft persistence.
7. Establish browser support for native Popover and ResizeObserver, then validate the intended iframe, camera and export scope.
8. Choose repository name, source licensing, distribution and version policy. The generated package is private and grants no new license.

Update, 23 October: the owner has created [dmfeisal/dmf-canvas](https://github.com/dmfeisal/dmf-canvas). The [API/package proposal](CANVAS-PACKAGE-BOUNDARY.md) records the next implementation contract. Next: populate that repository and verify the proposed boundaries when authorized. The broader sequence remains in [the roadmap](CANVAS-ROADMAP.md), with product release gates in [the PRD](CANVAS-PRD.md). No portfolio-level product decision changed, so no decision-log update is needed.
