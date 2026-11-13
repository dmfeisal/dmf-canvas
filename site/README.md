# Canvas documentation website

Static Astro/Starlight site for `https://canvas.feisal.id`. The home page `/` is the live editor playground; generated documentation lives under `/docs/` (for example `/docs/api/`), and the experimental import lab stays at `/labs/import/`. The library remains a separate package with no website runtime dependencies.

## Local workflow

```sh
npm ci --prefix site --ignore-scripts
npm run dev --prefix site
npm run build --prefix site
npm run preview --prefix site
```

Edit canonical Markdown in `docs/`, root README/changelog or the example guides. `scripts/sync-docs.mjs` generates the site's content before development/builds, normalizes metadata without changing the research source, rewrites Markdown links into routes and sends source-code links to GitHub. Every generated page is placed under `src/content/docs/docs/`, so its route starts with `/docs/`. Sync also writes the ignored `public/_redirects`, which sends each pre-12 November 2026 root URL (such as `/api/`) and `/playground/` to its new address with a Netlify 301; `scripts/check-build.mjs` fails if a redirect is malformed, its target is missing or a real page shadows it. Never edit `src/content/docs/` directly. Generated content, search output, build files and `.netlify/` project state are ignored.

`npm run build --prefix site` builds static HTML and Pagefind search, then checks every generated page and its local links/assets. It fails on missing local targets. Publication status notices distinguish proposed capabilities and unverified research. No telemetry or third-party font requests are added.

Design follows dmf-ui Nova/Neutral and system fonts: neutral reading surfaces, underlined links, a left navigation rail, readable content and a right page outline. Starlight provides search, light/dark themes and mobile navigation. Motion is limited to native UI responses and respects reduced motion.

Every page shares one header row, `src/components/SiteHeader.astro`, styled after ui.feisal.id (dmf-ui Nova/Neutral): the logo, icon links to Home, Docs, Import lab and Changelog, then the docs search, a 32px GitHub link and a 32px theme toggle that cycles System, Light and Dark. Starlight renders it through the `Header` override (`src/components/StarlightHeader.astro`); the mobile menu footer is overridden so the header remains the single theme control. The toggle stores Starlight's own `starlight-theme` key, so the choice carries between the home page and the docs. Below 40rem the links become icons; on docs pages below 50rem they move into the Starlight menu, which lists the same destinations. `src/styles/tokens.css` holds the shared Neutral tokens, so Canvas chrome on the home page uses its documented dmf-ui fallbacks and the embed follows the resolved theme. The import lab uses the same header and tokens. `src/styles/docs.css` maps Starlight's grey and accent palette onto the same Neutral scale and gives the header, sidebar and content one surface, so every page shares a single light and a single dark appearance.

## Netlify setup

Project: `dmf-canvas`, site ID `14282c2d-4b59-4f80-804b-28b5fd0ac4f4`.

- Project dashboard: https://app.netlify.com/projects/dmf-canvas
- Intended production domain: `canvas.feisal.id`
- Default Netlify hostname: `dmf-canvas.netlify.app`
- Base directory: repository root (leave blank)
- Package directory: `site`
- Build command and publish directory: defined in root `netlify.toml`
- Production branch when linking Git: `main`
- Node: 24, as declared in the Netlify configuration

For Git continuous deployment, import/link `dmfeisal/dmf-canvas` to this existing project rather than creating another project. The website source/config must be committed and pushed before the hosted Git build can use it. A one-off CLI deployment does not configure Git-based updates.

For an already-built manual deployment with an authorized Netlify CLI:

```sh
netlify deploy --site 14282c2d-4b59-4f80-804b-28b5fd0ac4f4 --dir site/dist --no-build --prod
```

Add `canvas.feisal.id` in Netlify Domain management before configuring DNS. In Cloudflare's `feisal.id` zone, add only this record:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | canvas | dmf-canvas.netlify.app | DNS only during setup |

Keep apex, www, mail and unrelated records unchanged. Wait for Netlify DNS verification and HTTPS provisioning, then verify the homepage, a deep route and search over HTTPS. A site build or Netlify hostname alone does not prove the custom domain is connected.

Official setup reference: https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/

## Initial deployment and validation

The initial production deploy succeeded at https://dmf-canvas.netlify.app; Netlify deploy ID `6ae079c60e4b3090d3f19c86`. The custom domain `https://canvas.feisal.id` is attached and returned the correct documentation homepage over verified HTTPS after the Cloudflare DNS setup. Git continuous deployment is not connected by this initial upload. The repository owner authorized committing and pushing the website source.

Validation: 55 generated documentation pages plus the 404 page build; 3,859 local page/asset references and Pagefind output pass. Browser checks confirmed search results for typography, 25 rendered competitor records, 390px layouts without document overflow and mobile-menu navigation to Text formatting. Desktop/mobile screenshots were inspected. External research claims were not reverified. Mermaid diagrams currently display as readable source blocks. Canvas runtime and root dependencies are unchanged.

## Live editor playground

The home page (`/`, formerly `/playground/`) bundles the existing Canvas library and configurator host through explicit package-export aliases. It adds host-owned Text creation, theme and reset controls without changing library runtime modules. No files are uploaded and no board autosave is enabled. The public documentation links to the playground; planned importer/viewer capabilities remain excluded.

After a production build, run `CANVAS_TEST_SPACE_ID=<agent-owned-space> npm run test:browser --prefix site`. The caller owns and closes the browser space. The runner serves the built site temporarily and checks Text editing/formatting/history, notes, images, Save/Open, Pencil, mobile controls, reset cancellation/confirmation, cleanup and navigation. The fixture rejects server writes.

Playground validation on 27 October 2026: the static build checks 56 content/playground pages and 3,925 local page/asset references. The reusable browser suite passed all named flows and reported zero server writes. Desktop/mobile screenshots were inspected. These are Chromium checks, not certification of other engines or real touch hardware.

## Experimental portable import lab (local development)

`/labs/import/` uses an original-free editor to preview bounded Excalidraw version-2 files, report every conversion/unsupported element, apply editable Text/freehand records, and save/open independent portable documents. Legacy original-backed playground behavior is retained. Run `CANVAS_TEST_SPACE_ID=<agent-owned-space> npm run test:import:browser --prefix site` after building. Synthetic fixtures are not evidence of real-board fidelity. This is an experimental local development slice until separately approved for commit/deployment.
