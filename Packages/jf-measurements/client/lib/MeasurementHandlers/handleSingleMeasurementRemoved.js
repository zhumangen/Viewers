import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { cornerstone } from 'meteor/ohif:cornerstone';

export default function({ instance, eventData, tool, toolGroupId, toolGroup }) {
    OHIF.log.info('CornerstoneToolsMeasurementRemoved');
    const measurementData = eventData.measurementData;
    const { measurementApi, timepointApi } = instance.data;
    const Collection = measurementApi.tools[eventData.toolType];

    // Stop here if the tool data shall not be persisted (e.g. temp tools)
    if (!Collection) return;

    const measurementTypeId = measurementApi.toolsGroupsMap[measurementData.toolType];
    const measurement = Collection.findOne(measurementData._id);

    // Stop here if the measurement is already gone or never existed
    if (!measurement) return;

    // Remove all the measurements with the given type and number
    const { measurementNumber } = measurement;
    measurementApi.deleteMeasurements(measurementTypeId, {
        measurementNumber
    });

    // Sync the new measurement data with cornerstone tools
    // const baseline = timepointApi.baseline();
    measurementApi.sortMeasurements();

    // Repaint the images on all viewports without the removed measurements
    _.each($('.imageViewerViewport'), element => cornerstone.updateImage(element));

    // Notify that viewer suffered changes
    if (tool.toolGroup !== 'temp') {
        JF.measurements.triggerTimepointUnsavedChanges(eventData.toolType);
    }
}
