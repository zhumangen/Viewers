import * as React from 'react';

export function PreviewHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-3"
      data-chrome="zelvyn-study-preview-header"
    >
      <div className="flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-[color:var(--accent,#2DD4BF)]" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide text-[color:var(--text-primary,#E8EEF4)]">
          Study Preview
        </h2>
      </div>
      <div className="flex items-center justify-end gap-1">{children}</div>
    </div>
  );
}
