import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { distanceThreshold, distanceThresholdTouch } from './definitions';

function pointNearEllipse (element, data, coords, distance) {
  const startCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
  const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

  const minorEllipse = {
    left: Math.min(startCanvas.x, endCanvas.x) + distance / 2,
    top: Math.min(startCanvas.y, endCanvas.y) + distance / 2,
    width: Math.abs(startCanvas.x - endCanvas.x) - distance,
    height: Math.abs(startCanvas.y - endCanvas.y) - distance
  };

  const majorEllipse = {
    left: Math.min(startCanvas.x, endCanvas.x) - distance / 2,
    top: Math.min(startCanvas.y, endCanvas.y) - distance / 2,
    width: Math.abs(startCanvas.x - endCanvas.x) + distance,
    height: Math.abs(startCanvas.y - endCanvas.y) + distance
  };

  const pointInMinorEllipse = cornerstoneTools.pointInEllipse(minorEllipse, coords);
  const pointInMajorEllipse = cornerstoneTools.pointInEllipse(majorEllipse, coords);

  if (pointInMajorEllipse && !pointInMinorEllipse) {
    return true;
  }

  return false;
}

function pointNearTool (element, data, coords) {
  return pointNearEllipse(element, data, coords, distanceThreshold);
}

function pointNearToolTouch (element, data, coords) {
  return pointNearEllipse(element, data, coords, distanceThresholdTouch);
}

export {
    pointNearTool,
    pointNearToolTouch
};
