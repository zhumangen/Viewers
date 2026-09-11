import * as React from 'react';

export function Toolbar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-card border-border/60 sticky top-0 z-10 flex shrink-0 items-center justify-center border-b py-2.5">
      {children}
    </div>
  );
}
