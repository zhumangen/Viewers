import React from 'react';
import { useToolbar } from '@ohif/core';
import { IconPresentationProvider, ToolButton } from '@ohif/ui-next';
import { Toolbar } from '../Toolbar/Toolbar';

/**
 * Dense left vertical tool rail — primary Cornerstone tools.
 * Distinct from stock OHIF horizontal Header toolbar.
 */
export function ZelvynToolRail() {
  const { toolbarButtons } = useToolbar({ buttonSection: 'primary' });

  if (!toolbarButtons?.length) {
    return null;
  }

  return (
    <aside
      className="zelvyn-tool-rail relative z-20 flex w-[56px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-sidebar,#0E141B)] py-2"
      data-chrome="zelvyn-tool-rail"
      aria-label="Viewer tools"
    >
      <IconPresentationProvider
        size="large"
        IconContainer={ToolButton}
      >
        <div className="flex w-full flex-col items-center gap-1 px-1">
          <Toolbar buttonSection="primary" />
        </div>
      </IconPresentationProvider>
    </aside>
  );
}

export default ZelvynToolRail;
