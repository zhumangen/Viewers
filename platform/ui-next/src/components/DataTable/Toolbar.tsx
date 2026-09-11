import * as React from 'react';

export function Toolbar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex shrink-0 items-center justify-center border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] py-2">
      {children}
    </div>
  );
}
