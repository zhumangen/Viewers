import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { toolType } from './definitions';
import { pointNearTool } from './pointNearTool';

export default function doubleClickCallback(e) {
    const eventData = e.detail;
    const { element } = eventData;
    let data;

    function doneCallback(data, deleteTool) {
        if (deleteTool === true) {
            cornerstoneTools.removeToolState(element, toolType, data);
            cornerstone.updateImage(element);
            return;
        }

        data.active = false;
        cornerstone.updateImage(element);
    }

    if (e.data && e.data.mouseButtonMask && !cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
        return false;
    }

    // Check if the element is enabled and stop here if not
    try {
        cornerstone.getEnabledElement(element);
    } catch (error) {
        return;
    }

    const config = cornerstoneTools[toolType].getConfiguration();

    const coords = eventData.currentPoints.canvas;
    const toolData = cornerstoneTools.getToolState(element, toolType);

    // now check to see if there is a handle we can move
    if (!toolData) {
        return;
    }

    for (let i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        if (pointNearTool(element, data, coords)) {
            data.active = true;
            cornerstone.updateImage(element);
            // Allow relabelling via a callback
            config.changeMeasurementLocationCallback(data, eventData, doneCallback);

            e.stopImmediatePropagation();
            return false;
        }
    }
}
