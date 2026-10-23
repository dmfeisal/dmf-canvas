# Vue installed-package example

`CanvasEmbed.vue` uses a template ref, `onMounted` setup and `onBeforeUnmount` cleanup. Vue owns the empty container; Canvas owns the appended subtree. Keep the engine out of Vue's reactive state. Use a stable name/key as the component identity, as `App.vue` does; changing identity should remount the component.

The lifecycle pattern follows [Vue Composition API lifecycle hooks](https://vuejs.org/api/composition-api-lifecycle.html). This example uses Vue 3.5.44, Vite 8.3.5 and the Vue plugin 6.0.10, pinned in this recipe's lockfile.

## Run

From the DMF Canvas repository root:

```sh
npm run test:frameworks
node scripts/test-frameworks.mjs --keep
cd <printed-directory-for-this-framework>
npm run dev
```

The runner copies this recipe and the canonical shared host/session assets into a new temporary project, packs Canvas and adds that archive's integrity to the generated lock. One clean install includes the local archive and existing locked framework dependencies. `INSTALL-PROVENANCE.json` records the installed archive; no source alias, sibling checkout or symlink is used. The source recipe intentionally omits the unpublished Canvas registry dependency and generated `src/lib` assets, so use the runner rather than running this source folder directly.

`npm run build` creates a production bundle; `npm run preview` serves that retained build. Dependencies belong only to the consumer recipe, not the core library. Package CSS is imported explicitly; the system-font host layout is shared with the existing plain HTML and Astro examples.

## Lifecycle and data

Both A and B are independent instances. Hide removes a component and disposes its engine, Pencil controller, toolbar, owners, observers, subscriptions and file URLs. Show mounts fresh visit-local state. Save a board file before hiding if needed; this example does not automatically persist or restore work. The shared page-local object clipboard does not use the system clipboard. Draft controls use opt-in memory only.

`examples/shared/framework-session.js` owns pagehide/pageshow listeners and idempotent cleanup. The components return/call that disposer at their framework boundary. The session's `data-mounts`, `data-disposals` and `canvasExample` DOM property are bounded example-only diagnostics, not additions to the Canvas API; cleanup removes the object property. Parent updates do not replace the unmanaged subtree.

## Validate

`CANVAS_TEST_SPACE_ID=<existing-agent-owned-space> npm run test:frameworks:browser` runs both framework development and production variants in one caller-managed browser space. It verifies lifecycle counts, parent re-renders, independent removal, clipboard, read-only controls, file round trips, mobile RTL, interrupted Pencil creation and ten hide/show cycles. The caller closes its browser space afterward. Hosted CI runs build checks; browser interaction checks require the local Ego Browser app.

This is a client-rendered integration recipe, not an SSR/hydration, router, HMR, real-touch-device, other-browser or iframe compatibility certification. No application service, publication or portfolio data is used.
