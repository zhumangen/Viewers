import { cornerstone } from 'meteor/ohif:cornerstone';

export default function (mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  const element = mouseEventData.element;

  function moveCallback (e) {
    const eventData = e.detail;

    handle.active = true;
    handle.x = eventData.currentPoints.image.x;
    handle.y = eventData.currentPoints.image.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    data.points.push({x:handle.x, y:handle.y});
    
    cornerstone.updateImage(element);

    const eventType = cornerstoneTools.EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    cornerstone.triggerEvent(element, eventType, modifiedEventData);
  }

  function whichMovement (e) {
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, whichMovement);
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, whichMovement);

    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, moveCallback);
    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, moveCallback);

    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_CLICK, moveEndCallback);
    if (e.type === cornerstoneTools.EVENTS.MOUSE_DRAG) {
      element.addEventListener(cornerstoneTools.EVENTS.MOUSE_UP, moveEndCallback);
    }
  }

  function measurementRemovedCallback (e) {
    const eventData = e.detail;

    if (eventData.measurementData === data) {
      moveEndCallback();
    }
  }

  function toolDeactivatedCallback (e) {
    const eventData = e.detail;

    if (eventData.toolType === toolType) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, moveCallback);
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, moveCallback);
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_CLICK, moveEndCallback);
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_UP, moveEndCallback);
      element.removeEventListener(cornerstoneTools.EVENTS.MEASUREMENT_REMOVED, measurementRemovedCallback);
      element.removeEventListener(cornerstoneTools.EVENTS.TOOL_DEACTIVATED, toolDeactivatedCallback);

      handle.active = false;
      cornerstone.updateImage(element);
    }
  }

  element.addEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, whichMovement);
  element.addEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, whichMovement);
  element.addEventListener(cornerstoneTools.EVENTS.MEASUREMENT_REMOVED, measurementRemovedCallback);
  element.addEventListener(cornerstoneTools.EVENTS.TOOL_DEACTIVATED, toolDeactivatedCallback);

  function moveEndCallback () {
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, moveCallback);
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, moveCallback);
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_CLICK, moveEndCallback);
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_UP, moveEndCallback);
    element.removeEventListener(cornerstoneTools.EVENTS.MEASUREMENT_REMOVED, measurementRemovedCallback);
    element.removeEventListener(cornerstoneTools.EVENTS.TOOL_DEACTIVATED, toolDeactivatedCallback);

    handle.active = false;
    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }
}
