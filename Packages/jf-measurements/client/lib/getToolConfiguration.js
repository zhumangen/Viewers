import { _ } from 'meteor/underscore';
import { JF } from 'meteor/jf:core';

/**
 * Return the tool configuration of a given tool type
 *
 * @param {String} toolType The tool type of the desired configuration
 */
JF.measurements.getToolConfiguration = toolType => {
    const { MeasurementApi } = JF.measurements;
    const configuration = MeasurementApi.getConfiguration();
    const toolsGroupsMap = MeasurementApi.getToolsGroupsMap();

    const toolGroupId = toolsGroupsMap[toolType];
    const toolGroup = _.findWhere(configuration.measurementTools, { id: toolGroupId });

    let tool;
    if (toolGroup) {
        tool = _.findWhere(toolGroup.childTools, { id: toolType });
    }

    return {
        toolGroupId,
        toolGroup,
        tool
    };
};
