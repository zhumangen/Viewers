import { toolType } from './definitions';
import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import moveNewHandle from './moveNewHandle';
import createNewMeasurement from './createNewMeasurement';
import doubleClickCallback from './doubleClickCallback';

const keys = { ESC: 27 };

export default function addNewMeasurement(mouseEventData) {
  const { element } = mouseEventData;
  const $element = $(element);

  function doneCallback() {
      measurementData.active = true;
      cornerstone.updateImage(element);
  }

  const measurementData = createNewMeasurement(mouseEventData);
  measurementData.viewport = cornerstone.getViewport(element);

  const tool = cornerstoneTools[toolType];
  const config = tool.getConfiguration();

  // associate this data with this imageId so we can render it and manipulate it
  cornerstoneTools.addToolState(element, toolType, measurementData);

  const disableDefaultHandlers = () => {
      // since we are dragging to another place to drop the end point, we can just activate
      // the end point and let the moveHandle move it for us.

      element.removeEventListener('cornerstonetoolsmousemove', tool.mouseMoveCallback);
      element.removeEventListener('cornerstonetoolsmousedown', tool.mouseDownCallback);
      element.removeEventListener('cornerstonetoolsmousedownactivate', tool.mouseDownActivateCallback);
      element.removeEventListener('cornerstonetoolsmousedoubleclick', doubleClickCallback);
  };

  disableDefaultHandlers();

  // Add a flag for using Esc to cancel tool placement
  let cancelled = false;
  const cancelAction = () => {
      cancelled = true;
      cornerstoneTools.removeToolState(element, toolType, measurementData);
  };

  // Add a flag for using Esc to cancel tool placement
  const keyDownHandler = event => {
      // If the Esc key was pressed, set the flag to true
      if (event.which === keys.ESC) {
          cancelAction();
      }

      // Don't propagate this keydown event so it can't interfere
      // with anything outside of this tool
      return false;
  };

  // Bind a one-time event listener for the Esc key
  $(element).one('keydown', keyDownHandler);

  // Bind a mousedown handler to cancel the measurement if it's zero-sized
  const mousedownHandler = () => {
      const { start, end } = measurementData.handles;
      if (!cornerstoneMath.point.distance(start, end)) {
          cancelAction();
      }
  };

  // Bind a one-time event listener for mouse down
  $element.one('mousedown', mousedownHandler);

  // Keep the current image and create a handler for new rendered images
  const currentImage = cornerstone.getImage(element);
  const currentViewport = cornerstone.getViewport(element);
  const imageRenderedHandler = () => {
      const newImage = cornerstone.getImage(element);

      // Check if the rendered image changed during measurement creation and delete it if so
      if (newImage.imageId !== currentImage.imageId) {
          cornerstone.displayImage(element, currentImage, currentViewport);
          cancelAction();
          cornerstone.displayImage(element, newImage, currentViewport);
      }
  };

  // Bind the event listener for image rendering
  element.addEventListener('cornerstoneimagerendered', imageRenderedHandler);

  // Bind the tool deactivation and enlargement handlers
  element.addEventListener('cornerstonetoolstooldeactivated', cancelAction);
  $element.one('ohif.viewer.viewport.toggleEnlargement', cancelAction);

  cornerstone.updateImage(element);

  const timestamp = new Date().getTime();
  cornerstoneTools.moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function() {
      const { handles, longestDiameter, shortestDiameter } = measurementData;
      const hasHandlesOutside = cornerstoneTools.anyHandlesOutsideImage(mouseEventData, handles);
      const longestDiameterSize = parseFloat(longestDiameter) || 0;
      const shortestDiameterSize = parseFloat(shortestDiameter) || 0;
      const isTooSmal = (longestDiameterSize < 1) || (shortestDiameterSize < 1);
      const isTooFast = (new Date().getTime() - timestamp) < 150;
      if (cancelled || hasHandlesOutside || isTooSmal || isTooFast) {
          // delete the measurement
          cancelAction();
      } else {
          // Set lesionMeasurementData Session
          config.getMeasurementLocationCallback(measurementData, mouseEventData, doneCallback);
      }

      measurementData.invalidated = true;

      // Unbind the Esc keydown hook
      $element.off('keydown', keyDownHandler);

      // Unbind the mouse down hook
      $element.off('mousedown', mousedownHandler);

      // Unbind the event listener for image rendering
      element.removeEventListener('cornerstoneimagerendered', imageRenderedHandler);

      // Unbind the tool deactivation and enlargement handlers
      element.removeEventListener('cornerstonetoolstooldeactivated', cancelAction);
      $element.off('ohif.viewer.viewport.toggleEnlargement', cancelAction);

      // Disable the default handlers and re-enable again
      disableDefaultHandlers();
      element.addEventListener('cornerstonetoolsmousemove', tool.mouseMoveCallback);
      element.addEventListener('cornerstonetoolsmousedown', tool.mouseDownCallback);
      element.addEventListener('cornerstonetoolsmousedownactivate', tool.mouseDownActivateCallback);
      element.addEventListener('cornerstonetoolsmousedoubleclick', doubleClickCallback);

      cornerstone.updateImage(element);
  });
}
