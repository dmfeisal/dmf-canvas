---
title: DMF Canvas Competitor Benchmark: 25 Products
status: research-synthesis
owner: product
research_cutoff: 2026-10-27
last_reviewed: 2026-10-27
source_of_truth: false
---

# DMF Canvas Competitor Benchmark: 25 Products

**Research cutoff:** October 27, 2026  
**Perspective:** CEO and Product Management  
**Origin:** Structured Markdown extraction of the completed Deep Research report, *“DMF Canvas Competitive Benchmark: Twenty-Five Competitors, Market Gaps, and Strategic Roadmap.”*  
**Provenance note:** This file preserves the report's 25-product coverage, key commercial and usage facts, competitive interpretations, and public source URLs in a reorganized, concise knowledge-base format. It is **not a verbatim archival copy** of the complete original research report. Refer to the full Deep Research report for additional prose and raw research context. Linked public sources should be rechecked before external publication or financial decisions.

## 1. Executive conclusion

DMF Canvas should **not** compete primarily as another general-purpose infinite whiteboard, website builder or professional motion tool. Those spaces already contain highly capable incumbents with major distribution advantages.

**Initial category:** Embeddable Interactive Canvas for the Web.  
**Long-term category:** Portable Visual Thinking & Frontend Interaction Layer.  
**Positioning:** “Your thinking, alive on the web.”  
**Product promise:** “Bring your visual thinking with you. Make it interactive. Publish it anywhere.”

**Proposed workflow:** **Import → Curate → Interact → Publish → Connect** (frontend connection is a later-phase ambition).

The opportunity is a portable, creator-owned layer between external visual ideation tools and the live public web: import editable visual artifacts from tools like Excalidraw/FigJam, attach annotations and interactions, then embed a lightweight visitor experience without requiring viewers to open the originating tool. Longer term, bring sketching/inspection to the live frontend and generate source-backed, reversible code changes.

**Critical distinction:** “Supports embeds” is not a sufficient unique selling point; many competitors have embedding or publishing. The possible differentiation lies in combining **editable external-board import + visual-process storytelling + lightweight host-agnostic embed + self-hostable portable documents + future live frontend context**.

### Four competitor segments

1. **Visual thinking and whiteboards (10):** Koboyo, FigJam, Miro, Excalidraw, tldraw, Whimsical, Milanote, Mural, Lucidspark, Canva Whiteboards.
2. **Visual web and code-connected creation (9):** Figma Design, Figma Sites, Onlook, Builder.io, Webflow, Framer, Plasmic, GrapesJS, Puck.
3. **Interactive publishing and storytelling (2):** Vev, Readymag.
4. **Motion and high-fidelity interactions (4):** Rive, ProtoPie, Spline, Jitter.

These categories describe each product's nearest competitive overlap, not necessarily the company's own category terminology. **Exactly 25 product entries** are tracked. FigJam, Figma Design and Figma Sites intentionally appear separately, but share Figma company finances and platform-level reach, which must not be counted three times.

## 2. Evidence and comparability rules

- **[H] High:** primary product docs, company announcements, regulatory filings, official pricing.
- **[M] Medium:** reputable secondary reporting; corporate metric used as a proxy for a specific product; ecosystem traction proxy.
- **[L] Low:** stale data, ambiguous or weakly verified figure, or no defensible current published data.
- **Undisclosed:** research found no public, defensible revenue or adoption figure. This is not evidence of zero revenue/users.
- **Revenue** means actual revenue recognized during a defined period. **ARR** is annual recurring revenue, not the same as revenue. **Funding** is capital raised, not revenue. **Valuation** is neither funding nor revenue.
- **MAU** means monthly active users; **registered accounts**, **customers**, **organizations**, **paid accounts**, **site publishes**, **GitHub stars**, **npm downloads** and **end-user reach** are different measures. Do not rank them as if they have a common denominator.
- Product feature marks below express the *researcher's competitive judgment* based on sources at the cutoff, not audited test outcomes.
- Pricing is **time-sensitive**; amounts are USD when shown as `$` unless otherwise noted, and are subject to location, annual/monthly billing, seat type, and evolving plans.

## 3. Scale and financing reference points

| Product / company | Scale signal and exact unit | Revenue / capital signal | Interpretation and source |
|---|---|---|---|
| Canva (all products) | **260M monthly users in 2025** | **$3.5B revenue for 2025** | [H] Parent company, **not Whiteboards-only**. [Canva 2025 review](https://www.canva.com/newsroom/news/canva-2025-wrap/). |
| Miro | **100M+ users / 250,000 customers** as reported Sept. 2026 | $400M Series C announced Jan. 2022; current revenue undisclosed in this report | [H] Customer and user measures distinct. [Miro 2026 announcement](https://miro.com/newsroom/momentum-grows-for-miro-mcp-as-users-embrace-the-canvas-for-ai-collaboration/), [Series C](https://miro.com/blog/series-c-funding-announcement/). |
| Figma (platform) | **13M MAU in March 2025** (secondary IPO-era report); **13,861 customers with >$10K ARR** Dec. 2025 | **$370.1M Q2 2026 revenue**, +48% YoY | [M] MAU, [H] SEC/company figures. Not separate FigJam/Design/Sites adoption. [Barron's](https://www.barrons.com/articles/figma-files-plans-ipo-3c9f6eb0), [Figma annual results](https://investor.figma.com/news-events/news/news-details/2026/Figma-Announces-Fourth-Quarter-and-Fiscal-Year-2025-Financial-Results/default.aspx), [Q2](https://investor.figma.com/news-events/news/news-details/2026/Figma-Announces-Second-Quarter-2026-Financial-Results/default.aspx). |
| Lucid (suite) | **100M+ users**; **99% Fortune 500**, **180+ countries** | Revenue/funding not verified here | [H] For **Lucid suite**, not Lucidspark alone. [Lucid About](https://lucid.co/about). |
| Mural | **95%+ Fortune 100 use Mural**, based on company claim | $50M Series C in 2021, approximately $200M cumulative funding then | [H] Enterprise penetration metric, not users. [Mural case study](https://www.mural.co/case-studies/emerson), [Series C](https://www.mural.co/press-releases/series-c). |
| ProtoPie | **50K+ companies in 180 countries**, company's 2025 claim | $21M Series B in Jan. 2025 | [H] Organizations, not MAU. [ProtoPie funding announcement](https://www.protopie.io/blog/protopie-secures-series-b-funding). |
| Rive | Built-with-Rive products reach **2B+ downstream end users** | Revenue not disclosed in reviewed source | [H] **Not editor users**. [Rive pricing/positioning](https://rive.app/pricing). |
| tldraw | **51.1K GitHub stars** and **283.4K weekly npm downloads**, figures displayed by product at research cutoff | $10M raise reported by company; revenue undisclosed | [H/M] Distribution proxies, not paying users. [Official tldraw SDK site](https://try.tldraw.com/), [licensing](https://tldraw.dev/pricing). |
| Framer | **58M publishes during 2025** | $100M Series D, 2025; **~$50M 2025 ARR** from secondary reporting | [M] Publishes are events, not MAU; ARR needs re-verification. [Framer announcement](https://www.framer.com/blog/series-d/), [2025 activity](https://www.linkedin.com/posts/framer_2025-was-huge-for-framer-100-features-activity-7419759492143407104-ZVET), [secondary ARR](https://gizmodo.com/framer-figma-killer-2000649692). |
| Onlook | **~26K GitHub stars** displayed by official site at research cutoff | Financials undisclosed | [M] Developer awareness, not users. [Onlook React](https://www.onlook.com/for/react). |
| Koboyo | No verified current customer/MAU figure found | Revenue and funding undisclosed | [L] No assumed business model beyond observed free product. [Koboyo](https://koboyo.com/). |

## 4. All-25 commercial benchmark

**Pricing caveat:** “Annual” means the monthly equivalent when paid annually where sourced. For quote-based plans, the absence of a listed price does not imply they are free.

| # | Product | Main job | Plans / pricing signals at cutoff | Revenue / funding | Strong user-base evidence |
|---:|---|---|---|---|---|
| 1 | [Koboyo](https://koboyo.com/) | Free lightweight infinite canvas | Free observed; no verified paid tier | Undisclosed | Undisclosed |
| 2 | [FigJam](https://www.figma.com/figjam/) | Ideation and group whiteboarding | Included within Figma's seat subscriptions | **Figma platform**, Q2 2026 revenue $370.1M | Figma platform ~13M MAU March 2025, **not FigJam MAU** |
| 3 | [Figma Design](https://www.figma.com/design/) | Collaborative UI design / prototypes | Figma seats, enterprise | Same platform financials, not product-isolated | Same platform data, not Design-only |
| 4 | [Figma Sites](https://www.figma.com/sites/) | Design-to-published website | Bundled/monetized through Figma offering | Same platform financials | Sites-specific adoption undisclosed |
| 5 | [Miro](https://miro.com/) | Enterprise AI innovation/collaboration | Free, Starter, Business, Enterprise | 2022 Series C $400M; revenue undisclosed | 100M+ users; 250K customers, Sept. 2026 |
| 6 | [Excalidraw](https://excalidraw.com/) | Hand-drawn open-source board | Free; **Plus $6/user/mo annual or $7 monthly** | Undisclosed | Current MAU/customer total undisclosed |
| 7 | [tldraw](https://tldraw.com/) | Whiteboard and embeddable canvas SDK | Hobby free; commercial SDK negotiated/value-priced; 100-day trial | $10M raise reported; revenue undisclosed | 51.1K GitHub stars and 283.4K weekly npm downloads, **not MAU** |
| 8 | [Whimsical](https://whimsical.com/) | Structured product thinking/diagrams | Free; Pro **$10/editor/mo annual**; Business **$20/editor/mo annual**; AI credits | $30M Series A (2021); revenue undisclosed | Current MAU/customer number undisclosed |
| 9 | [Milanote](https://milanote.com/) | Creative process/moodboards | Free; individual **$9.99/mo annual**, **$12.50 monthly**; teams | $780K seed (2017); revenue undisclosed | 35K users cited in **2017 only** (stale) |
| 10 | [Mural](https://www.mural.co/) | Enterprise facilitation | Free, Team+, Business, Enterprise | ~$200M funding by 2021 Series C | 95%+ Fortune 100 penetration (not seat count) |
| 11 | [Lucidspark](https://lucid.co/lucidspark) | Brainstorming linked to diagrams | Free; Individual around **$9**, Team around **$10** per official Mar. 2026 guide | Not verified | Lucid suite 100M+ users, **not Lucidspark-only** |
| 12 | [Canva Whiteboards](https://www.canva.com/online-whiteboard/) | Visual ideation for mass creators | Included in Canva Free/Pro/Business/Enterprise | Canva **$3.5B 2025 revenue** | Canva **260M MAU 2025**, not Whiteboards-only |
| 13 | [Onlook](https://www.onlook.com/) | Visual edits to real React/Next.js code | Free/open-source route; beta Teams/custom | Undisclosed | ~26K GitHub stars proxy, not MAU |
| 14 | [Builder.io](https://www.builder.io/) | Visual/AI creation tied to code and CMS | Free/Pro/Team/Enterprise + AI credits; **500 extra credits $25** | Additional $20M funding (2024); revenue undisclosed | Current MAU/customer total undisclosed |
| 15 | [Webflow](https://webflow.com/) | Complete business website platform | Free + sites/workspaces/seats/add-ons; e.g. Growth workspace **$49/mo annual** | At least $72M Series A + $140M Series B documented, **not total current funding** | Current official aggregate users not substantiated here |
| 16 | [Framer](https://www.framer.com/) | Designer-first hosted websites | Free; Basic **$10/mo**, Pro **$30/mo**, additional editors | $100M Series D 2025; secondary ~$50M 2025 ARR [M] | **58M publishes in 2025**, not users |
| 17 | [Plasmic](https://www.plasmic.app/) | Visual CMS on existing components | Freemium; secondary **~$39/$103/$399** annual equivalents [M]; enterprise | Undisclosed | Current verified users undisclosed |
| 18 | [GrapesJS](https://grapesjs.com/) | Open-source visual editor / Studio SDK | OSS core; SDK Free **1K sessions/mo**; Startup **$200/mo**, Business **$2,000/mo** | Undisclosed | No verified MAU or paid user count |
| 19 | [Puck](https://puckeditor.com/) | React-embedded visual editor | MIT-licensed core; no core fee | Undisclosed | No verified current MAU/customers |
| 20 | [Vev](https://www.vev.design/) | Interactive CMS-agnostic web content | Basic/Growth/Scale/Enterprise: quote-based | Undisclosed | User total undisclosed; public brand references |
| 21 | [Readymag](https://readymag.com/) | Creative editorial/portfolio websites | Subscription; standard prices not verified here; nonprofit discount/affiliate program | Undisclosed | Current user total undisclosed |
| 22 | [Rive](https://rive.app/) | Interactive motion and cross-platform runtime | Free; **Cadet $9/seat/mo**, **Voyager $32/seat/mo** annual; enterprise; no runtime royalty | Revenue undisclosed | **2B+ downstream end users reached**, not creators |
| 23 | [ProtoPie](https://www.protopie.io/) | High-fidelity interactive prototypes | Basic starts **$25/mo annual**; Pro **$59/mo** cited; Enterprise | **$21M Series B in 2025** | **50K+ companies**, 180 countries |
| 24 | [Spline](https://spline.design/) | Interactive web-ready 3D | Free + Hobby/Professional/Max/Enterprise; exact amounts unverified | Undisclosed | User total undisclosed |
| 25 | [Jitter](https://jitter.video/) | Accessible 2D motion creation | Free + Pro; Pro exact current price unverified | Undisclosed | User total undisclosed |

**Core pricing sources:** [Figma](https://www.figma.com/id-id/pricing/), [Miro](https://miro.com/pricing/), [Excalidraw+](https://plus.excalidraw.com/pricing), [tldraw](https://tldraw.dev/pricing), [Whimsical](https://whimsical.com/pricing), [Milanote](https://milanote.com/plans), [Mural](https://www.mural.co/pricing), [Lucidspark](https://lucid.co/blog/the-ultimate-lucidspark-guide), [Canva](https://www.canva.com/pricing/), [Builder.io](https://www.builder.io/pricing), [Webflow](https://webflow.com/pricing), [Framer](https://www.framer.com/pricing), [GrapesJS SDK](https://grapesjs.com/sdk/pricing), [Vev](https://www.vev.design/vev-pricing--flexible-plans-for-creating-interactive-content/), [Rive](https://rive.app/pricing), [ProtoPie](https://www.protopie.io/blog/introducing-protopie-basic). Specific annual billing and product-packaging details should be rechecked at checkout or on the official site.

## 5. Capability / substitution matrix

Legend: **●** core or strong; **◐** partial, programmable, restricted, or only share-level; **—** not verified as a core offer. **Embed** includes different degrees of publishing; `●` does not imply third-party editable HTML output or self-hostable files.

| Product | Visual editing | Public embed/publish | Import/interoperability | Stateful interaction/motion | Editing real existing frontend |
|---|:---:|:---:|---|:---:|:---:|
| Koboyo | ● | — | SVG/icons, MCP-adjacent tooling | — | — |
| FigJam | ● | ◐ | Figma-centric | — | — |
| Figma Design | ● | ◐ | Figma plugins, handoff ecosystem | ● prototypes | — |
| Figma Sites | ● | ● | Figma design ecosystem | ● | ◐ own platform |
| Miro | ● | ◐ | Integrations, MCP | ◐ | — |
| Excalidraw | ● | ●/◐ | Structured scene JSON, API/MCP evolution | — | — |
| tldraw | ● | ● | `.tldraw` and SDK | ◐ programmable | — |
| Whimsical | ● | ◐ | Paste/import cross-tool features | — | — |
| Milanote | ● | ◐ share | Media, notes, links | — | — |
| Mural | ● | ◐ | Integrations/MCP | — | — |
| Lucidspark | ● | ◐ | Lucid suite | — | — |
| Canva Whiteboards | ● | ◐ | Canva ecosystem | ◐ via broader Canva | — |
| Onlook | ● | ◐ | Real React/Next.js code, Tailwind, shadcn | ◐ | ● |
| Builder.io | ● | ● | Repository/Figma/assets/design systems, MCP | ◐ | ●/◐ |
| Webflow | ● | ● | Web exports, CMS, plugins | ● | ◐ own platform |
| Framer | ● | ● | Plugins/MCP/ecosystem | ● | ◐ own platform |
| Plasmic | ● | ● | Existing components/code/data | ●/◐ | ◐ |
| GrapesJS | ● | ● | HTML/templates/SDK | ◐ programmable | ◐ host-defined |
| Puck | ● | ● | Host React components/data | ◐ host-defined | ◐ |
| Vev | ● | ● | CMS integration/custom code | ● | — |
| Readymag | ● | ● | Media/web publishing | ● | — |
| Rive | ● | ● | SVG/media/Lottie to runtime artifact | ●● | — |
| ProtoPie | ● | ◐ share/test | Figma, APIs and dynamic data | ●● | — |
| Spline | ● | ● | 3D/web runtimes | ● | — |
| Jitter | ● | ◐ rendered/Lottie | Figma import, Lottie/media export | ● motion | — |

**Interpretation:** Many products draw; several embed; a few edit existing source. The proposed DMF chain uniquely emphasizes editable imported board material **and** creator-owned interactive portfolio storytelling. That remains a product hypothesis, not independently validated defensibility.

## 6. Individual competitor notes

### 1. Koboyo: simplicity and MCP-adjacent utility

- Product: [Koboyo Infinite Canvas](https://koboyo.com/), a free sketch/diagram/notes board with hand-drawn shapes, arrows, icons, tables, charts, and PNG/SVG export.
- Distribution wedge: the company promotes [a very large hand-drawn SVG icon library](https://koboyo.com/icons.html) and MCP-oriented icon/canvas workflows. The library page cited approximately 292,139 icons at the research cutoff, **an asset count, not a user-base metric**.
- Commercial evidence: free public product; no verified subscription, revenue, funding or user count.
- DMF lesson: keep first-use friction low. Koboyo validates lightweight visual drawing but does not demonstrate the full DMF import → story → independent embed → frontend chain in the reviewed public materials.

### 2. FigJam: distribution and upstream artifact ownership

- Product: [FigJam](https://www.figma.com/figjam/) for collaborative ideation and diagrams, benefiting from Figma's seat plans and shared file ecosystem.
- Differentiation: real-time collaboration, workshops and [temporary open sessions](https://help.figma.com/hc/en-us/articles/4410786053911-Invite-visitors-to-an-open-session) with limited friction.
- Metrics and revenue: Figma-wide platform metrics/financials, not separable FigJam adoption. See [Figma 2025 results](https://investor.figma.com/news-events/news/news-details/2026/Figma-Announces-Fourth-Quarter-and-Fiscal-Year-2025-Financial-Results/default.aspx).
- DMF lesson: FigJam is simultaneously a competing authoring workspace and a **priority import source**; don't force users to leave it before they are ready to publish.

### 3. Figma Design: source-of-truth incumbent

- Product: [Figma Design](https://www.figma.com/design/), collaborative interface design, components, prototyping and handoff.
- Differentiation: mature design-system ecosystem and broad designer/developer adoption; increasingly closer to code workflows.
- Metrics: same platform-level finance and usage as Figma; note the [June 2026 SEC filing](https://www.sec.gov/Archives/edgar/data/1579878/000162828026053348/fig-20260630.htm).
- DMF lesson: prioritize design-artifact ingestion and interaction storytelling instead of trying to recreate Figma's design-system editor.

### 4. Figma Sites: publishing from design workflows

- Product: [Figma Sites](https://www.figma.com/sites/), design-to-web publishing integrated into Figma; check [release notes](https://www.figma.com/release-notes/).
- Commercial model: benefits from Figma's wider subscription ecosystem; Sites-specific revenue and active users are not disclosed separately here.
- Threat: DMF loses differentiation if it becomes a full website builder. Opportunity: embed Canvas experiences into **existing sites**, regardless of where sites were authored.

### 5. Miro: enterprise collaboration leader

- Product: [Miro](https://miro.com/) for collaborative innovation, templates, workshops and enterprise controls; added [MCP integration](https://miro.com/ai/mcp/).
- Commercial: Free/Starter/Business/Enterprise. Company said [100M+ users, 250K customers in Sept. 2026](https://miro.com/newsroom/momentum-grows-for-miro-mcp-as-users-embrace-the-canvas-for-ai-collaboration/).
- Capital: [2022 Series C announced](https://miro.com/blog/series-c-funding-announcement/); public revenue undisclosed in this research.
- DMF lesson: make it easy to export selected thinking out of enterprise collaboration boards as an independently published narrative.

### 6. Excalidraw: first structured-import benchmark

- Product: [Excalidraw](https://excalidraw.com/), low-friction sketch-like open-source whiteboard; structured scene representation is the logical first DMF importer.
- Revenue model: free core plus [Excalidraw+](https://plus.excalidraw.com/pricing) at $6/user/month annual or $7 monthly. [MCP](https://plus.excalidraw.com/docs/mcp) and [API](https://plus.excalidraw.com/docs/api) expand integration paths.
- Scale: reviewed primary sources did not establish a current active-user or company revenue number.
- DMF lesson: import real `.excalidraw` files with fidelity reports rather than rebuilding native authoring primitives from scratch.

### 7. tldraw: the build-vs-buy warning

- Product: [tldraw](https://tldraw.com/) with commercial [infinite-canvas SDK](https://tldraw.dev/pricing), extensible editor primitives and multiplayer options.
- Commercial: hobby use free; SDK pricing negotiated/value-based. [SDK examples](https://try.tldraw.com/) reported developer ecosystem indicators, not end-user counts.
- Reported capital: [company-announced $10M raise](https://www.linkedin.com/posts/tldraw_we-raised-10m-more-later-activity-7312822228780273664-ljpQ); current revenue not verified.
- DMF lesson: native object editor infrastructure is not itself a strong market position. Evaluate engine reuse/licensing before devoting years to canvas selection, zoom and sync.

### 8. Whimsical: opinionated product-team UX

- Product: [Whimsical](https://whimsical.com/) with diagrams, wireframes, whiteboards and docs, emphasizing speed and product workflow clarity.
- Pricing: [Pro $10/editor/mo annual; Business $20/editor/mo annual](https://whimsical.com/pricing). [Cross-tool paste/import direction](https://whimsical.com/releases) is strategically relevant.
- Capital: [$30M Series A in 2021](https://whimsical.com/blog/funding); current MAU and revenue undisclosed.
- DMF lesson: interaction and editorial UX should be radically simpler than a full design/prototyping suite.

### 9. Milanote: creative process and moodboards

- Product: [Milanote](https://milanote.com/) for visual organization, references, notes and moodboards.
- Pricing: [$9.99/month annual or $12.50 monthly](https://milanote.com/plans) for individual tier; team subscriptions.
- Stale scale/capital: [TechCrunch 2017 report](https://techcrunch.com/2017/04/18/milanote-bags-780k-seed-to-tool-up-its-evernote-for-creatives/) cited roughly 35K users and a $780K seed. **Do not present this as 2026 adoption.**
- DMF lesson: visual-thinking artifacts matter to creative professionals; DMF can extend them into interactive explanations on owned websites.

### 10. Mural: enterprise visual facilitation

- Product: [Mural](https://www.mural.co/) for group facilitation and collaboration, not primarily authored public artifacts.
- Commercial: [Free/Team+/Business/Enterprise](https://www.mural.co/pricing). Company asserts [95%+ of Fortune 100 use it](https://www.mural.co/case-studies/emerson).
- Capital: [$50M Series C in 2021](https://www.mural.co/press-releases/series-c), cumulative funding then approximately $200M. Historical growth claims include [2020 user expansion](https://www.mural.co/press-releases/series-b).
- DMF lesson: don't compete on enterprise real-time workshops for the MVP.

### 11. Lucidspark: visual thinking plus formal diagrams

- Product: [Lucidspark](https://lucid.co/lucidspark), companion to Lucidchart in enterprise collaboration.
- Official [2026 Lucidspark guide](https://lucid.co/blog/the-ultimate-lucidspark-guide) showed Free and paid individual/team tiers around $9/$10.
- [Lucid About](https://lucid.co/about) reports 100M+ suite users, 99% Fortune 500. Lucidspark product-specific MAU not supplied.
- DMF lesson: be import/portable-web focused, not enterprise diagram-breadth focused.

### 12. Canva Whiteboards: unmatched freemium distribution

- Product: [Canva Whiteboards](https://www.canva.com/online-whiteboard/) within the larger [Canva pricing ecosystem](https://www.canva.com/pricing/).
- Company scale: [260M monthly users and $3.5B revenue for 2025](https://www.canva.com/newsroom/news/canva-2025-wrap/). This is **Canva-wide**, not Whiteboards MAU or Whiteboards revenue.
- DMF lesson: template and media scale are not realistically contestable; emphasize independent ownership and developer-first portability.

### 13. Onlook: primary future frontend-editing threat

- Product: [Onlook](https://www.onlook.com/) visually edits real [Next.js/React](https://www.onlook.com/for/nextjs) projects where code is source of truth; works with familiar frontend conventions.
- Model: free/open-source direction plus evolving beta team/custom plans; [beta pricing reference](https://beta.onlook.com/pricing).
- Scale: GitHub stars are a signal of developer awareness, not active creators. Official [React positioning](https://www.onlook.com/for/react) showed ~26K stars during the research.
- DMF lesson: retain the second product track but differentiate by annotations, imported story artifacts, host-agnostic publishing and multi-framework reach.

### 14. Builder.io: enterprise code/design convergence

- Product: [Builder.io](https://www.builder.io/) combines AI-assisted frontend delivery, visual editing, CMS and repository integrations.
- Model: [tiers and AI credits](https://www.builder.io/pricing); extra 500 credits $25 in reviewed pricing.
- Capital: [additional $20M announced in April 2024](https://www.builder.io/blog/builder-closes-20-million-funding-m12-microsoft). No verified user count/current revenue in reviewed research.
- DMF lesson: don't expand into a complete AI software-development platform to solve a portfolio storytelling use case.

### 15. Webflow: full website builder, prospective host

- Product: [Webflow](https://webflow.com/) with CMS, interaction authoring, hosting and professional site creation.
- Model: layered [site, workspace, seat and add-on pricing](https://webflow.com/pricing), including reviewed Growth workspace at $49/month annual equivalent.
- Capital: official [$72M Series A](https://webflow.com/blog/webflow-series-a-funding) and [$140M Series B](https://webflow.com/blog/webflow-series-b-funding), not asserted as lifetime total. No current verified users here.
- DMF lesson: enable embeds **inside Webflow** rather than trying to replace it.

### 16. Framer: portfolio distribution partner and adjacent rival

- Product: [Framer](https://www.framer.com/) design-centric hosted site tool with CMS, interactions, AI and templates.
- Pricing: [Free, Basic $10/month, Pro $30/month](https://www.framer.com/pricing), with editor/other add-on charges.
- Capital: [$100M Series D at $2B valuation in 2025](https://www.framer.com/blog/series-d/). [2025 activity reported 58M publishes](https://www.linkedin.com/posts/framer_2025-was-huge-for-framer-100-features-activity-7419759492143407104-ZVET); [secondary source estimated ~$50M 2025 ARR](https://gizmodo.com/framer-figma-killer-2000649692) [M].
- DMF lesson: target creator portfolio distribution with a plug-in-like embed; embeds should complement, not replace, the host site.

### 17. Plasmic: codebase-aware visual CMS

- Product: [Plasmic](https://www.plasmic.app/site-builder) registers actual components and data for visual composition within existing projects.
- Commercial: freemium SaaS and enterprise; [secondary 2026 pricing comparison](https://toolquestor.com/vs/plasmic-vs-webflow) is **not an official rate card**; customer total/revenue undisclosed.
- Distribution: [affiliate program](https://www.plasmic.app/affiliates) and design/development enterprise customers.
- DMF lesson: good reference for eventual component/source integration; less directly competitive with an embedded case-study sketchboard.

### 18. GrapesJS: open-core SDK monetization

- Product: [GrapesJS](https://grapesjs.com/) OSS editor framework plus [Studio SDK](https://app.grapesjs.com/docs-sdk/overview/getting-started).
- Revenue model: [Free 1K SDK sessions, Startup $200/month, Business $2,000/month](https://grapesjs.com/sdk/pricing), enterprise and overages.
- No published revenue or reliable customer count found in reviewed source.
- DMF lesson: possible later SDK economics, but monetize infrastructure **after** proving a distinct document/story format.

### 19. Puck: commoditized React editor infrastructure

- Product: [Puck](https://puckeditor.com/), MIT/open-source embeddable React visual editor. Public launch discussion: [Show HN](https://news.ycombinator.com/item?id=44115590).
- Revenue: no core-license fee, no verified company SaaS revenue or active users.
- DMF lesson: a React component page builder is not defensible enough alone. Native sketch/process and portable stories matter.

### 20. Vev: most directly adjacent interactive publishing offer

- Product: [Vev](https://www.vev.design/), interactive content/scrollytelling published into existing CMSs, with [CMS integration guidance](https://www.vev.design/blog/vev-cms-integration/).
- Commercial: [Basic/Growth/Scale/Enterprise quoted tiers](https://www.vev.design/vev-pricing--flexible-plans-for-creating-interactive-content/); user/revenue numbers not found.
- DMF lesson: DMF must offer something more specific than interactive publishing: **imported board semantics, editable process visuals, ownership, and eventually real-page inspection**.

### 21. Readymag: taste and portfolio narrative benchmark

- Product: [Readymag](https://readymag.com/) for expressive visual/editorial websites and portfolios.
- Model: subscription SaaS, [affiliate distribution](https://help.readymag.com/hc/en-us/articles/36060649591195-Affiliate-Program); [nonprofit discounted pricing](https://readymag.com/npo) must **not** be mistaken for standard public pricing.
- Revenue/scale: undisclosed in reviewed primary material.
- DMF lesson: designers expect high visual quality. Canvas needs tasteful typography, motion and storytelling defaults without becoming a general site builder.

### 22. Rive: interaction format and runtime inspiration

- Product: [Rive](https://rive.app/) for interactive graphics with timelines/state machines and cross-platform runtimes.
- Revenue model: [Free, Cadet $9/seat/month, Voyager $32/seat/month annual](https://rive.app/pricing), enterprise; **no runtime fees, royalties or revenue share**.
- Reach: Rive says products built with Rive reach **2B+ downstream end users**, **not Rive editor users**.
- DMF lesson: learn from Rive's lightweight deployment and interaction-data model; don't replicate professional timeline/rigging in v1.

### 23. ProtoPie: professional behavioral-prototyping ceiling

- Product: [ProtoPie](https://www.protopie.io/) high-fidelity interaction prototypes using real data, hardware, variables and complex conditions.
- Pricing: [Basic starts $25/mo annual](https://www.protopie.io/blog/introducing-protopie-basic), [Pro $59/mo in an official 2026 example](https://www.protopie.io/blog/simulating-money-transfers-for-fintech-prototyping), enterprise.
- Scale/capital: [50K+ companies / 180 countries, $21M Series B in 2025](https://www.protopie.io/blog/protopie-secures-series-b-funding).
- DMF lesson: simple hotspots, reveals, navigation and explanatory state should precede advanced expression engines or simulated hardware.

### 24. Spline: interactive 3D as future asset type

- Product: [Spline](https://spline.design/), browser-based interactive 3D creation for apps/websites.
- Commercial: free-to-paid Hobby/Professional/Max/Enterprise; exact prices and revenue not independently verified in this research; [terms](https://spline.design/terms).
- Adoption: reliable customer/MAU total not found, though [Oscilar is a published case study](https://spline.design/customers/oscilar).
- DMF lesson: future support for externally authored Spline content as an embed/media type rather than adding a native 3D editor.

### 25. Jitter: accessible motion-authoring patterns

- Product: [Jitter](https://jitter.video/) 2D browser motion tool with Figma import and [community templates](https://jitter.video/community/).
- Model: Free + Pro; free supports [media and Lottie output](https://jitter.video/templates/ui-elements/) with resolution restrictions; Pro exact current price and MAU unreliably reported and therefore left undisclosed.
- DMF lesson: borrow inspector and motion preset usability; DMF interactions should be **real visitor-triggered behavior**, not only rendered animation/video.

## 7. Priority threats, substitutes, and opportunity

### Three most strategically relevant threats

1. **Figma ecosystem:** already owns the ideation/design source material, huge professional distribution and an increasingly direct website-publishing path. **Response:** make first-class import/publishing interoperability the product, with legally and technically reliable source retrieval.
2. **Onlook:** most direct future threat to the source-connected frontend-editing track. **Response:** differentiate by cross-tool board imports, non-destructive sketch annotations, independent public embeds and framework-agnostic artifacts.
3. **Vev:** directly adjacent in interactive web storytelling and publishing into existing sites. **Response:** optimize for *interactive visual reasoning as an artifact*, not general marketing content pages.

### Three important infrastructure/adjacent substitutes

- **tldraw:** mature embeddable canvas SDK, suggesting drawing infrastructure alone is easily substituted.
- **Framer/Webflow:** both solve the 'make my site interactive' job, though at the whole-site layer; host integration is a larger opportunity than replacement.
- **Rive/ProtoPie:** dramatically deeper motion/prototyping tools; support specialized artifacts or adopt design patterns rather than chasing parity.

### Defensible strategic whitespace hypothesis

A creator should be able to **import an existing Excalidraw/FigJam board, keep meaningful objects editable, curate it into an explanation of design decisions, add accessible interactions and publish that experience directly into a website with no originating-tool account required by readers**.

The **document schema, imported object provenance, interaction semantics and lightweight viewer** should work independently of a chosen editor framework. This is a hypothesis to validate, not proof of competitor-free territory.

## 8. Framework for scoring competitors in product reviews

Do not assign arbitrary 'objective' numerical product scores without live testing. Proposed weighted criteria for a future hands-on benchmark:

| Criterion | Weight | DMF relevance / observable test |
|---|---:|---|
| Import and editability | 25% | Bring in a real Excalidraw/FigJam board; inspect editability and loss reporting. |
| Portable, independent publishing | 25% | Embed within Astro, basic HTML and another host; test account-free visitor access and self-hosting. |
| Interactive story authoring | 20% | Build keyboard-accessible hotspots, reveal explanations and a short scene narrative. |
| Creator authoring UX | 10% | Onboarding, selection, keyboard tools, accessibility, time-to-first-published board. |
| Frontend/code integration | 10% | Annotate a real existing frontend; preserve source and reversible changes. |
| Performance, a11y and security | 10% | Viewer bundle, loading, WCAG behaviors, reduced motion, import sanitization and iframe isolation. |
| **Total** | **100%** | Validate against real use cases; publish test protocol and dated evidence. |

**Competitive score handling:** mark untested scenarios `Not tested` rather than `0`. Record product version, date, account tier, tested workflow, outcome, screenshots and caveats to prevent inflated ratings.

## 9. Commercial and distribution hypotheses for DMF Canvas

These are **recommendations**, not observed Canvas pricing, revenue or user demand.

| Proposed plan | Hypothetical offer | Rationale |
|---|---|---|
| Open / Free | Local/core editor, Canvas JSON, basic Excalidraw import, self-hosted/public viewer and limited hosted projects | Maximize format adoption; creator ownership is a feature, not a premium tax. |
| Creator | Test willingness to pay around **$10–15/month** for hosted projects, no-branding, private drafts, analytics, advanced stories | Near the creator/pro plan range observed in Framer/Whimsical/Rive. |
| Studio/Team | Experiment around **$20–30/editor/month** for collaboration, history, reviews, libraries and better FigJam ingestion | Only after single-user creator publishing is proven. |
| Developer SDK | Later usage/license model for embeddable authoring in commercial third-party SaaS | GrapesJS/tldraw show possible models; do not adopt before product/format differentiation. |
| Enterprise | Custom security, SSO, governance, private hosting and support | Only when enterprise demand emerges. |

Do not monetize public embed traffic with punitive runtime royalties unless research changes the strategic thesis. Publishing the artifact broadly increases distribution and complements the creator's existing website.

**Distribution experiments:**

- A live DMF Canvas experience on `dmfeisal.com` demonstrating a real design case study, not a toy demo.
- Astro starter embed, then vanilla HTML, Framer and Webflow examples.
- Excalidraw import tutorial and transparent compatibility matrix.
- Design/process-stories gallery with credit and “Made with Canvas” attribution if acceptable to creators.
- Small creator/design-engineering communities, developer content and accessible example templates.

## 10. Product roadmap implications, 2026–2028

Proposed dependency order based on the completed study. Calendar bands in the original report were illustrative, **not delivery commitments**.

| Phase | Main user-facing proof | Capabilities | Competitor benchmark addressed |
|---|---|---|---|
| **M0: Baseline / strategy** | “We know what exists and what needs to be reliable.” | Repo audit, resolved/registered regressions, product PRDs, feature inventory, versioned schema, tests | Avoid building an undifferentiated SDK/whiteboard |
| **M1: Portability** | “My board imported; I did not redraw it.” | Excalidraw JSON mapping, editable nodes, save/reload, compatibility report | Excalidraw, FigJam, tldraw |
| **M2: Publishability** | “The board works independently on my website.” | Separate viewer, responsive iframe, pan/zoom, Astro starter, self-hostable documents | Excalidraw/tldraw + site builders |
| **M3: Storytelling** | “Visitors explore the thinking, not a static screenshot.” | Hotspots, node focus, annotation reveals, click/focus states, scene transitions, reduced motion | Vev, Readymag, Jitter |
| **M4: Interoperability** | “I can use existing FigJam/other visual work.” | Authorized FigJam integration, SVG/JSON adapters, optional MCP bridges, import provenance | Figma, Whimsical, Miro, Koboyo |
| **M5: Hosted creator workflow** | “Publishing and updating doesn't require engineering.” | Hosted URL/embed, versioning, analytics, private drafts, billing experiment only with evidence | Framer/Vev publishing convenience |
| **M6: Frontend experimentation** | “I can draw on and visually inspect my running website.” | Opt-in live DOM overlay, transient element changes, reusable interaction ideas | Onlook, Builder, Plasmic |
| **M7: Source-aware changes** | “I can review and apply safe changes in source.” | Astro source mapping, diffs, test gate, rollback; React later as capacity allows | Onlook, Builder |
| **M8: Advanced interaction depth** | “My reusable interactions go beyond hotspots.” | Motion tokens, recipes, sequenced effects, possible timeline if users ask | Rive, ProtoPie, Webflow |

### Explicit non-goals during first year

General enterprise realtime whiteboard; full portfolio website builder/CMS; professional motion timeline and rigging; native 3D editor; extensive simultaneous multi-user collaboration; AI content generation as the primary value proposition; arbitrary source writeback without mapping, review and rollback.

## 11. Unknowns and follow-up evidence register

| Question | Current state | Required evidence / next action |
|---|---|---|
| Will designers prefer an imported editable embed over FigJam share links? | **Unvalidated** | Observe 5–10 designers completing the real import→annotate→publish flow; compare to existing workflow. |
| How editable can FigJam content be via REST vs plugin vs MCP? | **Not fully established** | Test authorized representative boards; matrix every supported node/connector/sticky/media, with failures. |
| Does an iframe viewer meet target accessibility/performance? | **Untested for Canvas** | Build and benchmark keyboard, screen reader, mobile, reduced-motion, cross-origin resize and loading. |
| What is the actual current Canvas repository implementation? | **Not inspected for this note** | Audit git tree/versions and tests; classify actual feature inventory. |
| Is live frontend editing a useful second product or a distracting expansion? | **Hypothesis** | Test on real portfolio/React/Astro projects after core MVP is credible. |
| Can creator hosting be monetized without harming self-host adoption? | **Unvalidated** | Pricing interviews, willingness-to-pay tests, hosting economics, retention observation. |
| What is Koboyo's current business model and user adoption? | **Undisclosed in reviewed sources** | Monitor [official product](https://koboyo.com/) and founder/launch disclosures, not scrape speculative revenue sites. |
| How current are individual competitors' 2026 subscription prices? | **Point-in-time observations** | Revisit official pricing pages each quarter and record country/billing tier. |
| Framer ~2025 ARR, Milanote 2017 adoption, Onlook stars, tldraw downloads | **Secondary/stale or ecosystem proxies** | Keep separately tagged [M]/[L]; do not promote to verified customer figures. |
| What is the product-level adoption for FigJam, Figma Sites, Lucidspark, Canva Whiteboards? | **Not separately disclosed in reviewed report** | Seek official segmentation or leave undisclosed. |

## 12. Source index and refresh protocol

This extracted note includes source URLs inline by claim. The original Deep Research report contains additional inline citation context, fuller company-by-company narrative and a long-form strategic roadmap. The source index below highlights the especially decision-critical evidence:

1. [Koboyo main product](https://koboyo.com/), [icon library](https://koboyo.com/icons.html)
2. [Figma FigJam](https://www.figma.com/figjam/), [Figma official financials](https://investor.figma.com/news-events/news/news-details/2026/Figma-Announces-Second-Quarter-2026-Financial-Results/default.aspx), [SEC 2026 filing](https://www.sec.gov/Archives/edgar/data/1579878/000162828026053348/fig-20260630.htm)
3. [Miro users/customers announcement](https://miro.com/newsroom/momentum-grows-for-miro-mcp-as-users-embrace-the-canvas-for-ai-collaboration/)
4. [Excalidraw+ pricing](https://plus.excalidraw.com/pricing), [API](https://plus.excalidraw.com/docs/api), [MCP](https://plus.excalidraw.com/docs/mcp)
5. [tldraw commercial licensing](https://tldraw.dev/pricing), [tldraw SDK](https://try.tldraw.com/)
6. [Whimsical pricing](https://whimsical.com/pricing), [funding](https://whimsical.com/blog/funding)
7. [Milanote pricing](https://milanote.com/plans), [2017 TechCrunch reporting](https://techcrunch.com/2017/04/18/milanote-bags-780k-seed-to-tool-up-its-evernote-for-creatives/)
8. [Mural pricing](https://www.mural.co/pricing), [Series C](https://www.mural.co/press-releases/series-c)
9. [Lucid organization metrics](https://lucid.co/about)
10. [Canva 2025 report](https://www.canva.com/newsroom/news/canva-2025-wrap/)
11. [Onlook React editor](https://www.onlook.com/for/react), [Next.js integration](https://www.onlook.com/for/nextjs)
12. [Builder pricing](https://www.builder.io/pricing), [2024 funding](https://www.builder.io/blog/builder-closes-20-million-funding-m12-microsoft)
13. [Webflow pricing](https://webflow.com/pricing), [Series A](https://webflow.com/blog/webflow-series-a-funding), [Series B](https://webflow.com/blog/webflow-series-b-funding)
14. [Framer pricing](https://www.framer.com/pricing), [Series D](https://www.framer.com/blog/series-d/), [secondary ARR story](https://gizmodo.com/framer-figma-killer-2000649692)
15. [Plasmic site builder](https://www.plasmic.app/site-builder), [affiliate model](https://www.plasmic.app/affiliates)
16. [GrapesJS SDK pricing](https://grapesjs.com/sdk/pricing), [Studio SDK documentation](https://app.grapesjs.com/docs-sdk/overview/getting-started)
17. [Puck editor discussion](https://news.ycombinator.com/item?id=44115590)
18. [Vev pricing](https://www.vev.design/vev-pricing--flexible-plans-for-creating-interactive-content/), [CMS integration](https://www.vev.design/blog/vev-cms-integration/)
19. [Readymag affiliate model](https://help.readymag.com/hc/en-us/articles/36060649591195-Affiliate-Program)
20. [Rive pricing and runtime position](https://rive.app/pricing)
21. [ProtoPie funding and scale](https://www.protopie.io/blog/protopie-secures-series-b-funding)
22. [Spline](https://spline.design/), [customer example](https://spline.design/customers/oscilar)
23. [Jitter community](https://jitter.video/community/), [export scope](https://jitter.video/templates/ui-elements/)

**Update procedure:** Quarterly pricing review; refresh major product changes on release/announcement; update independent company metrics only when credible official/secondary evidence exists; annotate changes with `verified_at`, original source date, unit, source type and confidence. Avoid silently replacing old datapoints when they show a historical trend.

**Related canonical docs to be created in the actual repository:** `docs/product/PRODUCT-STRATEGY.md`, `docs/product/PRODUCT-ROADMAP.md`, `docs/prd/MVP-PRD.md`, `docs/architecture/CANVAS-DOCUMENT-SPEC.md`, and `docs/research/COMPETITIVE-LANDSCAPE.md`. This note is research input; product decisions must be explicitly accepted in their own documents.
