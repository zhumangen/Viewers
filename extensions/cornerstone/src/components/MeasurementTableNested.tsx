import React, { useEffect, useMemo, useState } from 'react';
import { MeasurementTable } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';

/**
 * Nested measurement table for accordion groups.
 * Phase 3: annotate tracked status for status chips (visual only).
 */
export default function MeasurementTableNested(props) {
  const { title, items, group, customHeader, actions } = props;
  const { commandsManager, servicesManager } = useSystem();
  const trackedMeasurementsService = servicesManager?.services?.trackedMeasurementsService;

  const [trackedSeries, setTrackedSeries] = useState<string[]>(
    () => trackedMeasurementsService?.getTrackedSeries?.() || []
  );

  useEffect(() => {
    if (!trackedMeasurementsService?.subscribe) {
      return;
    }

    setTrackedSeries(trackedMeasurementsService.getTrackedSeries?.() || []);

    const { unsubscribe } = trackedMeasurementsService.subscribe(
      trackedMeasurementsService.EVENTS.TRACKED_SERIES_CHANGED,
      ({ trackedSeries: next }) => {
        setTrackedSeries(next || []);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [trackedMeasurementsService]);

  const hasTrackingService = Boolean(trackedMeasurementsService?.getTrackedSeries);

  const annotatedItems = useMemo(() => {
    return (items || []).map(item => {
      const seriesUID = item.referenceSeriesUID || item.SeriesInstanceUID;
      return {
        ...item,
        isTracked: hasTrackingService ? trackedSeries.includes(seriesUID) : item.isTracked,
      };
    });
  }, [items, trackedSeries, hasTrackingService]);

  const onAction = (e, command, uid) => {
    commandsManager.run(command, {
      uid,
      annotationUID: uid,
      displayMeasurements: annotatedItems,
    });
  };

  // Footer actions are owned by the panel sticky bar when using tracking panel.
  // Keep customHeader footer only when explicitly provided (legacy nested path).
  const showFooter = Boolean(customHeader && group?.isFirst);

  return (
    <MeasurementTable
      title={title ? title : `Measurements`}
      data={annotatedItems}
      onAction={onAction}
      {...group}
      key={group.key}
    >
      <MeasurementTable.Body key="measurementTableBody" />
      {showFooter && (
        <MeasurementTable.Footer key="measurementTableFooter">
          {customHeader({ ...props, items: props.allItems, actions: actions || props.actions })}
        </MeasurementTable.Footer>
      )}
    </MeasurementTable>
  );
}
