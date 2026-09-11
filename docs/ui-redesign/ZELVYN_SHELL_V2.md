# Zelvyn shell v2 — aggressive product chrome

> **Brand:** **Zelvyn** · assets `platform/app/public/assets/zelvyn/`  
> Branch: `ui/zelvyn-shell-v2` (from `ui/zelvyn-shell`)  
> Goal: WorkList + Viewer must **not** read as “stock OHIF with a new logo.”

Builds on Phase 0–3 tokens and the timid v1 shell (`ZELVYN_SHELL.md`). Clinical
data / modes / measurements logic is unchanged.

## Intentional layout differences vs stock OHIF

| Area | Stock OHIF | Zelvyn shell v2 |
|------|------------|-----------------|
| **WorkList header** | OHIF logo + sparse actions / legacy header pattern | Distinct **product app bar**: Zelvyn left + Worklist badge, **large centered search** with ⌘K, account cluster right, teal accent rail |
| **Filters** | Column filter row only | **Always-visible modality chips** (CT/MR/PT/US/XR toggles) + **date presets** (7/30 days) + Clear All primary teal button |
| **Study table** | Default row height / muted selection | **Denser rows**, uppercase compact headers, **teal selected wash + 4px left accent**, modality **pills** with per-modality tones |
| **Study Preview** | Generic side panel | Productized drawer: **“Study Preview”** header with teal tick, elevated sidebar surface, dashed empty state, **series list cards** with count badge |
| **Investigational footer** | Persistent OHIF “investigational use” banner + ohif.org link | **Fully removed** — component always returns `null`; configs set `investigationalUseDialog.option = 'never'` |
| **Viewer header** | Flat OHIF chrome | Zelvyn product bar: brand + **Viewer** badge, teal underline rail, tools in inset pill tray |
| **Toolbar / tools** | Larger buttons, purple/blue leftovers | **Denser 32px** tools, **2px teal inset ring** when active |
| **Side panels** | Default OHIF panel wash | Sidebar canvas + **teal active tab underline**, stronger edge borders |
| **Viewport active** | Subtle / legacy blue | **2px teal** outline + soft glow |
| **First-run tour** | Loud Shepherd / purple-primary look | Quieter teal tour chrome, reduced overlay opacity |

## Key files changed

### WorkList
- `platform/app/src/routes/WorkList/WorkList.tsx`
- `platform/app/src/routes/WorkList/WorkListAppBar.tsx`
- `platform/app/src/routes/WorkList/WorkListFilterChips.tsx`
- `platform/app/src/routes/WorkList/SidePanelPreview.tsx`
- `platform/ui-next/.../StudyList/components/Preview{Header,Container,Content,PatientSummary,SeriesList}.tsx`
- `platform/ui-next/.../StudyList/columns/defaultColumns.tsx` (modality pills)
- `platform/ui-next/.../Table/Table.tsx` (density + selection)
- `platform/ui-next/.../DataTable/Toolbar.tsx`

### Viewer
- `platform/ui-next/.../Header/Header.tsx`
- `platform/ui-next/.../NavBar/NavBar.tsx`
- `platform/ui-next/.../ToolButton/ToolButton.tsx`
- `platform/ui-next/.../SidePanel/SidePanel.tsx`
- `platform/ui-next/.../Viewport/ViewportPane.tsx`
- `extensions/default/src/ViewerLayout/{index,ViewerHeader}.tsx`
- `extensions/default/src/ViewerLayout/HeaderPatientInfo/HeaderPatientInfo.tsx`
- `platform/ui-next/.../Onboarding/Onboarding.css`

### Investigational banner kill
- `platform/ui-next/.../InvestigationalUseDialog/InvestigationalUseDialog.tsx` → always `null`
- Removed mount sites: WorkList, LegacyWorkList, ViewerLayout
- `platform/app/public/config/{default,dev,netlify,customization,e2e}.js` → `option: 'never'`

### Global
- `platform/app/src/App.css` — `.zelvyn-shell` helpers

## Verify

```bash
cd /workspace/ohif-worktree
pnpm run dev
```

1. **WorkList** — app bar is clearly Zelvyn (not OHIF header); search is large/centered with ⌘K; CT/MR chips toggle without using only column filters; selected row has teal left accent; Preview drawer says “Study Preview” with card series list / strong empty state.
2. **No investigational footer** on WorkList or Viewer (no OHIF learn-more bar).
3. **Viewer** — header reads as Zelvyn product bar; active tool has teal outline; side panel active tab teal; active viewport teal border.
4. Open a study / measure — modes, DICOM load, measurements still work.
5. No RadView / Voxa strings in chrome.

## Revert notes

- Banner only: restore `InvestigationalUseDialog.tsx` and re-mount in WorkList / ViewerLayout; set config option back.
- Shell chrome: revert this branch / files listed above; brand assets can stay.


## Follow-up: Viewer shell rebuild

See [`ZELVYN_VIEWER_SHELL.md`](./ZELVYN_VIEWER_SHELL.md) (`ui/zelvyn-viewer-shell`) — replaces stock Header/Toolbar composition with `ZelvynViewerChrome` + tool rail/pill.
