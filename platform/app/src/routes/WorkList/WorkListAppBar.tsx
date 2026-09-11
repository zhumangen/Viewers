import React, { useCallback, useEffect, useState } from 'react';
import { Icons, Button, Input } from '@ohif/ui-next';
import { ProductBrand } from '../../components/ProductBrand';

type WorkListAppBarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  rightActions?: React.ReactNode;
};

/**
 * Zelvyn Study List product app bar — brand left, large centered search (⌘K),
 * account cluster right. Intentionally not the stock OHIF header pattern.
 */
export function WorkListAppBar({
  searchValue = '',
  onSearchChange,
  rightActions,
}: WorkListAppBarProps) {
  const [local, setLocal] = useState(searchValue);

  useEffect(() => {
    setLocal(searchValue);
  }, [searchValue]);

  const commit = useCallback(() => {
    onSearchChange?.(local.trim());
  }, [local, onSearchChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('zelvyn-worklist-search') as HTMLInputElement | null;
        el?.focus();
        el?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      className="relative z-30 flex h-14 shrink-0 items-center gap-4 border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-4"
      data-chrome="zelvyn-app-bar"
    >
      {/* Teal accent rail under the bar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[color:var(--accent,#2DD4BF)] to-transparent opacity-80"
        aria-hidden
      />

      <div className="flex min-w-[132px] shrink-0 items-center gap-2">
        <ProductBrand variant="full" />
        <span className="bg-primary/20 text-primary hidden rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider lg:inline">
          Worklist
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center">
        <div className="relative flex h-10 w-full items-center rounded-full border border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-input,#161E27)] px-3.5 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.08)] focus-within:border-[color:var(--accent,#2DD4BF)] focus-within:ring-2 focus-within:ring-[color:var(--accent,#2DD4BF)]/25">
          <Icons.Search className="mr-2.5 h-4 w-4 shrink-0 text-[color:var(--accent,#2DD4BF)]" />
          <Input
            id="zelvyn-worklist-search"
            value={local}
            onChange={e => setLocal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                commit();
              }
            }}
            onBlur={commit}
            placeholder="Search patients, MRN, accession, or description…"
            className="h-9 flex-1 border-0 bg-transparent px-0 text-sm text-[color:var(--text-primary,#E8EEF4)] shadow-none placeholder:text-[color:var(--text-muted,#6B7A8A)] focus-visible:ring-0"
            aria-label="Search studies"
          />
          <kbd className="pointer-events-none ml-2 hidden rounded-md border border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-canvas,#0B0F14)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--text-muted,#6B7A8A)] sm:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {rightActions}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)]"
          aria-label="Notifications"
          type="button"
        >
          <Icons.NotificationInfo className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--accent,#2DD4BF)]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)]"
          aria-label="Help"
          type="button"
        >
          <Icons.Info className="h-4 w-4" />
        </Button>
        <div
          className="ml-1 flex items-center gap-2 rounded-full border border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-input,#161E27)] py-0.5 pl-0.5 pr-2.5"
          title="User (stub — no auth)"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent,#2DD4BF)]/25 text-[11px] font-semibold text-[color:var(--accent,#2DD4BF)]">
            RA
          </span>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-medium text-[color:var(--text-primary,#E8EEF4)]">
              Radiologist
            </span>
            <span className="text-[10px] text-[color:var(--text-muted,#6B7A8A)]">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default WorkListAppBar;
