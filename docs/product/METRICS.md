---
title: "Product metrics"
status: proposed
owner: product
last_reviewed: 2026-10-27
source_of_truth: true
related:
  - ../README.md
---

# Product metrics

Definitions are proposed; **no baseline, event collection or measured conversion is available**.

| Metric | Definition / unit | Proposed observation |
|---|---|---|
| Activation | Participant completes import + meaningful edit + successful save; share of eligible attempts | Consented usability session |
| First embed conversion | Creators with a working first host embed / creators starting the workflow in a defined cohort | Session checklist initially |
| Time to first published artifact | Elapsed minutes from choosing file to verified visitor render | Timed tasks; include failed attempts separately |
| Import error rate | Rejected import attempts / all import attempts, by reason and format/version | Local report/session evidence |
| Fidelity loss | Counts of Editable/Converted/Flattened/Unsupported source objects per import | Deterministic report |
| Publishing reliability | Successful artifact loads after publication / attempted verified loads | Future controlled checks |
| Viewer engagement | Explanation opens / eligible visitor sessions; define repeat and bot rules first | Only after consent/privacy decision |

Report sample size, date window, device/browser, denominator and exclusions. Initial qualitative sessions must not be represented as population conversion. Prefer local/consented observations over visitor tracking. Set numerical targets only after baseline measurement. Product owns definitions; engineering confirms observability. [Validation plan](VALIDATION-PLAN.md) defines gates.
