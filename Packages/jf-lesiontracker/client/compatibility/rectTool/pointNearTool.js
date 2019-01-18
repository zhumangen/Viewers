import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { distanceThreshold, distanceThresholdTouch } from './definitions';

function pointNearRect (element, data, coords, distance) {
  const startCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
  const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

  const rect = {
    left: Math.min(startCanvas.x, endCanvas.x),
    top: Math.min(startCanvas.y, endCanvas.y),
    width: Math.abs(startCanvas.x - endCanvas.x),
    height: Math.abs(startCanvas.y - endCanvas.y)
  };

  const distanceToPoint = cornerstoneMath.rect.distanceToPoint(rect, coords);
  return (distanceToPoint < distance);
}

function pointNearTool (element, data, coords) {
  return pointNearRect(element, data, coords, distanceThreshold);
}

function pointNearToolTouch (element, data, coords) {
  return pointNearRect(element, data, coords, distanceThresholdTouch);
}

export {
    pointNearTool,
    pointNearToolTouch
};
