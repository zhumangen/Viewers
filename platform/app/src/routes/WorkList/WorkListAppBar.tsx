import React, { useCallback, useEffect, useState } from 'react';
import { Icons, Button, Input } from '@ohif/ui-next';
import { ProductBrand } from '../../components/ProductBrand';

type WorkListAppBarProps = {
  /** Current free-text search (patient / MRN / accession / description proxy). */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Optional right-side actions (upload, datasource config). */
  rightActions?: React.ReactNode;
};

/**
 * Top app bar for Study List — brand left, prominent search center, stubs right.
 * Matches mockup 02 chrome without changing query plumbing beyond patientName filter.
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

  return (
    <header className="bg-card border-border z-20 flex h-12 shrink-0 items-center gap-3 border-b px-3">
      <div className="flex min-w-[120px] shrink-0 items-center">
        <ProductBrand variant="full" />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 items-center">
        <div className="bg-input border-border/80 relative flex h-9 w-full items-center rounded-full border px-3">
          <Icons.Search className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
          <Input
            value={local}
            onChange={e => setLocal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                commit();
              }
            }}
            onBlur={commit}
            placeholder="Search patients, MRN, accession, or description…"
            className="placeholder:text-muted-foreground h-8 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            aria-label="Search studies"
          />
          <kbd className="text-muted-foreground pointer-events-none ml-2 hidden rounded border border-[color:var(--border-subtle)] px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {rightActions}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8"
          aria-label="Notifications"
          type="button"
        >
          <Icons.NotificationInfo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8"
          aria-label="Help"
          type="button"
        >
          <Icons.Info className="h-4 w-4" />
        </Button>
        <div
          className="border-border ml-1 flex items-center gap-2 rounded-full border py-0.5 pl-0.5 pr-2"
          title="User (stub — no auth)"
        >
          <span className="bg-primary/25 text-primary inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold">
            RA
          </span>
          <span className="text-muted-foreground hidden text-xs sm:inline">Radiologist</span>
        </div>
      </div>
    </header>
  );
}

export default WorkListAppBar;
