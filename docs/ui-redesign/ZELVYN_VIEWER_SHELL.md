# Zelvyn Viewer shell — product chrome (match viewer-design.png)

> **Branch:** `ui/zelvyn-viewer-shell`  
> **Brand:** Zelvyn · assets `platform/app/public/assets/zelvyn/`  
> **Investigational banner:** remains fully removed (`InvestigationalUseDialog` → `null`)

## Layout

```
┌─ Chrome: Zelvyn | Patient ✓ | Study | Basic pills | ▤ ⋒ 📅 ⚙ ? ⏻ ─┐
├────┬──────────────────────────────────────────────┬───────────────┤
│Rail│  Viewport grid (default 2×2)                 │ Series cards  │
│W/L │                                              │ + footer      │
│…   │                                              │ (no tabs)     │
│More│                                              │               │
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

## Closed vs prior gaps

| Gap | Status |
|-----|--------|
| Series-only right (no Seg/Measure tabs) | Closed — `rightPanels: [zelvynSeries]` + direct `ZelvynSeriesPanel` host (no SidePanel tab strip) |
| Floating ToolPill | Removed — MeasurementTools/MoreTools/Layout via rail **More** menu (`moreTools` section) |
| Header utilities | Monitor · hanger · calendar · settings · help · power (thin SVGs + Gear/PowerOff) |
| Overlay density | Light CSS tighten on viewport overlays |
| Basic pills | Static labels; active teal-dot pill first |

## Key files

- `ZelvynViewerChrome.tsx`, `ViewerStudyMeta.tsx`, `ViewerHeader.tsx`
- `ZelvynToolRail.tsx` (labeled + More)
- `ZelvynSeriesPanel.tsx`, `ZelvynStatusBar.tsx`
- `ViewerLayout/index.tsx`
- `modes/basic` + `modes/longitudinal`
