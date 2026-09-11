import * as React from 'react';

export function PreviewHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="border-border/60 bg-bkg-med sticky top-0 z-10 flex h-10 shrink-0 items-center justify-between gap-2 border-b px-3">
      <h2 className="text-foreground text-base font-semibold leading-none">Study Preview</h2>
      <div className="flex items-center justify-end gap-1">{children}</div>
    </div>
  );
}
