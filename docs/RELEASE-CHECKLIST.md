# Private release checklist

1. Review scope and preserve unrelated changes. Confirm package remains private and release licensing/distribution constraints are documented.
2. Match package and root lockfile versions. Update changelog, API and compatibility documents; describe breaking changes and separate schema changes.
3. Run `npm run check`, `npm run test:astro`, `npm run test:frameworks` and `npm run test:configurator`. Runtime changes also require relevant authorized isolated-browser regressions. A metadata/documentation baseline may reuse the unchanged runtime's recorded browser results, explicitly distinguishing them from a fresh run.
4. Check `git diff --check` and inspect `npm pack --dry-run --json`: only intended runtime, styles, assets, notices and consumer documentation should ship.
5. Create the archive outside the checkout with `npm pack --ignore-scripts --pack-destination <release-directory> --json`. Record npm integrity and SHA-256; run the packed-consumer checks. Never overwrite an existing released version.
6. Commit the exact reviewed release source and create annotated tag `v<version>` on that commit. Keep tag creation local until push is requested. Record commit/tag and archive checksums alongside the artifact; tag content must match its source.
7. Update portfolio consumers only through their explicit pinned-archive process. A version bump does not migrate production canvases. Push, hosted releases and registry publication are separate actions; retain `private: true` until publication is explicitly authorized and licensing is resolved.

Archive output is ignored by Git. The source tag reproduces package contents; compression byte identity across different npm/toolchain versions is not promised. Do not report a new hosted CI or browser run unless it actually occurred.
