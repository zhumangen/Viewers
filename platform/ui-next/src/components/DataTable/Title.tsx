import * as React from 'react';

export function Title({ children }: { children?: React.ReactNode }) {
  return <div className="text-foreground text-xl font-semibold tracking-tight">{children}</div>;
}
