import { JF } from 'meteor/jf:core';
import { Viewerbase } from 'meteor/ohif:viewerbase';
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

const toolType = 'targetRect';
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
            measurementData.cancelled = true;
            cornerstoneTools.removeToolState(element, toolType, measurementData);
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

function createNewMeasurement (mouseEventData) {

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
    longestDiameter: 0,
    shortestDiameter: 0,
    density: 0,
    createdAt: new Date()
  };

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////
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
  return pointNearRect(element, data, coords, 5);
}

function pointNearToolTouch (element, data, coords) {
  return pointNearRect(element, data, coords, 12);
}

function numberWithCommas (x) {
  // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  const parts = x.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
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

    const imagePlane = cornerstone.metaData.get('imagePlaneModule', eventData.image.imageId);
    let rowPixelSpacing;
    let colPixelSpacing;

    if (imagePlane) {
        rowPixelSpacing = imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
        colPixelSpacing = imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
    } else {
        rowPixelSpacing = eventData.image.rowPixelSpacing;
        colPixelSpacing = eventData.image.columnPixelSpacing;
    }

  const lineWidth = cornerstoneTools.toolStyle.getToolWidth();
  const config = cornerstoneTools[toolType].getConfiguration();
  const context = eventData.canvasContext.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  // If we have tool data for this element - iterate over each set and draw it
  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];
    if (data.visible) {
        context.save();

        // Apply any shadow settings defined in the tool configuration
        if (config && config.shadow) {
          context.shadowColor = config.shadowColor || '#000000';
          context.shadowOffsetX = config.shadowOffsetX || 1;
          context.shadowOffsetY = config.shadowOffsetY || 1;
        }

        // Check which color the rendered tool should be
        const color = cornerstoneTools.toolColors.getColorIfActive(data.active);

        // Convert Image coordinates to Canvas coordinates given the element
        const handleStartCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
        const handleEndCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

        // Retrieve the bounds of the ellipse (left, top, width, and height)
        // In Canvas coordinates
        const leftCanvas = Math.min(handleStartCanvas.x, handleEndCanvas.x);
        const topCanvas = Math.min(handleStartCanvas.y, handleEndCanvas.y);
        const widthCanvas = Math.abs(handleStartCanvas.x - handleEndCanvas.x);
        const heightCanvas = Math.abs(handleStartCanvas.y - handleEndCanvas.y);

        // Draw the ellipse on the canvas
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.rect(leftCanvas, topCanvas, widthCanvas, heightCanvas);
        context.stroke();

        // If the tool configuration specifies to only draw the handles on hover / active,
        // Follow this logic
        if (config && config.drawHandlesOnHover) {
          // Draw the handles if the tool is active
          if (data.active === true) {
            cornerstoneTools.drawHandles(context, eventData, data.handles, color);
          } else {
            // If the tool is inactive, draw the handles only if each specific handle is being
            // Hovered over
            const handleOptions = {
              drawHandlesIfActive: true
            };

            cornerstoneTools.drawHandles(context, eventData, data.handles, color, handleOptions);
          }
        } else {
          // If the tool has no configuration settings, always draw the handles
          cornerstoneTools.drawHandles(context, eventData, data.handles, color);
        }

        let density;
        if (data.invalidated === false) {
            density = data.density;
        } else {
          const ellipse = {
            left: Math.round(Math.min(data.handles.start.x, data.handles.end.x)),
            top: Math.round(Math.min(data.handles.start.y, data.handles.end.y)),
            width: Math.round(Math.abs(data.handles.start.x - data.handles.end.x)),
            height: Math.round(Math.abs(data.handles.start.y - data.handles.end.y))
          };

            if (!image.color) {
                const pixels = cornerstone.getPixels(element, ellipse.left, ellipse.top, ellipse.width, ellipse.height);
                density = parseFloat(cornerstoneTools.calculateEllipseStatistics(pixels, ellipse).mean);
                data.density = density;
            }

            data.invalidated = false;
        }

        // Draw the text
        if (data.measurementNumber) {
            // Draw the textbox
            let suffix = ' pixels';
            const width = Math.abs(data.handles.start.x - data.handles.end.x);
            const height = Math.abs(data.handles.start.y - data.handles.end.y);
            if (rowPixelSpacing && colPixelSpacing) {
                suffix = ' mm';
                width *= colPixelSpacing;
                height *= rowPixelSpacing;
            }

            data.longestDiameter = (width>height?width:height).toFixed(1);
            data.shortestDiameter = (width>height?height:width).toFixed(1);

            const lengthText = ' L ' + data.longestDiameter + suffix;
            const widthText = ' W ' + data.shortestDiameter + suffix;
            const densityText = '  密度：' + density.toFixed(2);


            const textLines = [`标注 ${data.measurementNumber}`, densityText];

            // If the textbox has not been moved by the user, it should be displayed on the right-most
            // Side of the tool.
            if (!data.handles.textBox.hasMoved) {
              // Find the rightmost side of the ellipse at its vertical center, and place the textbox here
              // Note that this calculates it in image coordinates
              data.handles.textBox.x = Math.max(data.handles.start.x, data.handles.end.x);
              data.handles.textBox.y = (data.handles.start.y + data.handles.end.y) / 2;
            }

            // Convert the textbox Image coordinates into Canvas coordinates
            const textCoords = cornerstone.pixelToCanvas(element, data.handles.textBox);

            // Set options for the textbox drawing function
            const options = {
              centering: {
                x: false,
                y: true
              }
            };

            // Draw the textbox and retrieves it's bounding box for mouse-dragging and highlighting
            const boundingBox = cornerstoneTools.drawTextBox(context, textLines, textCoords.x,
              textCoords.y, color, options);

            // Store the bounding box data in the handle for mouse-dragging and highlighting
            data.handles.textBox.boundingBox = boundingBox;

            // OHIF.cornerstone.repositionTextBox(eventData, data, options);

              // Draw linked line as dashed
              const link = {
                start: {},
                end: {
                    x: textCoords.x,
                    y: textCoords.y
                }
              };

              // First we calculate the ellipse points (top, left, right, and bottom)
              const ellipsePoints = [{
                // Top middle point of ellipse
                x: leftCanvas + widthCanvas / 2,
                y: topCanvas
              }, {
                // Left middle point of ellipse
                x: leftCanvas,
                y: topCanvas + heightCanvas / 2
              }, {
                // Bottom middle point of ellipse
                x: leftCanvas + widthCanvas / 2,
                y: topCanvas + heightCanvas
              }, {
                // Right middle point of ellipse
                x: leftCanvas + widthCanvas,
                y: topCanvas + heightCanvas / 2
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
  pointNearTool: pointNearToolTouch,
  toolType
});

cornerstoneTools[toolType] = toolInterface.mouse;
cornerstoneTools[toolType].setConfiguration(configuration);
cornerstoneTools[toolType + 'Touch'] = toolInterface.touch;
