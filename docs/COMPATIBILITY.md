# Compatibility baseline: 0.1.0

Native ESM, explicit CSS and browser DOM objects are required. The runtime has no framework dependency or build step. Node 22/24 are the configured CI validation matrix, not browser runtimes. Import-only and declaration consumers are checked without mounting DOM UI.

Local interactive coverage uses Ego Lite/Chromium. Native Popover, ResizeObserver, pointer events and modern DOM APIs are required by optional controllers and example hosts. Other browser engines, real touch hardware and cross-origin iframes are not certified. Clipboard permission may require native-copy fallback. No universal minimum browser version is claimed.

HTML, Astro, React and Vue recipes install packed archives. Existing checks cover Astro ClientRouter cleanup, React development Strict Mode replay, framework unmounts, mobile RTL and repeated disposal. Generated configurator integrations are built and checked separately. This does not promise arbitrary SSR, hydration, HMR, router or host-CSS compatibility. Factories run only after a connected DOM host exists.

The standalone baseline includes bounded Text/Sticky Note/Drawing/Image objects, selection and transforms, locks/groups/arrangement/layers, history, page-local clipboard, local board files, Pencil, themes, permissions and optional drafts. It excludes camera controls, general shapes, Highlighter, Eraser, PNG export and production-owner migration. Production portfolio/Guestbook storage contracts remain separate.

The package stays private. Source licensing and public distribution decisions remain unresolved; bundled Lucide notices remain required. A local archive or Git tag is not registry publication or a public compatibility promise.

Unreleased inspector work uses native Popover and the existing owners' untransformed-host coordinates. It does not establish camera, CSS-transformed-ancestor, iframe or additional browser-engine support. The configurator's generated files must be paired with the corresponding unreleased package source until a new version is released.

## Shapes (schema 4)

Board files and clipboard transfers that contain a shape use **schema 4**; portable documents use **version 3**. Content without shapes is written exactly as before (schema 1–3, portable 1–2). Readers accept schemas 1–4 and portable versions 1–3, and reject a lower version that claims a shape. Draft envelopes stay version 1 and carry the board's own schema.

Older readers (0.3.0-alpha.2 and earlier) reject schema 4 and portable version 3 instead of dropping shapes. Shape records persist only semantic `shape`, `ink`, `strokeWidth`, `fill`, `corners` (rectangles) and two box-local `points` (lines and arrows), plus the resized box as `state.width` and `state.height` in pixels; only shapes may carry `state.height`.

## Highlighter (schema 3)

Board files and clipboard transfers that contain a Highlighter stroke use **schema 3**; otherwise saving keeps schema 1 or 2 exactly as before. Portable documents use **version 2** only when they contain a highlight. Readers accept schemas 1–3 and portable versions 1–2. A schema 1 or 2 board or transfer, or a version 1 portable document, that claims a highlight is rejected. Draft envelopes stay version 1 and carry the board's own schema.

Older readers (0.2.0 and earlier 0.3.0-alpha.1 builds) reject schema 3 boards and transfers instead of drawing highlights as solid Pencil ink. Highlight records persist only semantic `tool`, `ink` and `strokeWidth` keys. An explicit `tool:'pencil'` is accepted and normalized away, so Pencil records are unchanged.
