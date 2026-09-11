import React from 'react';
import { MeasurementTable, ScrollArea } from '@ohif/ui-next';

import { useMeasurements } from '../hooks/useMeasurements';
import StudyMeasurements from '../components/StudyMeasurements';
import StudyMeasurementsActions from '../components/StudyMeasurementsActions';

/**
 * The PanelMeasurement is a fairly simple wrapper that gets the filtered
 * measurements and then passes it on to the children component, default to
 * the StudyMeasurements sub-component if no children are specified.
 *
 * Phase 3: sticky footer actions + denser empty state (visual only).
 */
export default function PanelMeasurement(props): React.ReactNode {
  const { measurementFilter, emptyComponent: EmptyComponent, children } = props;

  const displayMeasurements = useMeasurements({ measurementFilter });

  const emptyNode = EmptyComponent ? (
    <EmptyComponent items={displayMeasurements} />
  ) : (
    <MeasurementTable
      title="Measurements"
      data={[]}
      isExpanded={true}
    >
      <MeasurementTable.Body />
    </MeasurementTable>
  );

  const body = !displayMeasurements.length
    ? emptyNode
    : children
      ? React.Children.map(children, child =>
          React.cloneElement(child, {
            items: displayMeasurements,
            filter: measurementFilter,
          })
        )
      : (
          <StudyMeasurements items={displayMeasurements} />
        );

  // Prefer StudyInstanceUID from first measurement's display set metadata when available
  const StudyInstanceUID = displayMeasurements?.[0]?.referenceStudyUID;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div>{body}</div>
      </ScrollArea>
      <StudyMeasurementsActions
        items={displayMeasurements}
        StudyInstanceUID={StudyInstanceUID}
        measurementFilter={measurementFilter}
        layout="footer"
      />
    </div>
  );
}
