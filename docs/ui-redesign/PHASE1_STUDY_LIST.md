# Phase 1 — Study List (WorkList) skin

Restyles the existing WorkList / `@ohif/ui-next` `StudyList` to match
[`DESIGN.md` §3](./DESIGN.md) and mockup `mockups/02-study-list.png`, without
changing DICOM query logic, URL sync, or data sources.

Depends on **Phase 0** design tokens (`ui/phase0-design-tokens`).

## What changed

| Area | Skin behavior |
|------|----------------|
| **Shell** | WorkList root uses `bg-background` (canvas) instead of pure black. |
| **Sticky filter bar** | DataTable toolbar + header/filter block use elevated `bg-card`, sticky, with subtle border. Reset → **Clear** (teal). |
| **Dense table** | Slightly tighter head/cell padding (`h-9`, `py-1.5`); row height ~clinical. |
| **Selected / hover** | Rows use `--bg-row-selected` / `--bg-row-hover` with a teal inset left bar on selection. |
| **Modality** | Tokens rendered as teal `Badge` pills; MRN uses muted mono; Patient is medium weight. |
| **SidePanelPreview** | Sidebar surface (`bg-bkg-med`), left border, sticky **Study Preview** header, denser patient/workflow cards, modality chips in series list. |
| **Empty / loading** | Centered empty state with search icon + Study List hint; loading keeps filter/header and centers the indicator. |

No new UI libraries. Query hooks (`useStudyListQuery` / `useStudyListStateSync`) untouched.

## Key files

| File | Role |
|------|------|
| `platform/app/src/routes/WorkList/WorkList.tsx` | Route shell canvas + preview width ≈ 320px |
| `platform/ui-next/src/components/StudyList/components/{Layout,Table,Preview*}.tsx` | StudyList layout, table chrome, preview drawer |
| `platform/ui-next/src/components/StudyList/columns/defaultColumns.tsx` | Modality badges / patient / MRN presentation |
| `platform/ui-next/src/components/DataTable/{DataTable,Toolbar,FilterRow,Title}.tsx` | Sticky elevated filter bar, empty/loading |
| `platform/ui-next/src/components/Table/Table.tsx` | Shared row hover/selected + density |
| `platform/ui-next/tailwind.config.js` | `bg-row-hover` / `bg-row-selected` utilities |

## How to verify

```bash
cd /workspace/ohif-worktree
pnpm run dev
```

1. Open WorkList (default study list route).
2. Confirm elevated sticky filter/header bar on canvas background.
3. Select a row → teal tint + left accent bar; hover is subtle teal wash.
4. Modalities show teal pills; open preview drawer → sidebar styling + “Study Preview”.
5. Clear filters / empty result → icon + “No studies available” hint (filters remain usable).
6. Loading should not wipe the filter bar.
