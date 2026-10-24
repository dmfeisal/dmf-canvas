# Embed configurator

Run `npm ci` and `npm start` from the repository root, then open `/examples/configurator/`.

Select Preview A or B to configure it independently. The selected preview supplies the generated code. Read-only mode, all 14 supported tool permissions, System/Light/Dark/Inherit themes, maximum width (280–1600px) and board height (200–800px) are supported. Invalid dimensions retain the last valid setting; other valid controls continue to apply. Reset settings preserves preview objects.

Previews are temporary and have no autosave or upload service. Save a local board file to retain edits. Generated code contains configuration only: it never includes preview text, imported images or board data.

Selection inspector opens from the sliders icon after selecting supported objects. Its five fields edit visible X/Y bounds, proportional Width/Height and Rotation. Multiple-object rotation is a relative turn. Enter or leaving a changed field applies one Undo step; Escape discards pending input and closes. Read-only/locked selections show disabled fields. Inspector changes are ordinary local owner geometry, not new settings or data uploads. Unsupported custom owner selections disable inspection.

## Use generated files

Choose HTML, Astro, React or Vue. Copy or download all four files into the same directory: the entry file, `canvas-embed.js`, `canvas-embed.css` and `image-controls.js`. Install a locally packed `dmf-canvas` archive in your consumer; this private preview is not published to a registry. See the root README and framework recipes for installation commands.

HTML uses a native import map and package CSS under `node_modules`; serve it over HTTP. The other formats import package CSS and resolve the installed package through their bundler. Render the generated component in your application. React effect cleanup, Vue unmount cleanup and Astro custom-element disconnection dispose their instances. The HTML host also exposes an explicit disposer and handles page lifecycle events.

The helper files are editable example host code, not new stable library exports. They own native controls, image import and local Save/Open. They preserve independent instance settings/history and dispose pending imports, listeners, observers and download URLs. Clipboard copying falls back to selecting the code for native copy when permission is unavailable.

## Validation

`npm run check` checks runtime contracts, public consumer types and packed installation. `npm run test:configurator` installs and builds the actual generated files for all four formats. The CI workflow includes these generated builds.

With an existing authorized isolated Ego browser space, run `CANVAS_TEST_SPACE_ID=<id> npm run test:configurator:browser`. The focused suite checks settings isolation, invalid inputs, images/files, copy/download, mobile RTL, cleanup and actual generated-host lifecycle. It does not certify other browser engines, real touch devices or arbitrary host styles. A hosted CI run is separate from local validation.

Run `CANVAS_TEST_SPACE_ID=<id> npm run test:inspector:browser` in that same space for numeric edits, native fields, mixed/group selections, locks, unsupported/failing owners, bounds, full-screen/mobile RTL containment and repeated cleanup. The inspector is an unreleased addition toward 0.2.0; generated files require its corresponding installed package source rather than the immutable 0.1.0 archive.
