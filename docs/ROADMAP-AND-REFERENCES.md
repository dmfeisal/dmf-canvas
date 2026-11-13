# Canvas release planning and references

Recorded 23 October 2026. The full 20-item product backlog is maintained in the portfolio repository at `docs/CANVAS-ROADMAP.md`. This file records the standalone release proposal and advancement references; it does not change package metadata or authorize publication.

## Proposed version milestones — 23 October 2026

Record this as the working release plan, not permission to publish. The proposal began at private `0.0.0`; private `0.1.0` established the first supported API and release checks, private `0.2.0` is prepared locally with the inspector and text formatting, private `0.3.0-alpha.1` is an experimental prerelease for portable documents, private `0.3.0-alpha.2` corrects its shipped documentation, and private `0.3.0-alpha.3` adds the Shape owner and data format. Later milestones remain proposed.

| Target | Scope |
| --- | --- |
| `0.1.0` | Immutable initial baseline with documented API boundaries and reproducible release archive |
| `0.2.0` | Prepared private archive: Selection inspector and text formatting |
| `0.3.0-alpha.3` | Current private experimental prerelease: Shape owner, schema 4 / portable version 3, free resize and the Shapes tool (Shapes delivery steps 1–3) |
| `0.3.0-alpha.2` | Documentation-only prerelease: alpha.1 runtime with corrected shipped documentation |
| `0.3.0-alpha.1` | Recorded private experimental prerelease: portable documents, Excalidraw Text/freehand import, dmf-ui token fallbacks; toolbar/icon/More menu standard; Highlighter (schema 3) and stroke Eraser (early 0.3.0 items) |
| `0.3.0` | Shapes, Highlighter and stroke Eraser |
| `0.4.0` | Touch controls, optional camera and snapping |
| `0.5.0` | PNG export and expanded release validation |
| `1.0.0-beta.1` | API freeze and integration testing |
| `1.0.0` | Stable documented API, compatibility baseline and resolved licensing |

Use one package version for runtime modules, CSS and declarations. Before 1.0, use patch releases for compatible fixes and minor releases for features or breaking changes; identify breaking changes explicitly with migration notes. From 1.0, follow [Semantic Versioning](https://semver.org/): patch fixes, minor compatible additions, major incompatible changes. Never replace released contents. Match each release to an immutable Git tag, changelog and tested archive; pin portfolio consumption to exact versions and archive integrity. Keep board-file and clipboard schema versions separate from package versions.

Keep `private: true` until distribution and licensing decisions are settled. If npm publication is later authorized, use `next` for prereleases and `latest` for stable releases ([npm distribution tags](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/)). Milestones may change; 1.0 requires a reliable declared scope, not completion of every backlog feature. No later milestone begins merely because the private 0.2.0 archive is prepared.

## Advancement references

- [Koboyo](https://koboyo.com/): canvas chrome, toolbar hierarchy, selection feedback and spatial navigation.
- [Mochiboard app](https://mochiboard.app/) and [source repository](https://github.com/jessawolfe-ux/mochiboard): additional directional references for future Canvas advancement. Evaluate mixed-content board workflows, quick capture/focus, shapes/connectors, snapping, typography and export discoverability against our existing roadmap. These are research areas, not newly approved features.

The Mochiboard repository README was reviewed on 23 October 2026; the supplied app URL could not be retrieved by the web reader, so no live-app interaction audit is claimed. Its README describes a Mac app wrapping a plain HTML/CSS/JavaScript canvas with native services. Study transferable interaction ideas while preserving DMF's framework-free embeddable core, scoped owners/history, accessible input, host-owned persistence and local/public-data boundaries. AI, native services, collaboration and backend integration require separate scope decisions. Inspect applicable source/asset licenses and preserve required attribution before any reuse; adding a reference does not authorize copying code or changing dependencies.

## Product roadmap reconciliation — 27 October 2026

The [product roadmap](product/PRODUCT-ROADMAP.md) now records proposed outcome/dependency milestones and reconciles the version targets above. Retain this page for version policy and historical proposals; no milestone-to-version mapping or release is approved by the documentation update.
