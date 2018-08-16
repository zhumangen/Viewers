import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { pointNearTool } from './pointNearTool';
import { toolType } from './definitions';

export default function mouseMoveCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;

    cornerstoneTools.toolCoordinates.setCoords(eventData);

    // If we have no tool data for this element, do nothing
    const toolData = cornerstoneTools.getToolState(element, toolType);

    if (!toolData) {
      return;
    }

    // We have tool data, search through all data
    // And see if we can activate a handle
    let imageNeedsUpdate = false;

    for (let i = 0; i < toolData.data.length; i++) {
      // Get the cursor position in canvas coordinates
      const coords = eventData.currentPoints.canvas;

      const data = toolData.data[i];

      if (cornerstoneTools.handleActivator(element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      const nearTool = pointNearTool(element, data, coords);
      const nearToolAndNotHover = nearTool && !data.hover;
      const notNearToolAndHover = !nearTool && data.hover;
      if (nearToolAndNotHover || notNearToolAndHover) {
        data.hover = !data.hover;
        imageNeedsUpdate = true;
      }
    }

    // Handle activation status changed, redraw the image
    if (imageNeedsUpdate === true) {
      cornerstone.updateImage(element);
    }
  }
