---
title: "Importer contract proposal"
status: proposed
owner: engineering
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Importer contract proposal

Current local file loading restores DMF boards; raster intake is separate. An experimental Excalidraw Text/freehand adapter now exists locally in [source](../../js/canvas-import-excalidraw.js); FigJam is still planned. Introduce adapters outside core that parse untrusted input into validated portable records, with adapter name/version and source-format metadata.

Return a deterministic report per source object: source ID, destination IDs, fidelity **Editable / Converted / Flattened / Unsupported**, reason and any warnings. Editable means supported semantics remain editable; Converted means an explicit semantic change; Flattened means visual-only output; Unsupported must never disappear silently.

## Pipeline and gates

Bound input bytes, object counts, nesting, points, asset pixels and decoded bytes before allocating DOM. Propose initial limits in the M1 RFC using existing 1 MiB/50-object limits as constraints, not automatic import promises. Parse → validate source → map → validate portable graph → report → preview → explicit apply as one atomic operation. Failure must leave the existing board intact.

Reject script/HTML content, unsafe URLs and unknown active assets. Imported text is text, never HTML. SVG requires a separate safe conversion/sanitization contract; do not feed arbitrary SVG into DOM. Remote fetching needs a documented allowlist and privacy boundary.

Excalidraw first; authorized FigJam later; generic JSON/SVG and optional MCP adapters follow. Local files require no MCP. Golden fixtures must cover rotation, text/font substitutions, groups, bindings, images, deleted elements, malformed input, limits and deterministic report ordering. See [Excalidraw PRD](../prd/IMPORT-EXCALIDRAW.md).
