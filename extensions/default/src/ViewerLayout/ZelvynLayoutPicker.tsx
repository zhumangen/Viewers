import React, { useCallback, useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import { useViewportGrid, cn } from '@ohif/ui-next';

type LayoutPreset = {
  label: string;
  numRows: number;
  numCols: number;
};

const PRESETS: LayoutPreset[] = [
  { label: '1×1', numRows: 1, numCols: 1 },
  { label: '1×2', numRows: 1, numCols: 2 },
  { label: '2×2', numRows: 2, numCols: 2 },
  { label: '2×3', numRows: 2, numCols: 3 },
  { label: '3×3', numRows: 3, numCols: 3 },
];

function MiniGrid({
  rows,
  cols,
  active,
  dense = false,
}: {
  rows: number;
  cols: number;
  active?: boolean;
  dense?: boolean;
}) {
  const cell = dense ? 7 : 9;
  const gap = dense ? 1 : 2;
  return (
    <div
      className={cn(
        'grid rounded-[3px] p-0.5',
        active
          ? 'ring-1 ring-[color:var(--accent,#2DD4BF)]'
          : 'ring-1 ring-[color:var(--border-strong,#2A3A4A)]'
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gridTemplateRows: `repeat(${rows}, ${cell}px)`,
        gap,
      }}
      aria-hidden
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'rounded-[1px]',
            active
              ? 'bg-[color:var(--accent,#2DD4BF)]'
              : 'bg-[color:var(--border-strong,#2A3A4A)]'
          )}
        />
      ))}
    </div>
  );
}

type ZelvynLayoutPickerProps = {
  className?: string;
  onAfterSelect?: () => void;
  /** Show hover grid for custom rows×cols */
  showCustomGrid?: boolean;
};

/**
 * Dense dark/teal layout picker — presets + optional hover grid.
 * Used by header monitor menu and More → Layout (replaces stock LayoutSelector look).
 */
export function ZelvynLayoutPicker({
  className,
  onAfterSelect,
  showCustomGrid = true,
}: ZelvynLayoutPickerProps) {
  const { commandsManager } = useSystem();
  const [{ layout }] = useViewportGrid();
  const curRows = layout?.numRows ?? 1;
  const curCols = layout?.numCols ?? 1;

  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);
  const gridRows = 3;
  const gridCols = 4;
  const hoverX = hoverIndex !== undefined ? hoverIndex % gridCols : -1;
  const hoverY = hoverIndex !== undefined ? Math.floor(hoverIndex / gridCols) : -1;

  const apply = useCallback(
    (numRows: number, numCols: number) => {
      commandsManager.run('setViewportGridLayout', { numRows, numCols });
      onAfterSelect?.();
    },
    [commandsManager, onAfterSelect]
  );

  const presets = useMemo(() => PRESETS, []);

  return (
    <div
      className={cn(
        'zelvyn-layout-picker flex flex-col gap-2.5 p-2.5',
        'bg-[color:var(--bg-elevated,#12181F)] text-[color:var(--text-primary,#E8EEF4)]',
        className
      )}
      data-chrome="zelvyn-layout-picker"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted,#6B7A8A)]">
        Layout
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map(preset => {
          const active = preset.numRows === curRows && preset.numCols === curCols;
          return (
            <button
              key={preset.label}
              type="button"
              data-cy={`zelvyn-layout-${preset.numCols}-${preset.numRows}`}
              title={preset.label}
              aria-pressed={active}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-1.5 py-1.5 transition-colors',
                'hover:bg-white/5',
                active && 'bg-[color:var(--accent,#2DD4BF)]/10'
              )}
              onClick={() => apply(preset.numRows, preset.numCols)}
            >
              <MiniGrid
                rows={preset.numRows}
                cols={preset.numCols}
                active={active}
              />
              <span
                className={cn(
                  'font-mono text-[10px] tabular-nums',
                  active
                    ? 'text-[color:var(--accent,#2DD4BF)]'
                    : 'text-[color:var(--text-secondary,#9AA8B6)]'
                )}
              >
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {showCustomGrid ? (
        <>
          <div className="h-px w-full bg-[color:var(--border-subtle,#1E2A36)]" />
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted,#6B7A8A)]">
            Custom
          </div>
          <div
            className="inline-grid gap-[3px] self-start rounded-md border border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-sidebar,#0E141B)] p-1.5"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, 18px)`,
              gridTemplateRows: `repeat(${gridRows}, 18px)`,
            }}
            onMouseLeave={() => setHoverIndex(undefined)}
          >
            {Array.from({ length: gridRows * gridCols }).map((_, index) => {
              const x = index % gridCols;
              const y = Math.floor(index / gridCols);
              const lit = hoverIndex !== undefined && x <= hoverX && y <= hoverY;
              return (
                <button
                  key={index}
                  type="button"
                  data-cy={`Layout-${x}-${y}`}
                  className={cn(
                    'rounded-[2px] transition-colors',
                    lit
                      ? 'bg-[color:var(--accent,#2DD4BF)]'
                      : 'bg-[color:var(--border-strong,#2A3A4A)] hover:bg-[color:var(--accent,#2DD4BF)]/50'
                  )}
                  onMouseEnter={() => setHoverIndex(index)}
                  onClick={() => apply(y + 1, x + 1)}
                  aria-label={`${y + 1} by ${x + 1} layout`}
                />
              );
            })}
          </div>
          <p className="text-[10px] leading-snug text-[color:var(--text-muted,#6B7A8A)]">
            Hover to select rows × columns · click to apply
          </p>
        </>
      ) : null}
    </div>
  );
}

export default ZelvynLayoutPicker;
