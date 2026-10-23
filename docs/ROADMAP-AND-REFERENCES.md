# Canvas release planning and references

Recorded 23 October 2026. The full 20-item product backlog is maintained in the portfolio repository at `docs/CANVAS-ROADMAP.md`. This file records the standalone release proposal and advancement references; it does not change package metadata or authorize publication.

## Proposed version milestones — 23 October 2026

Record this as the working release proposal, not completed releases or permission to publish. The proposal began at private `0.0.0`; the private `0.1.0` baseline now documents the supported API and release checks. Later milestones remain proposed.

| Target | Scope |
| --- | --- |
| `0.1.0` | Current baseline, documented API boundaries and reproducible release archive |
| `0.2.0` | Selection inspector and text formatting |
| `0.3.0` | Shapes, Highlighter and stroke Eraser |
| `0.4.0` | Touch controls, optional camera and snapping |
| `0.5.0` | PNG export and expanded release validation |
| `1.0.0-beta.1` | API freeze and integration testing |
| `1.0.0` | Stable documented API, compatibility baseline and resolved licensing |

Use one package version for runtime modules, CSS and declarations. Before 1.0, use patch releases for compatible fixes and minor releases for features or breaking changes; identify breaking changes explicitly with migration notes. From 1.0, follow [Semantic Versioning](https://semver.org/): patch fixes, minor compatible additions, major incompatible changes. Never replace released contents. Match each release to an immutable Git tag, changelog and tested archive; pin portfolio consumption to exact versions and archive integrity. Keep board-file and clipboard schema versions separate from package versions.

Keep `private: true` until distribution and licensing decisions are settled. If npm publication is later authorized, use `next` for prereleases and `latest` for stable releases ([npm distribution tags](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/)). Milestones may change; 1.0 requires a reliable declared scope, not completion of every backlog feature. Recommended next sequence: establish the 0.1.0 baseline, then implement the inspector toward 0.2.0.

## Advancement references

- [Koboyo](https://koboyo.com/): canvas chrome, toolbar hierarchy, selection feedback and spatial navigation.
- [Mochiboard app](https://mochiboard.app/) and [source repository](https://github.com/jessawolfe-ux/mochiboard): additional directional references for future Canvas advancement. Evaluate mixed-content board workflows, quick capture/focus, shapes/connectors, snapping, typography and export discoverability against our existing roadmap. These are research areas, not newly approved features.

The Mochiboard repository README was reviewed on 23 October 2026; the supplied app URL could not be retrieved by the web reader, so no live-app interaction audit is claimed. Its README describes a Mac app wrapping a plain HTML/CSS/JavaScript canvas with native services. Study transferable interaction ideas while preserving DMF's framework-free embeddable core, scoped owners/history, accessible input, host-owned persistence and local/public-data boundaries. AI, native services, collaboration and backend integration require separate scope decisions. Inspect applicable source/asset licenses and preserve required attribution before any reuse; adding a reference does not authorize copying code or changing dependencies.
