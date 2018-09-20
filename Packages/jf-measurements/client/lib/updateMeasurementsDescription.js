import { JF } from 'meteor/jf:core';

/**
 * Updates the measurements' description for a measurement number across all timepoints
 *
 * @param measurementData base measurement data that must contain toolType and measurementNumber
 * @param description measurement description that will be used
 */
JF.measurements.updateMeasurementsDescription = (measurementData, description) => {
    const { toolType, measurementNumber } = measurementData;
    measurementData.description = description;
    const filter = { measurementNumber };
    const operator = { $set: { description } };
    const options = { multi: true };
    const { toolGroup } = JF.measurements.getToolConfiguration(toolType);
    toolGroup.childTools.forEach(childTool => {
        const collection = JF.viewer.measurementApi.tools[childTool.id];
        collection.update(filter, operator, options);
    });

    // Notify that viewer suffered changes
    JF.measurements.triggerTimepointUnsavedChanges('relabel');
};
