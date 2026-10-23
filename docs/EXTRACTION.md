# Standalone extraction implementation

23 October 2026. Destination: https://github.com/dmfeisal/dmf-canvas. Local implementation only; no commit, push or public package publication has been performed by this task.

## Provenance and changes

Seeded from the reproducible exporter in `dmfeisal/dmf-web`, commit `c535322`, using its canonical isolated modules, reference example, CSS, cursor and attribution. `SOURCE-MANIFEST.json` preserves the original 37-file seed hashes and paths. Subsequent changes are intentional and are not expected to match those historical hashes.

- Native ESM package entrypoints now implement the proposed import boundary. The package is private, version 0.0.0, with no runtime dependency or build step.
- Every internal website version query was removed so each module has one URL identity.
- Pure tool settings are separate from demo settings/theme controls; core does not import optional UI or theme.
- Drawing owners and shared stroke paths are separate from the Pencil input controller. Document restoration imports Drawing owners without importing Pencil listeners.
- File, draft, image import and settings panels live under `examples/shared/`, outside package files. Both browser consumers use package entrypoints through import maps.
- All exported functions have declarations. Added the missing image-description command overload and invalid-description result. Consumer type checks include expected failures for payloads, permissions, widths and owner data.
- Structural tests, behavior tests and raster fixtures are local. Archive checks pack/install into a clean consumer, import every export without DOM, compile installed types and verify cursor resolution.

The copied design documents are historical planning context; this implementation note and README describe the current checkout. Production parity, stable compatibility and a public release remain future gates. Host-owned resize observation, file cancellation and disposal remain explicit in `consumer.js`.

## Review findings

Packing initially included root example helpers through a broad wildcard. The package now enumerates its public entrypoint files explicitly, and the install test rejects examples, servers and tests in the archive. Browser integration exposed no regression after the settings/controller split. There are no changes to portfolio runtime, storage or publishing.

## Validation

- 27 local automated tests passed.
- Strict TypeScript public-consumer checks passed, including expected errors.
- Eight browser integration scenarios passed against both hosts: editing/history isolation, read-only/themes, mixed owners, groups/locks, clipboard, image descriptions, board Save/Open/remount, Pencil, opt-in drafts, mobile RTL and 100 repeated disposal cycles. No extra DOM remained; this run measured 474ms for the 100 cycles, not a performance guarantee.
- Browser requests stayed inside this repository and the test server observed zero writes.
- A packed archive installed offline in a clean consumer; entrypoint imports, installed declarations and CSS cursor asset checks passed.

No other browser or real touch-device coverage is claimed. License, registry name, release versioning policy, camera/export parity, stable external original IDs and framework/iframe integration remain open. Do not publish this private preview until those choices and relevant compatibility checks are complete.
