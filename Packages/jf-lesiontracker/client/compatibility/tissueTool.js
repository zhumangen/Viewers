import { cornerstoneTools } from 'meteor/ohif:cornerstone';
import { Session } from 'meteor/session'
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

const toolType = 'tissue';

function createNewMeasurement () {
  const measurementData = {
    isCreating: true,
    toolType: toolType,
    createdAt: new Date()
  };
  
  const element = OHIF.viewerbase.viewportUtils.getActiveViewportElement();
  const { getImageAttributes } = JF.measurements.MeasurementHandlers;
  const imageAttributes = getImageAttributes(element);
  const userInfo = Session.get('userInfo');

  const measurement = _.extend({}, measurementData, imageAttributes, {
    userId: userInfo.userId,
    userName: userInfo.userName,
    permission: userInfo.permission,
    status: 0
  });

  return measurement;
}

cornerstoneTools[toolType] = { createNewMeasurement };
