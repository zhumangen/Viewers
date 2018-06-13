import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { toolType } from './definitions';
import { pointNearTool } from './pointNearTool';

export default function mouseDownCallback (e) {
    const eventData = e.detail;
    let data;
    const element = eventData.element;
    const options = cornerstoneTools.getToolOptions(toolType, element);

    if (!cornerstoneTools.isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
      return;
    }

    function handleDoneMove () {
      data.invalidated = true;
      if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles)) {
        // Delete the measurement
        cornerstoneTools.removeToolState(element, toolType, data);
      }

      cornerstone.updateImage(element);
      element.addEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, mouseMove);
    }

    const coords = eventData.startPoints.canvas;
    const toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

    if (!toolData) {
      return;
    }

    let i;

    // Now check to see if there is a handle we can move

    let preventHandleOutsideImage;

    if (options && options.preventHandleOutsideImage !== undefined) {
      preventHandleOutsideImage = options.preventHandleOutsideImage;
    } else {
      preventHandleOutsideImage = false;
    }

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      const distance = 6;
      const handle = cornerstoneTools.getHandleNearImagePoint(element, data.handles, coords, distance);

      if (handle) {
        element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, mouseMove);
        data.active = true;
        cornerstoneTools.moveHandle(eventData, toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        return;
      }
    }

    const opt = {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage: false
    };

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      data.active = false;
      if (pointNearTool(element, data, coords)) {
        data.active = true;
        element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, mouseMove);
        cornerstoneTools.moveAllHandles(e, data, toolData, toolType, opt, handleDoneMove);
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        return;
      }
    }
  }
  