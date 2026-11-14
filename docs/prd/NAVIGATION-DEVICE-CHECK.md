---
title: "Navigation device check"
status: checklist
owner: product
last_reviewed: 2026-11-14
source_of_truth: true
related:
  - NAVIGATION.md
  - ../RELEASE-CHECKLIST.md
---

# Navigation device check

Emulated multi-touch (CDP) covers the gesture logic, but not how real hardware behaves. Run this on at least one phone and one tablet before promoting navigation to `0.5.0`. Record the device, OS, browser and date beside each result. Don't mark a row passed from an emulator.

Use the configurator at `/examples/configurator/`, preview A, with **Zoom and pan** on.

| # | Check | Expected |
|---|---|---|
| 1 | One finger on empty space | The view pans with the finger, no page scroll |
| 2 | One finger on a Text or note, moved 4px or more | The object drags; the view stays put |
| 3 | Two fingers, pinch in and out | Zoom follows the pinch, and the point between the fingers stays under them |
| 4 | Two fingers, move together | The view pans, with no zoom change |
| 5 | Start an object drag, then add a second finger | The drag finishes as one step; Undo restores it in one go |
| 6 | Lift one finger while pinching | The remaining finger keeps panning until both are up |
| 7 | Add a third finger | No jump in the view |
| 8 | Touch the toolbar, More menu, inspector and text fields | They respond; the canvas doesn't pan or zoom |
| 9 | Trackpad pinch on a laptop | Zooms around the pointer; the page doesn't scroll |
| 10 | Mouse wheel | Pans; the page doesn't scroll |
| 11 | Rotate the device, then back | The camera stays usable; objects stay reachable |
| 12 | Tap Fit all, then Full screen | Everything fits; full screen shows the toolbar and the zoom controls |
| 13 | Right-to-left page (Arabic or `dir="rtl"`) | Controls appear in mirrored positions; touch and wheel behave as in rows 1–4 |
| 14 | Screen reader on (VoiceOver or TalkBack) | Zoom announcements are read; no stray labels |

## Recording a result

Copy the table into the PR or release notes with one line per device:

```
Device: <model>, <OS version>, <browser version>, <date>
Passed: rows …  Failed: rows …  Not tested: rows …
Notes: …
```

A failed row blocks promotion to `0.5.0`. Fix it, rerun the affected rows, and record the new run.
