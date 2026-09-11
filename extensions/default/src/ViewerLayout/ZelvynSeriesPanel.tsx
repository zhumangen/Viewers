import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSystem } from '@ohif/core';
import { useViewportGrid, Icons, cn } from '@ohif/ui-next';
import { thumbnailNoImageModalities } from '@ohif/core/src/utils/thumbnailNoImageModalities';
import usePatientInfo from '../hooks/usePatientInfo';
import getImageSrcFromImageId from '../Panels/getImageSrcFromImageId';

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
  thumbnailSrc?: string | null;
  noImage?: boolean;
};

function formatThickness(raw: string | number | undefined | null): string | null {
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? `${n.toFixed(1)} mm` : `${raw} mm`;
}

function getImageIdForThumbnail(displaySet: any, imageIds: string[]) {
  if (!imageIds?.length) {
    return undefined;
  }
  if (displaySet.isDynamicVolume) {
    const timePoints = displaySet.dynamicVolumeInfo?.timePoints;
    if (!timePoints?.length) {
      return imageIds[Math.floor(imageIds.length / 2)];
    }
    const middleIndex = Math.floor(timePoints.length / 2);
    const middleTimePointImageIds = timePoints[middleIndex];
    return middleTimePointImageIds[Math.floor(middleTimePointImageIds.length / 2)];
  }
  return imageIds[Math.floor(imageIds.length / 2)];
}

function createGetImageSrc(extensionManager: any) {
  try {
    const utilities = extensionManager.getModuleEntry(
      '@ohif/extension-cornerstone.utilityModule.common'
    );
    const { cornerstone } = utilities.exports.getCornerstoneLibraries();
    return getImageSrcFromImageId.bind(null, cornerstone);
  } catch {
    return null;
  }
}

function mapDisplaySet(
  ds: any,
  activeUIDs: Set<string>,
  sliceByUid: Map<string, { current: number; total: number }>,
  thumbnailSrc?: string | null
): SeriesCard {
  const instance = ds?.instances?.[0] || ds?.instance || {};
  const rows = instance.Rows || ds.rows;
  const columns = instance.Columns || ds.columns;
  const thickness = instance.SliceThickness ?? ds.SliceThickness;
  const numInstances = ds.numImageFrames || ds.instances?.length || 0;
  const sliceInfo = sliceByUid.get(ds.displaySetInstanceUID);
  const modality = ds.Modality || instance.Modality || '';
  const noImage =
    thumbnailNoImageModalities.includes(modality) ||
    ds?.unsupported ||
    ds.thumbnailSrc === null;
  return {
    displaySetInstanceUID: ds.displaySetInstanceUID,
    seriesNumber: ds.SeriesNumber ?? instance.SeriesNumber ?? '—',
    description: ds.SeriesDescription || instance.SeriesDescription || ds.label || 'Series',
    modality,
    numInstances,
    rows,
    columns,
    sliceThickness: thickness,
    isActive: activeUIDs.has(ds.displaySetInstanceUID),
    currentSlice: sliceInfo?.current,
    thumbnailSrc: thumbnailSrc ?? ds.thumbnailSrc ?? null,
    noImage,
  };
}

/**
 * Right Series panel — denser mockup cards with StudyBrowser-style thumbnails.
 */
export function ZelvynSeriesPanel() {
  const { servicesManager, commandsManager, extensionManager } = useSystem();
  const { displaySetService, hangingProtocolService, uiNotificationService, cornerstoneViewportService } =
    servicesManager.services;
  const [{ activeViewportId, viewports, isHangingProtocolLayout }] = useViewportGrid();
  const { patientInfo } = usePatientInfo();
  const [cards, setCards] = useState<SeriesCard[]>([]);
  const [thumbnailMap, setThumbnailMap] = useState<Record<string, string>>({});
  const [liveSlice, setLiveSlice] = useState<{
    uid: string;
    current: number;
    total: number;
  } | null>(null);
  const thumbInflight = useRef<Set<string>>(new Set());
  const thumbReady = useRef<Set<string>>(new Set());

  const getImageSrc = useMemo(() => createGetImageSrc(extensionManager), [extensionManager]);
  const dataSource = useMemo(() => {
    try {
      return extensionManager.getActiveDataSource()?.[0];
    } catch {
      return null;
    }
  }, [extensionManager]);

  const refresh = useCallback(() => {
    const activeUIDs = new Set<string>();
    const sliceByUid = new Map<string, { current: number; total: number }>();

    viewports?.forEach((vp: any) => {
      (vp?.displaySetInstanceUIDs || []).forEach((uid: string) => activeUIDs.add(uid));
    });

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

    if (liveSlice?.uid) {
      sliceByUid.set(liveSlice.uid, {
        current: liveSlice.current,
        total: liveSlice.total,
      });
    }

    const sets = (displaySetService.getActiveDisplaySets?.() || []).filter(
      (ds: any) => !ds?.unsupported && !ds?.excludeFromThumbnailBrowser
    );
    setCards(
      sets.map((ds: any) =>
        mapDisplaySet(ds, activeUIDs, sliceByUid, thumbnailMap[ds.displaySetInstanceUID])
      )
    );
  }, [
    displaySetService,
    viewports,
    activeViewportId,
    cornerstoneViewportService,
    thumbnailMap,
    liveSlice,
  ]);

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

  // Live n/m on the selected series card while the active viewport scrolls.
  // Uses cornerstone element events (string names — no @cornerstonejs/core import).
  useEffect(() => {
    if (!activeViewportId || !cornerstoneViewportService) {
      return;
    }

    const SLICE_EVENTS = [
      'CORNERSTONE_STACK_NEW_IMAGE',
      'CORNERSTONE_VOLUME_NEW_IMAGE',
      'CORNERSTONE_STACK_VIEWPORT_SCROLL',
      'VOLUME_VIEWPORT_SCROLL',
      'CORNERSTONE_CAMERA_MODIFIED',
    ];

    let raf = 0;
    let element: HTMLElement | null = null;

    const readSlice = (event?: any) => {
      try {
        const csVp = cornerstoneViewportService.getCornerstoneViewport?.(activeViewportId);
        if (!csVp || typeof csVp.getCurrentImageIdIndex !== 'function') {
          return;
        }
        const detail = event?.detail || {};
        const idxRaw =
          detail.newImageIdIndex ?? detail.imageIdIndex ?? detail.imageIndex;
        const idx =
          typeof idxRaw === 'number' ? idxRaw : csVp.getCurrentImageIdIndex();
        const total =
          typeof csVp.getNumberOfSlices === 'function'
            ? csVp.getNumberOfSlices()
            : 0;
        const activeVp =
          typeof viewports?.get === 'function'
            ? viewports.get(activeViewportId)
            : viewports?.[activeViewportId];
        const uid = activeVp?.displaySetInstanceUIDs?.[0];
        if (!uid) {
          return;
        }
        const next = { uid, current: (idx ?? 0) + 1, total: total || 0 };
        setLiveSlice(prev =>
          prev &&
          prev.uid === next.uid &&
          prev.current === next.current &&
          prev.total === next.total
            ? prev
            : next
        );
      } catch {
        // Viewport may be mid-rebuild
      }
    };

    const onSliceEvent = (event: Event) => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
      raf = requestAnimationFrame(() => readSlice(event));
    };

    const detach = () => {
      if (!element) {
        return;
      }
      SLICE_EVENTS.forEach(name => element!.removeEventListener(name, onSliceEvent));
      element = null;
    };

    const attach = () => {
      const csVp = cornerstoneViewportService.getCornerstoneViewport?.(activeViewportId);
      const next = (csVp?.element as HTMLElement) || null;
      if (!next) {
        return false;
      }
      if (element === next) {
        readSlice();
        return true;
      }
      detach();
      element = next;
      SLICE_EVENTS.forEach(name => element!.addEventListener(name, onSliceEvent));
      readSlice();
      return true;
    };

    attach();
    const sub = cornerstoneViewportService.subscribe?.(
      cornerstoneViewportService.EVENTS?.VIEWPORT_DATA_CHANGED,
      ({ viewportId }: { viewportId?: string }) => {
        if (viewportId && viewportId !== activeViewportId) {
          return;
        }
        attach();
      }
    );
    const retryTimer = window.setTimeout(() => attach(), 120);

    return () => {
      window.clearTimeout(retryTimer);
      sub?.unsubscribe?.();
      if (raf) {
        cancelAnimationFrame(raf);
      }
      detach();
    };
  }, [activeViewportId, viewports, cornerstoneViewportService]);


  // Load thumbnails via OHIF StudyBrowser pattern (getThumbnailSrc / middle imageId).
  useEffect(() => {
    if (!getImageSrc || !dataSource || !displaySetService) {
      return;
    }

    const loadForSets = () => {
      const sets = (displaySetService.getActiveDisplaySets?.() || []).filter(
        (ds: any) => !ds?.unsupported && !ds?.excludeFromThumbnailBrowser
      );

      sets.forEach(async (dSet: any) => {
        const uid = dSet.displaySetInstanceUID;
        if (!uid || thumbReady.current.has(uid) || thumbInflight.current.has(uid)) {
          return;
        }

        const displaySet = displaySetService.getDisplaySetByUID(uid) || dSet;
        const modality = displaySet.Modality || '';
        if (
          thumbnailNoImageModalities.includes(modality) ||
          displaySet.thumbnailSrc === null
        ) {
          thumbReady.current.add(uid);
          return;
        }

        if (displaySet.thumbnailSrc) {
          thumbReady.current.add(uid);
          setThumbnailMap(prev =>
            prev[uid] ? prev : { ...prev, [uid]: displaySet.thumbnailSrc }
          );
          return;
        }

        thumbInflight.current.add(uid);
        try {
          let thumbnailSrc: string | null = null;
          if (displaySet.getThumbnailSrc) {
            thumbnailSrc = await displaySet.getThumbnailSrc({ getImageSrc });
          }
          if (!thumbnailSrc) {
            const imageIds = dataSource.getImageIdsForDisplaySet?.(displaySet) || [];
            const imageId = getImageIdForThumbnail(displaySet, imageIds);
            if (imageId) {
              thumbnailSrc = await getImageSrc(imageId);
            }
          }
          if (thumbnailSrc) {
            displaySet.thumbnailSrc = thumbnailSrc;
            thumbReady.current.add(uid);
            setThumbnailMap(prev =>
              prev[uid] === thumbnailSrc ? prev : { ...prev, [uid]: thumbnailSrc }
            );
          }
        } catch {
          // Thumbnail generation can fail for some SOP classes; keep card text-only.
        } finally {
          thumbInflight.current.delete(uid);
        }
      });
    };

    loadForSets();
    const { EVENTS } = displaySetService;
    const subs = [
      displaySetService.subscribe(EVENTS.DISPLAY_SETS_ADDED, loadForSets),
      displaySetService.subscribe(EVENTS.DISPLAY_SETS_CHANGED, loadForSets),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, [displaySetService, dataSource, getImageSrc]);

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
            const thumb = card.thumbnailSrc || thumbnailMap[card.displaySetInstanceUID];

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
                    'relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded border',
                    card.isActive
                      ? 'border-[color:var(--accent,#2DD4BF)]/50'
                      : 'border-[color:var(--border-subtle,#1E2A36)]',
                    'bg-[color:var(--bg-input,#161E27)]'
                  )}
                >
                  {thumb && !card.noImage ? (
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <span
                      className={cn(
                        'flex h-full w-full items-center justify-center text-[10px] font-semibold',
                        card.isActive
                          ? 'text-[color:var(--accent,#2DD4BF)]'
                          : 'text-[color:var(--text-secondary,#9AA8B6)]'
                      )}
                    >
                      {card.modality || card.seriesNumber}
                    </span>
                  )}
                  <span className="absolute bottom-0 left-0 rounded-tr bg-black/65 px-0.5 font-mono text-[8px] leading-tight text-white/90">
                    {card.seriesNumber}
                  </span>
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
