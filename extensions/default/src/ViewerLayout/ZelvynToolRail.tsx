import React, { useEffect, useMemo, useState } from 'react';
import { useSystem, useToolbar } from '@ohif/core';
import {
  Icons,
  cn,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@ohif/ui-next';
import { ZelvynLayoutPicker } from './ZelvynLayoutPicker';
import { useZelvynChrome } from './ZelvynChromeContext';

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
  badgeCount,
  onBadgeClick,
}: {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
  isActive?: boolean;
  disabledText?: string;
  onClick: () => void;
  badgeCount?: number;
  onBadgeClick?: () => void;
}) {
  return (
    <div className="relative mx-1">
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
          'flex w-full flex-col items-center gap-0.5 rounded-md px-1 py-1.5 transition-colors',
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
      {badgeCount && badgeCount > 0 && onBadgeClick ? (
        <button
          type="button"
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent,#2DD4BF)] px-1 font-mono text-[9px] font-bold text-[color:var(--bg-canvas,#0B0F14)] shadow"
          title="Open measurements"
          aria-label={`Open measurements (${badgeCount})`}
          onClick={e => {
            e.stopPropagation();
            onBadgeClick();
          }}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Labeled left tool rail — primary tools + More overflow (no floating pill).
 * Layout uses ZelvynLayoutPicker; Measurements open as a slide-over drawer.
 */
export function ZelvynToolRail() {
  const { servicesManager } = useSystem();
  const { openMeasurements } = useZelvynChrome();
  const { toolbarButtons, onInteraction } = useToolbar({ buttonSection: 'primary' });
  const { toolbarButtons: moreButtons, onInteraction: onMoreInteraction } = useToolbar({
    buttonSection: 'moreTools',
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [measCount, setMeasCount] = useState(0);
  const measurementService = servicesManager?.services?.measurementService;

  useEffect(() => {
    if (!measurementService) {
      return;
    }
    const refresh = () => {
      try {
        setMeasCount(measurementService.getMeasurements?.()?.length || 0);
      } catch {
        setMeasCount(0);
      }
    };
    refresh();
    const { EVENTS } = measurementService;
    const subs = [
      measurementService.subscribe(EVENTS.MEASUREMENT_ADDED, refresh),
      measurementService.subscribe(EVENTS.RAW_MEASUREMENT_ADDED, refresh),
      measurementService.subscribe(EVENTS.MEASUREMENT_UPDATED, refresh),
      measurementService.subscribe(EVENTS.MEASUREMENT_REMOVED, refresh),
      measurementService.subscribe(EVENTS.MEASUREMENTS_CLEARED, refresh),
    ].filter(Boolean);
    return () => subs.forEach(s => s.unsubscribe?.());
  }, [measurementService]);

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
          badgeCount={item.id === 'Length' ? measCount : undefined}
          onBadgeClick={item.id === 'Length' ? openMeasurements : undefined}
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
            className="max-h-[70vh] min-w-[240px] overflow-y-auto border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] text-[color:var(--text-primary,#E8EEF4)]"
          >
            <DropdownMenuItem
              onSelect={() => openMeasurements()}
              className="flex items-center gap-2"
              data-cy="zelvyn-open-measurements"
            >
              <Icons.ByName
                name="tool-length"
                className="h-4 w-4"
              />
              <span className="flex-1">Measurements</span>
              {measCount > 0 ? (
                <span className="rounded-full bg-[color:var(--accent,#2DD4BF)]/20 px-1.5 font-mono text-[10px] text-[color:var(--accent,#2DD4BF)]">
                  {measCount}
                </span>
              ) : null}
            </DropdownMenuItem>

            {moreButtons.map((toolDef: any) => {
              if (!toolDef) {
                return null;
              }
              const { id, Component, componentProps } = toolDef;

              // Inline Zelvyn layout picker (replaces stock LayoutSelector chrome)
              if (id === 'Layout') {
                return (
                  <div
                    key={id}
                    className="my-1 border-y border-[color:var(--border-subtle,#1E2A36)]"
                    data-cy="Layout"
                  >
                    <ZelvynLayoutPicker
                      className="w-full max-w-[240px]"
                      onAfterSelect={() => setMoreOpen(false)}
                    />
                  </div>
                );
              }

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
