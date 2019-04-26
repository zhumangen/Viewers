import { toolType } from './definitions';
import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import createNewMeasurement from './createNewMeasurement';

export default function(touchEventData) {
  const { element } = touchEventData;
  const $element = $(element);

  function doneCallback() {
      measurementData.active = true;
      cornerstone.updateImage(element);
  }

  const measurementData = createNewMeasurement(touchEventData);
  measurementData.viewport = cornerstone.getViewport(element);

  const tool = cornerstoneTools[toolType];
  const config = tool.getConfiguration();

  // associate this data with this imageId so we can render it and manipulate it
  cornerstoneTools.addToolState(element, toolType, measurementData);

  // since we are dragging to another place to drop the end point, we can just activate
  // the end point and let the moveHandle move it for us.
  const { touchStartCallback, tapCallback, touchDownActivateCallback } = cornerstoneTools[toolType];
  element.removeEventListener(cornerstoneTools.EVENTS.TOUCH_START, touchStartCallback);
  element.removeEventListener(cornerstoneTools.EVENTS.TAP, tapCallback);
  element.removeEventListener(cornerstoneTools.EVENTS.TOUCH_START_ACTIVE, touchDownActivateCallback);

  cornerstone.updateImage(element);

  cornerstoneTools.moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.end, function() {
      const { cancelled, handles } = measurementData;
      const hasHandlesOutside = cornerstoneTools.anyHandlesOutsideImage(touchEventData, handles);
      if (cancelled || hasHandlesOutside) {
          // delete the measurement
          cornerstoneTools.removeToolState(element, toolType, measurementData);
      } else {
          // Set lesionMeasurementData Session
          config.getMeasurementLocationCallback(measurementData, touchEventData, doneCallback);
      }

      measurementData.invalidated = true;

      element.addEventListener(cornerstoneTools.EVENTS.TOUCH_START, touchStartCallback);
      element.addEventListener(cornerstoneTools.EVENTS.TAP, tapCallback);
      element.addEventListener(cornerstoneTools.EVENTS.TOUCH_START_ACTIVE, touchDownActivateCallback);

      cornerstone.updateImage(element);
  });
}
