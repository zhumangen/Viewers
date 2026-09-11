# Phase 3 — Measurement / report panels

Restyles measurement-tracking and report-related panels to match
[`DESIGN.md` §5](./DESIGN.md) and mockup `mockups/04-measurement-report.png`,
without changing the measurement-tracking state machine, Cornerstone tools, or
DICOM SR export semantics.

Depends on **Phase 0** tokens and **Phase 2** Viewer chrome / sidebar surfaces
(`ui/phase2-viewer-chrome`).

## What changed

| Area | Skin behavior |
|------|----------------|
| **Measurement list** | Group-by-series headers when series metadata is present; denser empty state with toolbar hint. |
| **Status chips** | `Tracked` / `Untracked` Badge chips using `--success-*` / muted tokens (series membership from `trackedMeasurementsService` only — display annotation). |
| **Jump to image** | Explicit Jump control on each row (`Icons.JumpToSlice`) in addition to row-click jump (same command). |
| **Sticky footer** | Export CSV (outline) + Delete (danger outline) + Save / create SR (primary accent) pinned below the scrollable list. |
| **SidePanel tabs** | Active tab uses teal underline + accent wash for Measurements / other panel tabs (Phase 2 sidebar consistency). |
| **Series group headers** | Clearer Series N – Description · image count labelling on accordion triggers. |
| **Row chrome** | Selection / hover use `bg-row-selected` / `bg-row-hover` reading-room tokens. |

No new UI libraries. Tracking prompts, XState machine, measurement service
mappings, and SR save events are unchanged — layout / tokens / labels only.

> **Note:** The mockup shows a separate **Report** tab with impression text.
> OHIF keeps Save Report as a footer action (existing model). Phase 3 skins that
> export surface in place rather than inventing a new Report editor.

## Key files

| File | Role |
|------|------|
| `platform/ui-next/src/components/MeasurementTable/MeasurementTable.tsx` | Series grouping, empty state, Jump control, status chips |
| `platform/ui-next/src/components/DataRow/DataRow.tsx` | Row hover/selected tokens; `trailingActions` slot |
| `platform/ui-next/src/components/Badge/Badge.tsx` | `success` / `warn` / `muted` chip variants |
| `platform/ui-next/src/components/SidePanel/SidePanel.tsx` | Tab underline active state; flex content for sticky footer |
| `platform/ui-next/src/components/StudySummary/StudySummary.tsx` | Denser study meta in panel header |
| `extensions/cornerstone/src/hooks/useMeasurements.ts` | Series group label / image-count metadata for list IA |
| `extensions/cornerstone/src/components/MeasurementTableNested.tsx` | Annotate `isTracked` from tracked series (visual) |
| `extensions/cornerstone/src/components/StudyMeasurementsActions.tsx` | Footer vs inline action layouts |
| `extensions/cornerstone/src/components/PanelAccordionTrigger.tsx` | Series / item group header chrome |
| `extensions/cornerstone/src/components/SeriesMeasurements.tsx` | Series header copy |
| `extensions/cornerstone/src/panels/PanelMeasurement.tsx` | Sticky footer shell (basic measurement panel) |
| `extensions/measurement-tracking/src/panels/PanelMeasurementTableTracking.tsx` | Sticky footer shell (tracking panel) |

## How to verify

```bash
cd /workspace/ohif-worktree
pnpm run dev
```

1. Open Longitudinal (or tracking) mode → right **Measurements** panel.
2. Draw Length / Bidirectional → rows appear under a **Group by series** header when multiple series exist.
3. Confirm **Tracked** / **Untracked** chips reflect series tracking (tracked series → Tracked).
4. Click **Jump** (or the row) → viewport jumps to the measurement image (unchanged command).
5. Footer stays visible while scrolling the list: **Export CSV**, **Delete**, **Save**.
6. Export / delete / save still open the same flows as before (CSV download, untrack confirm, SR save prompt).
7. SidePanel tabs show teal underline on the active tab.
8. Basic mode measurement panel gets the same sticky footer skin.
