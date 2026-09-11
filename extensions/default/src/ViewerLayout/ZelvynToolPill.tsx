import React from 'react';
import { useToolbar } from '@ohif/core';
import { IconPresentationProvider, ToolButton } from '@ohif/ui-next';
import { Toolbar } from '../Toolbar/Toolbar';

/**
 * Floating bottom/center pill bar for secondary tools (layout, etc.).
 * Hidden when the secondary section has no buttons.
 */
export function ZelvynToolPill() {
  const { toolbarButtons } = useToolbar({ buttonSection: 'secondary' });

  if (!toolbarButtons?.length) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center"
      data-chrome="zelvyn-tool-pill"
    >
      <div className="pointer-events-auto flex max-w-[90%] items-center gap-0.5 overflow-x-auto rounded-full border border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-elevated,#12181F)]/95 px-2 py-1 shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-sm">
        <IconPresentationProvider
          size="large"
          IconContainer={ToolButton}
        >
          <div className="flex items-center gap-0.5">
            <Toolbar buttonSection="secondary" />
          </div>
        </IconPresentationProvider>
      </div>
    </div>
  );
}

export default ZelvynToolPill;
