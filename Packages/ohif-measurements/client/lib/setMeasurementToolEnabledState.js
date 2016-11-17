import { OHIF } from 'meteor/ohif:core';

/**
 * Show / hide lesion tracker tools
 */

let previousStates;
let previousActiveTool;

OHIF.measurements.setMeasurementToolEnabledState = (measurementTypeId, enabled) => {
    const config = OHIF.measurements.MeasurementApi.getConfiguration();
    const measurementTool = config.measurementTools.find(tool => tool.id === measurementTypeId);
    const toolType = measurementTool.cornerstoneToolType;

    if (enabled === false) {
        // Save the current settings for later
        const toolDefaultStates = toolManager.getToolDefaultStates();
        previousActiveTool = toolManager.getActiveTool();
        previousStates = _.clone(toolDefaultStates);

        toolDefaultStates.activate.delete(toolType);
        toolDefaultStates.enable.delete(toolType);
        toolDefaultStates.disable.delete(toolType);
        toolDefaultStates.deactivate.add(toolType);
        toolDefaultStates.disabledToolButtons.add(toolType);

        toolManager.setToolDefaultStates(toolDefaultStates);

        // Using setActiveTool with no arguments activates the
        // default tool on all available viewports
        toolManager.setActiveTool();
    } else if (previousStates && previousActiveTool) {
        // Show the tools (reload previous states)
        toolManager.setToolDefaultStates(previousStates);

        // Using setActiveTool with no elements specified activates
        // the specified tool on all available viewports
        toolManager.setActiveTool(previousActiveTool);
    }

    OHIF.measurements.setMeasurementToolHotkey(measurementTypeId, enabled);
};

OHIF.measurements.setMeasurementToolHotkey = (measurementTypeId, isEnabled) => {
    // The hotkey can also be an array (e.g. ["NUMPAD0", "0"])
    OHIF.viewer.defaultHotkeys = OHIF.viewer.defaultHotkeys || {};

    const config = OHIF.measurements.MeasurementApi.getConfiguration();
    const measurementTool = config.measurementTools.find(tool => tool.id === measurementTypeId);
    const toolType = measurementTool.cornerstoneToolType;
    const key = measurementTool.defaultHotkey;

    // If this tool has no defaultHotkey defined, stop here
    if (!key) {
        return;
    }

    // Set the hotkey to either the default hotkey for the tool or null, 
    // in order to enable or disable the hotkey.
    OHIF.viewer.defaultHotkeys[toolType] = isEnabled ? key : null;
};
