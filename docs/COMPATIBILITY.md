# Compatibility baseline: 0.1.0

Native ESM, explicit CSS and browser DOM objects are required. The runtime has no framework dependency or build step. Node 22/24 are the configured CI validation matrix, not browser runtimes. Import-only and declaration consumers are checked without mounting DOM UI.

Local interactive coverage uses Ego Lite/Chromium. Native Popover, ResizeObserver, pointer events and modern DOM APIs are required by optional controllers and example hosts. Other browser engines, real touch hardware and cross-origin iframes are not certified. Clipboard permission may require native-copy fallback. No universal minimum browser version is claimed.

HTML, Astro, React and Vue recipes install packed archives. Existing checks cover Astro ClientRouter cleanup, React development Strict Mode replay, framework unmounts, mobile RTL and repeated disposal. Generated configurator integrations are built and checked separately. This does not promise arbitrary SSR, hydration, HMR, router or host-CSS compatibility. Factories run only after a connected DOM host exists.

The standalone baseline includes bounded Text/Sticky Note/Drawing/Image objects, selection and transforms, locks/groups/arrangement/layers, history, page-local clipboard, local board files, Pencil, themes, permissions and optional drafts. It excludes camera controls, general shapes, Highlighter, Eraser, PNG export and production-owner migration. Production portfolio/Guestbook storage contracts remain separate.

The package stays private. Source licensing and public distribution decisions remain unresolved; bundled Lucide notices remain required. A local archive or Git tag is not registry publication or a public compatibility promise.

Unreleased inspector work uses native Popover and the existing owners' untransformed-host coordinates. It does not establish camera, CSS-transformed-ancestor, iframe or additional browser-engine support. The configurator's generated files must be paired with the corresponding unreleased package source until a new version is released.
