import { JF } from 'meteor/jf:core';
import { Viewerbase } from 'meteor/ohif:viewerbase';

/**
 * Show / hide lesion tracker tools
 */

let previousStates;
let previousActiveTool;

let toolsShown = true;

JF.lesiontracker.toggleLesionTrackerTools = () => {
    const toolManager = Viewerbase.toolManager;

    if (toolsShown === true) {
        // Save the current settings for later
        previousStates = toolManager.getToolDefaultStates();
        previousActiveTool = toolManager.getActiveTool();

        // Hide the tools (set them all to disabled)
        const toolDefaultStates = {
            activate: ['deleteLesionKeyboardTool'],
            deactivate: [],
            enable: [],
            disable: ['bidirectional', 'nonTarget', 'length', 'targetEllipse', 'targetRect', 'targetProbe', 'targetPencil', 'targetCR', 'targetUN']
        };

        toolManager.setToolDefaultStates(toolDefaultStates);

        // Using setActiveTool with no arguments activates the
        // default tool on all available viewports
        toolManager.setActiveTool();

        toolsShown = false;
    } else {
        // Show the tools (reload previous states)
        toolManager.setToolDefaultStates(previousStates);

        // Using setActiveTool with no elements specified activates
        // the specified tool on all available viewports
        toolManager.setActiveTool(previousActiveTool);

        toolsShown = true;
    }
};

JF.lesiontracker.toggleLesionTrackerToolsButtons = (isEnabled) => {
    const toolManager = Viewerbase.toolManager;
    const toolStates = previousStates || toolManager.getToolDefaultStates();

    if (isEnabled) {
        toolStates.disabledToolButtons = [];
        JF.lesiontracker.toggleLesionTrackerToolsHotKeys(true);
    } else {
        toolStates.disabledToolButtons = ['bidirectional', 'nonTarget', 'targetEllipse', 'targetRect', 'targetProbe', 'targetPencil', 'targetCR', 'targetUN',
            'toggleHUD', 'toggleTrial', 'toolbarSectionEntry', 'toggleMeasurements'];
        JF.lesiontracker.toggleLesionTrackerToolsHotKeys(false);
    }

    // Reload the updated previous or default states
    toolManager.setToolDefaultStates(toolStates);

    // Reset the active tool if disabled
    if (!isEnabled) {
        toolManager.setActiveTool();
    }
};

JF.lesiontracker.toggleLesionTrackerToolsHotKeys = (isEnabled) => {
    // The hotkey can also be an array (e.g. ["NUMPAD0", "0"])
    OHIF.viewer.defaultHotkeys = OHIF.viewer.defaultHotkeys || {};

    if (isEnabled) {
        OHIF.viewer.defaultHotkeys.toggleLesionTrackerTools = 'O';
        OHIF.viewer.defaultHotkeys.bidirectional = 'T'; // Target
        OHIF.viewer.defaultHotkeys.nonTarget = 'N'; // Non-target
    } else {
        OHIF.viewer.defaultHotkeys.toggleLesionTrackerTools = null;
        OHIF.viewer.defaultHotkeys.bidirectional = null; // Target
        OHIF.viewer.defaultHotkeys.nonTarget = null; // Non-target
    }
};
