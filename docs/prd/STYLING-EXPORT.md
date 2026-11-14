---
title: "Styling and export"
status: accepted
owner: product
last_reviewed: 2026-11-14
source_of_truth: true
related:
  - DMF-WEB-PARITY.md
  - ORGANISATION.md
  - ../design/TOOLBAR.md
  - ../API.md
  - ../COMPATIBILITY.md
  - ../GLOSSARY.md
---

# Styling and export

Phase 4 of [dmf-web parity](DMF-WEB-PARITY.md), targeting 0.7.0: text ink, line height and letter spacing; sticky-note colour swatches and S/M/L text-size presets; and PNG export. The reference design is dmf-web's `docs/CANVAS.md`, which covers the Selection inspector's Text and Note colour sections, the Local PNG export section, and `CanvasNoteColors.astro`. Nothing here is implemented yet.

Two parts of this phase change saved data: the typography record (ink, line height, letter spacing) and the sticky-note paper keys. Export does not change saved data.

## What the package already has

Text has font, size, weight, alignment and wrapping in the typography record, with the sans, serif and mono font families and the 400–700 weights. Sticky notes have three paper colours (yellow, blue, pink), and text size uses the inspector's free size field. Export doesn't exist yet.

## Text ink, line height and letter spacing

- **Ink:** a semantic key, using the same palette as Pencil's inks (`primary`, `blue`, `red`), never a CSS value, following the token rules in AGENTS.md. Default `primary`.
- **Line height:** a multiplier from 0.8 to 3, default `normal`.
- **Letter spacing:** from −0.08em to 0.3em, default 0.
- **Inspector:** three new Text fields in the same fieldset as font, size, weight and alignment. Enter or leaving a field commits one Undo step, as with the existing fields. Mixed values show as Mixed.
- **Saved data:** all three fields go in the typography record. Records that set none of them are written exactly as before, so older files are unaffected.

## Sticky-note colour swatches and S/M/L presets

- **Swatches:** dmf-web has 16 unique paper colours. The package currently has 3 built-in paper keys.
- **Text-size presets:** S (14px), M (18px, default) and L (24px), plus Original, applied as one Undo step, as dmf-web does.
- **Saved data:** new paper keys extend the sticky-note key set. Readers that don't know a key must reject the board rather than drop the note's colour.

## PNG export

- **What it exports:** the selection, or the visible canvas when nothing is selected. Read-only, so it works on read-only canvases.
- **Limits:** at most 2× scale, 4096px per side and 12 megapixels. Larger requests reduce resolution rather than fail.
- **Failures:** one export at a time, a 25-second timeout, and a clear status message on failure. Object URLs are revoked when the export is replaced or closed.
- **Library:** the package has no runtime dependencies, so it can't use dmf-web's `html-to-image`.

## Decisions (accepted 14 November 2026)

1. **Text ink, line height and letter spacing: a board schema change? Accepted: yes, schema 5**, with the same reader rules as earlier bumps. Readers accept 1–5 and reject higher versions. Records without the new fields are written exactly as before, so older boards and readers keep working for them. The alternative, leaving text styling out of boards, would mean dmf-web's text styling can't round-trip.
2. **PNG export: host exporter or built-in capture? Accepted: a host-supplied exporter hook**, `createCanvasExport(canvas, {render})`, where the host brings its own renderer (for example `html-to-image`). The package provides the selection and visible-canvas bounds, the scale and size limits, and the cancellation and status. The alternative, a built-in SVG capture limited to the package's own owners, would keep the package dependency-free but could not export arbitrary host content.
3. **Sticky colours: 16 swatches or 3? Accepted: adopt dmf-web's 16 swatches as package keys**, named semantically (for example `sunshine`, `paradise`), with the 3 existing keys kept as aliases so existing boards load unchanged. The alternative, keeping 3 built-in keys and letting hosts add more, moves the palette into every host and makes a shared board look different on each one.

## Delivery

1. Typography record: ink, line height and letter spacing in the owners, the inspector and the schema-5 reader and writer, with the compatibility notes and changelog. **Built in 0.7.0-alpha.1**: the record, owner, inspector fields, schema 5 writer and reader, and the clipboard. Unknown future versions are still refused.
2. Sticky-note palette: the 16 keys with their aliases, the swatch control in the inspector, and the reader rules for unknown keys. **Built in 0.7.0-alpha.1**: sixteen hue-named keys, with the original three kept as the same keys (so no aliases are needed), a Note colour select in the inspector, and schema 5 for new keys. The keys are hues rather than the dmf-web collection names, because those names belong to a third party and the package's licensing is unresolved.
3. S/M/L text-size presets and their Undo step. **Built in 0.7.0-alpha.1**: a Size preset control in the Text section of the inspector (S 14px, M 18px, L 24px, and Original, the authored size). The presets are not saved; only the size they set is, as before.
4. The PNG export hook: bounds, scale and size limits, cancellation and status, with a host renderer in the configurator and the shared custom host. **Built in 0.7.0-alpha.2**: `dmf-canvas/export`, covered by the navigation suite with a test renderer. The configurator and custom-host renderers are not built yet; a host needs its own renderer and download, as the proposal says.
5. Hosts and docs: configurator, playground and shared custom host; API, toolbar standard, glossary, compatibility, changelog.
6. A browser suite covering: each inspector field and Undo, the schema-5 round trip and older-reader rejection, the 16 swatches and aliases, the presets, export bounds and size limits, a read-only export, cancellation, and dark mode and RTL.

It lands as `0.7.0-alpha.n` and is promoted to `0.7.0` when the suite passes in CI and dmf-web can move one surface onto it.

## Acceptance

- A board saved without the new fields is byte-for-byte what 0.6.0 writes.
- Readers accept schema 5 and portable version 4 where they say they do, and older readers reject them rather than dropping styling.
- Each sticky note's colour survives a save and reload, and aliased keys load as their replacement.
- Export is capped at 2×, 4096px and 12 megapixels, works read-only, and cancels cleanly.
- No runtime dependency, no fixed 44px minimum on controls, semantic keys in saved data, and keyboard and RTL support.
