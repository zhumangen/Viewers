import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import { useViewportGrid, Icons, cn } from '@ohif/ui-next';
import usePatientInfo from '../hooks/usePatientInfo';

type SeriesCard = {
  displaySetInstanceUID: string;
  seriesNumber: number | string;
  description: string;
  modality: string;
  numInstances: number;
  rows?: number;
  columns?: number;
  sliceThickness?: string | number;
  isActive: boolean;
  /** Current slice (1-based) when series is in a viewport */
  currentSlice?: number;
};

function formatThickness(raw: string | number | undefined | null): string | null {
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? `${n.toFixed(1)} mm` : `${raw} mm`;
}

function mapDisplaySet(
  ds: any,
  activeUIDs: Set<string>,
  sliceByUid: Map<string, { current: number; total: number }>
): SeriesCard {
  const instance = ds?.instances?.[0] || ds?.instance || {};
  const rows = instance.Rows || ds.rows;
  const columns = instance.Columns || ds.columns;
  const thickness = instance.SliceThickness ?? ds.SliceThickness;
  const numInstances = ds.numImageFrames || ds.instances?.length || 0;
  const sliceInfo = sliceByUid.get(ds.displaySetInstanceUID);
  return {
    displaySetInstanceUID: ds.displaySetInstanceUID,
    seriesNumber: ds.SeriesNumber ?? instance.SeriesNumber ?? '—',
    description: ds.SeriesDescription || instance.SeriesDescription || ds.label || 'Series',
    modality: ds.Modality || instance.Modality || '',
    numInstances,
    rows,
    columns,
    sliceThickness: thickness,
    isActive: activeUIDs.has(ds.displaySetInstanceUID),
    currentSlice: sliceInfo?.current,
  };
}

/**
 * Right Series panel — denser mockup cards + footer totals from real display sets.
 */
export function ZelvynSeriesPanel() {
  const { servicesManager, commandsManager } = useSystem();
  const { displaySetService, hangingProtocolService, uiNotificationService, cornerstoneViewportService } =
    servicesManager.services;
  const [{ activeViewportId, viewports, isHangingProtocolLayout }] = useViewportGrid();
  const { patientInfo } = usePatientInfo();
  const [cards, setCards] = useState<SeriesCard[]>([]);

  const refresh = useCallback(() => {
    const activeUIDs = new Set<string>();
    const sliceByUid = new Map<string, { current: number; total: number }>();

    viewports?.forEach((vp: any) => {
      (vp?.displaySetInstanceUIDs || []).forEach((uid: string) => activeUIDs.add(uid));
    });

    // Current slice for active viewport's display sets (Map from useViewportGrid)
    try {
      const csVp = cornerstoneViewportService?.getCornerstoneViewport?.(activeViewportId);
      if (csVp && typeof csVp.getCurrentImageIdIndex === 'function') {
        const idx = csVp.getCurrentImageIdIndex();
        const total =
          typeof csVp.getNumberOfSlices === 'function' ? csVp.getNumberOfSlices() : 0;
        const activeVp =
          typeof viewports?.get === 'function'
            ? viewports.get(activeViewportId)
            : viewports?.[activeViewportId];
        const uids: string[] = activeVp?.displaySetInstanceUIDs || [];
        uids.forEach(uid => {
          sliceByUid.set(uid, { current: (idx ?? 0) + 1, total: total || 0 });
        });
      }
    } catch {
      // Cornerstone viewport may not be ready yet
    }

    const sets = (displaySetService.getActiveDisplaySets?.() || []).filter(
      (ds: any) => !ds?.unsupported && !ds?.excludeFromThumbnailBrowser
    );
    setCards(sets.map((ds: any) => mapDisplaySet(ds, activeUIDs, sliceByUid)));
  }, [displaySetService, viewports, activeViewportId, cornerstoneViewportService]);

  useEffect(() => {
    refresh();
    const { EVENTS } = displaySetService;
    const subs = [
      displaySetService.subscribe(EVENTS.DISPLAY_SETS_ADDED, refresh),
      displaySetService.subscribe(EVENTS.DISPLAY_SETS_CHANGED, refresh),
      displaySetService.subscribe(EVENTS.DISPLAY_SETS_REMOVED, refresh),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, [displaySetService, refresh]);

  useEffect(() => {
    refresh();
  }, [activeViewportId, viewports, refresh]);

  // Slice progress on cards updates when viewports/active set change (live
  // index also shown in viewport overlays). Avoid importing @cornerstonejs/core
  // from extension-default.

  const totals = useMemo(() => {
    const seriesCount = cards.length;
    const imageCount = cards.reduce((n, c) => n + (Number(c.numInstances) || 0), 0);
    return { seriesCount, imageCount };
  }, [cards]);

  const onSelect = useCallback(
    async (displaySetInstanceUID: string) => {
      const viewportId = activeViewportId;
      if (!viewportId) {
        return;
      }
      let updatedViewports = [];
      try {
        updatedViewports = hangingProtocolService.getViewportsRequireUpdate(
          viewportId,
          displaySetInstanceUID,
          isHangingProtocolLayout
        );
      } catch (error) {
        console.warn(error);
        uiNotificationService?.show?.({
          title: 'Series',
          message: 'The selected series could not be added to the viewport.',
          type: 'error',
          duration: 3000,
        });
        return;
      }
      commandsManager.run('setDisplaySetsForViewports', {
        viewportsToUpdate: updatedViewports,
      });
    },
    [
      activeViewportId,
      commandsManager,
      hangingProtocolService,
      isHangingProtocolLayout,
      uiNotificationService,
    ]
  );

  const studyTitle = patientInfo.StudyLabel || patientInfo.StudyDescription || 'Study';
  const studyId = patientInfo.PatientID || '';

  return (
    <div
      className="zelvyn-series-panel flex h-full w-full flex-col bg-[color:var(--bg-sidebar,#0E141B)]"
      data-chrome="zelvyn-series-panel"
    >
      <div className="flex items-center justify-between border-b border-[color:var(--border-subtle,#1E2A36)] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[color:var(--text-primary,#E8EEF4)]">
            Series
          </span>
          <Icons.ByName
            name="chevron-down"
            className="h-3.5 w-3.5 text-[color:var(--text-muted,#6B7A8A)]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-[11px]">
        <span className="truncate font-medium text-[color:var(--text-secondary,#9AA8B6)]">
          {studyTitle}
        </span>
        {studyId ? (
          <span className="shrink-0 font-mono text-[10px] text-[color:var(--text-muted,#6B7A8A)]">
            {studyId}
          </span>
        ) : null}
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-2 pb-2">
        {cards.length === 0 ? (
          <div className="px-2 py-6 text-center text-[12px] text-[color:var(--text-muted,#6B7A8A)]">
            No series loaded
          </div>
        ) : (
          cards.map(card => {
            const res =
              card.rows && card.columns
                ? `${card.rows}×${card.columns}`
                : card.modality || '';
            const thick = formatThickness(card.sliceThickness);
            const total = card.numInstances || 0;
            const sliceProgress =
              card.isActive && card.currentSlice
                ? `${card.currentSlice}/${total || '—'}`
                : total
                  ? `${total}/${total}`
                  : null;
            const countLabel = card.isActive && card.currentSlice ? card.currentSlice : total || '—';

            return (
              <button
                key={card.displaySetInstanceUID}
                type="button"
                onClick={() => onSelect(card.displaySetInstanceUID)}
                onDoubleClick={() => onSelect(card.displaySetInstanceUID)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left transition-colors',
                  'bg-[color:var(--bg-elevated,#12181F)]',
                  card.isActive
                    ? 'border-[color:var(--accent,#2DD4BF)] shadow-[0_0_0_1px_rgba(45,212,191,0.35)]'
                    : 'border-[color:var(--border-subtle,#1E2A36)] hover:border-[color:var(--border-strong,#2A3A4A)]'
                )}
                data-active={card.isActive}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold',
                    card.isActive
                      ? 'bg-[color:var(--accent,#2DD4BF)]/20 text-[color:var(--accent,#2DD4BF)]'
                      : 'bg-[color:var(--bg-input,#161E27)] text-[color:var(--text-secondary,#9AA8B6)]'
                  )}
                >
                  {card.seriesNumber}
                </span>
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="block truncate text-[12px] font-semibold text-[color:var(--text-primary,#E8EEF4)]">
                    {card.description}
                  </span>
                  {res ? (
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-[color:var(--text-muted,#6B7A8A)]">
                      {res}
                    </span>
                  ) : null}
                  <span className="mt-0.5 block truncate text-[10px] text-[color:var(--text-secondary,#9AA8B6)]">
                    {[thick, sliceProgress].filter(Boolean).join(' | ') || card.modality}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      card.isActive ? 'bg-[color:var(--accent,#2DD4BF)]' : 'bg-transparent'
                    )}
                  />
                  <span className="font-mono text-[10px] tabular-nums text-[color:var(--text-secondary,#9AA8B6)]">
                    {countLabel}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <div
        className="flex shrink-0 items-center justify-between border-t border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-canvas,#0B0F14)] px-3 py-1.5 text-[11px] text-[color:var(--text-secondary,#9AA8B6)]"
        data-chrome="zelvyn-series-footer"
      >
        <span>{totals.seriesCount} Series</span>
        <span>Total: {totals.imageCount} images</span>
      </div>
    </div>
  );
}

export default ZelvynSeriesPanel;
