import React, { useMemo } from 'react';
import { useToolbar } from '@ohif/core';
import { Icons, cn } from '@ohif/ui-next';

/** Design mockup rail order + visible labels (Window/Level style). */
const RAIL_TOOLS: { id: string; label: string }[] = [
  { id: 'WindowLevel', label: 'Window/Level' },
  { id: 'Pan', label: 'Pan' },
  { id: 'Zoom', label: 'Zoom' },
  { id: 'Length', label: 'Length' },
  { id: 'Angle', label: 'Angle' },
  { id: 'Probe', label: 'Probe' },
];

/**
 * Labeled left tool rail — primary Cornerstone tools wired through OHIF toolbarService.
 * Matches viewer-design.png: icon + caption, teal active border.
 */
export function ZelvynToolRail() {
  const { toolbarButtons, onInteraction } = useToolbar({ buttonSection: 'primary' });

  const byId = useMemo(() => {
    const map = new Map<string, any>();
    (toolbarButtons || []).forEach((b: any) => {
      if (b?.id) {
        map.set(b.id, b);
      }
    });
    return map;
  }, [toolbarButtons]);

  const items = RAIL_TOOLS.map(spec => {
    const def = byId.get(spec.id);
    if (!def) {
      return null;
    }
    const props = def.componentProps || {};
    return {
      id: spec.id,
      label: spec.label,
      icon: props.icon || 'MissingIcon',
      disabled: !!props.disabled,
      isActive: !!props.isActive,
      disabledText: props.disabledText,
      commands: props.commands,
    };
  }).filter(Boolean);

  if (!items.length) {
    return null;
  }

  return (
    <aside
      className="zelvyn-tool-rail relative z-20 flex w-[72px] shrink-0 flex-col items-stretch gap-1 overflow-y-auto border-r border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-sidebar,#0E141B)] py-2"
      data-chrome="zelvyn-tool-rail"
      aria-label="Viewer tools"
    >
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          data-cy={item.id}
          data-tool={item.id}
          data-active={item.isActive}
          disabled={item.disabled}
          title={item.disabled ? item.disabledText || item.label : item.label}
          aria-label={item.label}
          aria-pressed={item.isActive}
          className={cn(
            'mx-1 flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 transition-colors',
            'text-[color:var(--text-secondary,#9AA8B6)] hover:bg-white/5 hover:text-[color:var(--text-primary,#E8EEF4)]',
            item.isActive &&
              'bg-[color:var(--accent,#2DD4BF)]/10 text-[color:var(--accent,#2DD4BF)] ring-1 ring-inset ring-[color:var(--accent,#2DD4BF)]',
            item.disabled && 'cursor-not-allowed opacity-40'
          )}
          onClick={() => {
            if (!item.disabled) {
              onInteraction({ itemId: item.id, commands: item.commands });
            }
          }}
        >
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-[4px]',
              item.isActive && 'ring-1 ring-[color:var(--accent,#2DD4BF)]'
            )}
          >
            <Icons.ByName
              name={item.icon}
              className="h-4 w-4"
            />
          </span>
          <span className="max-w-full truncate text-center text-[9px] font-medium leading-tight tracking-tight">
            {item.label}
          </span>
        </button>
      ))}
    </aside>
  );
}

export default ZelvynToolRail;
