import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { toolType } from './definitions';

function numberWithCommas (x) {
  // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export default function onImageRendered (e) {
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
        const color = cornerstoneTools.toolColors.getColorIfActive(data);
        if (data.hover) color = cornerstoneTools.toolColors.getActiveColor();

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
        cornerstoneTools.drawEllipse(context, leftCanvas, topCanvas, widthCanvas, heightCanvas);
        context.closePath();

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


            const textLines = [`病灶 ${data.measurementNumber}`, densityText];

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
