# Zelvyn Viewer shell — product chrome (match viewer-design.png)

> **Branch:** `ui/zelvyn-viewer-shell`  
> **Brand:** Zelvyn · assets `platform/app/public/assets/zelvyn/`  
> **Goal:** Viewer chrome matches the attached design mockup, not stock OHIF.

## Layout (must match mockup)

```
┌─ ZelvynViewerChrome (44px) ─────────────────────────────────────────────┐
│ [Z] Zelvyn/Viewer │ Patient ✓ │ Study │ Basic pills │ Layout · ⚙ · ? · ✕ │
├────┬───────────────────────────────────────────────────────┬────────────┤
│Rail│  Viewport grid (default 2×2)                          │ Series     │
│W/L │                                                       │ cards…     │
│Pan │                                                       │ footer     │
│Zoom│                                                       │ N Series   │
│Len │                                                       │ Total imgs │
│Ang │                                                       │            │
│Prb │                                                       │            │
├────┴───────────────────────────────────────────────────────┴────────────┤
│ Status: Patient ID · DOB (age) · Sex              Viewer: ver · DICOM…  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key files

| File | Role |
|------|------|
| `ZelvynViewerChrome.tsx` | Top bar: logo+title, meta, thin utilities |
| `ViewerStudyMeta.tsx` | Patient + green check + study + Basic pills |
| `ZelvynToolRail.tsx` | Labeled Window/Level·Pan·Zoom·Length·Angle·Probe |
| `ZelvynSeriesPanel.tsx` | Right Series cards + footer totals (real display sets) |
| `ZelvynStatusBar.tsx` | Bottom patient meta + version |
| `ZelvynToolPill.tsx` | Secondary overflow (measurements / more) |
| `ViewerLayout/index.tsx` | Composes shell; default 2×2 grid |
| `modes/basic` + `longitudinal` | Series on right; primary rail tools |
| `InvestigationalUseDialog` | Remains fully removed |

## Wiring

- **Tools:** `toolbarSections.primary` = six rail tools; activations go through `toolbarService` / Cornerstone tool groups.
- **Series:** `panelModule.zelvynSeries` reads `displaySetService` and loads into the active viewport via hanging-protocol update + `setDisplaySetsForViewports`.
- **2×2:** On first `VIEWPORTS_READY`, promotes a 1×1 layout to 2×2 (user/HP multi-viewport layouts left alone).

## Verify

1. Top bar is Zelvyn brand + patient check + Basic pills (not OHIF Header with tools).
2. Left rail shows **labeled** tools with teal active border.
3. Right panel is **Series** cards with footer totals.
4. Bottom status bar shows patient meta + Viewer version.
5. Viewport opens as **2×2** for default 1×1 hanging protocols.
6. No investigational-use banner.
