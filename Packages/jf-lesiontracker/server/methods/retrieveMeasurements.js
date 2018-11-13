import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

export default function retrieveMeasurements(options) {
    OHIF.log.info('Retrieving Measurements from the Server');

    OHIF.MongoUtils.validateUser();

    const Measurements = JF.collections.measurements;
    const userId = Meteor.userId();
    const orderId = options._id;
    const orderStatus = options.status;
    const reportEdited = options.reportEdited;
    const reviewEdited = options.reviewEdited;
    const Checks = JF.validation.checks;
    Checks.checkNonNegativeNumber(orderStatus);

    const measurementData = {};
    const filter = {
      orderId,
      status: 0
    };

    switch (orderStatus) {
      case 0:
        return measurementData;
      case 1:
        if (!reportEdited) {
          return measurementData;
        }
        filter.userId = userId;
        break;
      case 2:
        filter.status = 1;
        break;
      case 3:
        if (reviewEdited) {
          filter.userId = userId;
        } else {
          filter.status = 1;
        }
        break;
      case 4:
        filter.status = 2;
        break;
    }

    measurementTools.forEach(tool => {
        measurementData[tool.id] = Measurements[tool.id].find(filter).fetch();
    });

    return measurementData;
}
