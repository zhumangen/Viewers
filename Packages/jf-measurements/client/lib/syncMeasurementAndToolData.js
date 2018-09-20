import { JF } from 'meteor/jf:core';
import { cornerstoneTools } from 'meteor/ohif:cornerstone';

JF.measurements.syncMeasurementAndToolData = (measurement, syncAll) => {
    OHIF.log.info('syncMeasurementAndToolData');

    syncAll = syncAll !== undefined?  syncAll : true;
    const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();

    // Iterate each child tool if the current tool has children
    const { getImageIdForImagePath } = JF.viewerbase;
    const toolType = measurement.toolType;
    const { tool } = JF.measurements.getToolConfiguration(toolType);
    if (Array.isArray(tool.childTools)) {
        tool.childTools.forEach(childToolKey => {
            const childMeasurement = measurement[childToolKey];
            if (!childMeasurement) return;
            childMeasurement._id = measurement._id;
            childMeasurement.measurementNumber = measurement.measurementNumber;

            JF.measurements.syncMeasurementAndToolData(childMeasurement);
        });

        return;
    }

    const imageId = getImageIdForImagePath(measurement.imagePath);
    if (!imageId) return;

    // If no tool state exists for this imageId, create an empty object to store it
    if (!toolState[imageId]) {
        toolState[imageId] = {};
    }

    const currentToolState = toolState[imageId][toolType];
    const toolData = currentToolState && currentToolState.data;

    let alreadyExists = false;
    // Check if we already have toolData for this imageId and toolType
    if (toolData && toolData.length) {
        // If we have toolData, we should search it for any data related to the current Measurement
        const toolData = toolState[imageId][toolType].data;

        // Loop through the toolData to search for this Measurement
        toolData.forEach(tool => {
            // Break the loop if this isn't the Measurement we are looking for
            if (tool._id !== measurement._id) {
                return;
            }

            // If we have found the Measurement, set the flag to True
            alreadyExists = true;

            // Update the toolData from the Measurement data
            const active = tool.active;
            const hover = tool.hover;
            Object.assign(tool, measurement);
            if (!syncAll) {
              tool.active = active;
              tool.hover = hover;
            }

            return false;
        });
    } else {
        // If no toolData exists for this toolType, create an empty array to hold some
        toolState[imageId][toolType] = {
            data: []
        };
    }

    // Add the MeasurementData into the toolData for this imageId
    if (!alreadyExists) toolState[imageId][toolType].data.push(measurement);

    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(toolState);
};
