import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';

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
  return pointNearPencil(element, data, coords, 6);
}

function pointNearToolTouch (element, data, coords) {
  return pointNearPencil(element, data, coords, 15);
}

export {
    pointNearTool,
    pointNearToolTouch
};
