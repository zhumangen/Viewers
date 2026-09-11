# Zelvyn Viewer shell — product chrome (match viewer-design.png)

> **Branch:** `ui/zelvyn-viewer-shell`  
> **Brand:** Zelvyn · assets `platform/app/public/assets/zelvyn/`  
> **Investigational banner:** remains fully removed (`InvestigationalUseDialog` → `null`)

## Layout

```
┌─ Chrome: Zelvyn | Patient ✓ | Study | Basic pills | ▤ layout · … ─┐
├────┬──────────────────────────────────────────────┬───────────────┤
│Rail│  Viewport grid (default 2×2 + MPR fill)      │ Series cards  │
│…   │  overlays: stack glyph · W/L · Slice · mm    │ + thumbs      │
│More│  Measurements drawer overlays (no tabs)      │ live n/m      │
├────┴──────────────────────────────────────────────┴───────────────┤
│ Status bar                                                        │
└───────────────────────────────────────────────────────────────────┘
```

## Recent UX

| Item | Approach |
|------|----------|
| Layout picker | `ZelvynLayoutPicker` — dense presets + teal hover grid; header monitor + More→Layout (stock LayoutSelector replaced) |
| Measurements | Slide-over drawer with real `panelMeasurement`; open via More → Measurements or Length badge count; Series-only right unchanged |
| Layout CSS | App.css skins leftover LayoutSelector popovers under `.zelvyn-shell` |

## Keep / closed

- Series-only right (no Seg·Measure tabs)
- No floating ToolPill
- MPR fill, thumbs, live n/m, stack glyph, overlays
- Investigational null

## Honest gaps

- Basic pills still not a real mode switcher
- Advanced HP presets (MPR/3D four-up) not in the Zelvyn layout picker (still via hanger / protocol APIs)
- Measurements drawer is overlay UX, not a docked SidePanel tab
- Hanger / calendar utilities remain thin stubs
