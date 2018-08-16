import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { distanceThreshold, distanceThresholdTouch } from './definitions'

function pointNearPencil (element, data, coords, distance) {
    for (let i = 0; i < data.points.length; ++i) {
        const pCanvas = cornerstone.pixelToCanvas(element, data.points[i]);
        if (cornerstoneMath.point.distance(pCanvas, coords) < distance) {
            return true;
        }
    }
    return false;
}

function pointNearTool (element, data, coords) {
  return pointNearPencil(element, data, coords, distanceThreshold);
}

function pointNearToolTouch (element, data, coords) {
  return pointNearPencil(element, data, coords, distanceThresholdTouch);
}

export {
    pointNearTool,
    pointNearToolTouch
};
