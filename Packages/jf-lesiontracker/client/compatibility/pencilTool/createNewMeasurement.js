import { toolType } from './definitions';

export default function createNewMeasurement (mouseEventData) {

  const measurementData = {
    visible: true,
    active: true,
    invalidated: true,
    handles: {
      start: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: false
      },
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true
      },
      textBox: {
        x: mouseEventData.currentPoints.image.x - 50,
        y: mouseEventData.currentPoints.image.y - 50,
        active: false,
        hasMoved: false,
        movesIndependently: false,
        drawnIndependently: true,
        allowedOutsideImage: true,
        hasBoundingBox: true
      }
    },
    toolType: toolType,
    points: [{
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
    }],
    longestDiameter: 0,
    shortestDiameter: 0,
    density: 0,
    createdAt: new Date()
  };

  return measurementData;
}
