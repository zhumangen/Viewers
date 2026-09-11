# Zelvyn product shell redesign

> **Brand:** **Zelvyn** (temporary pick — easy to rename later).
> Rejected names: RadView, Voxa — do not ship those strings or wire `assets/radview` / `assets/voxa`.
> Logos: `platform/app/public/assets/zelvyn/logo-mark.png`, `logo-wordmark.png`.

Structural chrome beyond Phase 0–3 token skinning. Clinical data / mode / measurement
logic is unchanged.

## Goals (visible vs stock OHIF)

1. **Brand slot** — Header / WorkList / Viewer use `whiteLabeling.createLogoComponentFn`
   or `ProductBrand` with Zelvyn mark/wordmark (not OHIF logos).
2. **Study List shell** closer to mockup `02-study-list.png`:
   - Top app bar: brand | prominent search | user/action stubs
   - Filter chips row reflecting active ColumnFiltersState
   - Dense table + Study Preview drawer (Phase 1) kept
   - Investigational banner minimized (legal text retained)
3. **Viewer shell** closer to mockup `03-viewer-shell.png`:
   - Header brand via whiteLabeling; compact teal-active toolbar (Phase 2)
4. Document how to revert brand wiring (below).

## What changed (structural)

| Area | Change |
|------|--------|
| WorkList app bar | `WorkListAppBar.tsx` — brand left, search → patient filter, stubs right |
| Filter chips | `WorkListFilterChips.tsx` — chrome chips for modality/date/text filters |
| WorkList route | `WorkList.tsx` — composes app bar + chips above StudyList |
| Brand component | `ProductBrand.tsx` — Zelvyn mark/wordmark lockup |
| whiteLabeling | `config/default.js`, `config/dev.js` — Zelvyn wordmark logo fn |
| Investigational | Quieter bottom banner; required investigational wording kept |
| Document title | HTML templates / manifest → **Zelvyn** |
| Viewer About | Default About modal title softened (no hard-coded OHIF product name) |

## Key files

- `platform/app/src/components/ProductBrand.tsx`
- `platform/app/src/routes/WorkList/WorkList.tsx`
- `platform/app/src/routes/WorkList/WorkListAppBar.tsx`
- `platform/app/src/routes/WorkList/WorkListFilterChips.tsx`
- `platform/app/public/config/{default,dev}.js` (`whiteLabeling`)
- `platform/app/public/assets/zelvyn/`
- `platform/ui-next/.../InvestigationalUseDialog.tsx`
- `platform/ui-next/.../Header/Header.tsx` (consumes `WhiteLabeling`)
- `extensions/default/src/ViewerLayout/ViewerHeader.tsx`

## How to rename the brand later

1. Copy/replace assets under `platform/app/public/assets/<brand>/`.
2. Update `BRAND_NAME` / logo paths in `ProductBrand.tsx`.
3. Update `whiteLabeling.createLogoComponentFn` in configs.
4. Set HTML `<title>`, `application-name`, manifest `name`/`short_name`.
5. Rename this doc and branch (`ui/<brand>-shell`).

## How to revert brand / shell chrome

- **Brand only:** remove `whiteLabeling` from configs; Header/WorkList fall back to OHIF logos if `ProductBrand` is not used.
- **Shell chrome:** revert WorkList app bar/chips composition; restore prior `toolbarLeftComponent={OHIF logo}` in `WorkList.tsx`.
- Investigational: restore prior banner markup in `InvestigationalUseDialog.tsx`.

## Verify

```bash
cd /workspace/ohif-worktree
pnpm run dev
```

1. WorkList: top bar shows Zelvyn wordmark (not OHIF); search commits to patient filter; chips appear for active filters.
2. Investigational banner is compact; confirm/hide still works.
3. Open a study: Viewer header shows Zelvyn via whiteLabeling; teal tool active states still work (Phase 2).
4. No RadView / Voxa / TEMP_BRAND / 「待定」 strings in UI chrome.
