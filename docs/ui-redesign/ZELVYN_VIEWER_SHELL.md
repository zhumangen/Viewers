# Zelvyn Viewer shell — product chrome (not stock OHIF)

> **Branch:** `ui/zelvyn-viewer-shell` (from `ui/zelvyn-shell-v2`)  
> **Brand:** Zelvyn · assets `platform/app/public/assets/zelvyn/`  
> **Goal:** A screenshot of `/viewer` must read as a **custom product**, not “OHIF with Zelvyn text.”

## What changed vs stock OHIF / timid skins

| Area | Before | After |
|------|--------|-------|
| **Top bar** | Stock `@ohif/ui-next` `Header` + NavBar menu pattern (logo, centered tools, gear) | **`ZelvynViewerChrome`** — brand + Viewer badge left, **patient/study meta center**, undo/settings/avatar right. **No primary tools in the header.** |
| **Tools** | Horizontal toolbar inside Header children | **`ZelvynToolRail`** — dense **left vertical rail** (primary section); **`ZelvynToolPill`** — floating bottom pill (secondary / layout) |
| **Viewport** | Flat grid fill | Framed viewport (`zelvyn-viewport-frame`) with product border |
| **Side panels** | Prior teal tab underline | Kept + shell sidebar surface |
| **Investigational banner** | Removed in v2 | Still fully removed (`InvestigationalUseDialog` → `null`) |
| **Other routes** | Local / 404 / Debug / Legacy still OHIF-looking | Local upload, NotFound, Debug, LegacyWorkList use Zelvyn app bar / brand |

WorkList AppBar + chips from shell v2 remain; this branch focuses on Viewer structure and cross-route chrome consistency.

## New / key files

### Viewer (extension-default)
- `extensions/default/src/ViewerLayout/ZelvynViewerChrome.tsx` — product header
- `extensions/default/src/ViewerLayout/ZelvynToolRail.tsx` — left primary tools
- `extensions/default/src/ViewerLayout/ZelvynToolPill.tsx` — floating secondary pill
- `extensions/default/src/ViewerLayout/ViewerStudyMeta.tsx` — center patient/study/modality
- `extensions/default/src/ViewerLayout/ViewerHeader.tsx` — composes chrome (no stock `Header`)
- `extensions/default/src/ViewerLayout/index.tsx` — rail + framed viewport + pill
- `extensions/default/src/hooks/usePatientInfo.tsx` — + StudyDescription / Date / Modality
- `extensions/default/src/customizations/headerRightSideCustomization.ts` — undo/redo only (meta in center)

### App routes
- `platform/app/src/routes/Local/Local.tsx` — Zelvyn upload shell
- `platform/app/src/routes/NotFound/NotFound.tsx` — product 404
- `platform/app/src/routes/Debug.tsx` — product debug card
- `platform/app/src/routes/LegacyWorkList/LegacyWorkList.tsx` — `WorkListAppBar` instead of stock Header
- `platform/app/src/App.css` — tool rail / viewport frame helpers

### ui-next
- `platform/ui-next/.../ToolButton/ToolButton.tsx` — optional `tooltipSide`

## Layout sketch

```
┌─ ZelvynViewerChrome (48px) ─────────────────────────────────────┐
│ ← Brand | Viewer   │  Patient · Study · Modality chip  │ ↶↷ ⚙ RA │
├────┬───────────────────────────────────────────────────┬────────┤
│Rail│  Viewport frame (+ floating secondary pill)       │ Panels │
│ W/L│                                                   │        │
│Zoom│                                                   │        │
│ …  │                                                   │        │
└────┴───────────────────────────────────────────────────┴────────┘
```

## Verify

```bash
cd /workspace/ohif-worktree
pnpm run dev
```

1. Open a study → top bar is **Zelvyn product chrome** (not OHIF Header with tools in the middle).
2. Primary tools sit in the **left vertical rail**; active tool has teal ring.
3. Secondary/layout tools appear in the **bottom floating pill** when present.
4. Side panels + measurements/tools still work; Cornerstone viewports load.
5. Local upload `/local`, 404, Debug, and legacy worklist (if enabled) show Zelvyn chrome.
6. No investigational-use footer anywhere.
7. No RadView / Voxa / stock OHIF logo in product chrome.

## Revert

Revert this branch or the ViewerLayout + route files listed above. Brand assets can remain.
