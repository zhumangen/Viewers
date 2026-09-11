import React, { useMemo, useState } from 'react';
import { useToolbar } from '@ohif/core';
import {
  Icons,
  cn,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@ohif/ui-next';

/** Design mockup rail order + visible labels. */
const RAIL_TOOLS: { id: string; label: string }[] = [
  { id: 'WindowLevel', label: 'Window/Level' },
  { id: 'Pan', label: 'Pan' },
  { id: 'Zoom', label: 'Zoom' },
  { id: 'Length', label: 'Length' },
  { id: 'Angle', label: 'Angle' },
  { id: 'Probe', label: 'Probe' },
];

function RailButton({
  id,
  label,
  icon,
  disabled,
  isActive,
  disabledText,
  onClick,
}: {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
  isActive?: boolean;
  disabledText?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-cy={id}
      data-tool={id}
      data-active={!!isActive}
      disabled={disabled}
      title={disabled ? disabledText || label : label}
      aria-label={label}
      aria-pressed={!!isActive}
      className={cn(
        'mx-1 flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 transition-colors',
        'text-[color:var(--text-secondary,#9AA8B6)] hover:bg-white/5 hover:text-[color:var(--text-primary,#E8EEF4)]',
        isActive &&
          'bg-[color:var(--accent,#2DD4BF)]/10 text-[color:var(--accent,#2DD4BF)] ring-1 ring-inset ring-[color:var(--accent,#2DD4BF)]',
        disabled && 'cursor-not-allowed opacity-40'
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-[4px]',
          isActive && 'ring-1 ring-[color:var(--accent,#2DD4BF)]'
        )}
      >
        <Icons.ByName
          name={icon}
          className="h-4 w-4"
        />
      </span>
      <span className="max-w-full truncate text-center text-[9px] font-medium leading-tight tracking-tight">
        {label}
      </span>
    </button>
  );
}

/**
 * Labeled left tool rail — primary Cornerstone tools + More overflow (no floating pill).
 */
export function ZelvynToolRail() {
  const { toolbarButtons, onInteraction } = useToolbar({ buttonSection: 'primary' });
  const { toolbarButtons: moreButtons, onInteraction: onMoreInteraction } = useToolbar({
    buttonSection: 'moreTools',
  });
  const [moreOpen, setMoreOpen] = useState(false);

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
        <RailButton
          key={item.id}
          {...item}
          onClick={() => {
            if (!item.disabled) {
              onInteraction({ itemId: item.id, commands: item.commands });
            }
          }}
        />
      ))}

      {moreButtons?.length ? (
        <DropdownMenu
          open={moreOpen}
          onOpenChange={setMoreOpen}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-cy="MoreToolsRail"
              className="mx-1 flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[color:var(--text-secondary,#9AA8B6)] transition-colors hover:bg-white/5 hover:text-[color:var(--text-primary,#E8EEF4)]"
              aria-label="More tools"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[4px]">
                <Icons.More className="h-4 w-4" />
              </span>
              <span className="text-[9px] font-medium leading-tight">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            className="max-h-[70vh] w-56 overflow-y-auto"
          >
            {moreButtons.map((toolDef: any) => {
              if (!toolDef) {
                return null;
              }
              const { id, Component, componentProps } = toolDef;
              // Prefer native toolbar component when present (Layout selector, lists)
              if (Component) {
                return (
                  <div
                    key={id}
                    className="px-1 py-0.5"
                  >
                    <Component
                      id={id}
                      onInteraction={args => {
                        onMoreInteraction({ ...args, itemId: id });
                        setMoreOpen(false);
                      }}
                      {...componentProps}
                    />
                  </div>
                );
              }
              const label = componentProps?.label || id;
              return (
                <DropdownMenuItem
                  key={id}
                  disabled={!!componentProps?.disabled}
                  onSelect={() => {
                    onMoreInteraction({
                      itemId: id,
                      commands: componentProps?.commands,
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  {componentProps?.icon ? (
                    <Icons.ByName
                      name={componentProps.icon}
                      className="h-4 w-4"
                    />
                  ) : null}
                  <span>{label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </aside>
  );
}

export default ZelvynToolRail;
