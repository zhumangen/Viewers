import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { toolType } from './definitions';

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
        const color = cornerstoneTools.toolColors.getColorIfActive(data.active);
        const points = data.points.map(p => cornerstone.pixelToCanvas(element, p));


        // Draw the curve on the canvas
        if (points.length > 0) {
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;

            let currPos = points[0];
            context.moveTo(currPos.x, currPos.y);
            for (let i = 1; i < points.length; ++i) {
                const nextPos = points[i];
                context.lineTo(nextPos.x, nextPos.y);
                currPos = nextPos;
            }
            context.lineTo(points[0].x, points[0].y);
            context.closePath();
            context.stroke();
        }

        const ellipse = {
            left: image.width,
            top: image.height,
            right: 0,
            bottom: 0
          };

          data.points.forEach(p => {
              ellipse.left = Math.min(ellipse.left, p.x);
              ellipse.top = Math.min(ellipse.top, p.y);
              ellipse.right = Math.max(ellipse.right, p.x);
              ellipse.bottom = Math.max(ellipse.bottom, p.y);
          });

          ellipse.left = Math.max(ellipse.left, 0);
          ellipse.top = Math.max(ellipse.top, 0);
          ellipse.right = Math.min(ellipse.right, image.width);
          ellipse.bottom = Math.min(ellipse.bottom, image.height);
          ellipse.width = ellipse.right - ellipse.left;
          ellipse.height = ellipse.bottom - ellipse.top;
          const width = ellipse.width;
          const height = ellipse.height;
          if (colPixelSpacing && rowPixelSpacing) {
              width *= colPixelSpacing;
              height *= rowPixelSpacing;
          }
          data.longestDiameter = Math.max(width, height).toFixed(1);
          data.shortestDiameter = Math.min(width, height).toFixed(1);

        let density;
        if (data.invalidated === false) {
            density = data.density;
        } else {
            if (!image.color) {
                const pixels = cornerstone.getPixels(element, ellipse.left, ellipse.top, ellipse.width, ellipse.height);
                density = parseFloat(cornerstoneTools.calculateEllipseStatistics(pixels, ellipse).mean);
                data.density = density;
            }

            data.invalidated = false;
        }

        // Draw the text
        if (data.measurementNumber) {
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

              // We obtain the link starting point by finding the closest point on the ellipse to the
              // Center of the textbox
              link.start = cornerstoneMath.point.findClosestPoint(points, link.end);

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
