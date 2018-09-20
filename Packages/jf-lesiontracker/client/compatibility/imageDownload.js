import { JF } from 'meteor/jf:core';

JF.viewerbase.getImageDownloadDialogAnnotationTools = () => {
    const { measurementTools } = JF.measurements.MeasurementApi.getConfiguration();

    const resultSet = new Set();
    Object.values(measurementTools).forEach(toolGroup => {
        toolGroup.childTools.forEach(tool => {
            if (tool.childTools) return;
            resultSet.add(tool.cornerstoneToolType);
        });
    });

    return Array.from(resultSet);
};
