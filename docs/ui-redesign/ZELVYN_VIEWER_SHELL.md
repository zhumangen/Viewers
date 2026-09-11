# Zelvyn Viewer shell — product chrome (match viewer-design.png)

> **Branch:** `ui/zelvyn-viewer-shell`  
> **Brand:** Zelvyn · assets `platform/app/public/assets/zelvyn/`  
> **Investigational banner:** remains fully removed (`InvestigationalUseDialog` → `null`)

## Layout

```
┌─ Chrome: Zelvyn | Patient ✓ | Study | Basic pills | ▤ ⋒ 📅 ⚙ ? ⏻ ─┐
├────┬──────────────────────────────────────────────┬───────────────┤
│Rail│  Viewport grid (default 2×2)                 │ Series cards  │
│W/L │  (+ multi-series fill into empty cells)      │ + thumbs      │
│…   │                                              │ + footer      │
│More│                                              │ (no tabs)     │
├────┴──────────────────────────────────────────────┴───────────────┤
│ Status: Patient ID · DOB · Sex                 Viewer · DICOM…    │
└───────────────────────────────────────────────────────────────────┘
```

## Polish (visual)

| Item | Approach |
|------|----------|
| Study label in top bar | `usePatientInfo` builds `StudyLabel` (StudyDescription → Modality+BodyPart/Series) |
| Viewport overlays | `viewportOverlayCustomization`: W/L top-right, Slice n/m bottom-left, mm bottom-right |
| Series cards | denser name / resolution / thickness / slice progress + teal selected border |
| Series thumbnails | StudyBrowser pattern: `displaySet.getThumbnailSrc` / middle `imageId` via cornerstone `loadImageToCanvas` |
| Multi-series → 2×2 | After 1×1→2×2 (and on `DISPLAY_SETS_*`), `fillEmptyViewportsWithUnusedSeries` assigns unused image DSs to empty cells |
| Basic pills | Intentional chrome: active = mode label; secondary = modality or HP name. Not a live mode switcher (OHIF mode change = full route remount) |

## Closed vs prior gaps

| Gap | Status |
|-----|--------|
| Series-only right (no Seg/Measure tabs) | Closed — `rightPanels: [zelvynSeries]` + direct `ZelvynSeriesPanel` host (no SidePanel tab strip) |
| Floating ToolPill | Removed — MeasurementTools/MoreTools/Layout via rail **More** menu (`moreTools` section) |
| Header utilities | Monitor · hanger · calendar · settings · help · power (thin SVGs + Gear/PowerOff) |
| Overlay density | Light CSS tighten on viewport overlays |
| Series thumbnails | Closed — `ZelvynSeriesPanel` uses OHIF thumbnail APIs |
| Empty 2×2 cells with multi-series | Closed — `fillEmptyViewports.ts` + layout/display-set hooks |
| Basic pills | Intentional static (active + modality/Default); mode switch not wired |

## Honest remaining gaps

- Basic pills do **not** navigate between OHIF modes / protocols (would need route remount rewrite)
- Overlay top-left is still series text, not a stack glyph
- Series card live slice index updates with viewport/active changes (overlays remain authoritative)
- Hanger HP / calendar utilities remain thin UX stubs
- Measurements / segmentation still via More / commands only
- Single-series studies still show 1 filled + 3 empty cells by design

## Key files

- `ZelvynViewerChrome.tsx`, `ViewerStudyMeta.tsx`, `ViewerHeader.tsx`
- `ZelvynToolRail.tsx` (labeled + More)
- `ZelvynSeriesPanel.tsx`, `ZelvynStatusBar.tsx`
- `fillEmptyViewports.ts`, `ViewerLayout/index.tsx`
- `modes/basic` + `modes/longitudinal`
