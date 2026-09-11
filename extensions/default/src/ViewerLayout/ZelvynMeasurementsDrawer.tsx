import React, { useEffect, useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import { Icons, cn } from '@ohif/ui-next';
import { useZelvynChrome } from './ZelvynChromeContext';

const PANEL_ID = '@ohif/extension-cornerstone.panelModule.panelMeasurement';
/** Fixed dock width — takes flex space; never paints over the viewport. */
export const MEASUREMENTS_DOCK_WIDTH_PX = 320;

/**
 * Docked measurement list — real OHIF PanelMeasurement.
 * Renders as an in-flow flex column (not absolute overlay) so the viewport
 * grid shrinks and its teal active border stays fully visible.
 */
export function ZelvynMeasurementsDrawer() {
  const { extensionManager, servicesManager } = useSystem();
  const { measurementsOpen, closeMeasurements } = useZelvynChrome();
  const measurementService = servicesManager?.services?.measurementService;
  const [count, setCount] = useState(0);

  const Panel = useMemo(() => {
    try {
      const entry = extensionManager.getModuleEntry(PANEL_ID);
      return entry?.component || null;
    } catch {
      return null;
    }
  }, [extensionManager]);

  useEffect(() => {
    if (!measurementService) {
      return;
    }
    const refresh = () => {
      try {
        setCount(measurementService.getMeasurements?.()?.length || 0);
      } catch {
        setCount(0);
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

  if (!measurementsOpen) {
    return null;
  }

  return (
    <aside
      className={cn(
        'zelvyn-measurements-dock flex h-full shrink-0 flex-col overflow-hidden',
        'border-l border-[color:var(--border-subtle,#1E2A36)]',
        'bg-[color:var(--bg-sidebar,#0E141B)]'
      )}
      style={{ width: MEASUREMENTS_DOCK_WIDTH_PX }}
      role="region"
      aria-label="Measurements"
      data-chrome="zelvyn-measurements-drawer"
      data-docked="true"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--border-subtle,#1E2A36)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[13px] font-semibold text-[color:var(--text-primary,#E8EEF4)]">
            Measurements
          </span>
          {count > 0 ? (
            <span className="rounded-full bg-[color:var(--accent,#2DD4BF)]/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[color:var(--accent,#2DD4BF)]">
              {count}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--text-secondary,#9AA8B6)] hover:bg-white/5 hover:text-[color:var(--accent,#2DD4BF)]"
          aria-label="Close measurements"
          onClick={closeMeasurements}
        >
          <Icons.Close className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {Panel ? (
          <Panel />
        ) : (
          <div className="px-3 py-6 text-center text-[12px] text-[color:var(--text-muted,#6B7A8A)]">
            Measurement panel unavailable
          </div>
        )}
      </div>
    </aside>
  );
}

export default ZelvynMeasurementsDrawer;
