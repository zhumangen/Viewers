import { cornerstoneTools } from 'meteor/ohif:cornerstone';
import { Session } from 'meteor/session'
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

const toolType = 'tissue';

function createNewMeasurement () {
  const measurementData = {
    isCreating: true,
    toolType: toolType,
    version: JF.managers.settings.systemVersion(),
    lesionCode: JF.viewer.data.order.lesionCode,
    orderId: JF.viewer.data.order._id,
    createdAt: new Date()
  };

  const element = JF.viewerbase.viewportUtils.getActiveViewportElement();
  const { getImageAttributes } = JF.measurements.MeasurementHandlers;
  const imageAttributes = getImageAttributes(element);
  const viewport = cornerstone.getViewport(element);
  delete viewport.voiLUT;

  const measurement = _.extend({}, measurementData, imageAttributes, {viewport}, {
    userId: Meteor.userId(),
    status: 0
  });

  return measurement;
}

cornerstoneTools[toolType] = { createNewMeasurement };
