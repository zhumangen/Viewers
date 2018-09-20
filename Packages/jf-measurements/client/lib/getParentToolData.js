import { JF } from 'meteor/jf:core';

/**
 * Return the parent tool data if it's a child tool or the tool data itself if not
 *
 * @param measurementData measurement data that must contain the toolType and measurement's _id
 * @returns {Object} Parent measurement data
 */
JF.measurements.getParentToolData = measurementData => {
    const { toolType, _id } = measurementData;
    const { tool } = JF.measurements.getToolConfiguration(toolType);
    const parentToolType = tool.parentTool || toolType;
    const parentToolData = JF.viewer.measurementApi.tools[parentToolType].findOne(_id);
    return parentToolData;
};
