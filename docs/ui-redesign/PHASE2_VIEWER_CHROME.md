# Phase 2 — Viewer chrome

Restyles the Viewer shell (Header / Toolbar / SidePanels / Viewport grid chrome)
to match [`DESIGN.md` §4](./DESIGN.md) and mockup `mockups/03-viewer-shell.png`,
without changing Cornerstone tools, hanging protocols, or mode logic.

Depends on **Phase 0** design tokens and stacks on **Phase 1** Study List
(`ui/phase1-study-list`).

## What changed

| Area | Skin behavior |
|------|----------------|
| **Top Header / NavBar** | Elevated `bg-card` bar with subtle bottom border; compact **40px** height; quieter separators and settings control. |
| **Toolbar / ToolButton** | Slightly smaller default hit targets (`w-9 h-9`); muted idle icons; **teal outline** active/toggled states via Phase 0 `highlight` / `accent` tokens. |
| **Left / Right SidePanel** | Sidebar surface (`bg-bkg-med`); clearer side + header borders; quieter tab wash. |
| **Study browser panel** | Sidebar surface; compact 40px settings/header row. |
| **Viewport grid chrome** | Active viewport **2px** `--viewport-active` outline; inactive `--viewport-inactive` border; pane chrome uses `--viewport-chrome`. |
| **Series thumbnails** | Active series gets inset teal ring (selected series cue). |
| **Viewport action bar / overlays** | Denser muted meta text; overlays use high-contrast light text (not teal fill). |
| **Layout height** | Main row uses `calc(100vh - 40px)` to match compact header. |

No new UI libraries. Toolbar button registration, panel service, and viewport
activation behavior are unchanged — chrome only.

> **Note:** The mockup shows a vertical left toolbar; OHIF keeps tools in the
> top Header (existing interaction model). Phase 2 skins that chrome in place.

## Key files

| File | Role |
|------|------|
| `platform/ui-next/src/components/Header/Header.tsx` | Compact 40px header shell |
| `platform/ui-next/src/components/NavBar/NavBar.tsx` | Elevated dark bar + border |
| `platform/ui-next/src/components/ToolButton/ToolButton.tsx` | Compact + teal active outline |
| `platform/ui-next/src/components/ToolButton/ToolButtonList.tsx` | Matching dropdown / divider |
| `platform/ui-next/src/components/SidePanel/SidePanel.tsx` | Sidebar surface + borders |
| `platform/ui-next/src/components/Viewport/ViewportPane.tsx` | Active / inactive viewport outline |
| `platform/ui-next/src/components/Viewport/ViewportActionBar.tsx` | Denser muted status strip |
| `platform/ui-next/src/components/Viewport/ViewportOverlay.{tsx,css}` | Quieter overlay typography |
| `platform/ui-next/src/components/StudyBrowser/StudyBrowser.tsx` | Sidebar panel surface |
| `platform/ui-next/src/components/Thumbnail/Thumbnail.tsx` | Active series teal ring |
| `platform/ui-next/src/components/PanelSection/PanelSection.tsx` | Sidebar-aligned section headers |
| `platform/ui-next/tailwind.config.js` | `viewport.chrome/active/inactive` utilities |
| `extensions/default/src/ViewerLayout/index.tsx` | Header height sync |
| `extensions/default/src/ViewerLayout/ViewerHeader.tsx` | Tighter tool gap |
| `extensions/default/src/ViewerLayout/HeaderPatientInfo/HeaderPatientInfo.tsx` | Denser patient meta |
| `extensions/default/src/Panels/StudyBrowser/PanelStudyBrowserHeader.tsx` | Sidebar header chrome |
| `extensions/default/src/Toolbar/ToolbarDivider.tsx` | Muted divider |

## How to verify

```bash
cd /workspace/ohif-worktree
pnpm run dev
```

1. Open WorkList → open a study into the Viewer (Basic mode).
2. Confirm top bar is compact (~40px), elevated dark, with patient/mode/tools.
3. Activate a tool → teal outline/active state (not legacy blue fill).
4. Confirm left/right panels read as sidebar surface with clearer edges.
5. Multi-viewport layout → active pane has teal outline; inactive panes have subtle borders.
6. Series list: active series shows teal ring / highlight cue.
7. Tools, layout switcher, hanging protocols, and panel collapse still work as before.
