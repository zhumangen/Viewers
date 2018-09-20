import { JF } from 'meteor/jf:core';
import { Viewerbase } from 'meteor/jf:viewerbase';
import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';

const toolDefaultStates = Viewerbase.toolManager.getToolDefaultStates();
const textBoxConfig = toolDefaultStates.textBoxConfig;

const configuration = {
    getMeasurementLocationCallback,
    changeMeasurementLocationCallback,
    drawHandles: false,
    drawHandlesOnHover: true,
    arrowFirst: true,
    textBox: textBoxConfig
};

// Used to cancel tool placement
const keys = { ESC: 27 };

// Define a callback to get your text annotation
// This could be used, e.g. to open a modal
function getMeasurementLocationCallback(measurementData, eventData, doneCallback) {
    doneCallback(window.prompt('Enter your lesion location:'));
}

function changeMeasurementLocationCallback(measurementData, eventData, doneCallback) {
    doneCallback(window.prompt('Change your lesion location:'));
}

const toolType = 'targetProbe';
const toolInterface = { toolType };

///////// BEGIN ACTIVE TOOL ///////
function addNewMeasurement(mouseEventData) {
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

    cornerstoneTools.moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function() {
        if (cancelled || cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
            // delete the measurement
            measurementData.cancelled = true;
            cornerstoneTools.removeToolState(element, toolType, measurementData);
        } else {
            // Set lesionMeasurementData Session
            config.getMeasurementLocationCallback(measurementData, mouseEventData, doneCallback);
        }

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

function createNewMeasurement (mouseEventData) {
  const measurementData = {
    visible: true,
    active: true,
    invalidated: true,
    handles: {
      start: {
        x: 0,
        y: 0,
        highlight: false,
        active: false
      },
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true
      },
      textBox: {
        x: mouseEventData.currentPoints.image.x + 10,
        y: mouseEventData.currentPoints.image.y + 10,
        active: false,
        hasMoved: false,
        movesIndependently: false,
        drawnIndependently: true,
        allowedOutsideImage: true,
        hasBoundingBox: true
      }
    },
    toolType: toolType,
    createdAt: new Date()
  };

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////
function pointNearTool (element, data, coords) {
  const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);
  return cornerstoneMath.point.distance(endCanvas, coords) < 5;
}

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  const image = eventData.image;
  const element = eventData.element;
  const context = eventData.canvasContext.canvas.getContext('2d');
  const lineWidth = cornerstoneTools.toolStyle.getToolWidth();

  context.setTransform(1, 0, 0, 1, 0, 0);
  
  let color;
  const font = cornerstoneTools.textStyle.getFont();
  const fontHeight = cornerstoneTools.textStyle.getFontSize();

  // If we have tool data for this element - iterate over each set and draw it
  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];
    if (data.visible) {
        context.save();

        if (data.active) {
          color = cornerstoneTools.toolColors.getActiveColor();
        } else {
          color = cornerstoneTools.toolColors.getToolColor();
        }
        
        // Draw the handles
      cornerstoneTools.drawHandles(context, eventData, { end: data.handles.end }, color);
        
        if (data.measurementNumber) {
            const x = Math.round(data.handles.end.x);
            const y = Math.round(data.handles.end.y);
            let storedPixels;
            let value = '';
            let textLines = [`标注 ${data.measurementNumber}`];

            if (x < 0 || y < 0 || x >= image.columns || y >= image.rows) {
              return;
            }

            if (image.color) {
              storedPixels = getRGBPixels(element, x, y, 1, 1);
              value = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]}`;
            } else {
              storedPixels = cornerstone.getStoredPixels(element, x, y, 1, 1);
              const sp = storedPixels[0];
              const mo = sp * image.slope + image.intercept;
              value = `MO: ${parseFloat(mo.toFixed(3))}`;
            }
            
            textLines.push(value);
            data.value = value;
            
            // If the textbox has not been moved by the user, it should be displayed on the right-most
            // Side of the tool.
            if (!data.handles.textBox.hasMoved) {
              // Find the rightmost side of the ellipse at its vertical center, and place the textbox here
              // Note that this calculates it in image coordinates
              data.handles.textBox.x = data.handles.end.x + 3;
              data.handles.textBox.y = data.handles.end.y - 3;
            }
            
            const textCoords = cornerstone.pixelToCanvas(element, data.handles.textBox);

            context.font = font;
            context.fillStyle = color;

            const boundingBox = cornerstoneTools.drawTextBox(context, textLines, textCoords.x, textCoords.y, color);
            
            // Store the bounding box data in the handle for mouse-dragging and highlighting
            data.handles.textBox.boundingBox = boundingBox;
            
            // OHIF.cornerstone.repositionTextBox(eventData, data);
              
            if (data.handles.textBox.hasMoved) {
                // Draw linked line as dashed
                const end = cornerstone.pixelToCanvas(element, data.handles.end);
              const link = {
                start: {},
                end: textCoords
              };
                
                // First we calculate the ellipse points (top, left, right, and bottom)
              const ellipsePoints = [{
                // Top middle point of ellipse
                x: end.x,
                y: end.y + 5
              }, {
                // Left middle point of ellipse
                x: end.x - 5,
                y: end.y
              }, {
                // Bottom middle point of ellipse
                x: end.x,
                y: end.y + 5
              }, {
                // Right middle point of ellipse
                x: end.x + 5,
                y: end.y
              }];
              
              // We obtain the link starting point by finding the closest point on the ellipse to the
              // Center of the textbox
              link.start = cornerstoneMath.point.findClosestPoint(ellipsePoints, link.end);

              // Next we calculate the corners of the textbox bounding box
              const boundingBoxPoints = [{
                // Top middle point of bounding box
                x: boundingBox.left + boundingBox.width / 2,
                y: boundingBox.top
              }, {
                // Left middle point of bounding box
                x: boundingBox.left,
                y: boundingBox.top + boundingBox.height / 2
              }, {
                // Bottom middle point of bounding box
                x: boundingBox.left + boundingBox.width / 2,
                y: boundingBox.top + boundingBox.height
              }, {
                // Right middle point of bounding box
                x: boundingBox.left + boundingBox.width,
                y: boundingBox.top + boundingBox.height / 2
              }];

              // Now we recalculate the link endpoint by identifying which corner of the bounding box
              // Is closest to the start point we just calculated.
              link.end = cornerstoneMath.point.findClosestPoint(boundingBoxPoints, link.start);

              // Finally we draw the dashed linking line
              context.beginPath();
              context.strokeStyle = color;
              context.lineWidth = lineWidth;
              context.setLineDash([2, 3]);
              context.moveTo(link.start.x, link.start.y);
              context.lineTo(link.end.x, link.end.y);
              context.stroke();
            }
        }
        
        context.restore();
    }
  }
}
// /////// END IMAGE RENDERING ///////

function doubleClickCallback(e) {
    const eventData = e.detail;
    const { element } = eventData;
    let data;

    function doneCallback(data, deleteTool) {
        if (deleteTool === true) {
            cornerstoneTools.removeToolState(element, toolType, data);
            cornerstone.updateImage(element);
            return;
        }

        data.active = false;
        cornerstone.updateImage(element);
    }

    if (e.data && e.data.mouseButtonMask && !cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
        return false;
    }

    // Check if the element is enabled and stop here if not
    try {
        cornerstone.getEnabledElement(element);
    } catch (error) {
        return;
    }

    const config = cornerstoneTools[toolType].getConfiguration();

    const coords = eventData.currentPoints.canvas;
    const toolData = cornerstoneTools.getToolState(element, toolType);

    // now check to see if there is a handle we can move
    if (!toolData) {
        return;
    }

    for (let i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        if (pointNearTool(element, data, coords)) {
            data.active = true;
            cornerstone.updateImage(element);
            // Allow relabelling via a callback
            config.changeMeasurementLocationCallback(data, eventData, doneCallback);

            e.stopImmediatePropagation();
            return false;
        }
    }
}

toolInterface.mouse = cornerstoneTools.mouseButtonTool({
  addNewMeasurement,
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  mouseDoubleClickCallback: doubleClickCallback
});

toolInterface.touch = cornerstoneTools.touchTool({
  addNewMeasurement,
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType
});

cornerstoneTools[toolType] = toolInterface.mouse;
cornerstoneTools[toolType].setConfiguration(configuration);
cornerstoneTools[toolType + 'Touch'] = toolInterface.touch;
