# DMF Canvas

An embeddable, framework-free DOM Canvas. This repository is the standalone extraction preview from feisal.id, with explicit object owners and independent instances.

**Status:** private `0.0.0` development preview. The package entrypoints work locally; compatibility, source licensing and public release policy are not settled. This is not the full portfolio Canvas engine.

## Run the examples

```sh
npm ci
npm run check
npm start
```

Open `http://127.0.0.1:8000/` for two independent custom hosts, or `/examples/canvas/` for the more complete controls specimen. There is no build step and no runtime dependency. TypeScript is a development checker only.

The examples include Text, Sticky Notes, Drawings and local raster Images; selection/marquee, editing, transforms, groups, arrangement, layer ordering, locks, Undo/Redo, duplication/deletion, page-local clipboard and local board files. Settings, theme and optional draft persistence belong to each host. No service, upload, publication or portfolio script is required.

## Integrate

Consumers use native ESM entrypoints. A bundler may resolve the package name; build-free hosts supply an import map as both examples do. CSS is explicit: load `dmf-canvas/canvas.css`, plus `dmf-canvas/toolbar.css` if using the optional toolbar. This preview is not available from a public registry; `npm pack` creates a local archive for installation testing.

```js
import {createCanvas} from 'dmf-canvas';
import {createTextOwner, canvasDocuments} from 'dmf-canvas/owners';

// host: connected, positioned, sized HTMLElement; text: static direct child.
const canvas = createCanvas(host, {documents: canvasDocuments});
canvas.register(text, createTextOwner(text, host));
const render = () => updateYourControls(canvas.getState());
const unsubscribe = canvas.subscribe(render);
render(); // Subscriptions have no initial callback.

// Host lifecycle cleanup:
unsubscribe();
canvas.destroy();
```

Host CSS owns surface dimensions and original-object layout. Keep owner objects as positioned direct children on an untransformed surface. See `consumer.js` for complete setup, resize containment, theme, toolbar, file URLs, cancellation and disposal. Register originals in the same order when restoring board files: version 1 identifies originals by registration ID, not stable external IDs.

## Entry points

| Import | Exports |
| --- | --- |
| `dmf-canvas` | `createCanvas`, `resolveSettings`, `canvasToolNames`, core types |
| `dmf-canvas/owners` | Text, Sticky Note, Image and Drawing factories; `canvasDocuments`, `validateObject` |
| `dmf-canvas/clipboard` | `createObjectClipboard`, `validateTransfer` |
| `dmf-canvas/pencil` | `createPencil` input controller |
| `dmf-canvas/toolbar` | `createCanvasToolbar` with host-owned actions |
| `dmf-canvas/theme` | `createCanvasTheme`, `resolveTheme` |
| `dmf-canvas/drafts` | `createLocalDraft`, `parseLocalDraft` with injected storage |

Core import does not initialize DOM, UI, theme, persistence or Pencil. Optional file/image/settings panels live under `examples/shared/` and are excluded from the archive. Tool restrictions guard interaction and commands as well as UI; `readOnly` still permits selection and Copy/Save. Board files never include tool permissions or theme.

The six theme roles are surface, grid, selection, toolbar, ink and line. Existing scoped `--dmf-*` aliases remain for source compatibility; the theme adapter supplies values without portfolio tokens. Styles do not load fonts or global portfolio CSS. Cursor artwork and Lucide attribution travel in the package.

## Validate

- `npm test`: bounded data, revisions, storage adapter, isolation boundaries and import-graph checks.
- `npm run test:types`: public consumer examples and expected type failures.
- `npm run test:package`: pack, offline install into a clean temporary consumer, import every entrypoint, compile consumer types and resolve CSS assets.
- `CANVAS_TEST_SPACE_ID=<agent-owned-space-id> npm run test:browser`: eight browser scenarios using the installed Ego Browser CLI. The caller owns that space and closes it afterward.

The local server binds loopback, accepts GET/HEAD only and does not save files. Drafts in the custom host are opt-in memory-only; the controls specimen separately offers opt-in localStorage drafts. Native editors retain text Undo and their system clipboard.

## Limits and provenance

This preview has no camera, PNG export, Highlighter, Eraser, general shapes or production owner migration. Browser validation used Ego Lite/Chromium; other browsers, real touch devices and cross-origin iframes are not certified. Native Popover and ResizeObserver are required by the optional adapters/example hosts.

[Extraction notes](docs/EXTRACTION.md) record source provenance, changes and validation. Historical source hashes are in `docs/SOURCE-MANIFEST.json`; they describe the copied seed, not hashes of refactored files. Existing portfolio source remains unchanged. Required Lucide licensing is in [LICENSES/lucide.txt](LICENSES/lucide.txt); no new source license is granted by this preview. Choose licensing and release policy before publishing.
