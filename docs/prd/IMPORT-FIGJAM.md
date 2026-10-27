---
title: "FigJam import: discovery scope"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# FigJam import: discovery scope

Current state: Planned; no verified editable node compatibility in this repository. Compare authorized REST retrieval, a user-run plugin exporter and optional MCP-assisted ingestion. MCP is a transport option, not evidence of editability or permission to extract arbitrary content.

Before implementation, test a permitted representative board and record each sticky/text/shape/connector/media outcome as Editable, Converted, Flattened or Unsupported. Record API/exporter version, account permissions, source IDs, licensing constraints and missing data. Screenshot extraction is Flattened and cannot be marketed as editable import.

Acceptance for discovery: reproducible authorized retrieval, source-node compatibility matrix, safe token handling and an explicit go/no-go recommendation. No credential may enter exported documents. Open: API fidelity, asset access, plugin distribution and ongoing permissions. External API details require fresh official-source verification when this work starts. Depends on [importer](../architecture/IMPORTER-SPEC.md); not the first MVP import.
