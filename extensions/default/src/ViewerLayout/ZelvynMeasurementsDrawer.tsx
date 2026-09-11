import React, { useEffect, useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import { Icons, cn } from '@ohif/ui-next';
import { useZelvynChrome } from './ZelvynChromeContext';

const PANEL_ID = '@ohif/extension-cornerstone.panelModule.panelMeasurement';

/**
 * Slide-over measurement list — real OHIF PanelMeasurement, without
 * restoring Seg·Measure SidePanel tabs beside Series.
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
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-40 flex justify-end"
      data-chrome="zelvyn-measurements-drawer-host"
    >
      {/* Scrim over viewport only — Series stays visible underneath when drawer is narrower */}
      <button
        type="button"
        aria-label="Close measurements"
        className="pointer-events-auto absolute inset-0 bg-black/35"
        onClick={closeMeasurements}
      />
      <aside
        className={cn(
          'pointer-events-auto relative flex h-full w-[min(340px,92vw)] flex-col',
          'border-l border-[color:var(--border-subtle,#1E2A36)]',
          'bg-[color:var(--bg-sidebar,#0E141B)] shadow-[-8px_0_24px_rgba(0,0,0,0.45)]'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Measurements"
        data-chrome="zelvyn-measurements-drawer"
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
            aria-label="Close"
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
    </div>
  );
}

export default ZelvynMeasurementsDrawer;
