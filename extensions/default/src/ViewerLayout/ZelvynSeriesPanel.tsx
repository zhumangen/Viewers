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
};

function mapDisplaySet(ds: any, activeUIDs: Set<string>): SeriesCard {
  const instance = ds?.instances?.[0] || ds?.instance || {};
  const rows = instance.Rows || ds.rows;
  const columns = instance.Columns || ds.columns;
  const thickness = instance.SliceThickness ?? ds.SliceThickness;
  return {
    displaySetInstanceUID: ds.displaySetInstanceUID,
    seriesNumber: ds.SeriesNumber ?? instance.SeriesNumber ?? '—',
    description: ds.SeriesDescription || instance.SeriesDescription || ds.label || 'Series',
    modality: ds.Modality || instance.Modality || '',
    numInstances: ds.numImageFrames || ds.instances?.length || ds.numberOfDisplaySets || 0,
    rows,
    columns,
    sliceThickness: thickness,
    isActive: activeUIDs.has(ds.displaySetInstanceUID),
  };
}

/**
 * Right Series panel — card list + footer totals from real OHIF display sets.
 * Click loads series into the active viewport via hanging protocol update.
 */
export function ZelvynSeriesPanel() {
  const { servicesManager, commandsManager } = useSystem();
  const { displaySetService, hangingProtocolService, uiNotificationService } =
    servicesManager.services;
  const [{ activeViewportId, viewports, isHangingProtocolLayout }] = useViewportGrid();
  const { patientInfo } = usePatientInfo();
  const [cards, setCards] = useState<SeriesCard[]>([]);

  const refresh = useCallback(() => {
    const activeUIDs = new Set<string>();
    viewports?.forEach((vp: any) => {
      (vp?.displaySetInstanceUIDs || []).forEach((uid: string) => activeUIDs.add(uid));
    });
    const sets = (displaySetService.getActiveDisplaySets?.() || []).filter(
      (ds: any) => !ds?.unsupported && !ds?.excludeFromThumbnailBrowser
    );
    setCards(sets.map((ds: any) => mapDisplaySet(ds, activeUIDs)));
  }, [displaySetService, viewports]);

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

  // Recompute active card highlight when viewport display sets change
  useEffect(() => {
    refresh();
  }, [activeViewportId, viewports, refresh]);

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

  const studyTitle = patientInfo.StudyDescription || 'Study';
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

      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px]">
        <span className="truncate font-medium text-[color:var(--text-secondary,#9AA8B6)]">
          {studyTitle}
        </span>
        {studyId ? (
          <span className="shrink-0 font-mono text-[color:var(--text-muted,#6B7A8A)]">{studyId}</span>
        ) : null}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {cards.length === 0 ? (
          <div className="px-2 py-6 text-center text-[12px] text-[color:var(--text-muted,#6B7A8A)]">
            No series loaded
          </div>
        ) : (
          cards.map(card => {
            const res =
              card.rows && card.columns ? `${card.rows}×${card.columns}` : card.modality || '';
            const thick =
              card.sliceThickness !== undefined && card.sliceThickness !== null
                ? `${card.sliceThickness} mm`
                : null;
            const meta = [thick, card.numInstances ? `${card.numInstances}` : null]
              .filter(Boolean)
              .join(' | ');

            return (
              <button
                key={card.displaySetInstanceUID}
                type="button"
                onClick={() => onSelect(card.displaySetInstanceUID)}
                onDoubleClick={() => onSelect(card.displaySetInstanceUID)}
                className={cn(
                  'flex w-full items-stretch gap-2 rounded-md border bg-[color:var(--bg-elevated,#12181F)] px-2.5 py-2 text-left transition-colors',
                  card.isActive
                    ? 'border-[color:var(--accent,#2DD4BF)] shadow-[0_0_0_1px_rgba(45,212,191,0.25)]'
                    : 'border-[color:var(--border-subtle,#1E2A36)] hover:border-[color:var(--border-strong,#2A3A4A)]'
                )}
                data-active={card.isActive}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-semibold',
                    card.isActive
                      ? 'bg-[color:var(--accent,#2DD4BF)]/20 text-[color:var(--accent,#2DD4BF)]'
                      : 'bg-[color:var(--bg-input,#161E27)] text-[color:var(--text-secondary,#9AA8B6)]'
                  )}
                >
                  {card.seriesNumber}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-[color:var(--text-primary,#E8EEF4)]">
                    {card.description}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-[color:var(--text-muted,#6B7A8A)]">
                    {[res, meta].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end justify-center gap-0.5">
                  {card.isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent,#2DD4BF)]" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                  )}
                  <span className="font-mono text-[10px] text-[color:var(--text-secondary,#9AA8B6)]">
                    {card.numInstances || '—'}
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
        <span>
          {totals.seriesCount} Series
        </span>
        <span>Total: {totals.imageCount} images</span>
      </div>
    </div>
  );
}

export default ZelvynSeriesPanel;
