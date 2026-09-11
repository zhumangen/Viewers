# Zelvyn Viewer shell — product chrome (match viewer-design.png)

> **Branch:** `ui/zelvyn-viewer-shell`  
> **Brand:** Zelvyn · assets `platform/app/public/assets/zelvyn/`  
> **Investigational banner:** remains fully removed (`InvestigationalUseDialog` → `null`)

## Layout

```
┌─ Chrome: Zelvyn | Patient ✓ | Study | Basic pills | ▤ ⋒ 📅 ⚙ ? ⏻ ─┐
├────┬──────────────────────────────────────────────┬───────────────┤
│Rail│  Viewport grid (default 2×2)                 │ Series cards  │
│W/L │  unique series + MPR orients for empties     │ + thumbs      │
│…   │  overlays: stack glyph · W/L · Slice · mm    │ live n/m      │
│More│                                              │ (no tabs)     │
├────┴──────────────────────────────────────────────┴───────────────┤
│ Status: Patient ID · DOB · Sex                 Viewer · DICOM…    │
└───────────────────────────────────────────────────────────────────┘
```

## Polish (visual)

| Item | Approach |
|------|----------|
| Study label in top bar | `usePatientInfo` builds `StudyLabel` |
| Viewport overlays | stack glyph top-left; W/L top-right; Slice n/m bottom-left; mm bottom-right |
| Series cards | dense meta + teal selected + StudyBrowser thumbnails |
| Series live n/m | listen to stack/volume scroll + camera events on active viewport element |
| Multi-series → 2×2 | unique unused image DSs first |
| Series < viewports | reconstructable DS → volume + sagittal/coronal/axial into remaining empties (no plain stack duplicate) |
| Basic pills | intentional active + modality/Default (not a mode switcher) |

## Honest remaining gaps

- Basic pills do **not** navigate OHIF modes
- MPR fill only when `displaySet.isReconstructable`; XR/non-volume stay with honest empties
- Fourth empty cell may remain when only 3 orthogonal planes are assigned (2×2 + primary stack already using one plane)
- Hanger HP / calendar utilities remain thin stubs
- Measurements / segmentation still via More / commands only
- `CAMERA_MODIFIED` can fire on pan/zoom (RAF-coalesced); slice index still correct

## Key files

- `fillEmptyViewports.ts`, `ViewerLayout/index.tsx`
- `ZelvynSeriesPanel.tsx`, `ViewerStudyMeta.tsx`
- `viewportOverlayCustomization.tsx`
- `modes/basic` + `modes/longitudinal`
