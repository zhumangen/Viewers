# Phase 0 — Design Token → CSS / Tailwind Map

Canonical design tokens: [`DESIGN.md` §2](./DESIGN.md).  
Canonical runtime defaults: `platform/ui-next/src/tailwind.css` (`:root`, no `.theme-*` class).

Theme presets in `platform/ui-next/src/themes/themes.css` still override `:root` when a `.theme-*` body class is applied; Phase 0 only changes the **default** reading-room theme.

## Color roles

| Design token | Value | CSS variable(s) | Consumed by |
|--------------|-------|-----------------|-------------|
| `--bg-canvas` | `#0B0F14` | `--bg-canvas`; `--background` → `213 29% 6%` | `bg-background`, `bkg-low` |
| `--bg-elevated` | `#12181F` | `--bg-elevated`; `--card` / `--popover` → `212 27% 10%` | `bg-card`, `bg-popover`, `bkg-full` |
| `--bg-sidebar` | `#0E141B` | `--bg-sidebar`; `--muted` → `212 32% 8%` | `bg-muted`, `bkg-med` |
| `--bg-row-hover` | `rgba(94, 234, 212, 0.06)` | `--bg-row-hover` | `bg-row-hover` (Phase 1 Study List) |
| `--bg-row-selected` | `rgba(45, 212, 191, 0.12)` | `--bg-row-selected` | `bg-row-selected` (Phase 1 Study List) |
| `--bg-input` | `#161E27` | `--bg-input`; `--input` → `212 28% 12%` | `bg-input` / `border-input` |
| `--border-subtle` | `#1E2A36` | `--border-subtle`; `--border` → `210 29% 16%` | `border-border` |
| `--border-strong` | `#2A3A4A` | `--border-strong`; `--neutral-dark` / `--secondary` | Secondary surfaces |
| `--border-focus` | `#2DD4BF` | `--border-focus`; `--ring` → `172 66% 50%` | `ring-ring`, focus rings |
| `--text-primary` | `#E8EEF4` | `--text-primary`; `--foreground` → `210 35% 93%` | `text-foreground` |
| `--text-secondary` | `#9AA8B6` | `--text-secondary`; `--muted-foreground` / `--neutral` | `text-muted-foreground` |
| `--text-muted` | `#6B7A8A` | `--text-muted` | Placeholders / disabled (legacy `common.dark`) |
| `--text-inverse` | `#0B0F14` | `--text-inverse`; `--primary-foreground` | `text-primary-foreground` |
| `--accent` | `#2DD4BF` | `--accent-color` *(hex)*; `--primary` / `--highlight` / `--ring` *(HSL)* | `bg-primary`, `text-primary`, `bg-highlight`, buttons / active tools |
| `--accent-muted` | `rgba(45, 212, 191, 0.18)` | `--accent-muted`; shadcn `--accent` → `172 40% 14%` | Chip / hover surfaces (`bg-accent`) |
| `--accent-hover` | `#5EEAD4` | `--accent-hover` | `actions-highlight`, legacy `primary.light` |
| `--success` | `#34D399` | `--success`; `--success-hsl` / `--success-text` | `text-success`, status helpers |
| `--warn` | `#FBBF24` | `--warn`; `--warn-hsl` / `--warning-text` | `text-warn`, status helpers |
| `--danger` | `#F87171` | `--danger`; `--danger-hsl`; `--destructive` → `0 72% 55%` | `bg-destructive`, `text-danger` |
| `--info` | `#38BDF8` | `--info`; `--info-hsl` / `--info-text` | Status helpers |
| `--viewport-chrome` | `#0A0E12` | `--viewport-chrome` | Future viewport chrome |
| `--viewport-active` | `#2DD4BF` | `--viewport-active` (= accent) | Future active viewport border |
| `--viewport-inactive` | `#1A2430` | `--viewport-inactive` | Future inactive viewport border |
| `--overlay-scrim` | `rgba(0,0,0,0.55)` | `--overlay-scrim` | Dialogs / drawers |
| `--scrollbar` | `#2A3A4A` | `--scrollbar` | Scrollbars |

> **Naming note:** Design `--accent` is the brand teal. The existing shadcn token `--accent` means a *muted surface* (hover/chip). Brand teal is wired to `--primary`, `--highlight`, and `--ring`, and exposed as hex `--accent-color`.

## Files touched (Phase 0)

| File | Role |
|------|------|
| `platform/ui-next/src/tailwind.css` | Default `:root` / `.dark` tokens (source of truth) |
| `platform/ui-next/tailwind.config.js` | Maps CSS vars → Tailwind (`bkg`, `actions`, `success` / `warn` / `danger`) |
| `platform/ui-next/src/themes/themes.css` | Comment only — presets unchanged |
| `platform/ui/tailwind.config.js` | Legacy `@ohif/ui` hardcoded blues → reading-room teal/surfaces |
| `platform/ui/src/tailwind.css` | Legacy `:root` mirror (app loads ui-next via `ThemeWrapper`) |

## How to verify

```bash
cd /workspace/ohif-worktree
pnpm run dev
```

1. Open the Viewer (default theme — no `?theme=` / no theme switcher override).
2. Confirm canvas / shell backgrounds read as near-black cold gray (`#0B0F14`), not pure OHIF blue-black.
3. Primary buttons, links, focus rings, and active tool highlights should be teal (`#2DD4BF`), not blue (`#348CFD`).
4. Optional: `?theme=arctic` (etc.) still overrides via `.theme-*` classes.

Typography, spacing, radius, and layout redesigns are **out of scope** for Phase 0 (see later phases in `SUMMARY.md`).
